<?php

use App\Models\Tour;
use App\Support\PublicContentCache;
use App\Support\TourSearchIndex;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Search keywords per tour and the normalised word index the public search
 * matches (see TourSearchIndex). Existing tours start with the places their
 * short description lists, for the office to review.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->json('search_keywords')->nullable()->after('category_ids');
            $table->text('search_index')->nullable()->after('search_keywords');
        });

        // Written directly so the backfill neither touches updated_at nor logs an
        // activity entry per tour.
        Tour::withTrashed()->with('region')->each(function (Tour $tour): void {
            $tour->search_keywords = TourSearchIndex::suggestKeywords($tour);

            DB::table('tours')->where('id', $tour->id)->update([
                'search_keywords' => json_encode($tour->search_keywords, JSON_UNESCAPED_UNICODE),
                'search_index' => TourSearchIndex::build($tour),
            ]);
        });

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(['search_keywords', 'search_index']);
        });
    }
};
