<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicPortfolioContentResource;
use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;

class PortfolioContentController extends Controller
{
    public function index(Request $request)
    {
        $page = (string) $request->query('page', 'home');

        $blocks = PublicContentCache::remember(
            PublicContentCache::HOMEPAGE_CONTENT,
            "page:{$page}",
            900,
            function () use ($page, $request) {
                return PortfolioContentBlock::query()
                    ->forPage($page)
                    ->whereNull('deleted_at')
                    ->get()
                    ->mapWithKeys(fn (PortfolioContentBlock $block) => [
                        $block->key => (new PublicPortfolioContentResource($block))->resolve($request),
                    ]);
            }
        );

        return response()->json($blocks);
    }
}
