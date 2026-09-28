<?php

namespace Tests;

use App\Support\TourLabelResolver;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Storage;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Tests start from an empty database, so media ids restart at 1; on the
        // real disk they would overwrite the local media library's files.
        Storage::fake(config('media-library.disk_name'));

        // Labels are memoized per process; each test starts with a fresh database.
        TourLabelResolver::flush();
    }
}
