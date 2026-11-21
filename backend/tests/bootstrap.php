<?php

// The tests run on their own SQLite file (phpunit.xml), never the development
// database. RefreshDatabase migrates it once per run and wraps every test in a
// transaction; an in-memory database would be migrated again before each test.
// The file only has to exist: its contents are rebuilt on every run.
touch(__DIR__.'/../database/testing.sqlite');

require __DIR__.'/../vendor/autoload.php';
