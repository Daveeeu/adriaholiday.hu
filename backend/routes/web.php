<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\PortfolioSpaController;
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

$serveAdminSpa = fn () => response()->file(public_path('admin/index.html'));

Route::get('/admin/{any?}', function (Request $request) use ($serveAdminSpa) {
    if (
        $request->is('admin/assets/*')
        || $request->is('admin/favicon.ico')
        || $request->is('admin/robots.txt')
        || $request->is('admin/manifest*')
    ) {
        abort(404);
    }

    return $serveAdminSpa();
})->where('any', '.*');

Route::get('/media/{any?}', $serveAdminSpa)->where('any', '.*');
Route::get('/gallery/{any?}', $serveAdminSpa)->where('any', '.*');

Route::get('/{any?}', PortfolioSpaController::class)->where('any', '.*');
