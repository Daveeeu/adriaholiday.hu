<?php

namespace Tests;

use App\Support\TourLabelResolver;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Labels are memoized per process; each test starts with a fresh database.
        TourLabelResolver::flush();
    }
}
