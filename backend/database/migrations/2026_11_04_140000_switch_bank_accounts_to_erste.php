<?php

use App\Models\Page;
use App\Support\Booking\BookingConfirmationSettings;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The agency moved its bank accounts from OTP to Erste. Only the old account
 * details are replaced, so edits made to the rest of the texts in the admin are
 * kept. Archived legacy pages (earlier contract terms) keep the details that
 * were valid at the time.
 */
return new class extends Migration
{
    private const REPLACEMENTS = [
        // Contact and imprint pages.
        '<p><strong>HUF:</strong> OTP Bank Nyrt. 11734004-20467221-00000000<br><strong>EUR:</strong> OTP Bank Nyrt. 11763347-60298889<br><strong>IBAN:</strong> HU39 1176 3347 6029 8889 0000 0000<br><strong>BIC (SWIFT):</strong> OTPVHUHB</p>' => '<p><strong>HUF:</strong> Erste Bank Hungary Zrt. 11600006-00000002-08084747<br><strong>IBAN (HUF):</strong> HU63 1160 0006 0000 0002 0808 4747<br><strong>EUR:</strong> Erste Bank Hungary Zrt. 11600006-00000002-08084802<br><strong>IBAN (EUR):</strong> HU33 1160 0006 0000 0002 0808 4802<br><strong>BIC (SWIFT):</strong> GIBAHUHB</p>',
        // Terms.
        'Banksz.: OTP BANK Nyrt. 11734004-20467221-00000000' => 'Banksz.: Erste Bank Hungary Zrt. 11600006-00000002-08084747',
        // Booking confirmation e-mail.
        'OTP 11734004-20467221' => 'Erste 11600006-00000002-08084747',
        // Booking note text blocks.
        'az OTP Banknál vezetett 11734004-20467221-00000000 számú bankszámlára átutalással egyenlítse ki, vagy bármely OTP Bank fiókjában' => 'az Erste Banknál vezetett 11600006-00000002-08084747 számú bankszámlára átutalással egyenlítse ki, vagy bármely Erste Bank fiókjában',
        // Company details text block.
        'HUF – OTP BANK Nyrt. 11734004-20467221-00000000' => 'HUF – Erste Bank Hungary Zrt. 11600006-00000002-08084747',
        'EUR – OTP BANK Zrt. 11763347-60298889' => 'EUR – Erste Bank Hungary Zrt. 11600006-00000002-08084802',
        'IBAN: HU39 1176 3347 6029 8889 0000 0000' => 'IBAN (HUF): HU63 1160 0006 0000 0002 0808 4747<br>IBAN (EUR): HU33 1160 0006 0000 0002 0808 4802',
        'BIC(SWIFT) KÓD: OTPVHUHB' => 'BIC(SWIFT) KÓD: GIBAHUHB',
    ];

    private const SETTINGS = [
        LegalPageContent::GROUP => ['contact_content', 'imprint_content', 'terms_content'],
        BookingConfirmationSettings::GROUP => ['bank_account_number'],
    ];

    public function up(): void
    {
        foreach (self::SETTINGS as $group => $keys) {
            DB::table('site_settings')->where('group', $group)->whereIn('key', $keys)->get(['id', 'value'])
                ->each(fn (object $setting) => $this->replaceIn('site_settings', $setting->id, 'value', $setting->value));
        }

        DB::table('pages')->where('kind', Page::KIND_TEXT_BLOCK)->get(['id', 'content'])
            ->each(fn (object $block) => $this->replaceIn('pages', $block->id, 'content', $block->content));

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS, PublicContentCache::PAGES);
    }

    public function down(): void
    {
        // Content update only.
    }

    private function replaceIn(string $table, int $id, string $column, ?string $text): void
    {
        if (! is_string($text)) {
            return;
        }

        $replaced = strtr($text, self::REPLACEMENTS);

        if ($replaced !== $text) {
            DB::table($table)->where('id', $id)->update([$column => $replaced, 'updated_at' => now()]);
        }
    }
};
