<?php

namespace App\Services\Tour\ProgramStructure;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;
use DOMXPath;

/**
 * Reads a program's HTML into its top-level blocks with DOMDocument:
 * paragraphs and headings line by line (a <br> ends a line), tables and
 * lists whole. Of the formatting only bold, italic and links are kept;
 * colours, fonts and other wrappers (<span>, <font>…) are dropped.
 */
final class ProgramHtmlReader
{
    private const LINE_BLOCKS = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'section', 'article'];

    private const WHOLE_BLOCKS = ['table', 'ul', 'ol'];

    private const SKIPPED = ['script', 'style', 'hr', 'img', 'iframe'];

    private const ALIGNMENTS = ['center', 'right'];

    /** @var list<ProgramBlock> */
    private array $blocks = [];

    /** @var list<DOMNode> inline nodes outside any paragraph, read as one */
    private array $looseInline = [];

    /**
     * @return list<ProgramBlock>
     */
    public function read(string $html): array
    {
        $this->blocks = [];
        $this->looseInline = [];

        $document = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8"><div id="program-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = (new DOMXPath($document))->query('//*[@id="program-root"]')->item(0);

        if ($root instanceof DOMElement) {
            $this->readContainer($root);
        }

        return $this->blocks;
    }

    private function readContainer(DOMNode $container): void
    {
        foreach ($container->childNodes as $node) {
            $tag = $node instanceof DOMElement ? strtolower($node->tagName) : null;

            if ($tag !== null && in_array($tag, self::SKIPPED, true)) {
                continue;
            }

            if ($tag !== null && in_array($tag, self::WHOLE_BLOCKS, true)) {
                $this->flushLooseInline();
                $this->addWholeBlock($node);
            } elseif ($tag !== null && in_array($tag, self::LINE_BLOCKS, true)) {
                $this->flushLooseInline();

                // A wrapper of paragraphs (<div><p>…</p><p>…</p></div>) is read as its paragraphs.
                if ($this->hasBlockChildren($node)) {
                    $this->readContainer($node);
                } else {
                    $this->addParagraph($tag, $node, iterator_to_array($node->childNodes));
                }
            } else {
                $this->looseInline[] = $node;
            }
        }

        $this->flushLooseInline();
    }

    private function flushLooseInline(): void
    {
        if ($this->looseInline !== []) {
            $this->addParagraph('p', null, $this->looseInline);
            $this->looseInline = [];
        }
    }

    /**
     * @param  array<int, DOMNode>  $nodes
     */
    private function addParagraph(string $tag, ?DOMNode $element, array $nodes): void
    {
        $lines = [[]];
        $isHeading = preg_match('/^h[1-6]$/', $tag) === 1;

        foreach ($nodes as $node) {
            $this->collectRuns($node, false, false, null, $lines);
        }

        $lines = array_values(array_filter(
            array_map(fn (array $runs): ProgramLine => ProgramLine::trimmed($this->collapsedRuns($runs)), $lines),
            fn (ProgramLine $line): bool => $line->runs !== [],
        ));

        if ($lines !== []) {
            $this->blocks[] = ProgramBlock::paragraph($isHeading || $tag === 'blockquote' ? $tag : 'p', $this->alignment($element), $lines);
        }
    }

    /**
     * @param  list<list<array{text: string, strong: bool, em: bool, href: ?string}>>  $lines
     */
    private function collectRuns(DOMNode $node, bool $strong, bool $em, ?string $href, array &$lines): void
    {
        if ($node instanceof DOMText) {
            $lines[array_key_last($lines)][] = ['text' => $node->wholeText, 'strong' => $strong, 'em' => $em, 'href' => $href];

            return;
        }

        if (! $node instanceof DOMElement) {
            return;
        }

        $tag = strtolower($node->tagName);

        if (in_array($tag, self::SKIPPED, true)) {
            return;
        }

        if ($tag === 'br') {
            $lines[] = [];

            return;
        }

        $isBlock = in_array($tag, self::LINE_BLOCKS, true) || in_array($tag, self::WHOLE_BLOCKS, true) || $tag === 'tr';

        if ($isBlock) {
            $lines[] = [];
        }

        $strong = $strong || in_array($tag, ['strong', 'b'], true);
        $em = $em || in_array($tag, ['em', 'i'], true);
        $link = $tag === 'a' ? trim($node->getAttribute('href')) : '';
        $href = $link !== '' && preg_match('#^(https?:|mailto:|tel:|/)#i', $link) === 1 ? $link : $href;

        foreach ($node->childNodes as $child) {
            $this->collectRuns($child, $strong, $em, $href, $lines);
        }

        if ($isBlock) {
            $lines[] = [];
        }
    }

    /**
     * Collapses whitespace (non-breaking spaces included) inside and between
     * the runs, dropping zero-width spaces.
     *
     * @param  list<array{text: string, strong: bool, em: bool, href: ?string}>  $runs
     * @return list<array{text: string, strong: bool, em: bool, href: ?string}>
     */
    private function collapsedRuns(array $runs): array
    {
        $collapsed = [];
        $endsWithSpace = true;

        foreach ($runs as $run) {
            $text = (string) preg_replace('/[\x{200B}\x{FEFF}]/u', '', $run['text']);
            $text = (string) preg_replace('/[\s\x{00A0}]+/u', ' ', $text);

            if ($endsWithSpace) {
                $text = ltrim($text, ' ');
            }

            if ($text === '') {
                continue;
            }

            $endsWithSpace = str_ends_with($text, ' ');
            $collapsed[] = [...$run, 'text' => $text];
        }

        return $collapsed;
    }

    private function addWholeBlock(DOMNode $node): void
    {
        $tag = strtolower($node instanceof DOMElement ? $node->tagName : 'table');
        $text = $this->normalized($this->spacedText($node));

        if ($text === '') {
            return;
        }

        $items = [];

        if ($tag !== 'table') {
            foreach ($node->childNodes as $child) {
                if ($child instanceof DOMElement && strtolower($child->tagName) === 'li' && ($item = $this->normalized($this->spacedText($child))) !== '') {
                    $items[] = $item;
                }
            }
        }

        $this->blocks[] = ProgramBlock::whole($tag, (string) $node->ownerDocument?->saveHTML($node), $text, $items);
    }

    /**
     * The text of a table or list with a space between its cells, rows,
     * items and lines (textContent runs them together).
     */
    private function spacedText(DOMNode $node): string
    {
        if ($node instanceof DOMText) {
            return $node->wholeText;
        }

        $text = '';

        foreach ($node->childNodes as $child) {
            $text .= $this->spacedText($child);
        }

        $separated = $node instanceof DOMElement && in_array(strtolower($node->tagName), ['td', 'th', 'tr', 'li', 'p', 'div', 'br'], true);

        return $separated ? " {$text} " : $text;
    }

    private function hasBlockChildren(DOMNode $node): bool
    {
        foreach ($node->childNodes as $child) {
            if ($child instanceof DOMElement && in_array(strtolower($child->tagName), [...self::LINE_BLOCKS, ...self::WHOLE_BLOCKS], true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * A centred or right-aligned block keeps its alignment; justified and
     * left are the site's own.
     */
    private function alignment(?DOMNode $element): ?string
    {
        if (! $element instanceof DOMElement) {
            return null;
        }

        $align = preg_match('/text-align\s*:\s*([a-z]+)/i', $element->getAttribute('style'), $match) ? strtolower($match[1]) : '';

        return in_array($align, self::ALIGNMENTS, true) ? $align : null;
    }

    private function normalized(string $text): string
    {
        $text = (string) preg_replace('/[\x{200B}\x{FEFF}]/u', '', $text);

        return trim((string) preg_replace('/[\s\x{00A0}]+/u', ' ', $text));
    }
}
