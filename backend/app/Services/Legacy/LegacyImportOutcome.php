<?php

namespace App\Services\Legacy;

enum LegacyImportOutcome: string
{
    case Created = 'created';
    case Updated = 'updated';
    case Skipped = 'skipped';
}
