<?php

namespace App\Services\Legacy\Apartments;

use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;
use App\Models\ApartmentType;
use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\LegacyImportRun;
use App\Services\Legacy\LegacyMediaMirror;
use App\Support\Apartment\ApartmentPriceTable;
use App\Support\Legacy\Apartments\LegacyApartmentData;
use App\Support\Legacy\Apartments\LegacyApartmentExport;
use App\Support\MediaCategory;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

/**
 * The legacy apartment import: every apartment of the export becomes (or
 * updates) the apartment of its legacy id, in its place's location, with its
 * gallery copied into the media library. The apartments the legacy site
 * listed are imported active and published, the rest inactive drafts. A dry
 * run only reports what would happen. Each apartment is written in its own
 * transaction, so one failure never stops the others, and a re-run updates
 * what an earlier one wrote.
 *
 * @phpstan-type ApartmentRow array<string, mixed>
 */
final class LegacyApartmentImporter
{
    public const MEDIA_LISTED = 'listed';

    public const MEDIA_ALL = 'all';

    public const MEDIA_NONE = 'none';

    public const CREATE = 'create';

    public const UPDATE = 'update';

    public const CONFLICT = 'conflict';

    public const SKIPPED_DELETED = 'skipped_deleted';

    public const FAILED = 'failed';

    public function __construct(
        private readonly LegacyApartmentMapper $mapper,
        private readonly LegacyApartmentLocationResolver $locations,
        private readonly LegacyMediaMirror $media,
    ) {}

    /**
     * @param  Closure(int, string, string): void  $progress  legacy id, action, message
     * @return array{run: LegacyImportRun|null, rows: list<ApartmentRow>, other_apartments: array{removed: list<int>, deactivated: list<int>}}
     */
    public function import(LegacyApartmentExport $export, bool $dryRun, string $mediaMode, bool $removeOthers, Closure $progress): array
    {
        $run = $dryRun ? null : LegacyImportRun::query()->create([
            'source_file' => $export->path,
            'source_sha256' => $export->sha256,
            'dry_run' => false,
            'status' => LegacyImportRun::RUNNING,
            'started_at' => now(),
        ]);

        if (! $dryRun) {
            $this->ensureTypes();
        }

        $rows = [];

        foreach ($export->apartments as $record) {
            $data = $this->mapper->map($record, $export);
            $row = $dryRun ? $this->plan($data, $export) : $this->write($data, $record, $export, $mediaMode, $run);
            $rows[] = $row;
            $progress($data->legacyId, $row['action'], (string) $row['name']);
        }

        $others = $removeOthers ? $this->removeOthers($dryRun) : ['removed' => [], 'deactivated' => []];

        if ($run !== null) {
            $failed = collect($rows)->where('action', self::FAILED)->pluck('legacy_id')->values()->all();
            $run->update([
                'status' => $failed === [] ? LegacyImportRun::COMPLETED : LegacyImportRun::COMPLETED_WITH_ERRORS,
                'summary' => [
                    'actions' => collect($rows)->countBy('action')->all(),
                    'failed_legacy_ids' => $failed,
                    'other_apartments' => $others,
                ],
                'finished_at' => now(),
            ]);
        }

        return ['run' => $run, 'rows' => $rows, 'other_apartments' => $others];
    }

    /**
     * What an import would do with an apartment, without writing anything.
     *
     * @return ApartmentRow
     */
    private function plan(LegacyApartmentData $data, LegacyApartmentExport $export): array
    {
        $existing = Apartment::withTrashed()->where('legacy_id', $data->legacyId)->first();
        $location = $data->placeId !== null ? $this->locations->find($data->placeId, $export) : null;

        $action = match (true) {
            $data->placeId === null => self::CONFLICT,
            $existing?->trashed() => self::SKIPPED_DELETED,
            $this->slugTakenByAnother($data->attributes['slug'], $existing) => self::CONFLICT,
            $existing !== null => self::UPDATE,
            default => self::CREATE,
        };

        return $this->row($data, $action, $existing, $location?->slug ?? ($data->placeId !== null ? "(új) hely #{$data->placeId}" : null), $this->messages($data, $action));
    }

