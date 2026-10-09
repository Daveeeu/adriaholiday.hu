<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\SiteSetting;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\BookingPaymentSettings;
use App\Support\Payment\BookingPaymentKind;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TourBookingPaymentTest extends TestCase
{
    use RefreshDatabase;

    private const START_URL = 'https://api.test.barion.com/v2/Payment/Start';

    private Tour $tour;

    private TourDate $tourDate;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.barion.environment' => 'test',
            'services.barion.pos_key' => 'test-pos-key',
            'services.barion.payee' => 'payee@example.com',
            'services.barion.redirect_url' => 'https://adriaholiday.test/fizetes/eredmeny',
        ]);

        $this->tour = Tour::factory()->create(['active' => true, 'booking_form_template_id' => null, 'name' => 'Horvát tengerpart']);
        $this->tourDate = TourDate::factory()->for($this->tour)->create([
            'start_date' => today()->addDays(60),
            'end_date' => today()->addDays(61),
            'price' => 45950,
            'price_box_price' => 45950,
            'price_box_available_seats' => null,
        ]);
    }

    public function test_booking_starts_a_full_barion_payment_and_returns_the_gateway_url(): void
    {
        $this->fakeBarionStart('pay-1');

        $response = $this->postJson('/api/bookings', $this->bookingPayload());

        $response->assertCreated()->assertJsonPath('paymentUrl', 'https://secure.test.barion.com/Pay?id=pay-1');
        $booking = Booking::query()->findOrFail($response->json('id'));
        $payment = $booking->payments()->sole();

        $this->assertSame(BookingPaymentStatus::STARTED, $payment->status);
        $this->assertSame(BookingPaymentKind::FULL, $payment->kind);
        $this->assertSame('pay-1', $payment->provider_payment_id);
        $this->assertEquals((float) $booking->total_amount, (float) $payment->amount);

        Http::assertSent(function (Request $request) use ($booking, $payment): bool {
            return $request->url() === self::START_URL
                && $request->hasHeader('x-pos-key', 'test-pos-key')
                && $request['PaymentRequestId'] === $payment->payment_request_id
                && $request['Currency'] === 'HUF'
                && $request['RedirectUrl'] === 'https://adriaholiday.test/fizetes/eredmeny'
                && str_ends_with($request['CallbackUrl'], '/api/payments/barion/callback')
                && $request['Transactions'][0]['Payee'] === 'payee@example.com'
                && (float) $request['Transactions'][0]['Total'] === (float) $booking->total_amount;
        });
    }

    public function test_deposit_setting_charges_the_configured_percentage_rounded_to_whole_forints(): void
    {
        $this->setPaymentSetting('online_payment_kind', 'string', BookingPaymentKind::DEPOSIT);
        $this->setPaymentSetting('online_payment_deposit_percent', 'number', 33);
        $this->fakeBarionStart('pay-1');

        $booking = $this->book();
        $payment = $booking->payments()->sole();

        $this->assertSame(BookingPaymentKind::DEPOSIT, $payment->kind);
        // 33% of 2 × 45 950 = 30 327
        $this->assertEquals(30327, (float) $payment->amount);
    }

    public function test_no_payment_is_started_without_barion_credentials_or_when_disabled(): void
    {
        Http::fake();
        config(['services.barion.pos_key' => null]);

        $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated()->assertJsonPath('paymentUrl', null);

        config(['services.barion.pos_key' => 'test-pos-key']);
        $this->setPaymentSetting('online_payment_enabled', 'boolean', false);

        $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated()->assertJsonPath('paymentUrl', null);

        Http::assertNothingSent();
        $this->assertSame(0, BookingPayment::query()->count());
    }

    public function test_a_barion_error_keeps_the_booking_as_unpaid(): void
    {
        Http::fake([self::START_URL => Http::response(['Errors' => [['ErrorCode' => 'InvalidPosKey', 'Title' => 'Invalid POS key']]], 400)]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload());

        $response->assertCreated()->assertJsonPath('paymentUrl', null);
        $booking = Booking::query()->findOrFail($response->json('id'));
        $this->assertSame('unpaid', $booking->payment_status);
        $this->assertSame(BookingPaymentStatus::FAILED, $booking->payments()->sole()->status);
    }

    public function test_succeeded_callback_credits_the_booking_exactly_once(): void
    {
        $this->fakeBarionStart('pay-1', state: 'Succeeded');
        $booking = $this->book();

        $this->post('/api/payments/barion/callback', ['paymentId' => 'pay-1'])->assertOk();
        $this->post('/api/payments/barion/callback', ['paymentId' => 'pay-1'])->assertOk();

        $booking->refresh();
        $this->assertSame('paid', $booking->payment_status);
        $this->assertEquals((float) $booking->total_amount, (float) $booking->paid_amount);
        $this->assertSame(BookingPaymentStatus::SUCCEEDED, $booking->payments()->sole()->status);
        Http::assertSentCount(2);
    }

    public function test_succeeded_deposit_marks_the_booking_partially_paid(): void
    {
        $this->setPaymentSetting('online_payment_kind', 'string', BookingPaymentKind::DEPOSIT);
        $this->setPaymentSetting('online_payment_deposit_percent', 'number', 40);
        $this->fakeBarionStart('pay-1', state: 'Succeeded');
        $booking = $this->book();

        $this->getJson('/api/payments/barion/pay-1')
            ->assertOk()
            ->assertJsonPath('data.status', BookingPaymentStatus::SUCCEEDED)
            ->assertJsonPath('data.kind', BookingPaymentKind::DEPOSIT)
            ->assertJsonPath('data.canRetry', false);

        $booking->refresh();
        $this->assertSame('partial', $booking->payment_status);
        $this->assertEquals(36760, (float) $booking->paid_amount);
    }

    public function test_result_page_exposes_no_personal_data(): void
    {
        $this->fakeBarionStart('pay-1', state: 'Prepared');
        $this->book();

        $data = $this->getJson('/api/payments/barion/pay-1')->assertOk()->json('data');

        $this->assertSame(BookingPaymentStatus::STARTED, $data['status']);
        $this->assertSame('Horvát tengerpart', $data['tourName']);
        $this->assertArrayNotHasKey('email', $data);
        $this->assertArrayNotHasKey('customerName', $data);
    }

    public function test_a_failed_payment_can_be_retried_but_an_open_one_cannot(): void
    {
        Http::fake([
            self::START_URL => Http::sequence()
                ->push(['PaymentId' => 'pay-1', 'Status' => 'Prepared', 'Errors' => []])
                ->push(['PaymentId' => 'pay-2', 'Status' => 'Prepared', 'Errors' => []]),
            'https://api.test.barion.com/v4/Payment/pay-1/PaymentState' => Http::sequence()
                ->push(['PaymentId' => 'pay-1', 'Status' => 'Started', 'Errors' => []])
                ->push(['PaymentId' => 'pay-1', 'Status' => 'Canceled', 'Errors' => []]),
        ]);
        $booking = $this->book();

        $this->postJson('/api/payments/barion/pay-1/retry')->assertStatus(409);

        $this->getJson('/api/payments/barion/pay-1')
            ->assertOk()
            ->assertJsonPath('data.status', BookingPaymentStatus::FAILED)
            ->assertJsonPath('data.canRetry', true);

        $this->postJson('/api/payments/barion/pay-1/retry')
            ->assertOk()
            ->assertJsonPath('paymentUrl', 'https://secure.test.barion.com/Pay?id=pay-2');

        $this->assertSame(2, $booking->payments()->count());
        $this->assertSame('unpaid', $booking->refresh()->payment_status);
    }

    public function test_a_paid_booking_cannot_start_another_payment(): void
    {
        $this->fakeBarionStart('pay-1', state: 'Succeeded');
        $booking = $this->book();
        $this->post('/api/payments/barion/callback', ['paymentId' => 'pay-1'])->assertOk();

        $failed = BookingPayment::factory()->for($booking)->create(['status' => BookingPaymentStatus::FAILED]);

        $this->postJson("/api/payments/barion/{$failed->provider_payment_id}/retry")->assertStatus(409);
    }

    public function test_unknown_payment_ids_are_rejected(): void
    {
        Http::fake();

        $this->post('/api/payments/barion/callback', ['paymentId' => 'unknown'])->assertNotFound();
        $this->postJson('/api/payments/barion/callback')->assertStatus(422);
        $this->getJson('/api/payments/barion/unknown')->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_offer_detail_tells_the_booking_form_how_much_is_paid_online(): void
    {
        $this->setPaymentSetting('online_payment_kind', 'string', BookingPaymentKind::DEPOSIT);

        $this->getJson('/api/portfolio/offers/'.$this->tour->seo_name)
            ->assertOk()
            ->assertJsonPath('bookingPayment.kind', BookingPaymentKind::DEPOSIT)
            ->assertJsonPath('bookingPayment.depositPercent', 30);

        config(['services.barion.pos_key' => null]);

        $this->getJson('/api/portfolio/offers/'.$this->tour->seo_name)
            ->assertOk()
            ->assertJsonPath('bookingPayment', null);
    }

    private function fakeBarionStart(string $paymentId, string $state = 'Prepared'): void
    {
        Http::fake([
            self::START_URL => Http::response(['PaymentId' => $paymentId, 'Status' => 'Prepared', 'Errors' => []]),
            'https://api.test.barion.com/v4/Payment/*' => Http::response([
                'PaymentId' => $paymentId,
                'Status' => $state,
                'CompletedAt' => $state === 'Succeeded' ? now()->toIso8601String() : null,
                'Errors' => [],
            ]),
        ]);
    }

    private function setPaymentSetting(string $key, string $type, mixed $value): void
    {
        SiteSetting::query()->updateOrCreate(
            ['group' => BookingPaymentSettings::GROUP, 'key' => $key],
            ['type' => $type, 'is_public' => true, 'value' => SiteSetting::encodeValue($type, $value)],
        );
    }

    private function book(): Booking
    {
        $response = $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated();

        return Booking::query()->findOrFail($response->json('id'));
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingPayload(): array
    {
        return [
            'termsAccepted' => true,
            'tourId' => $this->tour->id,
            'tourDateId' => $this->tourDate->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
                'contact_postal_code' => '1051',
                'contact_city' => 'Budapest',
                'contact_address' => 'Fő utca 1.',
            ],
            'passengers' => array_map(fn (int $index): array => [
                'passenger_name' => "Utas {$index}",
                'passenger_birth_date' => '1990-01-01',
            ], range(1, 2)),
        ];
    }
}
