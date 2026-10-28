<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The office asked for Sziman Zita, Kovács Eszter and Lengyel Edit to lead the
 * team on the about page. The names are one list and each photo its own block
 * by position ("about.team.member.{n}.image"), so the photo blocks are renamed
 * along with the list, keeping every photo with its person. The page also gets
 * photo slots up to nine members, so the seventh can be added in the editor.
 */
return new class extends Migration
{
    private const LEADING = ['Sziman Zita', 'Kovács Eszter', 'Lengyel Edit'];

    private const MEMBERS_KEY = 'about.team.members';

    /** As many portraits as the about page has room for (TEAM_SIZE on the site). */
    private const TEAM_SIZE = 9;

    public function up(): void
    {
        $this->putLeadingMembersFirst();
        $this->addEmptyPhotoSlots();

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
    }

    public function down(): void
    {
        // Content update only.
    }

    private function putLeadingMembersFirst(): void
    {
        $block = DB::table('portfolio_content_blocks')->where('key', self::MEMBERS_KEY)->first(['id', 'value_json']);
        $members = $block !== null ? json_decode((string) $block->value_json, true) : null;

        if (! is_array($members) || $members === []) {
            return;
        }

        $positions = array_keys($members);
        $leading = array_values(array_filter(array_map(
            fn (string $name): ?int => $this->positionOf($members, $name),
            self::LEADING,
        ), fn (?int $position): bool => $position !== null));
        $order = [...$leading, ...array_values(array_diff($positions, $leading))];

        if ($order === $positions) {
            return;
        }

        DB::transaction(function () use ($block, $members, $order): void {
            DB::table('portfolio_content_blocks')->where('id', $block->id)->update([
                'value_json' => json_encode(array_map(fn (int $position): array => $members[$position], $order), JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);

            // Keys are unique: move every photo block aside first, then to its new place.
            foreach ($order as $position) {
                DB::table('portfolio_content_blocks')->where('key', $this->imageKey($position))->update(['key' => $this->imageKey($position).'.moving']);
            }

            foreach ($order as $newPosition => $oldPosition) {
                DB::table('portfolio_content_blocks')->where('key', $this->imageKey($oldPosition).'.moving')->update([
                    'key' => $this->imageKey($newPosition),
                    'label' => $this->imageLabel($newPosition),
                ]);
            }
        });
    }

    private function addEmptyPhotoSlots(): void
    {
        foreach (range(0, self::TEAM_SIZE - 1) as $position) {
            PortfolioContentBlock::query()->withTrashed()->firstOrCreate(
                ['key' => $this->imageKey($position)],
                [
                    'page' => 'about',
                    'section' => 'team',
                    'label' => $this->imageLabel($position),
                    'type' => 'image',
                    'locale' => 'hu',
                    'value_json' => ['alt' => '', 'title' => ''],
                    'is_published' => true,
                ],
            );
        }
    }

    /**
     * @param  array<int, array{name?: string}>  $members
     */
    private function positionOf(array $members, string $name): ?int
    {
        foreach ($members as $position => $member) {
            if (trim((string) ($member['name'] ?? '')) === $name) {
                return $position;
            }
        }

        return null;
    }

    private function imageKey(int $position): string
    {
        return 'about.team.member.'.($position + 1).'.image';
    }

    private function imageLabel(int $position): string
    {
        return ($position + 1).'. csapattag fotója';
    }
};
