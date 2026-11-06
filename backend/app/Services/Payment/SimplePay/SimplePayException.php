<?php

namespace App\Services\Payment\SimplePay;

use RuntimeException;

/**
 * SimplePay could not be reached, rejected a request, or sent a message whose
 * signature does not match.
 */
class SimplePayException extends RuntimeException {}
