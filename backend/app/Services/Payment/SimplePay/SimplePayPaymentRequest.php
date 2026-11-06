<?php

namespace App\Services\Payment\SimplePay;

/**
 * An immediate card payment to start on the SimplePay gateway. Any null
 * payer detail is asked for on the payment page instead.
 */
final class SimplePayPaymentRequest
{
    public function __construct(
        public readonly string $orderRef,
        public readonly float $amount,
        public readonly string $currency,
        public readonly ?string $payerEmail,
        public readonly ?string $payerName,
        public readonly ?string $postalCode,
        public readonly ?string $city,
        public readonly ?string $address,
        public readonly ?string $phone,
        public readonly string $redirectUrl,
    ) {}
}
