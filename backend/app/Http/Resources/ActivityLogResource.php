<?php

namespace App\Http\Resources;

use App\Support\ActivityLog\ActivitySubjectTypes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

/**
 * @mixin Activity
 */
class ActivityLogResource extends JsonResource
{
    private const MAX_VALUE_LENGTH = 1000;

    /**
     * Columns tried, in order, to name a record in the log.
     */
    private const LABEL_ATTRIBUTES = [
        'name',
        'title',
        'label',
        'customer_name',
        'offer_name_snapshot',
        'apartment_name_snapshot',
        'code',
        'key',
        'source_path',
        'email',
        'slug',
    ];

    public function toArray(Request $request): array
    {
        $changes = $this->attribute_changes ?? collect();
        $properties = $this->properties ?? collect();

        return [
            'id' => (string) $this->id,
            'logName' => $this->log_name,
            'event' => $this->event,
            'description' => $this->description,
            'createdAt' => $this->created_at?->toISOString(),
            'causer' => $this->causer ? [
                'id' => (string) $this->causer->getKey(),
                'name' => $this->causer->name,
                'email' => $this->causer->email,
            ] : null,
            'subject' => $this->subject_type ? [
                'type' => ActivitySubjectTypes::keyFor($this->subject_type),
                'typeLabel' => ActivitySubjectTypes::labelFor($this->subject_type),
                'id' => $this->subject_id !== null ? (string) $this->subject_id : null,
                'label' => $this->subjectLabel($changes->get('attributes', []), $changes->get('old', [])),
                'exists' => $this->subject instanceof Model && ! $this->subjectIsTrashed(),
            ] : null,
            'changes' => $this->changeRows($changes->get('attributes', []), $changes->get('old', [])),
            'context' => [
                'ip' => $properties->get('ip'),
                'userAgent' => $properties->get('user_agent'),
                'email' => $properties->get('email'),
                'reason' => $properties->get('reason'),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $old
     */
    private function subjectLabel(array $attributes, array $old): ?string
    {
        $sources = [$this->subject?->getAttributes() ?? [], $attributes, $old];

        foreach (self::LABEL_ATTRIBUTES as $attribute) {
            foreach ($sources as $source) {
                $value = $source[$attribute] ?? null;

                if (is_scalar($value) && trim((string) $value) !== '') {
                    return Str::limit(trim(strip_tags((string) $value)), 120);
                }
            }
        }

        return null;
    }

    private function subjectIsTrashed(): bool
    {
        return method_exists($this->subject, 'trashed') && $this->subject->trashed();
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $old
     * @return array<int, array{field: string, old: mixed, new: mixed}>
     */
    private function changeRows(array $attributes, array $old): array
    {
        return collect(array_keys($attributes + $old))
            ->map(fn (string $field): array => [
                'field' => $field,
                'old' => $this->presentValue($old[$field] ?? null),
                'new' => $this->presentValue($attributes[$field] ?? null),
            ])
            ->values()
            ->all();
    }

    private function presentValue(mixed $value): string|int|float|bool|null
    {
        if ($value === null || is_bool($value) || is_int($value) || is_float($value)) {
            return $value;
        }

        if (is_array($value)) {
            $value = Arr::isList($value) && collect($value)->every(fn (mixed $item): bool => is_scalar($item))
                ? implode(', ', $value)
                : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return Str::limit((string) $value, self::MAX_VALUE_LENGTH);
    }
}
