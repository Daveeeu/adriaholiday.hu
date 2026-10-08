<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyAdriaOfferCrawler;
use App\Services\Legacy\LegacyFeaturedOffersImporter;
use Illuminate\Console\Command;

class AdriaImportFeaturedOffersCommand extends Command
{
    protected $signature = 'adria:import-featured';

    protected $description = 'Feature the offers of the legacy adriaholiday.hu homepage ("Kiemelt Ajánlataink!") in their order; unfeature every other tour.';

    public function handle(LegacyAdriaOfferCrawler $crawler, LegacyFeaturedOffersImporter $importer): int
    {
        $slugs = $crawler->discoverFeaturedOfferSlugs();

        if ($slugs === []) {
            $this->error('No featured offers found on the legacy homepage; nothing changed.');

            return self::FAILURE;
        }

        $result = $importer->import($slugs);

        foreach ($result['featured'] as $index => $slug) {
            $this->line(sprintf('%2d. %s', $index + 1, $slug));
        }

        foreach ($result['missing'] as $slug) {
            $this->warn("Not on the new site (import it first): {$slug}");
        }

        $this->info(sprintf('%d offer(s) featured.', count($result['featured'])));

        return self::SUCCESS;
    }
}
