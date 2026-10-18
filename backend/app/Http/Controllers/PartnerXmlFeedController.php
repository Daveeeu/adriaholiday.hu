<?php

namespace App\Http\Controllers;

use App\Services\PartnerXml\PartnerXmlCatalog;
use App\Services\PartnerXml\PartnerXmlFeed;
use App\Services\PartnerXml\PartnerXmlFeedWriter;
use App\Support\PublicContentCache;
use Illuminate\Http\Response;

/**
 * A partner XML feed (/xmltravel, /xmltravelmax, /xmlcesys, /xml), built
 * from the tours marked for the XML and reused until a tour changes or it
 * gets old.
 */
class PartnerXmlFeedController extends Controller
{
    public function __invoke(PartnerXmlCatalog $catalog, PartnerXmlFeedWriter $writer, string $feed): Response
    {
        $partnerFeed = PartnerXmlFeed::from($feed);

        $xml = PublicContentCache::remember(
            PublicContentCache::PARTNER_XML,
            $partnerFeed->value,
            (int) config('partner_xml.cache_minutes') * 60,
            fn (): string => $writer->write($partnerFeed, $catalog->tours(), $catalog->insurance()),
        );

        return response($xml, 200, ['Content-Type' => 'text/xml; charset=UTF-8']);
    }
}
