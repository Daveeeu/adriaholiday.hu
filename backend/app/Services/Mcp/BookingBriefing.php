<?php

namespace App\Services\Mcp;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\EmailLog;
use App\Support\Booking\BookingAdminPath;
use App\Support\Booking\BookingDocumentData;
use App\Support\Booking\TourBookingStatus;
use Spatie\Activitylog\Models\Activity;

/**
 * Bookings, inquiries and apartment bookings as the AI assistant reads them:
 * a short line for lists, and for one booking everything the admin's booking
 * sheet shows (passengers, price breakdown, instalments, payments, e-mails
 * and its history).
 */
class BookingBriefing
{
    private const HISTORY_LIMIT = 30;

    public function __construct(private readonly McpLinks $links) {}

    /**
     * @return array<string, mixed>
     */
    public function summary(Booking $booking): array
    {
        return array_filter([
            'id' => $booking->id,
            'booking_type' => $booking->booking_type,
            'status' => $booking->status,
            'status_label' => $booking->booking_type === 'tour_booking' ? TourBookingStatus::label((string) $booking->status) : null,
            'cancelled' => (bool) $booking->cancelled,
            'customer_name' => $booking->customer_name ?? $booking->partner_name_snapshot,
            'email' => $booking->email,
            'phone' => $booking->phone,
            'trip' => $booking->offer_name_snapshot ?? $booking->apartment_name_snapshot ?? $booking->property_name_snapshot,
            'tour_id' => $booking->tour_id,
            'tour_date_id' => $booking->tour_date_id,
            'apartment_id' => $booking->apartment_id,
            'offer_code' => $booking->offer_code,
            'departure_date' => $booking->departure_date?->toDateString(),
            'check_in' => $booking->check_in?->toDateString(),
            'check_out' => $booking->check_out?->toDateString(),
            'passengers' => $booking->passenger_count,
            'adults' => $booking->adults,
            'children' => $booking->children,
            'total_amount' => $booking->total_amount !== null ? (float) $booking->total_amount : null,
            'paid_amount' => $booking->paid_amount !== null ? (float) $booking->paid_amount : null,
            'currency' => $booking->currency,
            'payment_status' => $booking->payment_status,
            'coupon_code' => $booking->coupon_code,
            'created_at' => $booking->created_at?->toDateTimeString(),
            'admin_url' => $this->links->admin(BookingAdminPath::for($booking->booking_type)),
        ], fn (mixed $value): bool => $value !== null && $value !== '');
    }

    /**
     * @return array<string, mixed>
     */
    public function details(Booking $booking): array
    {
        $document = (new BookingDocumentData($booking, $booking->tour))->toArray();

        return [
            ...$this->summary($booking),
            'contact' => $document['contactRows'],
            'address' => trim(implode(' ', array_filter([$booking->country, $booking->city, $booking->address]))) ?: null,
            'trip_details' => $document['tripRows'],
            'passenger_details' => $document['passengers'],
            'chosen_options' => $document['extraRows'],
            'customer_message' => $booking->message,
            'customer_notes' => $booking->notes,
            'admin_note' => $booking->admin_note,
            'price_breakdown' => $document['priceRows'],
            'price_total' => $document['total'],
            'insurances' => $document['insuranceNames'],
            'payment_method' => $document['paymentMethod'],
            'payment_schedule' => $document['paymentSchedule'],
            'payments' => $booking->payments
                ->map(fn (BookingPayment $payment): array => [
                    'kind' => $payment->kind,
                    'status' => $payment->status,
                    'amount' => (float) $payment->amount,
                    'currency' => $payment->currency,
                    'provider' => $payment->provider,
                    'started_at' => $payment->created_at?->toDateTimeString(),
                    'completed_at' => $payment->completed_at?->toDateTimeString(),
                ])
                ->values()
                ->all(),
            'emails' => $booking->emailLogs
                ->map(fn (EmailLog $email): array => [
                    'subject' => $email->subject,
                    'to' => $email->to,
                    'status' => $email->status,
                    'sent_at' => $email->sent_at?->toDateTimeString(),
                    'error' => $email->error,
                ])
                ->values()
                ->all(),
            'history' => Activity::query()
                ->where('subject_type', Booking::class)
                ->where('subject_id', $booking->id)
                ->with('causer')
                ->latest()
                ->latest('id')
                ->limit(self::HISTORY_LIMIT)
                ->get()
                ->map(fn (Activity $activity): array => [
                    'at' => $activity->created_at?->toDateTimeString(),
                    'event' => $activity->event,
                    'by' => $activity->causer?->name ?? 'rendszer / ügyfél',
                    // The form payload is the booking itself (shown above), not a change worth repeating.
                    'changes' => collect($activity->attribute_changes?->get('attributes') ?? [])->except('payload')->all(),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * The relations details() reads.
     *
     * @return array<int, string>
     */
    public static function detailRelations(): array
    {
        return ['tour', 'tourDate', 'payments', 'emailLogs'];
    }
}