    /**
     * @param  array<string, mixed>  $record
     * @return ApartmentRow
     */
    private function write(LegacyApartmentData $data, array $record, LegacyApartmentExport $export, string $mediaMode, LegacyImportRun $run): array
    {
        $existing = Apartment::withTrashed()->where('legacy_id', $data->legacyId)->first();

        if ($existing?->trashed()) {
            return $this->row($data, self::SKIPPED_DELETED, $existing, null, ['Deleted on the new site; left alone.']);
        }

        if ($data->placeId === null || $this->slugTakenByAnother($data->attributes['slug'], $existing)) {
            $messages = $this->messages($data, self::CONFLICT);
            $this->record($data, $record, $run, null, LegacyImportRecord::FAILED, $messages);

            return $this->row($data, self::CONFLICT, $existing, null, $messages);
        }

        try {
            $location = $this->locations->resolve($data->placeId, $export, [$data->attributes['latitude'], $data->attributes['longitude']]);

            $apartment = DB::transaction(function () use ($data, $existing, $location): Apartment {
                $apartment = $existing ?? new Apartment;
                $apartment->fill([
                    ...$data->attributes,
                    'region_id' => $location->region_id,
                    'location_id' => $location->id,
                ])->save();

                return $apartment;
            });

            // Downloads stay outside the transaction: a copied file is never rolled back.
            $images = $this->shouldMirror($data, $mediaMode) ? $this->syncGallery($apartment, $data) : ['copied' => 0, 'failed' => 0];
            $this->record($data, $record, $run, $apartment, LegacyImportRecord::IMPORTED, $data->warnings);
            $apartment->setRelation('location', $location);
        } catch (Throwable $exception) {
            report($exception);
            $messages = [Str::limit($exception->getMessage(), 500)];
            $this->record($data, $record, $run, null, LegacyImportRecord::FAILED, $messages);

            return $this->row($data, self::FAILED, $existing, null, $messages);
        }

        $messages = [...$data->warnings, ...($images['failed'] > 0 ? ["{$images['failed']} image(s) could not be copied; see legacy_media_files."] : [])];

        return $this->row($data, $existing !== null ? self::UPDATE : self::CREATE, $apartment, $apartment->location?->slug, $messages, $images['copied']);
    }

    /**
     * Copies the gallery's images and makes them the apartment's gallery, in
     * the legacy order; images removed from the legacy gallery are removed
     * here too. Images added on the new site are kept, after the legacy ones.
     *
     * @return array{copied: int, failed: int}
     */
    private function syncGallery(Apartment $apartment, LegacyApartmentData $data): array
    {
        $kept = [];
        $failed = 0;

        foreach ($data->images as $position => $image) {
            $file = $this->media->mirror($image['url'], [
                'title' => $image['title'] ?? $apartment->name,
                'alt' => $apartment->name,
                'category' => MediaCategory::APARTMENTS,
            ]);

            if ($file->media_id === null) {
                $failed++;

                continue;
            }

            $item = ApartmentGalleryItem::query()->updateOrCreate(
                ['apartment_id' => $apartment->id, 'legacy_image_id' => $image['legacy_image_id']],
                ['media_id' => $file->media_id, 'title' => $image['title'], 'alt' => $apartment->name, 'sort_order' => $position, 'active' => true],
            );
            $kept[] = $item->id;
        }

        ApartmentGalleryItem::query()
            ->where('apartment_id', $apartment->id)
            ->whereNotNull('legacy_image_id')
            ->whereNotIn('id', $kept)
            ->delete();

        return ['copied' => count($kept), 'failed' => $failed];
    }

    /**
     * The legacy images are copied for the apartments the site shows, or for
     * all of them; inactive apartments keep their image list in their import
     * record until a run copies them.
     */
    private function shouldMirror(LegacyApartmentData $data, string $mediaMode): bool
    {
        return match ($mediaMode) {
            self::MEDIA_ALL => true,
            self::MEDIA_LISTED => $data->listed,
            default => false,
        };
    }

