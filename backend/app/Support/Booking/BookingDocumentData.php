<?php

namespace App\Support\Booking;

use App\Models\Booking;
use App\Models\BookingFormField;
use App\Models\SiteSetting;
use App\Models\Tour;
use App\Models\TourReferenceOption;
use App\Services\Booking\BookingFormValidationService;
use App\Services\Booking\BookingPaymentService;
use App\Support\CompanyContact;
use Illuminate\Support\Str;

/**
 * Everything a booking document shows – the customer's confirmation e-mail and the
 * admin's booking PDF: contact and passenger details, the trip, the price breakdown,
 * insurance, how and until when to pay, entry requirements and the agency's details.
 *
 * The tour is optional: bookings imported from the legacy site may belong to a trip
 * that does not exist here, and then show the trip name stored with the booking.
 */
final class BookingDocumentData
{
    private const PAYMENT_METHOD_KEY = 'extra_payment_method';

    private const ENTRY_REQUIREMENTS_URL = 'https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/';

    private const TRAVEL_MODES = ['bus' => 'Autóbusszal', 'plane' => 'Repülővel', 'train' => 'Vonattal'];

    public function __construct(
        private readonly Booking $booking,
        private readonly ?Tour $tour,
    ) {}

    public function tripName(): string
    {
        return $this->tour?->name ?? (string) ($this->booking->offer_name_snapshot ?: 'Utazás');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $prices = BookingPriceSummary::of($this->booking);
        $settings = BookingConfirmationSettings::load();
        $formData = $this->booking->payload['formData'] ?? [];

        return [
            'booking' => $this->booking,
            'tripName' => $this->tripName(),
            'customerName' => $this->booking->customer_name ?: 'Utazó',
            'contactRows' => $this->fieldRows($formData, [BookingFormField::PASSENGER_GROUP, BookingFormField::EXTRA_GROUP]),
            'passengers' => array_map(
                fn (array $passenger): array => $this->fieldRows($passenger),
                $this->booking->payload['passengers'] ?? [],
            ),
            'tripRows' => $this->tripRows($prices),
            'extraRows' => $this->extraRows($formData),
            'note' => $this->booking->message,
            'priceRows' => $prices?->rows() ?? [],
            'total' => $prices?->total() ?? $this->storedTotal(),
            'insuranceNames' => $prices?->insuranceNames() ?? [],
            'paymentMethod' => $formData[self::PAYMENT_METHOD_KEY] ?? null,
            'bankTransfer' => $this->bankTransfer($prices, $settings),
            'entryRequirementLinks' => $this->entryRequirementLinks(),
            'termsUrl' => rtrim((string) config('app.url'), '/').'/aszf',
            'company' => $this->company($settings),
        ];
    }

    /**
     * Imported bookings carry their total but no price breakdown.
     */
    private function storedTotal(): ?string
    {
        return $this->booking->total_amount !== null
            ? number_format((float) $this->booking->total_amount, 0, ',', '.').' Ft'
            : null;
    }

    /**
     * Label/value rows of the given form values in the booking form's field order.
     *
     * @param  array<string, mixed>  $values
     * @param  array<int, string>  $excludedGroups
     * @return array<int, array{label: string, value: string}>
     */
    private function fieldRows(array $values, array $excludedGroups = []): array
    {
        $labels = BookingFormValidationService::fieldLabels();
        $excludedKeys = BookingFormField::query()->whereIn('input_group', $excludedGroups)->pluck('key')->all();
        $order = BookingFormField::query()->orderBy('sort_order')->pluck('key')->flip();

        return collect($values)
            ->filter(fn (mixed $value, string $key): bool => trim((string) $value) !== ''
                && $key !== 'note'
                && ! in_array($key, $excludedKeys, true))
            ->sortBy(fn (mixed $value, string $key): int => $order[$key] ?? PHP_INT_MAX)
            ->map(fn (mixed $value, string $key): array => ['label' => $labels[$key] ?? Str::headline($key), 'value' => (string) $value])
            ->values()
            ->all();
    }

