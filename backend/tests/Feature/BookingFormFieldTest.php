<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingFormField;
use App\Models\BookingFormTemplate;
use App\Models\Tour;
use App\Models\User;
use Database\Seeders\BookingFormFieldSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BookingFormFieldTest extends TestCase
{
    use RefreshDatabase;

    private const ALL_PERMISSIONS = [
        'booking-form-templates.viewAny',
        'booking-form-templates.view',
        'booking-form-templates.create',
        'booking-form-templates.update',
        'booking-form-templates.delete',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(BookingFormFieldSeeder::class);
    }

    public function test_address_fields_are_available_in_the_catalog(): void
    {
        foreach (['contact_postal_code', 'contact_address', 'passenger_birth_place', 'passenger_address'] as $key) {
            $this->assertDatabaseHas('booking_form_fields', ['key' => $key]);
        }
    }

    public function test_listing_fields_requires_permission(): void
    {
        $this->seed(RolePermissionSeeder::class);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/booking-form-fields')->assertForbidden();
    }

    public function test_view_only_admin_cannot_create_fields(): void
    {
        $this->actingAsAdmin(['booking-form-templates.viewAny']);

        $this->getJson('/api/admin/booking-form-fields')
            ->assertOk()
            ->assertJsonFragment(['key' => 'contact_name', 'isSystem' => true]);

        $this->postJson('/api/admin/booking-form-fields', [
            'label' => 'Anyja neve',
            'fieldType' => 'text',
            'inputGroup' => 'passenger',
        ])->assertForbidden();
    }

    public function test_admin_can_create_a_field_with_a_generated_unique_key(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);

        $first = $this->postJson('/api/admin/booking-form-fields', [
            'label' => 'Anyja neve',
            'fieldType' => 'text',
            'inputGroup' => 'passenger',
        ]);

        $first->assertCreated()
            ->assertJsonPath('data.key', 'passenger_anyja_neve')
            ->assertJsonPath('data.isSystem', false);

        $this->postJson('/api/admin/booking-form-fields', [
            'label' => 'Anyja neve',
            'fieldType' => 'text',
            'inputGroup' => 'passenger',
        ])->assertCreated()->assertJsonPath('data.key', 'passenger_anyja_neve_2');
    }

    public function test_select_field_requires_options_and_stores_them_normalized(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);

        $this->postJson('/api/admin/booking-form-fields', [
            'label' => 'Ülőhely',
            'fieldType' => 'select',
            'inputGroup' => 'passenger',
            'options' => [],
        ])->assertStatus(422)->assertJsonValidationErrors(['options']);

        $this->postJson('/api/admin/booking-form-fields', [
            'label' => 'Ülőhely',
            'fieldType' => 'select',
            'inputGroup' => 'passenger',
            'options' => [' Ablak ', 'Folyosó', ''],
        ])->assertCreated()->assertJsonPath('data.options', ['Ablak', 'Folyosó']);
    }

    public function test_options_are_dropped_for_non_select_fields(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);

        $this->postJson('/api/admin/booking-form-fields', [
            'label' => 'Anyja neve',
            'fieldType' => 'text',
            'inputGroup' => 'passenger',
            'options' => ['Felesleges'],
        ])->assertCreated()->assertJsonPath('data.options', null);
    }

    public function test_system_field_label_can_change_but_type_and_group_cannot(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);
        $field = BookingFormField::query()->where('key', 'contact_email')->firstOrFail();

        $this->patchJson("/api/admin/booking-form-fields/{$field->id}", [
            'label' => 'E-mail cím (értesítésekhez)',
            'fieldType' => 'email',
            'inputGroup' => 'contact',
        ])->assertOk()->assertJsonPath('data.label', 'E-mail cím (értesítésekhez)');

        $this->patchJson("/api/admin/booking-form-fields/{$field->id}", [
            'label' => 'E-mail',
            'fieldType' => 'text',
            'inputGroup' => 'passenger',
        ])->assertStatus(422)->assertJsonValidationErrors(['field_type']);

        $this->assertSame('email', $field->refresh()->field_type);
    }

    public function test_system_field_cannot_be_deleted(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);
        $field = BookingFormField::query()->where('key', 'contact_name')->firstOrFail();

        $this->deleteJson("/api/admin/booking-form-fields/{$field->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['field']);

        $this->assertModelExists($field);
    }

    public function test_field_visible_in_a_template_cannot_be_deleted_until_hidden(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);
        $field = BookingFormField::query()->where('key', 'passenger_address')->firstOrFail();
        $template = BookingFormTemplate::query()->create(['name' => 'Repülős út', 'slug' => 'repulos-ut']);
        $templateField = $template->templateFields()->create([
            'booking_form_field_id' => $field->id,
            'visibility' => 'required',
            'sort_order' => 1,
        ]);

        $this->deleteJson("/api/admin/booking-form-fields/{$field->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['field']);

        $templateField->update(['visibility' => 'hidden']);

        $this->deleteJson("/api/admin/booking-form-fields/{$field->id}")->assertNoContent();

        $this->assertModelMissing($field);
        $this->assertDatabaseMissing('booking_form_template_fields', ['id' => $templateField->id]);
    }

    public function test_public_booking_validates_values_against_field_types(): void
    {
        $tour = $this->tourWithTemplate([
            'contact_name' => 'required',
            'contact_email' => 'required',
            'contact_phone' => 'required',
            'passenger_name' => 'required',
            'passenger_birth_date' => 'required',
            'document_type' => 'required',
        ]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'nem-email',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna', 'passenger_birth_date' => '1990-02-31', 'document_type' => 'Jogosítvány'],
            ],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors([
            'formData.contact_email',
            'passengers.0.passenger_birth_date',
            'passengers.0.document_type',
        ]);
    }

    public function test_public_booking_stores_address_fields_and_admin_sees_their_labels(): void
    {
        $tour = $this->tourWithTemplate([
            'contact_name' => 'required',
            'contact_email' => 'required',
            'contact_phone' => 'required',
            'contact_postal_code' => 'required',
            'contact_address' => 'required',
            'passenger_name' => 'required',
            'passenger_address' => 'optional',
        ]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
                'contact_postal_code' => '1051',
                'contact_address' => 'Fő utca 1.',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna', 'passenger_address' => '1051 Budapest, Fő utca 1.'],
            ],
        ]);

        $response->assertCreated();

        $booking = Booking::findOrFail($response->json('id'));
        $this->assertSame('Fő utca 1.', $booking->payload['formData']['contact_address']);
        $this->assertSame('1051 Budapest, Fő utca 1.', $booking->payload['passengers'][0]['passenger_address']);

        $this->actingAsAdmin(['bookings.viewAny', 'bookings.view']);

        $this->getJson("/api/admin/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonFragment(['key' => 'contact_address', 'label' => 'Lakcím (utca, házszám)', 'value' => 'Fő utca 1.']);
    }

    /**
     * @param  array<string, string>  $visibilityByFieldKey
     */
    private function tourWithTemplate(array $visibilityByFieldKey): Tour
    {
        $template = BookingFormTemplate::query()->create(['name' => 'Teszt sablon', 'slug' => 'teszt-sablon']);
        $fields = BookingFormField::query()->whereIn('key', array_keys($visibilityByFieldKey))->get();

        foreach ($fields as $index => $field) {
            $template->templateFields()->create([
                'booking_form_field_id' => $field->id,
                'visibility' => $visibilityByFieldKey[$field->key],
                'sort_order' => $index + 1,
            ]);
        }

        return Tour::factory()->create(['active' => true, 'booking_form_template_id' => $template->id]);
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsAdmin(array $permissions): void
    {
        foreach ([...self::ALL_PERMISSIONS, ...$permissions] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Booking Form Field Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
