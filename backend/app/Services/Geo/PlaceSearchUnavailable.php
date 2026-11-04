<?php

namespace App\Services\Geo;

use RuntimeException;

/**
 * The place search service could not be reached; nothing is cached.
 */
class PlaceSearchUnavailable extends RuntimeException {}
