<?php

namespace App\Services\Tour\ProgramStructure;

/**
 * One line of a program paragraph (the text between two <br>s), as runs of
 * text with the only formatting kept: bold, italic and links.
 */
final class ProgramLine
{
    /**
     * @param  list<array{text: string, strong: bool, em: bool, href: ?string}>  $runs  whitespace already collapsed, the line trimmed
     */
    public function __construct(public readonly array $runs) {}

    public function text(): string
    {
        return implode('', array_column($this->runs, 'text'));
    }

    /**
     * The bold text the line starts with ("1. NAP BELGRÁD" of "<strong>1. NAP BELGRÁD</strong> Indulás…").
     */
    public function boldPrefix(): string
    {
        return trim(implode('', array_column($this->leadingBoldRuns(), 'text')));
    }

    public function isAllBold(): bool
    {
        return $this->runs !== [] && count($this->leadingBoldRuns()) === count($this->runs);
    }

    /**
     * The line without its first $length characters: "Indulás…" of
     * "<strong>1.nap:</strong> Indulás…" without the bold "1.nap:".
     */
    public function withoutLeading(int $length): self
    {
        $runs = [];

        foreach ($this->runs as $run) {
            $runLength = mb_strlen($run['text']);

            if ($length >= $runLength) {
                $length -= $runLength;

                continue;
            }

            $runs[] = [...$run, 'text' => mb_substr($run['text'], $length)];
            $length = 0;
        }

        return self::trimmed($runs);
    }

    public function html(): string
    {
        $html = '';
        $open = [null, false, false];

        foreach ($this->runs as $run) {
            $wanted = [$run['href'], $run['strong'], $run['em']];
            $html .= $this->switchFormatting($open, $wanted).e($run['text']);
            $open = $wanted;
        }

        return $html.$this->switchFormatting($open, [null, false, false]);
    }

    /**
     * @param  list<array{text: string, strong: bool, em: bool, href: ?string}>  $runs
     */
    public static function trimmed(array $runs): self
    {
        $runs = array_values(array_filter($runs, fn (array $run): bool => $run['text'] !== ''));

        if ($runs !== []) {
            $runs[0]['text'] = ltrim($runs[0]['text']);
            $last = array_key_last($runs);
            $runs[$last]['text'] = rtrim($runs[$last]['text']);
        }

        return new self(array_values(array_filter($runs, fn (array $run): bool => $run['text'] !== '')));
    }

    /**
     * @return list<array{text: string, strong: bool, em: bool, href: ?string}>
     */
    private function leadingBoldRuns(): array
    {
        $bold = [];

        foreach ($this->runs as $run) {
            if (! $run['strong']) {
                break;
            }

            $bold[] = $run;
        }

        return $bold;
    }

    /**
     * The closing and opening tags that turn one formatting into the other,
     * nested as <a><strong><em>.
     *
     * @param  array{0: ?string, 1: bool, 2: bool}  $from
     * @param  array{0: ?string, 1: bool, 2: bool}  $to
     */
    private function switchFormatting(array $from, array $to): string
    {
        $first = 0;

        while ($first < 3 && $from[$first] === $to[$first]) {
            $first++;
        }

        $tags = '';

        for ($level = 2; $level >= $first; $level--) {
            if ($from[$level]) {
                $tags .= ['</a>', '</strong>', '</em>'][$level];
            }
        }

        for ($level = $first; $level < 3; $level++) {
            if ($to[$level]) {
                $tags .= [$level === 0 ? '<a href="'.e((string) $to[0]).'">' : '', '<strong>', '<em>'][$level];
            }
        }

        return $tags;
    }
}
