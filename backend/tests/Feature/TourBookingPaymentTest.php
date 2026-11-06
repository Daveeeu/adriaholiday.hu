<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\SiteSetting;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Payment\SimplePay\SimplePayClient;
use App\Support\Booking\BookingPaymentSettings;
use App\Support\Payment\BookingPaymentKind;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TourBookingPaymentTest extends TestCase
{
    use RefreshDatabase;

    private const START_URL = 'https://sandbox.simplepay.hu/payment/v2/start';

    private const QUERY_URL = 'https://sandbox.simplepay.hu/payment/v2/query';

    private const MERCHANT = 'TESTHUF';

    private const SECRET = 'test-secret-key';

    private const TRANSACTION_ID = 612345678;

    private const GATEWAY_URL = 'https://sandbox.simplepay.hu/pay/pay/pspHU/abc';

    private Tour $tour;

    private TourDate $tourDate;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.simplepay.environment' => 'test',
            'services.simplepay.merchants' => ['HUF' => ['id' => self::MERCHANT, 'secret' => self::SECRET]],
            'services.simplepay.redirect_url' => 'https://adriaholiday.test/fizetes/eredmeny',
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

    public function test_a_booking_close_to_departure_pays_the_whole_price_and_returns_the_gateway_url(): void
    {
        $this->departInDays(20);
        $this->fakeSimplePay();

        $response = $this->postJson('/api/bookings', $this->bookingPayload());

        $response->assertCreated()->assertJsonPath('paymentUrl', self::GATEWAY_URL);
        $booking = Booking::query()->findOrFail($response->json('id'));
        $payment = $booking->payments()->sole();

        $this->assertSame(BookingPaymentStatus::STARTED, $payment->status);
        $this->assertSame(BookingPaymentKind::FULL, $payment->kind);
        $this->assertSame((string) self::TRANSACTION_ID, $payment->provider_payment_id);
        $this->assertEquals((float) $booking->total_amount, (float) $payment->amount);

        Http::assertSent(function (Request $request) use ($booking, $payment): bool {
            return $request->url() === self::START_URL
                && $request->hasHeader('Signature', SimplePayClient::sign($request->body(), self::SECRET))
                && $request['merchant'] === self::MERCHANT
                && $request['orderRef'] === $payment->payment_request_id
                && $request['currency'] === 'HUF'
                && $request['methods'] === ['CARD']
                && $request['url'] === 'https://adriaholiday.test/fizetes/eredmeny'
                && $request['customerEmail'] === 'anna@example.com'
                && $request['invoice']['name'] === 'Kovács Anna'
                && $request['invoice']['zip'] === '1051'
                && $request['invoice']['city'] === 'Budapest'
                && $request['invoice']['address'] === 'Fő utca 1.'
                && strlen($request['salt']) === 32
                && $request['total'] === (int) $booking->total_amount;
        });
    }

    public function test_online_payment_takes_the_deposit_of_the_payment_schedule(): void
    {
        $this->fakeSimplePay();

        $payment = $this->book()->payments()->sole();

        $this->assertSame(BookingPaymentKind::DEPOSIT, $payment->kind);
        // 60 days to departure: 40% of 2 × 45 950
        $this->assertEquals(36760, (float) $payment->amount);
    }

    public function test_a_departure_more_than_150_days_away_pays_a_20_percent_deposit_online(): void
    {
        $this->departInDays(200);
        $this->fakeSimplePay();

        // 20% of 2 × 45 950
        $this->assertEquals(18380, (float) $this->book()->payments()->sole()->amount);
    }

    public function test_no_payment_is_started_without_a_merchant_account_or_when_disabled(): void
    {
        Http::fake();
        config(['services.simplepay.merchants.HUF.secret' => null]);

        $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated()->assertJsonPath('paymentUrl', null);

        config(['services.simplepay.merchants.HUF.secret' => self::SECRET]);
        $this->setPaymentSetting('online_payment_enabled', 'boolean', false);

        $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated()->assertJsonPath('paymentUrl', null);

        Http::assertNothingSent();
        $this->assertSame(0, BookingPayment::query()->count());
    }

    public function test_online_payment_needs_the_data_transfer_statement_accepted(): void
    {
        Http::fake();

        $this->postJson('/api/bookings', [...$this->bookingPayload(), 'paymentDataTransferAccepted' => false])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_data_transfer_accepted');

        $this->assertSame(0, Booking::query()->count());
    }

    public function test_the_data_transfer_acceptance_is_recorded_with_the_booking(): void
    {
        $this->fakeSimplePay();

        $this->assertNotNull($this->book()->payload['paymentDataTransferAcceptedAt'] ?? null);
    }

    public function test_a_booking_without_online_payment_needs_no_data_transfer_statement(): void
    {
        Http::fake();
        $this->setPaymentSetting('online_payment_enabled', 'boolean', false);

        $response = $this->postJson('/api/bookings', [...$this->bookingPayload(), 'paymentDataTransferAccepted' => false])->assertCreated();

        $this->assertArrayNotHasKey('paymentDataTransferAcceptedAt', Booking::query()->findOrFail($response->json('id'))->payload);
    }

    public function test_a_simplepay_error_keeps_the_booking_as_unpaid(): void
    {
        Http::fake([self::START_URL => Http::response(['errorCodes' => [5321]])]);

        $response = $this->postJson('/api/bookings', $this->bookingPayload());

        $response->assertCreated()->assertJsonPath('paymentUrl', null);
        $booking = Booking::query()->findOrFail($response->json('id'));
        $this->assertSame('unpaid', $booking->payment_status);
        $this->assertSame(BookingPaymentStatus::FAILED, $booking->payments()->sole()->status);
    }

    public function test_a_gateway_response_with_a_wrong_signature_starts_nothing(): void
    {
        Http::fake([self::START_URL => Http::response(
            ['transactionId' => self::TRANSACTION_ID, 'paymentUrl' => 'https://evil.example/pay'],
            headers: ['Signature' => 'forged'],
        )]);

        $this->postJson('/api/bookings', $this->bookingPayload())->assertCreated()->assertJsonPath('paymentUrl', null);

        $this->assertSame(BookingPaymentStatus::FAILED, BookingPayment::query()->sole()->status);
    }

    public function test_a_signed_ipn_credits_the_booking_exactly_once_and_is_confirmed(): void
    {
        $this->departInDays(20);
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book();

        $response = $this->notify($booking)->assertOk();
        $this->notify($booking)->assertOk();

        $confirmation = json_decode($response->getContent(), true);
        $this->assertSame($booking->payments()->sole()->payment_request_id, $confirmation['orderRef']);
        $this->assertArrayHasKey('receiveDate', $confirmation);
        $this->assertSame(SimplePayClient::sign($response->getContent(), self::SECRET), $response->headers->get('Signature'));

        $booking->refresh();
        $this->assertSame('paid', $booking->payment_status);
        $this->assertEquals((float) $booking->total_amount, (float) $booking->paid_amount);
        $this->assertSame(BookingPaymentStatus::SUCCEEDED, $booking->payments()->sole()->status);
        Http::assertSentCount(2);
    }

    public function test_a_forged_ipn_changes_nothing(): void
    {
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book();

        $this->notify($booking, signature: 'forged')->assertStatus(400);

        $this->assertSame('unpaid', $booking->refresh()->payment_status);
        Http::assertSentCount(1);
    }

    public function test_an_ipn_is_not_confirmed_while_the_state_cannot_be_read(): void
    {
        Http::fake([
            self::START_URL => $this->signed(['transactionId' => self::TRANSACTION_ID, 'paymentUrl' => self::GATEWAY_URL]),
            self::QUERY_URL => Http::response(status: 500),
        ]);
        $booking = $this->book();

        $this->notify($booking)->assertStatus(503);

        $this->assertSame('unpaid', $booking->refresh()->payment_status);
    }

    public function test_a_state_simplepay_adds_later_keeps_the_payment_open(): void
    {
        $this->fakeSimplePay(state: 'SOMETHING_NEW');
        $this->book();

        $this->getJson($this->paymentPath())
            ->assertOk()
            ->assertJsonPath('data.status', BookingPaymentStatus::STARTED);
    }

    public function test_the_customers_signed_return_shows_the_payment(): void
    {
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book();
        $reference = $booking->payments()->sole()->payment_request_id;
        $message = json_encode(['r' => 0, 't' => self::TRANSACTION_ID, 'e' => 'SUCCESS', 'm' => self::MERCHANT, 'o' => $reference]);

        $this->postJson('/api/payments/simplepay/return', ['r' => base64_encode($message), 's' => SimplePayClient::sign($message, self::SECRET)])
            ->assertOk()
            ->assertJsonPath('data.reference', $reference)
            ->assertJsonPath('data.status', BookingPaymentStatus::SUCCEEDED)
            ->assertJsonPath('data.transactionId', (string) self::TRANSACTION_ID);
    }

    public function test_a_forged_return_is_rejected(): void
    {
        $this->fakeSimplePay(state: 'FINISHED');
        $reference = $this->book()->payments()->sole()->payment_request_id;
        $message = json_encode(['m' => self::MERCHANT, 'o' => $reference]);

        $this->postJson('/api/payments/simplepay/return', ['r' => base64_encode($message), 's' => 'forged'])->assertNotFound();
    }

    public function test_succeeded_deposit_marks_the_booking_partially_paid(): void
    {
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book();

        $this->getJson($this->paymentPath())
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
        $this->fakeSimplePay(state: 'INIT');
        $this->book();

        $data = $this->getJson($this->paymentPath())->assertOk()->json('data');

        $this->assertSame(BookingPaymentStatus::STARTED, $data['status']);
        $this->assertSame('Horvát tengerpart', $data['tourName']);
        $this->assertArrayNotHasKey('email', $data);
        $this->assertArrayNotHasKey('customerName', $data);
    }

    #[DataProvider('unattemptedPayments')]
    public function test_a_cancelled_or_timed_out_payment_is_not_shown_as_declined_nor_with_a_transaction_id(string $state, string $failure): void
    {
        $this->fakeSimplePay(state: $state);
        $this->book();

        $this->getJson($this->paymentPath())
            ->assertOk()
            ->assertJsonPath('data.status', BookingPaymentStatus::FAILED)
            ->assertJsonPath('data.failure', $failure)
            ->assertJsonPath('data.transactionId', null);
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function unattemptedPayments(): array
    {
        return ['cancelled' => ['CANCELLED', 'cancelled'], 'timed out' => ['TIMEOUT', 'timeout']];
    }

    public function test_a_declined_payment_shows_its_transaction_id(): void
    {
        $this->fakeSimplePay(state: 'NOTAUTHORIZED');
        $this->book();

        $this->getJson($this->paymentPath())
            ->assertOk()
            ->assertJsonPath('data.failure', 'declined')
            ->assertJsonPath('data.transactionId', (string) self::TRANSACTION_ID);
    }

    public function test_a_failed_payment_can_be_retried_but_an_open_one_cannot(): void
    {
        Http::fake([
            self::START_URL => Http::sequence()
                ->push(...$this->signedParts(['transactionId' => self::TRANSACTION_ID, 'paymentUrl' => self::GATEWAY_URL]))
                ->push(...$this->signedParts(['transactionId' => self::TRANSACTION_ID + 1, 'paymentUrl' => self::GATEWAY_URL.'2'])),
            self::QUERY_URL => Http::sequence()
                ->push(...$this->signedParts(['transactions' => [['transactionId' => self::TRANSACTION_ID, 'status' => 'INPAYMENT']]]))
                ->push(...$this->signedParts(['transactions' => [['transactionId' => self::TRANSACTION_ID, 'status' => 'CANCELLED']]])),
        ]);
        $booking = $this->book();
        $path = $this->paymentPath();

        $this->postJson($path.'/retry')->assertStatus(409);

        $this->getJson($path)
            ->assertOk()
            ->assertJsonPath('data.status', BookingPaymentStatus::FAILED)
            ->assertJsonPath('data.canRetry', true);

        $this->postJson($path.'/retry')
            ->assertOk()
            ->assertJsonPath('paymentUrl', self::GATEWAY_URL.'2');

        $this->assertSame(2, $booking->payments()->count());
        $this->assertSame('unpaid', $booking->refresh()->payment_status);
    }

    public function test_a_paid_booking_cannot_start_another_payment(): void
    {
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book();
        $this->notify($booking)->assertOk();

        $failed = BookingPayment::factory()->for($booking)->create(['status' => BookingPaymentStatus::FAILED]);

        $this->postJson("/api/payments/{$failed->payment_request_id}/retry")->assertStatus(409);
    }

    public function test_a_payment_of_a_former_provider_is_left_alone(): void
    {
        Http::fake();
        $payment = BookingPayment::factory()->for(Booking::factory())->create([
            'provider' => 'barion',
            'status' => BookingPaymentStatus::STARTED,
            'provider_payment_id' => 'barion-id',
        ]);

        $this->getJson("/api/payments/{$payment->payment_request_id}")
            ->assertOk()
            ->assertJsonPath('data.status', BookingPaymentStatus::STARTED);

        Http::assertNothingSent();
    }

    public function test_unknown_payment_references_are_rejected(): void
    {
        Http::fake();

        $this->getJson('/api/payments/'.Str::uuid())->assertNotFound();
        $this->getJson('/api/payments/612345678')->assertNotFound();
        $this->postJson('/api/payments/simplepay/return')->assertStatus(422);

        $body = json_encode(['orderRef' => (string) Str::uuid(), 'merchant' => self::MERCHANT]);
        $this->call('POST', '/api/payments/simplepay/ipn', server: ['HTTP_Signature' => SimplePayClient::sign($body, self::SECRET)], content: $body)
            ->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_offer_detail_tells_the_booking_form_how_much_is_paid_online(): void
    {
        $this->getJson('/api/portfolio/offers/'.$this->tour->seo_name)
            ->assertOk()
            ->assertJsonPath('bookingPayment.provider', 'simplepay')
            ->assertJsonPath('dates.0.depositPercent', 40);

        config(['services.simplepay.merchants.HUF.secret' => null]);

        $this->getJson('/api/portfolio/offers/'.$this->tour->seo_name)
            ->assertOk()
            ->assertJsonPath('bookingPayment', null);
    }

    public function test_a_succeeded_payment_is_reported_to_ga4_as_a_purchase_of_the_booking_visitor(): void
    {
        config(['analytics.google.measurement_id' => 'G-TEST123', 'analytics.google.api_secret' => 'secret']);
        $this->departInDays(20);
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book(['analytics' => [
            'analytics_consent' => true,
            'ga_client_id' => '123456789.1700000000',
            'ga_session_id' => '1700000123',
        ]]);

        $this->notify($booking)->assertOk();
        $this->notify($booking)->assertOk();

        $payment = $booking->payments()->sole();
        $purchases = Http::recorded(fn (Request $request): bool => str_starts_with($request->url(), 'https://www.google-analytics.com/mp/collect'));

        $this->assertCount(1, $purchases);
        [$request] = $purchases->first();
        $this->assertStringContainsString('measurement_id=G-TEST123', $request->url());
        $this->assertStringContainsString('api_secret=secret', $request->url());
        $this->assertSame('123456789.1700000000', $request['client_id']);
        $this->assertSame('purchase', $request['events'][0]['name']);
        $params = $request['events'][0]['params'];
        $this->assertSame("booking-{$booking->id}-payment-{$payment->id}", $params['transaction_id']);
        $this->assertEquals((float) $payment->amount, $params['value']);
        $this->assertSame('HUF', $params['currency']);
        $this->assertSame('1700000123', $params['session_id']);
        $this->assertSame(Str::after($this->tour->publicPath(), '/ajanlat/'), $params['items'][0]['item_id']);
        $this->assertSame(2, $params['items'][0]['quantity']);
    }

    public function test_no_purchase_is_reported_to_ga4_without_analytics_consent(): void
    {
        config(['analytics.google.measurement_id' => 'G-TEST123', 'analytics.google.api_secret' => 'secret']);
        $this->departInDays(20);
        $this->fakeSimplePay(state: 'FINISHED');
        $booking = $this->book(['analytics' => ['analytics_consent' => false, 'ga_client_id' => '123456789.1700000000']]);

        $this->notify($booking)->assertOk();

        $this->assertArrayNotHasKey('googleAnalytics', array_filter($booking->refresh()->payload));
        Http::assertNotSent(fn (Request $request): bool => str_starts_with($request->url(), 'https://www.google-analytics.com/'));
    }

    public function test_a_malformed_ga_client_id_is_rejected(): void
    {
        Http::fake();

        $this->postJson('/api/bookings', [...$this->bookingPayload(), 'analytics' => ['analytics_consent' => true, 'ga_client_id' => '<script>']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('analytics.ga_client_id');
    }

    private function departInDays(int $days): void
    {
        $this->tourDate->update(['start_date' => today()->addDays($days), 'end_date' => today()->addDays($days + 1)]);
    }

    private function fakeSimplePay(string $state = 'INIT'): void
    {
        Http::fake([
            self::START_URL => $this->signed(['transactionId' => self::TRANSACTION_ID, 'paymentUrl' => self::GATEWAY_URL]),
            self::QUERY_URL => $this->signed(['transactions' => [[
                'transactionId' => self::TRANSACTION_ID,
                'status' => $state,
                'finishDate' => $state === 'FINISHED' ? now()->format('Y-m-d\TH:i:sO') : null,
            ]]]),
            'https://www.google-analytics.com/*' => Http::response(status: 204),
        ]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function signed(array $payload): mixed
    {
        return Http::response(...$this->signedParts($payload));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{0: string, 1: int, 2: array<string, string>}
     */
    private function signedParts(array $payload): array
    {
        $body = (string) json_encode($payload);

        return [$body, 200, ['Signature' => SimplePayClient::sign($body, self::SECRET)]];
    }

    private function notify(Booking $booking, ?string $signature = null): TestResponse
    {
        $body = (string) json_encode([
            'salt' => Str::random(32),
            'orderRef' => $booking->payments()->sole()->payment_request_id,
            'method' => 'CARD',
            'merchant' => self::MERCHANT,
            'transactionId' => self::TRANSACTION_ID,
            'status' => 'FINISHED',
        ]);

        return $this->call(
            'POST',
            '/api/payments/simplepay/ipn',
            server: ['CONTENT_TYPE' => 'application/json', 'HTTP_Signature' => $signature ?? SimplePayClient::sign($body, self::SECRET)],
            content: $body,
        );
    }

    private function paymentPath(): string
    {
        return '/api/payments/'.BookingPayment::query()->latest('id')->firstOrFail()->payment_request_id;
    }

    private function setPaymentSetting(string $key, string $type, mixed $value): void
    {
        SiteSetting::query()->updateOrCreate(
            ['group' => BookingPaymentSettings::GROUP, 'key' => $key],
            ['type' => $type, 'is_public' => true, 'value' => SiteSetting::encodeValue($type, $value)],
        );
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function book(array $overrides = []): Booking
    {
        $response = $this->postJson('/api/bookings', [...$this->bookingPayload(), ...$overrides])->assertCreated();

        return Booking::query()->findOrFail($response->json('id'));
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingPayload(): array
    {
        return [
            'termsAccepted' => true,
            'paymentDataTransferAccepted' => true,
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
                'passenger_address' => '1051 Budapest, Fő utca 1.',
                'document_number' => 'AB123456',
            ], range(1, 2)),
        ];
    }
}
