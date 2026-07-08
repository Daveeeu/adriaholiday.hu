<?php

namespace Tests\Feature;

use App\Models\BookingFormField;
use App\Models\BookingFormTemplate;
use App\Models\Tour;
use App\Models\User;
use Database\Seeders\BookingFormFieldSeeder;
use Database\Seeders\BookingFormTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BookingFormTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_seeding_creates_bus_and_flight_templates_with_expected_visibility(): void
    {
        $this->seed(BookingFormFieldSeeder::class);
        $this->seed(BookingFormTemplateSeeder::class);

        $this->assertDatabaseCount('booking_form_fields', 11);
        $this->assertDatabaseCount('booking_form_templates', 2);

        $busTemplate = BookingFormTemplate::query()->where('slug', 'buszos-ut')->firstOrFail();
        $flightTemplate = BookingFormTemplate::query()->where('slug', 'repulos-ut')->firstOrFail();

        $busVisibility = $busTemplate->templateFields()->with('field')->get()
            ->mapWithKeys(fn ($templateField) => [$templateField->field->key => $templateField->visibility]);

        $this->assertSame('required', $busVisibility['contact_name']);
        $this->assertSame('required', $busVisibility['passenger_name']);
        $this->assertSame('optional', $busVisibility['contact_city']);
        $this->assertSame('hidden', $busVisibility['document_type']);

        $flightVisibility = $flightTemplate->templateFields()->with('field')->get()
            ->mapWithKeys(fn ($templateField) => [$templateField->field->key => $templateField->visibility]);

        $this->assertSame('required', $flightVisibility['document_type']);
        $this->assertSame('required', $flightVisibility['document_number']);
        $this->assertSame('required', $flightVisibility['passenger_birth_date']);
        $this->assertSame('hidden', $flightVisibility['contact_city']);
    }

    public function test_tour_can_be_assigned_a_booking_form_template(): void
    {
        $this->seed(BookingFormFieldSeeder::class);
        $this->seed(BookingFormTemplateSeeder::class);
        $this->actingAsBookingFormTemplateAdmin(['tours.viewAny', 'tours.view', 'tours.create', 'tours.update']);

        $template = BookingFormTemplate::query()->where('slug', 'buszos-ut')->firstOrFail();
        $tour = Tour::factory()->create(['booking_form_template_id' => $template->id]);

        $response = $this->getJson("/api/admin/tours/{$tour->id}");

        $response->assertOk();
        $response->assertJsonPath('data.bookingFormTemplateId', $template->id);
        $response->assertJsonPath('data.bookingFormTemplate.slug', 'buszos-ut');
        $this->assertNotEmpty($response->json('data.bookingFormTemplate.fields'));
    }

    public function test_public_booking_requires_required_fields_from_assigned_template(): void
    {
        $this->seed(BookingFormFieldSeeder::class);
        $this->seed(BookingFormTemplateSeeder::class);

        $template = BookingFormTemplate::query()->where('slug', 'buszos-ut')->firstOrFail();
        $tour = Tour::factory()->create(['booking_form_template_id' => $template->id]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'participants' => 1,
            'formData' => [
                'contact_name' => 'Kovács Anna',
            ],
            'passengers' => [],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['formData.contact_email', 'formData.contact_phone']);
        $this->assertIsString($response->json('errors')['formData.contact_email'][0]);
    }

    public function test_public_booking_succeeds_with_valid_payload(): void
    {
        $this->seed(BookingFormFieldSeeder::class);
        $this->seed(BookingFormTemplateSeeder::class);

        $template = BookingFormTemplate::query()->where('slug', 'buszos-ut')->firstOrFail();
        $tour = Tour::factory()->create(['booking_form_template_id' => $template->id]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'participants' => 1,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna'],
            ],
            'note' => 'Ablak melletti helyet kérek.',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('bookings', [
            'tour_id' => $tour->id,
            'booking_type' => 'tour_booking',
            'email' => 'anna@example.com',
            'customer_name' => 'Kovács Anna',
        ]);
    }

    public function test_admin_crud_without_permission_returns_403(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/booking-form-templates');

        $response->assertForbidden();
    }

    public function test_admin_crud_with_permission_works(): void
    {
        $this->seed(BookingFormFieldSeeder::class);
        $this->actingAsBookingFormTemplateAdmin([
            'booking-form-templates.viewAny',
            'booking-form-templates.view',
            'booking-form-templates.create',
            'booking-form-templates.update',
            'booking-form-templates.delete',
        ]);

        $field = BookingFormField::query()->where('key', 'contact_name')->firstOrFail();

        $createResponse = $this->postJson('/api/admin/booking-form-templates', [
            'name' => 'Egyedi sablon',
            'fields' => [
                ['fieldId' => $field->id, 'visibility' => 'required', 'sortOrder' => 1],
            ],
        ]);

        $createResponse->assertCreated();
        $templateId = $createResponse->json('data.id');
        $this->assertDatabaseHas('booking_form_templates', ['name' => 'Egyedi sablon']);

        $updateResponse = $this->patchJson("/api/admin/booking-form-templates/{$templateId}", [
            'name' => 'Egyedi sablon módosítva',
            'fields' => [
                ['fieldId' => $field->id, 'visibility' => 'optional', 'sortOrder' => 1],
            ],
        ]);

        $updateResponse->assertOk();
        $updateResponse->assertJsonPath('data.name', 'Egyedi sablon módosítva');

        $deleteResponse = $this->deleteJson("/api/admin/booking-form-templates/{$templateId}");
        $deleteResponse->assertNoContent();
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsBookingFormTemplateAdmin(array $permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Booking Form Template Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
