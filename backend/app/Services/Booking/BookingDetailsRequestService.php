<?php

namespace App\Services\Booking;

use App\Mail\BookingDetailsCompletedOfficeNotification;
use App\Mail\BookingDetailsRequest;
use App\Models\Booking;
use App\Models\BookingFormField;
use App\Services\Mail\LoggedMailer;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Deferred booking form fields may be left empty when booking; they are kept
 * as the booking's pending details (payload.pendingDetails). The customer is
 * e-mailed a link with a random token, and gives the details on the public
 * site; once they are all given the link stops working.
 */
class BookingDetailsRequestService
{
    /** The public site's page for giving the details; the token follows. */
    public const PAGE_PATH = '/foglalas/adatok/';

    public function __construct(
        private readonly BookingFormFieldResolver $fieldResolver,
        private readonly BookingFormValidationService $validator,
        private readonly LoggedMailer $mailer,
    ) {}

    /**
     * E-mails the customer a new link for the pending details, replacing any
     * earlier link. Returns false when nothing is pending or there is no
     * address to write to.
     */
    public function send(Booking $booking): bool
    {
        $pending = $this->pendingFields($booking);

        if ($this->isEmpty($pending) || blank($booking->email)) {
            return false;
        }

        $token = Str::random(48);
        $booking->forceFill(['details_token_hash' => self::hash($token)])->saveQuietly();

        $this->mailer->send(
            new BookingDetailsRequest($booking, rtrim((string) config('app.url'), '/').self::PAGE_PATH.$token, $this->labels($booking, $pending)),
            (string) $booking->email,
            $booking->id,
        );

        return true;
    }

    public function findByToken(string $token): ?Booking
    {
        return Booking::query()
            ->where('details_token_hash', self::hash($token))
            ->with('tour.bookingFormTemplate.templateFields.field')
            ->first();
    }

    /**
     * The fields still to be given, as the tour's booking form defines them
     * now; a field since removed from the form is no longer asked.
     *
     * @return array{formData: array<int, array<string, mixed>>, passengers: array<int, array<int, array<string, mixed>>>}
     */
    public function pendingFields(Booking $booking): array
    {
        $pending = $booking->payload['pendingDetails'] ?? [];

        if ($pending === [] || $booking->tour === null) {
            return ['formData' => [], 'passengers' => []];
        }

        $fields = collect($this->fieldResolver->resolve($booking->tour))->keyBy('key');
        $fieldsOf = fn (array $keys): array => $fields->only($keys)->values()->all();

        return [
            'formData' => $fieldsOf($pending['formData'] ?? []),
            'passengers' => collect($pending['passengers'] ?? [])
                ->map(fn (array $keys): array => $fieldsOf($keys))
                ->filter()
                ->all(),
        ];
    }

    /**
     * What is still missing, in words: "Kapcsolattartó" and "2. utas" with the
     * labels of their pending fields.
     *
     * @param  array{formData: array<int, array<string, mixed>>, passengers: array<int, array<int, array<string, mixed>>>}|null  $pending
     * @return array<int, array{title: string, fields: array<int, string>}>
     */
    public function labels(Booking $booking, ?array $pending = null): array
    {
        $pending ??= $this->pendingFields($booking);
        $labelsOf = fn (array $fields): array => array_column($fields, 'label');

        return [
            ...($pending['formData'] !== [] ? [['title' => 'Megrendelő', 'fields' => $labelsOf($pending['formData'])]] : []),
            ...collect($pending['passengers'])
                ->map(fn (array $fields, int $index): array => ['title' => $this->passengerTitle($booking, $index), 'fields' => $labelsOf($fields)])
                ->values()
                ->all(),
        ];
    }

    public function passengerTitle(Booking $booking, int $index): string
    {
        $name = $booking->payload['passengers'][$index]['passenger_name'] ?? null;

        return ($index + 1).'. utas'.($name ? " ({$name})" : '');
    }

    /**
     * Saves the pending details the customer gave, all of which are required
     * by now, and invalidates the link.
     *
     * @param  array<string, mixed>  $formData
     * @param  array<int|string, array<string, mixed>>  $passengers
     *
     * @throws ValidationException
     */
    public function complete(Booking $booking, array $formData, array $passengers): Booking
    {
        $pending = $this->pendingFields($booking);
        $payload = $booking->payload ?? [];
        $errors = [];

        foreach ($pending['formData'] as $fieldDef) {
            $result = $this->validator->validateRequiredValue($fieldDef, $formData[$fieldDef['key']] ?? '');

            if ($result['error'] !== null) {
                $errors["formData.{$fieldDef['key']}"] = $result['error'];
            } else {
                $payload['formData'][$fieldDef['key']] = $result['value'];
            }
        }

        foreach ($pending['passengers'] as $index => $fieldDefs) {
            foreach ($fieldDefs as $fieldDef) {
                $result = $this->validator->validateRequiredValue($fieldDef, $passengers[$index][$fieldDef['key']] ?? '');

                if ($result['error'] !== null) {
                    $errors["passengers.{$index}.{$fieldDef['key']}"] = $result['error'];
                } else {
                    $payload['passengers'][$index][$fieldDef['key']] = $result['value'];
                }
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        $labels = $this->labels($booking, $pending);
        unset($payload['pendingDetails']);

        $booking->forceFill([
            ...collect(BookingFormField::CONTACT_COLUMNS)
                ->filter(fn (string $column, string $key): bool => isset($payload['formData'][$key]))
                ->mapWithKeys(fn (string $column, string $key): array => [$column => $payload['formData'][$key]])
                ->all(),
            'payload' => $payload,
            'details_token_hash' => null,
        ])->save();

        $officeAddress = config('mail.office_notifications_address');

        if ($officeAddress) {
            $this->mailer->send(new BookingDetailsCompletedOfficeNotification($booking, $labels), $officeAddress, $booking->id);
        }

        return $booking;
    }

    /**
     * @param  array{formData: array<int, mixed>, passengers: array<int, mixed>}  $pending
     */
    public function isEmpty(array $pending): bool
    {
        return $pending['formData'] === [] && $pending['passengers'] === [];
    }

    private static function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
