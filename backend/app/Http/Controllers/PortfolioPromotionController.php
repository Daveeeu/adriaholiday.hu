<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicPromotionResource;
use App\Models\Promotion;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;

class PortfolioPromotionController extends Controller
{
    public function active(Request $request)
    {
        $promotion = PublicContentCache::remember(
            PublicContentCache::PROMOTIONS,
            'active',
            900,
            fn () => Promotion::query()
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('starts_at')->orWhereDate('starts_at', '<=', now()))
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhereDate('expires_at', '>=', now()))
                ->orderByDesc('updated_at')
                ->first()
        );

        return response()->json([
            'promotion' => $promotion ? (new PublicPromotionResource($promotion))->resolve($request) : null,
        ]);
    }
}
