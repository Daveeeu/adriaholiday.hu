<?php

namespace App\Services\Legacy;

/**
 * What happened to one legacy booking record during an import.
 */
final class LegacyBookingImportResult
{
    private function __construct(
        public readonly string $outcome,
        public readonly bool $tourMatched = false,
        public readonly bool $dateMatched = false,
        public readonly ?string $offerName = null,
        public readonly ?string $reason = null,
    ) {}

    public static function imported(bool $tourMatched, bool $dateMatched, string $offerName): self
    {
        return new self('imported', $tourMatched, $dateMatched, $offerName);
    }

    public static function alreadyImported(): self
    {
        return new self('already_imported');
    }

    public static function invalid(string $reason): self
    {
        return new self('invalid', reason: $reason);
    }
}
