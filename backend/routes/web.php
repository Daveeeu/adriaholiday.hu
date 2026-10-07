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
// Legacy adriaholiday.hu URLs, so links and search results keep working after the switch.
Route::get('/korutazasok/csoport/{group}/{country?}', function (string $group) {
    $categories = ['korutazas' => 'korutazasok', 'tengerparti-udulesek' => 'tengerpartok', 'advent' => 'adventi-barangolasok'];

    return redirect(isset($categories[$group]) ? "/kategoriak/{$categories[$group]}" : '/utazasok', 301);
})->where('country', '.*');
Route::redirect('/korutazasok/regio/{country}', '/utazasok', 301)->where('country', '.*');
Route::redirect('/korutazasok/akcio', '/utazasok', 301);
Route::redirect('/altalanos-szerzodesi-feltetelek', '/aszf', 301);
Route::redirect('/adatkezelesi-szabalyzat', '/adatvedelem', 301);
// The former duplicate of the home page.
Route::redirect('/portfolio', '/', 301);
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
