<?php

namespace App\Mcp\Tools;

use App\Services\Booking\BookingStatistics;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_business_overview')]
#[Title('Üzleti áttekintés')]
#[Description('Booking figures of a period, counted by the date bookings came in: bookings and inquiries by type and status, passengers, revenue and paid amounts per currency (tour and apartment bookings that were not cancelled, as on the admin dashboard; tours are in HUF, apartments in EUR), the best-selling trips (most bookings first) and a month-by-month breakdown. Default period: the current year to date.')]
#[IsReadOnly]
#[IsIdempotent]
class GetBusinessOverviewTool extends AdminTool
{
    private const DEFAULT_TOP_TRIPS = 10;

    /** A year and a bit, so "last 12 months" fits but the tool stays quick. */
    private const MAX_PERIOD_DAYS = 400;

    public function __construct(private readonly BookingStatistics $statistics) {}

    protected function permission(): string
    {
        return 'dashboard.view';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->format('date')->description('First day (YYYY-MM-DD). Default: 1 January of this year.'),
            'to' => $schema->string()->format('date')->description('Last day (YYYY-MM-DD). Default: today.'),
            'top_trips' => $schema->integer()->min(1)->max(30)->description('How many best-selling trips to list (default 10).'),
        ];
    }

    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'top_trips' => ['nullable', 'integer', 'min:1', 'max:30'],
        ]);

        $to = isset($validated['to']) ? CarbonImmutable::parse($validated['to']) : CarbonImmutable::today();
        $from = isset($validated['from']) ? CarbonImmutable::parse($validated['from']) : $to->startOfYear();

        if ($from->diffInDays($to) > self::MAX_PERIOD_DAYS) {
            $from = $to->subDays(self::MAX_PERIOD_DAYS);
        }

        return $this->respond($this->statistics->forPeriod($from, $to, $validated['top_trips'] ?? self::DEFAULT_TOP_TRIPS));
    }
}
