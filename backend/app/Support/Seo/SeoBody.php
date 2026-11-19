<?php

namespace App\Support\Seo;

/**
 * The text of a public page as served in its HTML before the app runs, so
 * crawlers that do not run JavaScript (most AI assistants' among them) read
 * what the page is about and follow its links. The app replaces it on start.
 */
final class SeoBody
{
    /**
     * @param  array<int, string>  $paragraphs
     * @param  array<int, SeoLinkSection>  $sections
     * @param  array<int, array{question: string, answer: string}>  $questions  frequently asked questions
     */
    public function __construct(
        public readonly string $heading,
        public readonly array $paragraphs = [],
        public readonly array $sections = [],
        public readonly array $questions = [],
    ) {}

    /**
     * The same content followed by further link sections.
     */
    public function withSections(SeoLinkSection ...$sections): self
    {
        return new self($this->heading, $this->paragraphs, [...$this->sections, ...$sections], $this->questions);
    }
}
