<?php

namespace App\Services\PartnerXml;

/**
 * The partner XML feeds, by the address the legacy site served each at.
 */
enum PartnerXmlFeed: string
{
    /** Travelgate (its travel type), tours with one row per party size. */
    case Travelgate = 'xmltravel';

    /** Travelmax: as Travelgate's, with travel insurance and an accommodation description. */
    case Travelmax = 'xmltravelmax';

    /** Cesys: one party of two adults per date, with its own accommodation. */
    case Cesys = 'xmlcesys';

    /** The general "traveloffers" feed: one price per date. */
    case General = 'xml';
}
