<?php

namespace App\Services\Payment\Barion;

/**
 * A single-item immediate payment to start on the Barion gateway.
 */
final class BarionPaymentRequest
{
    public function __construct(
        public readonly string $paymentRequestId,
        public readonly string $orderNumber,
        public readonly string $itemName,
        public readonly string $itemDescription,
        public readonly float $amount,
        public readonly string $currency,
        public readonly ?string $payerEmail,
        public readonly string $redirectUrl,
        public readonly string $callbackUrl,
    ) {}
}
