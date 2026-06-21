<?php

namespace Database\Factories;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\Location;
use App\Models\Region;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $customerNames = [
            'Kovács Anna',
            'Nagy Péter',
            'Szabó Zsófia',
            'Tóth Gábor',
            'Varga Eszter',
            'Molnár Balázs',
            'Farkas Júlia',
            'Kiss Dániel',
        ];
        $tourNames = [
            'Bibione családi körutazás',
            'Lignano tengerparti pihenés',
            'Sarti tengerparti utazás',
            'Budva városi és tengerparti élmény',
            'Napospart all inclusive út',
        ];
        $apartmentNames = [
            'Dune Villa Bibione',
            'Horizon Apartman Bibione',
            'Sarti Sunset Apartman',
            'Budva Old Town Apartman',
            'Napospart Sunrise Residence',
        ];

        return [
            'booking_type' => $this->faker->randomElement(['tour_booking', 'tour_inquiry', 'apartment_booking']),
            'status' => 'pending',
            'payment_status' => $this->faker->randomElement(['unpaid', 'partial', 'paid', null]),
            'region_id' => Region::query()->inRandomOrder()->value('id'),
            'location_id' => Location::query()->inRandomOrder()->value('id'),
            'offer_id' => $this->faker->optional()->numberBetween(1, 20),
            'offer_date_id' => $this->faker->optional()->numberBetween(1, 20),
            'apartment_id' => Apartment::query()->inRandomOrder()->value('id'),
            'tour_id' => Tour::query()->inRandomOrder()->value('id'),
            'customer_name' => $this->faker->randomElement($customerNames),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'country' => $this->faker->country(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'adults' => $this->faker->numberBetween(0, 6),
            'children' => $this->faker->numberBetween(0, 4),
            'passenger_count' => $this->faker->numberBetween(0, 8),
            'check_in' => $this->faker->optional()->date(),
            'check_out' => $this->faker->optional()->date(),
            'departure_date' => $this->faker->optional()->date(),
            'arrival' => $this->faker->optional()->date(),
            'departure' => $this->faker->optional()->date(),
            'appointment_time' => $this->faker->optional()->dateTimeBetween('-2 months', '+2 months'),
            'application_date' => $this->faker->optional()->dateTimeBetween('-2 months', 'now'),
            'booking_date' => $this->faker->optional()->dateTimeBetween('-2 months', 'now'),
            'property_name_snapshot' => $this->faker->optional()->randomElement($tourNames),
            'offer_name_snapshot' => $this->faker->optional()->randomElement($tourNames),
            'apartment_name_snapshot' => $this->faker->optional()->randomElement($apartmentNames),
            'partner_name_snapshot' => $this->faker->optional()->randomElement($customerNames),
            'offer_code' => $this->faker->optional()->bothify('OFF-###'),
            'total_amount' => $this->faker->optional()->randomFloat(2, 1000, 6000),
            'paid_amount' => $this->faker->optional()->randomFloat(2, 0, 5000),
            'currency' => 'EUR',
            'credited' => $this->faker->boolean(),
            'cancelled' => $this->faker->boolean(15),
            'notes' => $this->faker->optional()->sentence(12),
            'message' => $this->faker->optional()->paragraph(),
            'payload' => [
                'source' => 'factory',
            ],
        ];
    }

    public function tourBooking(): static
    {
        return $this->state(fn (): array => [
            'booking_type' => 'tour_booking',
            'status' => 'pending',
            'customer_name' => $this->faker->randomElement(['Kovács Anna', 'Nagy Péter', 'Szabó Zsófia', 'Tóth Gábor']),
            'partner_name_snapshot' => $this->faker->randomElement(['Horváth Péter', 'Kiss László', 'Németh Éva', 'Varga Tamás']),
            'offer_name_snapshot' => $this->faker->randomElement(['Bibione családi körutazás', 'Sarti tengerparti utazás', 'Budva városi és tengerparti élmény', 'Napospart all inclusive út']),
            'departure_date' => $this->faker->dateTimeBetween('+1 month', '+1 year')?->format('Y-m-d'),
            'passenger_count' => $this->faker->numberBetween(1, 8),
            'payment_status' => $this->faker->randomElement(['unpaid', 'partial', 'paid']),
            'appointment_time' => $this->faker->dateTimeBetween('-2 months', '+2 months'),
            'application_date' => $this->faker->dateTimeBetween('-2 months', 'now'),
        ]);
    }

    public function tourInquiry(): static
    {
        return $this->state(fn (): array => [
            'booking_type' => 'tour_inquiry',
            'status' => 'new',
            'customer_name' => $this->faker->randomElement(['Kovács Anna', 'Nagy Péter', 'Szabó Zsófia', 'Tóth Gábor']),
            'offer_name_snapshot' => $this->faker->randomElement(['Bibione családi körutazás', 'Sarti tengerparti utazás', 'Budva városi és tengerparti élmény', 'Napospart all inclusive út']),
            'message' => $this->faker->paragraph(),
            'appointment_time' => $this->faker->dateTimeBetween('-2 months', '+2 months'),
            'application_date' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'payment_status' => null,
        ]);
    }

    public function apartmentBooking(): static
    {
        return $this->state(fn (): array => [
            'booking_type' => 'apartment_booking',
            'status' => 'new',
            'customer_name' => $this->faker->randomElement(['Kovács Anna', 'Nagy Péter', 'Szabó Zsófia', 'Tóth Gábor']),
            'apartment_name_snapshot' => $this->faker->randomElement(['Dune Villa Bibione', 'Horizon Apartman Bibione', 'Sarti Sunset Apartman', 'Budva Old Town Apartman']),
            'arrival' => $this->faker->dateTimeBetween('+1 week', '+6 months')?->format('Y-m-d'),
            'departure' => $this->faker->dateTimeBetween('+1 week', '+6 months')?->format('Y-m-d'),
            'application_date' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'booking_date' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'offer_code' => $this->faker->bothify('APT-###'),
            'payment_status' => null,
        ]);
    }
}
