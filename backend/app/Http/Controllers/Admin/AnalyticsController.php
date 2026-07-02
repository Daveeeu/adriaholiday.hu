<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:analytics.view');
    }

    public function summary(Request $request): JsonResponse
    {
        $query = $this->filteredQuery($request);

        return response()->json([
            'counts' => [
                'pageViews' => (clone $query)->where('event_name', 'page_view')->count(),
                'offerViews' => (clone $query)->where('event_name', 'offer_view')->count(),
                'categoryViews' => (clone $query)->where('event_name', 'category_view')->count(),
                'ctaClicks' => (clone $query)->where('event_name', 'cta_click')->count(),
                'priceboxViews' => (clone $query)->where('event_name', 'pricebox_view')->count(),
                'dateSelects' => (clone $query)->where('event_name', 'date_select')->count(),
                'filterClicks' => (clone $query)->where('event_name', 'filter_click')->count(),
            ],
            'topCtas' => $this->topCtas(clone $query, (int) $request->integer('limit', 10)),
        ]);
    }

    public function topOffers(Request $request): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->integer('limit', 10)));

        $items = $this->aggregateByEntity(
            $this->filteredQuery($request)->where('event_name', 'offer_view'),
            'tour',
            $limit,
        );

        return response()->json(['items' => $items]);
    }

    public function topCategories(Request $request): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->integer('limit', 10)));

        $items = $this->aggregateByEntity(
            $this->filteredQuery($request)->where('event_name', 'category_view'),
            'category',
            $limit,
        );

        return response()->json(['items' => $items]);
    }

    public function events(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->integer('page', 1));
        $perPage = min(100, max(1, (int) $request->integer('perPage', $request->integer('per_page', 25))));

        $paginator = $this->filteredQuery($request)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'items' => collect($paginator->items())
                ->map(fn (AnalyticsEvent $event): array => [
                    'id' => $event->id,
                    'eventId' => $event->event_id,
                    'eventName' => $event->event_name,
                    'entityType' => $event->entity_type,
                    'entityId' => $event->entity_id,
                    'entitySlug' => $event->entity_slug,
                    'pagePath' => $event->page_path,
                    'utmCampaign' => $event->utm_campaign,
                    'utmSource' => $event->utm_source,
                    'sessionId' => $event->session_id,
                    'visitorId' => $event->visitor_id,
                    'metadata' => $event->metadata ?? [],
                    'consentAnalytics' => $event->consent_analytics,
                    'consentMarketing' => $event->consent_marketing,
                    'createdAt' => $event->created_at?->toISOString(),
                ])
                ->values()
                ->all(),
            'totalCount' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
        ]);
    }

    public function utm(Request $request): JsonResponse
    {
        $limit = min(100, max(1, (int) $request->integer('limit', 10)));

        $items = $this->filteredQuery($request)
            ->whereNotNull('utm_campaign')
            ->where('utm_campaign', '!=', '')
            ->selectRaw('utm_campaign')
            ->selectRaw('count(*) as event_count')
            ->selectRaw('count(distinct visitor_id) as unique_visitors')
            ->selectRaw("sum(case when event_name = 'page_view' then 1 else 0 end) as page_view_count")
            ->selectRaw("sum(case when event_name = 'offer_view' then 1 else 0 end) as offer_view_count")
            ->selectRaw("sum(case when event_name = 'lead_submit' then 1 else 0 end) as lead_submit_count")
            ->selectRaw('max(created_at) as last_seen_at')
            ->groupBy('utm_campaign')
            ->orderByDesc('event_count')
            ->limit($limit)
            ->get()
            ->map(fn ($row): array => [
                'utmCampaign' => (string) $row->utm_campaign,
                'eventCount' => (int) $row->event_count,
                'uniqueVisitors' => (int) $row->unique_visitors,
                'pageViewCount' => (int) $row->page_view_count,
                'offerViewCount' => (int) $row->offer_view_count,
                'leadSubmitCount' => (int) $row->lead_submit_count,
                'lastSeenAt' => $row->last_seen_at ? Carbon::parse($row->last_seen_at)->toISOString() : null,
            ])
            ->values()
            ->all();

        return response()->json(['items' => $items]);
    }

    public function funnel(Request $request): JsonResponse
    {
        $baseQuery = $this->funnelFilteredQuery($request);

        $definitions = [
            ['key' => 'page_view', 'label' => 'Oldalmegtekintés', 'events' => ['page_view']],
            ['key' => 'offer_view', 'label' => 'Ajánlat megtekintés', 'events' => ['offer_view']],
            ['key' => 'pricebox_view', 'label' => 'Ár blokk megtekintés', 'events' => ['pricebox_view']],
            ['key' => 'date_select', 'label' => 'Időpont választás', 'events' => ['date_select']],
            ['key' => 'booking_anchor_click', 'label' => 'Foglalás blokk kattintás', 'events' => ['booking_anchor_click']],
            ['key' => 'lead_or_booking_start', 'label' => 'Érdeklődés / foglalás indítás', 'events' => ['lead_start', 'booking_start']],
            ['key' => 'lead_or_booking_success', 'label' => 'Lead elküldés / sikeres foglalás', 'events' => ['lead_submit', 'booking_success']],
        ];

        $previousCount = null;
        $steps = [];

        foreach ($definitions as $definition) {
            $count = (clone $baseQuery)
                ->whereIn('event_name', $definition['events'])
                ->count();

            $dropoffRate = null;

            if ($previousCount !== null && $previousCount > 0) {
                $dropoffRate = (float) round((1 - ($count / $previousCount)) * 100, 1);
            }

            $steps[] = [
                'key' => $definition['key'],
                'label' => $definition['label'],
                'count' => $count,
                'dropoffRate' => $dropoffRate,
            ];

            $previousCount = $count;
        }

        return response()->json([
            'steps' => $steps,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $query = AnalyticsEvent::query();

        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', Carbon::parse((string) $from)->startOfDay());
        }

        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', Carbon::parse((string) $to)->endOfDay());
        }

        foreach ([
            'event_name' => 'event_name',
            'entity_type' => 'entity_type',
            'entity_slug' => 'entity_slug',
            'utm_campaign' => 'utm_campaign',
        ] as $input => $column) {
            $value = $request->query($input);

            if (is_string($value) && trim($value) !== '') {
                $query->where($column, trim($value));
            }
        }

        return $query;
    }

    private function funnelFilteredQuery(Request $request): Builder
    {
        $query = AnalyticsEvent::query();

        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', Carbon::parse((string) $from)->startOfDay());
        }

        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', Carbon::parse((string) $to)->endOfDay());
        }

        if ($utmCampaign = $request->query('utm_campaign')) {
            if (is_string($utmCampaign) && trim($utmCampaign) !== '') {
                $query->where('utm_campaign', trim($utmCampaign));
            }
        }

        if ($offerSlug = $request->query('offer_slug')) {
            if (is_string($offerSlug) && trim($offerSlug) !== '') {
                $slug = trim($offerSlug);

                $query->where(function (Builder $builder) use ($slug): void {
                    $builder
                        ->where('entity_slug', $slug)
                        ->orWhere('page_path', 'like', "%/ajanlat/{$slug}%");
                });
            }
        }

        if ($categorySlug = $request->query('category_slug')) {
            if (is_string($categorySlug) && trim($categorySlug) !== '') {
                $slug = trim($categorySlug);

                $query->where(function (Builder $builder) use ($slug): void {
                    $builder
                        ->where('entity_slug', $slug)
                        ->orWhere('page_path', 'like', "%/kategoriak/{$slug}%");
                });
            }
        }

        return $query;
    }

    private function aggregateByEntity(Builder $query, string $entityType, int $limit): array
    {
        return $query
            ->where('entity_type', $entityType)
            ->whereNotNull('entity_slug')
            ->where('entity_slug', '!=', '')
            ->selectRaw('entity_type')
            ->selectRaw('entity_id')
            ->selectRaw('entity_slug')
            ->selectRaw('count(*) as event_count')
            ->selectRaw('count(distinct visitor_id) as unique_visitors')
            ->selectRaw('max(created_at) as last_seen_at')
            ->groupBy('entity_type', 'entity_id', 'entity_slug')
            ->orderByDesc('event_count')
            ->limit($limit)
            ->get()
            ->map(fn ($row): array => [
                'entityType' => (string) $row->entity_type,
                'entityId' => $row->entity_id !== null ? (string) $row->entity_id : null,
                'entitySlug' => (string) $row->entity_slug,
                'eventCount' => (int) $row->event_count,
                'uniqueVisitors' => (int) $row->unique_visitors,
                'lastSeenAt' => $row->last_seen_at ? Carbon::parse($row->last_seen_at)->toISOString() : null,
            ])
            ->values()
            ->all();
    }

    private function topCtas(Builder $query, int $limit): array
    {
        $driver = DB::connection()->getDriverName();
        $expression = match ($driver) {
            'pgsql' => "coalesce(metadata->>'cta_name', '')",
            'sqlite' => "coalesce(json_extract(metadata, '$.cta_name'), '')",
            default => "coalesce(json_unquote(json_extract(metadata, '$.cta_name')), '')",
        };

        return $query
            ->where('event_name', 'cta_click')
            ->selectRaw("{$expression} as cta_name")
            ->selectRaw('count(*) as event_count')
            ->whereRaw("{$expression} <> ''")
            ->groupBy('cta_name')
            ->orderByDesc('event_count')
            ->limit($limit)
            ->get()
            ->map(fn ($row): array => [
                'ctaName' => (string) $row->cta_name,
                'eventCount' => (int) $row->event_count,
            ])
            ->values()
            ->all();
    }
}
