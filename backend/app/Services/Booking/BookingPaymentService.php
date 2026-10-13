<?php

namespace App\Services\Booking;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Services\Payment\Barion\BarionClient;
use App\Services\Payment\Barion\BarionException;
use App\Services\Payment\Barion\BarionPaymentRequest;
use App\Support\Booking\BookingPaymentSchedule;
use App\Support\Booking\BookingPaymentSettings;
use App\Support\Booking\TourBookingStatus;
use App\Support\Payment\BookingPaymentKind;
use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Online payment of tour bookings through Barion.
 *
 * Right after booking the customer is sent to the Barion gateway to pay
 * the deposit: the first instalment of BookingPaymentSchedule (the whole
 * price when the departure is close).
 * A failed or abandoned payment leaves the booking in place as unpaid and
 * can be retried. Barion's callback and the customer's return both only
 * trigger a state query, so the booking is credited from what Barion
 * reports, never from what the request claims, and exactly once.
 */
class BookingPaymentService
{
    public const PROVIDER = 'barion';

    public function __construct(private readonly BarionClient $barion) {}

    /**
     * What the public booking form tells the customer about paying online,
     * or null when bookings in this currency cannot be paid online. The
     * deposit's share of each date comes with the date.
     *
     * @return array{provider: string}|null
     */
    public function publicOptions(string $currency): ?array
    {
        if (! $this->isEnabled(BookingPaymentSettings::load()) || ! $this->barion->supportsCurrency($currency)) {
            return null;
        }

        return ['provider' => self::PROVIDER];
    }

    public function canStart(Booking $booking): bool
    {
        return $booking->booking_type === 'tour_booking'
            && (float) $booking->total_amount > 0
            && ! in_array($booking->status, [TourBookingStatus::CANCELLED, TourBookingStatus::EXPIRED], true)
            && $this->barion->supportsCurrency((string) $booking->currency)
            && ! $booking->payments()->where('status', BookingPaymentStatus::SUCCEEDED)->exists()
            && $this->isEnabled(BookingPaymentSettings::load());
    }

    /**
     * Starts a payment for the booking and returns the Barion gateway URL
     * to send the customer to, or null when online payment is not possible
     * for this booking or Barion refused it (the reason is logged).
     */
    public function start(Booking $booking): ?string
    {
        if (! $this->canStart($booking)) {
            return null;
        }

        $due = $this->amountDue($booking);

        if ($due['amount'] <= 0) {
            return null;
        }

        $payment = $booking->payments()->create([
            'provider' => self::PROVIDER,
            'payment_request_id' => (string) Str::uuid(),
            'status' => BookingPaymentStatus::PENDING,
            'kind' => $due['kind'],
            'amount' => $due['amount'],
            'currency' => $booking->currency,
        ]);

        try {
            $started = $this->barion->startPayment(new BarionPaymentRequest(
                paymentRequestId: $payment->payment_request_id,
                orderNumber: 'AH-'.$booking->id,
                itemName: (string) ($booking->offer_name_snapshot ?: 'Utazás foglalás'),
                itemDescription: sprintf(
                    '%s – foglalás #%d',
                    $due['kind'] === BookingPaymentKind::DEPOSIT ? 'Előleg' : 'Részvételi díj',
                    $booking->id,
                ),
                amount: $due['amount'],
                currency: (string) $booking->currency,
                payerEmail: $booking->email,
                redirectUrl: (string) (config('services.barion.redirect_url') ?: url('/fizetes/eredmeny')),
                callbackUrl: route('payments.barion.callback'),
            ));
        } catch (BarionException $exception) {
            Log::error('Barion payment could not be started.', [
                'booking_id' => $booking->id,
                'booking_payment_id' => $payment->id,
                'error' => $exception->getMessage(),
            ]);
            $payment->update(['status' => BookingPaymentStatus::FAILED]);

            return null;
        }

        $payment->update([
            'provider_payment_id' => $started['paymentId'],
            'provider_status' => $started['status'],
            'status' => BookingPaymentStatus::STARTED,
        ]);

        return $started['gatewayUrl'];
    }

    /**
     * Refreshes the payment from Barion and, when it has just succeeded,
     * credits the booking. Final payments are returned untouched; when
     * Barion cannot be reached the stored state is returned as is.
     */
    public function sync(BookingPayment $payment): BookingPayment
    {
        if (BookingPaymentStatus::isFinal($payment->status) || $payment->provider_payment_id === null) {
            return $payment;
        }

        try {
            $state = $this->barion->paymentState($payment->provider_payment_id);
        } catch (BarionException $exception) {
            Log::warning('Barion payment state could not be read.', [
                'booking_payment_id' => $payment->id,
                'error' => $exception->getMessage(),
            ]);

            return $payment;
        }

        return DB::transaction(function () use ($payment, $state): BookingPayment {
            $locked = BookingPayment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if (BookingPaymentStatus::isFinal($locked->status)) {
                return $locked;
            }

            $locked->update([
                'status' => $state['status'],
                'provider_status' => $state['providerStatus'],
                'completed_at' => $state['completedAt'] !== null ? Carbon::parse($state['completedAt']) : null,
            ]);

            if ($state['status'] === BookingPaymentStatus::SUCCEEDED) {
                $this->credit($locked);
            }

            return $locked;
        });
    }

    private function credit(BookingPayment $payment): void
    {
        $booking = Booking::query()->whereKey($payment->booking_id)->lockForUpdate()->firstOrFail();
        $paidAmount = (float) $booking->paid_amount + (float) $payment->amount;

        // A full payment settles the booking even when the total had to be
        // rounded to whole forints for Barion.
        $settled = $payment->kind === BookingPaymentKind::FULL || $paidAmount >= (float) $booking->total_amount;

        $booking->update([
            'paid_amount' => $paidAmount,
            'payment_status' => $settled ? 'paid' : 'partial',
        ]);
    }

    /**
     * The deposit (first instalment); a booking without a price breakdown or
     * departure date, or one paid in a single instalment, pays its total.
     *
     * @return array{kind: string, amount: float}
     */
    private function amountDue(Booking $booking): array
    {
        $instalments = BookingPaymentSchedule::forBooking($booking)?->instalments() ?? [];

        if (count($instalments) > 1) {
            return ['kind' => BookingPaymentKind::DEPOSIT, 'amount' => $instalments[0]['amount']];
        }

        $decimals = $booking->currency === 'HUF' ? 0 : 2;

        return ['kind' => BookingPaymentKind::FULL, 'amount' => round((float) $booking->total_amount, $decimals)];
    }

    private function isEnabled(BookingPaymentSettings $settings): bool
    {
        return $settings->enabled && $this->barion->isConfigured();
    }
}
