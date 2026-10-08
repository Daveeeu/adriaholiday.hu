<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Bus trips are called "autóbuszos" in the site's own copy. Tour texts mirror
 * the legacy site and slugs stay as they are, so only the marketing copy,
 * the filter chip labels and the homepage offer teasers change.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->rewrite('site_settings', 'value', fn (Builder $query) => $query
            ->where(fn (Builder $q) => $q->where('group', 'footer')->where('key', 'description'))
            ->orWhere(fn (Builder $q) => $q->where('group', 'seo')->where('key', 'default_description')));

        $footerBlock = fn (Builder $query) => $query->where('key', 'home.footer.description');
        $this->rewrite('portfolio_content_blocks', 'value', $footerBlock);
        $this->rewrite('portfolio_content_blocks', 'draft_value', $footerBlock);

        $this->rewrite('portfolio_filter_chips', 'label');
        $this->rewrite('homepage_offer_translations', 'short_description');

        PublicContentCache::bump(
            PublicContentCache::SITE_SETTINGS,
            PublicContentCache::HOMEPAGE_CONTENT,
            PublicContentCache::PORTFOLIO_FILTERS,
            PublicContentCache::OFFERS,
        );
    }

    public function down(): void
    {
        // Content update only.
    }

    private function rewrite(string $table, string $column, ?Closure $scope = null): void
    {
        DB::table($table)
            ->where(fn (Builder $query) => $scope ? $scope($query) : $query)
            ->where($column, 'like', '%uszos%')
            ->get(['id', $column])
            ->each(function (object $row) use ($table, $column): void {
                $text = (string) $row->{$column};
                $rewritten = preg_replace(
                    ['/(?<![\p{L}-])Buszos(?![\p{L}-])/u', '/(?<![\p{L}-])buszos(?![\p{L}-])/u'],
                    ['Autóbuszos', 'autóbuszos'],
                    $text,
                );

                if ($rewritten !== $text) {
                    DB::table($table)->where('id', $row->id)->update([$column => $rewritten]);
                }
            });
    }
};
