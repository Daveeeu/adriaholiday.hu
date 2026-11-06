<?php

use App\Models\SiteSetting;
use App\Support\Booking\BookingPaymentSettings;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Online payment moves from Barion to SimplePay: the Barion Pixel's setting
 * goes, the booking form's card option is renamed (staying as selectable as it
 * was), and the cookie policy loses the pixel. As before, only the untouched
 * previous default policy is replaced; one edited in the admin is left alone.
 * Past payments keep their provider.
 */
return new class extends Migration
{
    private const BARION_CARD_PAYMENT = 'Online bankkártyás fizetés (Barion)';

    private const SIMPLEPAY_CARD_PAYMENT = 'Online bankkártyás fizetés (SimplePay)';

    private const COOKIE_POLICY_KEY = 'cookie_content';

    /** sha1 of the previous default text, set by 2026_11_04_180000_add_clarity_to_cookie_policy. */
    private const PREVIOUS_COOKIE_POLICY_SHA1 = '6e84d86211b5ac18a0fc2a465eda3a9000e09af6';

    public function up(): void
    {
        DB::table('site_settings')
            ->where('group', BookingPaymentSettings::GROUP)
            ->where('key', 'barion_pixel_id')
            ->delete();

        $this->renameCardPayment(self::BARION_CARD_PAYMENT, self::SIMPLEPAY_CARD_PAYMENT);

        $policy = DB::table('site_settings')
            ->where('group', LegalPageContent::GROUP)
            ->where('key', self::COOKIE_POLICY_KEY)
            ->first(['id', 'value']);

        if ($policy !== null && sha1(trim((string) $policy->value)) === self::PREVIOUS_COOKIE_POLICY_SHA1) {
            DB::table('site_settings')->where('id', $policy->id)->update([
                'value' => SiteSetting::encodeValue(LegalPageContent::TYPE, LegalPageContent::defaults()[self::COOKIE_POLICY_KEY]),
                'updated_at' => now(),
            ]);
        }

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        $this->renameCardPayment(self::SIMPLEPAY_CARD_PAYMENT, self::BARION_CARD_PAYMENT);
    }

    private function renameCardPayment(string $from, string $to): void
    {
        DB::table('booking_form_fields')->where('key', 'extra_payment_method')->get(['id', 'options', 'disabled_options'])
            ->each(function (object $field) use ($from, $to): void {
                DB::table('booking_form_fields')->where('id', $field->id)->update([
                    'options' => $this->renamed($field->options, $from, $to),
                    'disabled_options' => $this->renamed($field->disabled_options, $from, $to),
                ]);
            });
    }

    private function renamed(?string $options, string $from, string $to): ?string
    {
        if ($options === null) {
            return null;
        }

        return json_encode(
            array_map(fn (string $option): string => $option === $from ? $to : $option, json_decode($options, true)),
            JSON_UNESCAPED_UNICODE,
        );
    }
};
