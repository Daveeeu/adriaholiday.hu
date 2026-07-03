<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\RobotsController;
use App\Http\Controllers\SitemapController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);
Route::get('/robots.txt', RobotsController::class);
Route::get('/sitemap.xml', SitemapController::class);
Route::redirect('/korutazasok', '/utazasok', 301);
Route::get('/korutazasok/{slug}', function (string $slug) {
    return redirect("/ajanlat/{$slug}", 301);
})->where('slug', '.*');

Route::get('/admin/{any?}', function (Request $request) {
    if (
        $request->is('admin/assets/*')
        || $request->is('admin/favicon.ico')
        || $request->is('admin/robots.txt')
        || $request->is('admin/manifest*')
    ) {
        abort(404);
    }

    return response()->file(public_path('admin/index.html'));
})->where('any', '.*');

Route::get('/media/{any?}', function (Request $request) {
    if (
        $request->is('admin/assets/*')
        || $request->is('admin/favicon.ico')
        || $request->is('admin/robots.txt')
        || $request->is('admin/manifest*')
    ) {
        abort(404);
    }

    return response()->file(public_path('admin/index.html'));
})->where('any', '.*');

Route::get('/gallery/{any?}', function (Request $request) {
    if (
        $request->is('admin/assets/*')
        || $request->is('admin/favicon.ico')
        || $request->is('admin/robots.txt')
        || $request->is('admin/manifest*')
    ) {
        abort(404);
    }

    return response()->file(public_path('admin/index.html'));
})->where('any', '.*');

Route::get('/{any?}', function (Request $request) {
    if (
        $request->is('api/*')
        || $request->is('admin/assets/*')
        || $request->is('portfolio/assets/*')
        || $request->is('storage/*')
        || $request->is('favicon.ico')
        || $request->is('robots.txt')
        || $request->is('sitemap.xml')
    ) {
        abort(404);
    }

    return response()->file(public_path('portfolio/index.html'));
})->where('any', '.*');
