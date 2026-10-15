<?php

namespace App\Support\Legacy\Catalog;

use RuntimeException;

/**
 * The legacy catalog file cannot be read at all (missing, not JSON, no offers).
 */
final class LegacyCatalogException extends RuntimeException {}