    /**
     * The extra options chosen on the last step, except the payment method shown on its own.
     *
     * @param  array<string, mixed>  $formData
     * @return array<int, array{label: string, value: string}>
     */
    private function extraRows(array $formData): array
    {
        $extraKeys = BookingFormField::query()
            ->where('input_group', BookingFormField::EXTRA_GROUP)
            ->where('key', '!=', self::PAYMENT_METHOD_KEY)
            ->pluck('key')
            ->all();

        return $this->fieldRows(array_intersect_key($formData, array_flip($extraKeys)));
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function tripRows(?BookingPriceSummary $prices): array
    {
        $date = $this->booking->tourDate;
        $start = $date?->start_date ?? $this->booking->departure_date;
        $end = $date?->end_date;

        return array_values(array_filter([
            ['label' => 'Utazás', 'value' => $this->tripName()],
            ['label' => 'Időpont', 'value' => $start !== null
                ? $start->format('Y.m.d.').($end !== null && ! $end->isSameDay($start) ? ' – '.$end->format('Y.m.d.') : '')
                : ''],
            ['label' => 'Személyek száma', 'value' => $this->booking->passenger_count ? $this->booking->passenger_count.' fő' : ''],
            ['label' => 'Elhelyezés', 'value' => (string) $this->tour?->accommodation],
            ['label' => 'Ellátás', 'value' => (string) $this->tour?->catering],
            ['label' => 'Utazás módja', 'value' => self::TRAVEL_MODES[$this->tour?->travel_mode_id ?? ''] ?? ''],
            ['label' => 'Felszállás', 'value' => (string) $prices?->departurePlaceName()],
        ], fn (array $row): bool => trim($row['value']) !== ''));
    }

    /**
     * What and until when to transfer, unless the customer pays online right after booking.
     *
     * @return array{amount: string, dueDate: string, accountNumber: string, accountHolder: string}|null
     */
    private function bankTransfer(?BookingPriceSummary $prices, BookingConfirmationSettings $settings): ?array
    {
        if ($prices?->total() === null
            || $settings->bankAccountNumber === ''
            || app(BookingPaymentService::class)->canStart($this->booking)) {
            return null;
        }

        $departure = $this->booking->tourDate?->start_date ?? $this->booking->departure_date;

        return [
            'amount' => $prices->total(),
            'dueDate' => $settings->paymentDueDate($this->booking->created_at ?? now(), $departure)->format('Y.m.d.'),
            'accountNumber' => $settings->bankAccountNumber,
            'accountHolder' => $settings->bankAccountHolder,
        ];
    }

    /**
     * The Hungarian foreign ministry's travel advice pages of the countries the tour visits.
     *
     * @return array<int, array{country: string, url: string}>
     */
    private function entryRequirementLinks(): array
    {
        return TourReferenceOption::query()
            ->where('type', 'country')
            ->whereIn('code', $this->tour?->country_ids ?? [])
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (TourReferenceOption $country): array => [
                'country' => $country->name,
                'url' => self::ENTRY_REQUIREMENTS_URL.Str::slug($country->name),
            ])
            ->all();
    }

    /**
     * @return array{name: string, logoUrl: ?string, address: string, phones: array<int, string>, email: string, website: string, websiteLabel: string, license: string}
     */
    private function company(BookingConfirmationSettings $settings): array
    {
        $contact = SiteSetting::valuesOf(CompanyContact::GROUP, ['address', 'phone', 'phones', 'email']);
        $site = SiteSetting::query()
            ->where(fn ($query) => $query->where('group', 'general')->where('key', 'site_name'))
            ->orWhere(fn ($query) => $query->where('group', 'brand')->where('key', 'logo'))
            ->get()
            ->mapWithKeys(fn (SiteSetting $setting): array => [$setting->key => $setting->decodedValue()]);
        $website = rtrim((string) config('app.url'), '/');

        return [
            'name' => (string) ($site->get('site_name') ?: config('app.name')),
            'logoUrl' => $site->get('logo')['url'] ?? null,
            'address' => (string) ($contact->get('address') ?? CompanyContact::DEFAULTS['address']['value']),
            'phones' => CompanyContact::phoneNumbers(
                $contact->get('phones'),
                $contact->get('phone') ?? CompanyContact::DEFAULTS['phone']['value'],
            ),
            'email' => (string) ($contact->get('email') ?? CompanyContact::DEFAULTS['email']['value']),
            'website' => $website,
            'websiteLabel' => (string) preg_replace('#^https?://#', '', $website),
            'license' => $settings->agencyLicenseNumber,
        ];
    }
}
