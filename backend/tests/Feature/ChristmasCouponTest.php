<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Support\Booking\ChristmasCoupon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChristmasCouponTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/portfolio/christmas-coupon';

    public function test_the_season_runs_from_15_november_to_epiphany_in_hungarian_time(): void
    {
        $budapest = fn (string $moment) => CarbonImmutable::parse($moment, ChristmasCoupon::TIMEZONE);

        $this->assertNull(ChristmasCoupon::seasonEndsAt($budapest('2026-11-14 23:59:59')));
        $this->assertNull(ChristmasCoupon::seasonEndsAt($budapest('2027-01-07 00:00:00')));
        $this->assertNull(ChristmasCoupon::seasonEndsAt($budapest('2027-07-01 12:00:00')));

        $end = $budapest('2027-01-06 23:59:59');
        $this->assertTrue(ChristmasCoupon::seasonEndsAt($budapest('2026-11-15 00:00:00'))->equalTo($end));
        $this->assertTrue(ChristmasCoupon::seasonEndsAt($budapest('2026-12-24 18:00:00'))->equalTo($end));
        $this->assertTrue(ChristmasCoupon::seasonEndsAt($budapest('2027-01-06 23:59:59'))->equalTo($end));
        // 23:30 UTC on 14 November is already the 15th in Budapest.
        $this->assertNotNull(ChristmasCoupon::seasonEndsAt(CarbonImmutable::parse('2026-11-14 23:30:00', 'UTC')));
    }

    public function test_a_visitor_gets_a_coupon_of_their_own_valid_until_epiphany(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-12-10 10:00:00', ChristmasCoupon::TIMEZONE));

        $response = $this->postJson(self::URL)->assertCreated();

        $this->assertStringStartsWith('KAR-', $response->json('code'));
        $this->assertEquals(3, $response->json('percent'));
        $coupon = Coupon::query()->where('code', $response->json('code'))->sole();
        $this->assertTrue($coupon->active);
        $this->assertFalse($coupon->used);
        $this->assertNull($coupon->tour_date_id);
        $this->assertNull($coupon->value);
        $this->assertTrue($coupon->expires_at->equalTo(CarbonImmutable::parse('2027-01-06 23:59:59', ChristmasCoupon::TIMEZONE)));

        $this->assertNotSame($response->json('code'), $this->postJson(self::URL)->assertCreated()->json('code'));
    }

    public function test_no_coupon_is_given_outside_the_season(): void
    {
        $this->travelTo(CarbonImmutable::parse('2027-03-01 10:00:00', ChristmasCoupon::TIMEZONE));

        $this->postJson(self::URL)->assertUnprocessable()->assertJsonValidationErrors('season');
        $this->assertSame(0, Coupon::query()->count());
    }

    public function test_a_visitor_gets_only_a_few_coupons_a_day(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-12-10 10:00:00', ChristmasCoupon::TIMEZONE));

        foreach (range(1, 3) as $attempt) {
            $this->postJson(self::URL)->assertCreated();
        }

        $this->postJson(self::URL)->assertTooManyRequests();
        $this->assertSame(3, Coupon::query()->count());
    }
}
