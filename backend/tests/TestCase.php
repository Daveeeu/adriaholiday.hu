<?php

namespace Tests;

use App\Support\TourLabelResolver;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
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

        // Tests never reach the network: the legacy importers default to the live
        // site, and an unfaked call would hit production and stall the suite.
        Http::preventStrayRequests();
    }
}
