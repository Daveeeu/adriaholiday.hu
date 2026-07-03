<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteSettings\UpdateSiteSettingsRequest;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SiteSettingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:site-settings.view')->only('index');
        $this->middleware('permission:site-settings.update')->only('update');
    }

    public function index(): JsonResponse
    {
        $items = SiteSetting::query()
            ->orderBy('group')
            ->orderBy('id')
            ->get();

        return response()->json([
            'items' => SiteSettingResource::collection($items)->resolve(),
        ]);
    }

    public function update(UpdateSiteSettingsRequest $request): JsonResponse
    {
        $items = DB::transaction(function () use ($request) {
            foreach ($request->validated()['items'] as $item) {
                SiteSetting::query()->updateOrCreate(
                    [
                        'group' => $item['group'],
                        'key' => $item['key'],
                    ],
                    [
                        'type' => $item['type'],
                        'is_public' => $item['is_public'],
                        'value' => SiteSetting::encodeValue($item['type'], $item['value'] ?? null),
                    ],
                );
            }

            return SiteSetting::query()
                ->orderBy('group')
                ->orderBy('id')
                ->get();
        });

        return response()->json([
            'items' => SiteSettingResource::collection($items)->resolve(),
        ]);
    }
}
