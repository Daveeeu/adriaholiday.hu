<?php

namespace App\Support\Legacy\Apartments;

use RuntimeException;

/**
 * The legacy apartment export file cannot be read or has not the expected shape.
 */
final class LegacyApartmentExportException extends RuntimeException {}
