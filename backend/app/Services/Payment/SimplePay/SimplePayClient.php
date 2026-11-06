<?php

namespace App\Services\Payment\SimplePay;

use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Thin client for the SimplePay v2 API: starts immediate card payments
 * (start), reads their state (query) and authenticates what SimplePay sends
 * to us (the customer's return and the IPN). Every message is signed with
 * HMAC-SHA384 using the secret key of the merchant account, which is bound to
 * one currency. The secret key is never logged.
 */
class SimplePayClient
{
    public const CANCELLED = 'CANCELLED';

    public const TIMEOUT = 'TIMEOUT';

    private const API_URLS = [
        'prod' => 'https://secure.simplepay.hu/payment/v2',
        'test' => 'https://sandbox.simplepay.hu/payment/v2',
    ];

    private const SDK_VERSION = 'AdriaHoliday_Laravel_1.0';

    /** How long the customer has to start paying on the gateway, in minutes. */
    private const PAYMENT_WINDOW_MINUTES = 30;

    private const SUCCEEDED_STATE = 'FINISHED';

    /** Final SimplePay states in which no money was taken. */
    private const FAILED_STATES = [self::CANCELLED, self::TIMEOUT, 'NOTAUTHORIZED', 'FRAUD', 'REVERSED'];

    /** The form has no country field; card issuers get the merchant's market. */
    private const INVOICE_COUNTRY = 'HU';

    /** threeDSReqAuthMethod: the customer books as a guest. */
    private const GUEST_CUSTOMER = '01';

    public function isConfigured(): bool
    {
        return collect(array_keys((array) config('services.simplepay.merchants')))
            ->contains(fn (string $currency): bool => $this->supportsCurrency($currency));
    }

    public function supportsCurrency(string $currency): bool
    {
        $merchant = config("services.simplepay.merchants.{$currency}");

        return is_array($merchant) && filled($merchant['id'] ?? null) && filled($merchant['secret'] ?? null);
    }

    /**
     * @return array{transactionId: string, paymentUrl: string}
     *
     * @throws SimplePayException
     */
    public function startPayment(SimplePayPaymentRequest $payment): array
    {
        $response = $this->send('/start', $payment->currency, [
            'orderRef' => $payment->orderRef,
            'currency' => $payment->currency,
            'language' => 'HU',
            'methods' => ['CARD'],
            'total' => $payment->currency === 'HUF' ? (int) round($payment->amount) : round($payment->amount, 2),
            'timeout' => now()->addMinutes(self::PAYMENT_WINDOW_MINUTES)->toIso8601String(),
            'url' => $payment->redirectUrl,
            'threeDSReqAuthMethod' => self::GUEST_CUSTOMER,
            ...$this->payerFields($payment),
        ]);

        $transactionId = $response->json('transactionId');
        $paymentUrl = $response->json('paymentUrl');

        if (! is_numeric($transactionId) || ! is_string($paymentUrl) || $paymentUrl === '') {
            throw new SimplePayException('SimplePay did not return a transaction.');
        }

        return ['transactionId' => (string) $transactionId, 'paymentUrl' => $paymentUrl];
    }

    /**
     * @return array{status: string, providerStatus: string, completedAt: string|null}
     *
     * @throws SimplePayException
     */
    public function paymentState(string $transactionId, string $currency): array
    {
        $response = $this->send('/query', $currency, ['transactionIds' => [$transactionId]]);
        $transaction = collect($response->json('transactions') ?? [])
            ->first(fn (mixed $item): bool => is_array($item) && (string) ($item['transactionId'] ?? '') === $transactionId);

        if ($transaction === null) {
            throw new SimplePayException('SimplePay did not return the queried transaction.');
        }

        $providerStatus = (string) ($transaction['status'] ?? '');
        $finishDate = $transaction['finishDate'] ?? null;

        return [
            'status' => self::toPaymentStatus($providerStatus),
            'providerStatus' => $providerStatus,
            'completedAt' => is_string($finishDate) && $finishDate !== '' ? $finishDate : null,
        ];
    }

    /**
     * Anything not known to be final stays open: a failed payment is never
     * looked at again, so an unknown state must not lose a later success.
     */
    public static function toPaymentStatus(string $providerStatus): string
    {
        return match (true) {
            $providerStatus === self::SUCCEEDED_STATE => BookingPaymentStatus::SUCCEEDED,
            in_array($providerStatus, self::FAILED_STATES, true) => BookingPaymentStatus::FAILED,
            default => BookingPaymentStatus::STARTED,
        };
    }

    /**
     * The order of the customer's return from the gateway. Only identifies
     * the payment: the event in it is not the transaction's final state.
     *
     * @throws SimplePayException
     */
    public function orderRefOfReturn(string $encodedResult, string $signature): string
    {
        $message = base64_decode($encodedResult, true);
        $result = is_string($message) ? json_decode($message, true) : null;

        if (! is_array($result) || ! is_string($result['o'] ?? null)) {
            throw new SimplePayException('SimplePay return is malformed.');
        }

        $this->assertSigned($message, $signature, $this->secretOfMerchant($result['m'] ?? null));

        return $result['o'];
    }

    /**
     * @return array<string, mixed> the authenticated IPN message
     *
     * @throws SimplePayException
     */
    public function readNotification(string $body, ?string $signature): array
    {
        $notification = json_decode($body, true);

        if (! is_array($notification) || ! is_string($notification['orderRef'] ?? null)) {
            throw new SimplePayException('SimplePay notification is malformed.');
        }

        $this->assertSigned($body, $signature, $this->secretOfMerchant($notification['merchant'] ?? null));

        return $notification;
    }

    /**
     * The signed answer that stops SimplePay repeating an IPN message: the
     * message itself with the time we received it.
     *
     * @param  array<string, mixed>  $notification
     * @return array{body: string, signature: string}
     */
    public function confirmNotification(array $notification): array
    {
        $body = $this->encode([...$notification, 'receiveDate' => now()->toIso8601String()]);

        return ['body' => $body, 'signature' => self::sign($body, $this->secretOfMerchant($notification['merchant'] ?? null))];
    }

    public static function sign(string $message, string $secret): string
    {
        return base64_encode(hash_hmac('sha384', $message, $secret, true));
    }

    /**
     * @return array<string, mixed>
     */
    private function payerFields(SimplePayPaymentRequest $payment): array
    {
        $invoice = [
            'name' => $payment->payerName,
            'country' => self::INVOICE_COUNTRY,
            'state' => $payment->city,
            'city' => $payment->city,
            'zip' => $payment->postalCode,
            'address' => $payment->address,
        ];

        return [
            ...(filled($payment->payerEmail) ? ['customerEmail' => $payment->payerEmail] : ['maySelectEmail' => true]),
            ...(collect($invoice)->every(fn (?string $value): bool => filled($value))
                ? ['invoice' => array_filter([...$invoice, 'phone' => $payment->phone])]
                : ['maySelectInvoice' => true]),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     *
     * @throws SimplePayException
     */
    private function send(string $path, string $currency, array $payload): Response
    {
        if (! $this->supportsCurrency($currency)) {
            throw new SimplePayException("SimplePay has no merchant account for {$currency}.");
        }

        $merchant = config("services.simplepay.merchants.{$currency}");
        $body = $this->encode([
            'salt' => Str::random(32),
            'merchant' => $merchant['id'],
            'sdkVersion' => self::SDK_VERSION,
            ...$payload,
        ]);

        try {
            $response = Http::baseUrl($this->apiUrl())
                ->timeout((int) config('services.simplepay.timeout', 15))
                ->withHeaders(['Signature' => self::sign($body, $merchant['secret'])])
                ->withBody($body, 'application/json')
                ->post($path);
        } catch (ConnectionException $exception) {
            throw new SimplePayException('SimplePay is unreachable: '.$exception->getMessage(), previous: $exception);
        }

        $errorCodes = (array) $response->json('errorCodes', []);

        if ($response->failed() || $errorCodes !== []) {
            throw new SimplePayException(sprintf(
                'SimplePay request failed (HTTP %d): %s',
                $response->status(),
                implode(', ', $errorCodes) ?: 'no details',
            ));
        }

        $this->assertSigned($response->body(), $response->header('Signature'), $merchant['secret']);

        return $response;
    }

    /**
     * @throws SimplePayException
     */
    private function assertSigned(string $message, ?string $signature, string $secret): void
    {
        if (! is_string($signature) || ! hash_equals(self::sign($message, $secret), $signature)) {
            throw new SimplePayException('SimplePay signature does not match.');
        }
    }

    /**
     * @throws SimplePayException
     */
    private function secretOfMerchant(mixed $merchantId): string
    {
        $merchant = collect((array) config('services.simplepay.merchants'))
            ->first(fn (array $merchant): bool => filled($merchant['secret'] ?? null) && ($merchant['id'] ?? null) === $merchantId);

        if ($merchant === null) {
            throw new SimplePayException('SimplePay message names an unknown merchant.');
        }

        return $merchant['secret'];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function encode(array $payload): string
    {
        return json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function apiUrl(): string
    {
        return self::API_URLS[config('services.simplepay.environment') === 'prod' ? 'prod' : 'test'];
    }
}
