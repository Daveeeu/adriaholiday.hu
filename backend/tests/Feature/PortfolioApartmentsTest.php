<?php

namespace Tests\Feature;

use App\Mail\ApartmentBookingCustomerConfirmation;
use App\Mail\NewApartmentBookingOfficeNotification;
use App\Models\AdminMediaItem;
use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PortfolioApartmentsTest extends TestCase
{
    use RefreshDatabase;

    private Location $bibione;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-10-16 12:00:00');
        config(['mail.office_notifications_address' => 'iroda@example.com']);

        $this->bibione = Location::factory()->for(Region::factory()->create(['slug' => 'italy', 'name' => 'Olaszország']))->create([
            'slug' => 'bibione',
            'name' => 'Bibione',
            'area_slug' => 'veneto',
            'area_name' => 'Veneto',
            'description' => '<p>Bibione bevezető</p>',
            'guide' => '<h2 id="strand_bibione">Strand</h2>',
            'apartment_information' => '<p>A feltüntetett árak apartman/éj értendőek.</p>',
            'is_active' => true,
        ]);
    }

    public function test_the_location_page_exists_only_with_a_public_apartment(): void
    {
        $this->getJson('/api/portfolio/apartment-locations/veneto/bibione')->assertNotFound();

        $this->apartment();

        $this->getJson('/api/portfolio/apartment-locations/veneto/bibione')
            ->assertOk()
            ->assertJsonPath('name', 'Bibione')
            ->assertJsonPath('areaName', 'Veneto')
            ->assertJsonPath('link', '/apartmanok/veneto/bibione')
            ->assertJsonPath('guide', '<h2 id="strand_bibione">Strand</h2>')
            ->assertJsonPath('filters.layouts.1.value', 'B');

        $this->getJson('/api/portfolio/apartment-locations/olasz/bibione')->assertNotFound();
    }

    public function test_the_list_shows_public_apartments_by_code_and_filters_them(): void
    {
        $this->apartment(['code' => '42', 'name' => 'Negyvenkettő', 'stars' => 3, 'max_guests' => 6, 'services' => ['legkondicionalo']]);
        $this->apartment(['code' => '7', 'name' => 'Hetes', 'stars' => 4, 'max_guests' => 4, 'services' => ['kert'], 'pricing_matrix' => $this->matrix(['A-4' => '2+2'])]);
        $this->apartment(['code' => '9', 'name' => 'Rejtett', 'is_active' => false]);
        $this->apartment(['code' => '10', 'name' => 'Vázlat', 'status' => Apartment::STATUS_DRAFT]);

        $this->getJson('/api/portfolio/apartment-locations/veneto/bibione/apartments')
            ->assertOk()
            ->assertJsonPath('totalCount', 2)
            ->assertJsonPath('items.0.name', 'Hetes')
            ->assertJsonPath('items.1.name', 'Negyvenkettő')
            ->assertJsonPath('items.1.link', '/apartman/negyvenketto')
            ->assertJsonPath('items.1.services.0.label', 'Légkondicionáló')
            ->assertJsonPath('items.1.lowestPrice', 106);

        $names = fn (string $query): array => collect($this->getJson("/api/portfolio/apartment-locations/veneto/bibione/apartments?{$query}")->assertOk()->json('items'))->pluck('name')->all();

        $this->assertSame(['Negyvenkettő'], $names('guests=5'));
        $this->assertSame(['Hetes'], $names('stars[]=4'));
        $this->assertSame(['Hetes'], $names('services[]=kert'));
        $this->assertSame(['Negyvenkettő'], $names('code=42'));
        $this->assertSame(['Hetes'], $names('layouts[]=A'));
        $this->assertSame(['Negyvenkettő'], $names('layouts[]=C'));

        $this->getJson('/api/portfolio/apartment-locations/veneto/bibione/apartments?services[]=ismeretlen')->assertUnprocessable();
    }

    public function test_the_home_page_section_shows_the_locations_and_featured_apartments_with_pictures(): void
    {
        $this->getJson('/api/portfolio/apartment-highlights')->assertOk()->assertJsonPath('locations', [])->assertJsonPath('apartments', []);

        $plain = $this->apartment(['code' => '1', 'name' => 'Egyszerű', 'stars' => 3]);
        $featured = $this->apartment(['code' => '2', 'name' => 'Kiemelt', 'stars' => 2, 'featured' => true]);
        $withoutPicture = $this->apartment(['code' => '3', 'name' => 'Kép nélkül', 'stars' => 5]);

        foreach ([$plain, $featured] as $apartment) {
            ApartmentGalleryItem::query()->create([
                'apartment_id' => $apartment->id,
                'media_id' => AdminMediaItem::create()->addMedia(UploadedFile::fake()->image('kep.jpg', 20, 20))->toMediaCollection('library')->id,
            ]);
        }

        $this->getJson('/api/portfolio/apartment-highlights')
            ->assertOk()
            ->assertJsonPath('locations.0.link', '/apartmanok/veneto/bibione')
            ->assertJsonPath('locations.0.apartmentCount', 3)
            ->assertJsonPath('apartments.0.name', 'Kiemelt')
            ->assertJsonPath('apartments.1.name', 'Egyszerű')
            ->assertJsonCount(2, 'apartments');

        $this->assertNotNull($withoutPicture->id);
    }

    public function test_the_apartment_page_shows_only_the_prices_still_to_come(): void
    {
        $apartment = $this->apartment();

        $this->getJson('/api/portfolio/apartments/'.$apartment->slug)
            ->assertOk()
            ->assertJsonPath('name', 'Negyvenkettő')
            ->assertJsonPath('prices.periods', [['startDate' => '2027-07-03', 'endDate' => '2027-07-10']])
            ->assertJsonPath('prices.rows.0.category', 'B-5')
            ->assertJsonPath('prices.rows.0.prices', [106])
            ->assertJsonPath('prices.rows.0.maxGuests', 5)
            ->assertJsonPath('apartmentTypes', ['B-5', 'C-6'])
            ->assertJsonPath('location.link', '/apartmanok/veneto/bibione')
            ->assertJsonPath('location.apartmentInformation', '<p>A feltüntetett árak apartman/éj értendőek.</p>')
            ->assertJsonPath('distanceToSeaM', 300);

        $apartment->update(['is_active' => false]);
        $this->getJson('/api/portfolio/apartments/'.$apartment->slug)->assertNotFound();
    }

    public function test_a_booking_request_is_recorded_and_the_office_and_customer_are_notified(): void
    {
        Mail::fake();
        $apartment = $this->apartment();

        $this->postJson("/api/portfolio/apartments/{$apartment->slug}/bookings", $this->bookingPayload())
            ->assertCreated()
            ->assertJsonPath('status', 'new');

        $booking = Booking::query()->sole();
        $this->assertSame('apartment_booking', $booking->booking_type);
        $this->assertSame($apartment->id, $booking->apartment_id);
        $this->assertSame('Negyvenkettő', $booking->apartment_name_snapshot);
        $this->assertSame('42', $booking->offer_code);
        $this->assertSame('2027-07-03', $booking->arrival->toDateString());
        $this->assertSame('2027-07-10', $booking->departure->toDateString());
        $this->assertSame(2, $booking->passenger_count);
        $this->assertSame('B-5', $booking->payload['apartmentType']);
        $this->assertTrue($booking->payload['travelInsurance']);
        $this->assertFalse($booking->payload['cancellationInsurance']);
        $this->assertSame(['name' => 'Kiss Anna', 'birthDate' => '1990-04-02', 'documentNumber' => 'AB123456'], $booking->payload['passengers'][0]);
        $this->assertSame('3530', $booking->payload['postalCode']);

        Mail::assertSent(NewApartmentBookingOfficeNotification::class, fn ($mail): bool => $mail->hasTo('iroda@example.com'));
        Mail::assertSent(ApartmentBookingCustomerConfirmation::class, fn ($mail): bool => $mail->hasTo('anna@example.com'));

        $confirmation = (new ApartmentBookingCustomerConfirmation($booking, $apartment->load('location')))->render();
        foreach (['Kedves Kiss Anna!', 'Negyvenkettő', 'B-5', '2027.07.03.', '2027.07.10. (7 éj)', '2 fő', 'kéri', 'Kiss Béla', '1990.04.02.', 'AB123456', 'Földszinti apartmant kérnénk.'] as $text) {
            $this->assertStringContainsString($text, $confirmation);
        }

        $this->assertStringContainsString('/bookings/apartment-bookings', (new NewApartmentBookingOfficeNotification($booking, $apartment))->render());
    }

    public function test_a_booking_request_is_validated(): void
    {
        Mail::fake();
        $apartment = $this->apartment();

        $this->postJson("/api/portfolio/apartments/{$apartment->slug}/bookings", [...$this->bookingPayload(), 'apartmentType' => 'Z-9'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('apartment_type');

        $this->postJson("/api/portfolio/apartments/{$apartment->slug}/bookings", [...$this->bookingPayload(), 'departure' => '2027-07-01', 'termsAccepted' => false, 'passengers' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['departure', 'terms_accepted', 'passengers']);

        $apartment->update(['is_active' => false]);
        $this->postJson("/api/portfolio/apartments/{$apartment->slug}/bookings", $this->bookingPayload())->assertNotFound();

        $this->assertSame(0, Booking::query()->count());
        Mail::assertNothingSent();
    }

    public function test_the_pages_have_their_seo_head_and_are_in_the_sitemap(): void
    {
        $apartment = $this->apartment(['seo_title' => 'Negyvenkettő apartman Bibionéban']);
        $hidden = $this->apartment(['code' => '9', 'name' => 'Rejtett', 'is_active' => false]);

        $this->get('/apartman/'.$apartment->slug)->assertOk()->assertSee('<title data-rh="true">Negyvenkettő apartman Bibionéban | Adria Holiday</title>', false);
        $this->get('/apartmanok/veneto/bibione')->assertOk()->assertSee('<title data-rh="true">Bibione apartmanok | Adria Holiday</title>', false);
        $this->get('/apartman/'.$hidden->slug)->assertNotFound();

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertSee('/apartmanok/veneto/bibione</loc>', false)
            ->assertSee('/apartman/negyvenketto</loc>', false)
            ->assertDontSee('/apartman/rejtett</loc>', false);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function apartment(array $attributes = []): Apartment
    {
        $name = $attributes['name'] ?? 'Negyvenkettő';

        return Apartment::factory()->create([
            'region_id' => $this->bibione->region_id,
            'location_id' => $this->bibione->id,
            'gallery_id' => null,
            'name' => $name,
            'slug' => str($name)->slug()->toString(),
            'code' => '42',
            'is_active' => true,
            'status' => Apartment::STATUS_PUBLISHED,
            'stars' => 3,
            'featured' => false,
            'max_guests' => 6,
            'distance_to_sea_m' => 300,
            'services' => [],
            'pricing_matrix' => $this->matrix(['B-5' => '3+2', 'C-6' => '4+2']),
            ...$attributes,
        ]);
    }

    /**
     * Two periods, one already over, with a price in each for every type.
     *
     * @param  array<string, string>  $types  name => beds
     * @return array<string, mixed>
     */
    private function matrix(array $types): array
    {
        return [
            'columns' => [
                ['id' => 'c1', 'startDate' => '2026-07-04', 'endDate' => '2026-07-11'],
                ['id' => 'c2', 'startDate' => '2027-07-03', 'endDate' => '2027-07-10'],
            ],
            'rows' => collect(array_keys($types))->map(fn (string $type, int $index): array => [
                'id' => "r{$index}",
                'category' => $type,
                'beds' => $types[$type],
                'prices' => ['80', (string) (106 + 15 * $index)],
            ])->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingPayload(): array
    {
        return [
            'customerName' => 'Kiss Anna',
            'email' => 'anna@example.com',
            'phone' => '+36 30 111 2222',
            'postalCode' => '3530',
            'city' => 'Miskolc',
            'address' => 'Városház tér 22.',
            'arrival' => '2027-07-03',
            'departure' => '2027-07-10',
            'apartmentType' => 'B-5',
            'passengers' => [
                ['name' => 'Kiss Anna', 'birthDate' => '1990-04-02', 'documentNumber' => 'AB123456'],
                ['name' => 'Kiss Béla', 'birthDate' => '1988-11-20', 'address' => 'Miskolc'],
            ],
            'travelInsurance' => true,
            'cancellationInsurance' => false,
            'message' => 'Földszinti apartmant kérnénk.',
            'termsAccepted' => true,
        ];
    }
}
