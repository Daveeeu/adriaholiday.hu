<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_summary_returns_counts_and_series(): void
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/dashboard/summary')
            ->assertOk()
            ->assertJsonStructure([
                'counts' => [
                    'apartments',
                    'tours',
                    'bookings',
                    'messages',
                    'coupons',
                    'homepageOffers',
                    'blogArticles',
                    'buses',
                    'activeBookings',
                    'newInquiries',
                    'monthlyRevenue',
                ],
                'monthlyRevenue' => [
                    '*' => [
                        'month',
                        'revenue',
                    ],
                ],
                'recentActivity' => [
                    '*' => [
                        'id',
                        'title',
                        'description',
                        'timestamp',
                        'targetUrl',
                        'kind',
                    ],
                ],
            ]);
    }
}
