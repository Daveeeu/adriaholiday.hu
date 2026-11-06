<?php

namespace App\Services\Payment\Barion;

use RuntimeException;

/**
 * The Barion API could not be reached or rejected a request.
 */
class BarionException extends RuntimeException {}