    /**
     * @param  array<string, mixed>  $record
     * @param  list<string>  $messages
     */
    private function record(LegacyApartmentData $data, array $record, LegacyImportRun $run, ?Apartment $apartment, string $status, array $messages): void
    {
        $payload = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $entry = LegacyImportRecord::query()->firstOrNew(['entity' => LegacyImportRecord::APARTMENT, 'legacy_id' => $data->legacyId]);

        // A failed re-run never loses the link to what an earlier run imported.
        if ($status === LegacyImportRecord::FAILED && $entry->exists && $entry->status === LegacyImportRecord::IMPORTED) {
            $entry->fill(['legacy_import_run_id' => $run->id, 'messages' => $messages])->save();

            return;
        }

        $entry->fill([
            'local_type' => $apartment !== null ? Apartment::class : null,
            'local_id' => $apartment?->id,
            'legacy_import_run_id' => $run->id,
            'payload_sha256' => hash('sha256', $payload),
            'raw_payload' => $payload,
            'status' => $status,
            'messages' => $messages,
        ])->save();
    }

    /**
     * The apartment types of the legacy lists, created when missing (the
     * apartment form only offers existing types).
     */
    private function ensureTypes(): void
    {
        foreach ((array) config('legacy_apartments.types') as $type) {
            ApartmentType::query()->firstOrCreate(['slug' => $type['slug']], ['name' => $type['name'], 'is_active' => true]);
        }
    }

    /**
     * Takes the apartments the import did not bring (the demo apartments of a
     * fresh install) off the site: soft-deleted, or, when a booking refers to
     * one, kept as an inactive draft.
     *
     * @return array{removed: list<int>, deactivated: list<int>} ids (that would be) changed
     */
    private function removeOthers(bool $dryRun): array
    {
        $others = Apartment::query()->whereNull('legacy_id')->get();
        $booked = Booking::withTrashed()->whereIn('apartment_id', $others->modelKeys())->distinct()->pluck('apartment_id')->all();
        [$keep, $remove] = $others->partition(fn (Apartment $apartment): bool => in_array($apartment->id, $booked, true));
        $deactivate = $keep->filter(fn (Apartment $apartment): bool => $apartment->is_active || $apartment->status === Apartment::STATUS_PUBLISHED);

        if (! $dryRun) {
            $remove->each->delete();
            $deactivate->each->update(['is_active' => false, 'status' => Apartment::STATUS_DRAFT]);
        }

        return ['removed' => $remove->modelKeys(), 'deactivated' => $deactivate->modelKeys()];
    }

    private function slugTakenByAnother(string $slug, ?Apartment $existing): bool
    {
        return Apartment::withTrashed()
            ->where('slug', $slug)
            ->when($existing !== null, fn ($query) => $query->whereKeyNot($existing->id))
            ->exists();
    }

    /**
     * @return list<string>
     */
    private function messages(LegacyApartmentData $data, string $action): array
    {
        return match ($action) {
            self::CONFLICT => $data->placeId === null
                ? ['No place in the legacy admin and none configured; not imported.']
                : ["Another apartment already has the URL name \"{$data->attributes['slug']}\"; not imported."],
            self::SKIPPED_DELETED => ['Deleted on the new site; left alone.'],
            default => $data->warnings,
        };
    }

    /**
     * @param  list<string>  $messages
     * @return ApartmentRow
     */
    private function row(LegacyApartmentData $data, string $action, ?Apartment $apartment, ?string $location, array $messages, ?int $imagesCopied = null): array
    {
        $pricing = $data->attributes['pricing_matrix'];

        return [
            'legacy_id' => $data->legacyId,
            'name' => $data->attributes['name'],
            'slug' => $data->attributes['slug'],
            'code' => $data->attributes['code'],
            'list' => $data->list,
            'listed' => $data->listed,
            'action' => $action,
            'apartment_id' => $apartment?->id,
            'location' => $location,
            'images' => count($data->images),
            'images_copied' => $imagesCopied,
            'price_periods' => is_array($pricing) ? count($pricing['columns']) : 0,
            'upcoming_price_periods' => count(ApartmentPriceTable::upcoming($pricing, today())['periods']),
            'apartment_types' => implode(', ', ApartmentPriceTable::categories($pricing)),
            'services' => count($data->attributes['services']),
            'messages' => $messages,
        ];
    }
}
