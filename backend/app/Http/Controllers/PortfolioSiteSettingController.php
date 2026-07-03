<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class PortfolioSiteSettingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $payload = SiteSetting::query()
            ->public()
            ->orderBy('group')
            ->orderBy('id')
            ->get()
            ->groupBy('group')
            ->map(function ($settings): array {
                return $settings->reduce(function (array $carry, SiteSetting $setting): array {
                    $carry[$setting->key] = $setting->decodedValue();

                    return $carry;
                }, []);
            });

        return response()->json($payload);
    }
}
