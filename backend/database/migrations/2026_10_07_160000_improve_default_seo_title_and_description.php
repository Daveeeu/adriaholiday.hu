<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The home page's search title was just the brand name and its description was
 * generic; both now name what the agency offers. Values an admin already changed
 * are kept.
 */
return new class extends Migration
{
    /**
     * @var array<string, array{0: string, 1: string}> key => [old default, new value]
     */
    private const VALUES = [
        'default_title' => [
            'Adria Holiday',
            'Körutazások és tengerparti nyaralás 2003 óta | Adria Holiday',
        ],
        'default_description' => [
            'Prémium buszos és repülős utazások Európa legszebb úti céljaihoz.',
            'Buszos és repülős körutazások, adventi utak és tengerparti nyaralás 2003 óta. Válogatott szállások, magyar idegenvezetés, online foglalás.',
        ],
    ];

    public function up(): void
    {
        foreach (self::VALUES as $key => [$old, $new]) {
            DB::table('site_settings')->where('group', 'seo')->where('key', $key)->where('value', $old)->update(['value' => $new]);
        }

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        foreach (self::VALUES as $key => [$old, $new]) {
            DB::table('site_settings')->where('group', 'seo')->where('key', $key)->where('value', $new)->update(['value' => $old]);
        }
    }
};
