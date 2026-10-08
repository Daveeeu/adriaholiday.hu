<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('queue:prune-failed --hours=168')->dailyAt('02:15');

Schedule::command('backup:run')->dailyAt('02:00')->withoutOverlapping();

// A tour whose last date departed leaves the public site the next night.
Schedule::command('tours:sync-expired')->dailyAt('00:10')->withoutOverlapping();
