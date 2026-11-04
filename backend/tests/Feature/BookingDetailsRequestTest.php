<?php

namespace Tests\Feature;

use App\Mail\BookingDetailsCompletedOfficeNotification;
use App\Mail\BookingDetailsRequest;
use App\Models\Booking;
use App\Models\BookingFormField;
use App\Models\BookingFormTemplate;
use App\Models\Tour;
use App\Models\User;
use Database\Seeders\BookingFormFieldSeeder;
use Database\Seeders\BookingFormTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BookingDetailsRequestTest extends TestCase
{
    use RefreshDatabase;

    private Tour $tour;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed([BookingFormFieldSeeder::class, BookingFormTemplateSeeder::class]);
        config(['mail.office_notifications_address' => 'iroda@example.com']);
        Mail::fake();

        $template = BookingFormTemplate::query()->where('slug', 'buszos-ut')->firstOrFail();
        $template->templateFields()
            ->whereIn('booking_form_field_id', BookingFormField::query()->whereIn('key', ['contact_city', 'document_number'])->pluck('id'))
            ->update(['visibility' => BookingFormField::VISIBILITY_DEFERRED]);

        $this->tour = Tour::factory()->create(['booking_form_template_id' => $template->id, 'name' => 'Adventi Bécs']);
    }

    public function test_deferred_fields_may_be_left_empty_and_are_asked_for_by_email(): void
    {
        $booking = $this->book(city: '', documentNumbers: ['', 'CD654321']);

        $this->assertSame(
            ['formData' => ['contact_city'], 'passengers' => [0 => ['document_number']]],
            $booking->payload['pendingDetails'],
        );
        Mail::assertSent(BookingDetailsRequest::class, fn (BookingDetailsRequest $mail): bool => $mail->hasTo('anna@example.com')
            && $mail->missing === [
                ['title' => 'Megrendelő', 'fields' => ['Város']],
                ['title' => '1. utas (Kovács Anna)', 'fields' => ['Útiokmány száma']],
            ]);

        $token = $this->sentToken();
        $html = Mail::sent(BookingDetailsRequest::class)->last()->render();
        $this->assertStringContainsString('Adatok megadása', $html);
        $this->assertStringContainsString('/foglalas/adatok/'.$token, $html);
        $this->assertStringContainsString('Útiokmány száma', $html);

        $this->getJson("/api/booking-details/{$token}")
            ->assertOk()
            ->assertJsonMissingPath('data.bookingId')
            ->assertJsonPath('data.tourName', 'Adventi Bécs')
            ->assertJsonPath('data.formDataFields.0.key', 'contact_city')
            ->assertJsonPath('data.passengers.0.index', 0)
            ->assertJsonPath('data.passengers.0.fields.0.key', 'document_number')
            ->assertJsonCount(1, 'data.passengers');
    }

    public function test_the_customer_gives_the_pending_details_through_the_link_once(): void
    {
        $booking = $this->book(city: '', documentNumbers: ['', 'CD654321']);
        $token = $this->sentToken();

        $this->postJson("/api/booking-details/{$token}", ['formData' => ['contact_city' => 'Szeged'], 'passengers' => []])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['passengers.0.document_number']);

        $this->postJson("/api/booking-details/{$token}", [
            'formData' => ['contact_city' => 'Szeged'],
            'passengers' => [0 => ['document_number' => 'AB123456']],
        ])->assertNoContent();

        $booking->refresh();
        $this->assertSame('Szeged', $booking->city);
        $this->assertSame('Szeged', $booking->payload['formData']['contact_city']);
        $this->assertSame('AB123456', $booking->payload['passengers'][0]['document_number']);
        $this->assertSame('CD654321', $booking->payload['passengers'][1]['document_number']);
        $this->assertArrayNotHasKey('pendingDetails', $booking->payload);
        $this->assertNull($booking->details_token_hash);
        Mail::assertSent(BookingDetailsCompletedOfficeNotification::class, fn ($mail): bool => $mail->hasTo('iroda@example.com'));
        $this->assertStringContainsString('Útiokmány száma', Mail::sent(BookingDetailsCompletedOfficeNotification::class)->last()->render());

        $this->getJson("/api/booking-details/{$token}")->assertNotFound();
    }

    public function test_a_booking_with_every_detail_given_asks_for_nothing(): void
    {
        $booking = $this->book(city: 'Budapest', documentNumbers: ['AB123456']);

        $this->assertArrayNotHasKey('pendingDetails', $booking->payload);
        $this->assertNull($booking->details_token_hash);
        Mail::assertNotSent(BookingDetailsRequest::class);
    }

    public function test_the_office_can_resend_the_request_with_a_new_link(): void
    {
        $booking = $this->book(city: '', documentNumbers: ['AB123456']);
        $firstToken = $this->sentToken();
        $this->actingAsAdmin(['bookings.view', 'bookings.update']);

        $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonPath('data.pendingDetails', [['title' => 'Megrendelő', 'fields' => ['Város']]]);

        $this->postJson("/api/admin/bookings/tour-bookings/{$booking->id}/details-request")->assertNoContent();

        Mail::assertSent(BookingDetailsRequest::class, 2);
        $this->getJson("/api/booking-details/{$firstToken}")->assertNotFound();
        $this->getJson('/api/booking-details/'.$this->sentToken())->assertOk();
    }

    public function test_resending_needs_pending_details(): void
    {
        $booking = $this->book(city: 'Budapest', documentNumbers: ['AB123456']);
        $this->actingAsAdmin(['bookings.view', 'bookings.update']);

        $this->postJson("/api/admin/bookings/tour-bookings/{$booking->id}/details-request")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['booking']);
    }

    public function test_resending_needs_the_update_permission(): void
    {
        $booking = $this->book(city: '', documentNumbers: ['AB123456']);
        $this->actingAsAdmin(['bookings.view']);

        $this->postJson("/api/admin/bookings/tour-bookings/{$booking->id}/details-request")->assertForbidden();
    }

    public function test_the_contact_email_cannot_be_deferred(): void
    {
        $this->actingAsAdmin(['booking-form-templates.create']);
        $email = BookingFormField::query()->where('key', 'contact_email')->firstOrFail();

        $this->postJson('/api/admin/booking-form-templates', [
            'name' => 'Utólagos e-mail',
            'fields' => [['fieldId' => $email->id, 'visibility' => BookingFormField::VISIBILITY_DEFERRED, 'sortOrder' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors(['fields.0.visibility']);
    }

    /**
     * @param  array<int, string>  $documentNumbers  one passenger per entry
     */
    private function book(string $city, array $documentNumbers): Booking
    {
        $names = ['Kovács Anna', 'Kovács Béla'];

        $response = $this->postJson('/api/bookings', [
            'termsAccepted' => true,
            'tourId' => $this->tour->id,
            'participants' => count($documentNumbers),
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
                'contact_postal_code' => '1051',
                'contact_city' => $city,
                'contact_address' => 'Fő utca 1.',
            ],
            'passengers' => array_map(fn (string $documentNumber, int $index): array => [
                'passenger_name' => $names[$index],
                'passenger_birth_date' => '1990-01-01',
                'passenger_address' => '1051 Budapest, Fő utca 1.',
                'document_number' => $documentNumber,
            ], $documentNumbers, array_keys($documentNumbers)),
        ])->assertCreated();

        return Booking::query()->findOrFail($response->json('id'));
    }

    private function sentToken(): string
    {
        $url = Mail::sent(BookingDetailsRequest::class)->last()->url;

        return substr($url, strrpos($url, '/') + 1);
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsAdmin(array $permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Booking Details Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
