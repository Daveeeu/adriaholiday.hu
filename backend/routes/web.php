<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin/{any?}', function () {
    return response()->file(public_path('admin/index.html'));
})->where('any', '.*');
