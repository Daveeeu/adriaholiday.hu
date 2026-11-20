<?php

namespace App\Services\Tour\ProgramStructure;

/**
 * A top-level block of a program: a paragraph or heading read line by line,
 * or a table / list kept whole.
 */
final class ProgramBlock
{
    /**
     * @param  list<ProgramLine>  $lines  of a paragraph or heading
     * @param  ?string  $html  of a table or list, kept as it is
     * @param  list<string>  $listItems  the items of a list
     */
    private function __construct(
        public readonly string $tag,
        public readonly ?string $align,
        public readonly array $lines,
        public readonly ?string $html,
        public readonly string $text,
        public readonly array $listItems,
    ) {}

    /**
     * @param  list<ProgramLine>  $lines
     */
    public static function paragraph(string $tag, ?string $align, array $lines): self
    {
        $text = implode("\n", array_map(fn (ProgramLine $line): string => $line->text(), $lines));

        return new self($tag, $align, $lines, null, $text, []);
    }

    /**
     * @param  list<string>  $listItems
     */
    public static function whole(string $tag, string $html, string $text, array $listItems = []): self
    {
        return new self($tag, null, [], $html, $text, $listItems);
    }

    public function isWhole(): bool
    {
        return $this->html !== null;
    }

    public function isHeading(): bool
    {
        return preg_match('/^h[1-6]$/', $this->tag) === 1;
    }
}
