<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\Booking;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;

/**
 * What legacy apartment bookings and tour inquiries share: the contact
 * fields of the legacy form, the booking's legacy date and its legacy data in
 * the payload.
 */
trait BuildsLegacyBookings
{
    /**
     * The status legacy requests get: the legacy office already handled them.
     */
    private const LEGACY_STATUS = 'contacted';

    private function newLegacyBooking(string $type, LegacyAdminExportRecord $record): Booking
    {
        $createdAt = LegacyAdminExportRecord::dateTime($record->field('created_at') ?? $record->listValue('Jelentkezés időpontja')) ?? now()->toImmutable();
        $booking = new Booking([
            'booking_type' => $type,
            'status' => self::LEGACY_STATUS,
            'seats_reserved' => false,
            'application_date' => $createdAt,
            'booking_date' => $createdAt,
            'admin_note' => $this->adminNote($record),
        ]);
        $booking->created_at = $createdAt;

        return $booking;
    }

    /**
     * @return array<string, mixed>
     */
    private function contact(LegacyAdminExportRecord $record): array
    {
        $zip = $record->field('zip');
        $city = $record->field('city');
        $street = $record->field('street');

        return [
            'customer_name' => $record->field('name') ?? $record->listValue('Név'),
            'email' => $record->field('email') ?? $record->listValue('Email'),
            'city' => $city,
            'address' => trim(implode(' ', array_filter([$zip, $city])).', '.($street ?? ''), ' ,') ?: null,
            'message' => $record->field('message'),
        ];
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function legacyPayload(LegacyAdminExportRecord $record, array $extra): array
    {
        return array_filter([
            'id' => $record->legacyId(),
            'passengers' => $record->field('passengers'),
            'description' => $record->field('description'),
            ...$extra,
        ], fn (mixed $value): bool => $value !== null && $value !== '');
    }

    private function adminNote(LegacyAdminExportRecord $record, ?string $extra = null): string
    {
        return implode("\n", array_filter([
            "Áthozva a régi rendszerből (#{$record->legacyId()}).",
            $extra,
            $record->field('description') !== null ? 'Régi leírás: '.$record->field('description') : null,
        ]));
    }
}
