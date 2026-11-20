<?php

namespace App\Services\Tour\ProgramStructure;

/**
 * A program split up: its days, its price items and the rest of its text by
 * the tour field it belongs to. When reviewReasons is not empty the program
 * could not be split with confidence and must be left as it is.
 */
final class StructuredProgram
{
    /**
     * @param  list<array{day_number: int, title: string, description: string}>  $days
     * @param  list<array{type: string, text: string}>  $priceItems
     * @param  array<string, string>  $fields  sanitized HTML by tour column (program_before, program_footer, prices, optional_programs, payment_program)
     * @param  list<string>  $reviewReasons
     */
    public function __construct(
        public readonly array $days,
        public readonly array $priceItems,
        public readonly array $fields,
        public readonly array $reviewReasons,
    ) {}

    public function needsReview(): bool
    {
        return $this->reviewReasons !== [];
    }

    public function priceItemCount(string $type): int
    {
        return count(array_filter($this->priceItems, fn (array $item): bool => $item['type'] === $type));
    }
}
