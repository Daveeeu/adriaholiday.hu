<?php

namespace App\Services\PortfolioContent;

use App\Models\PortfolioContentBlock;
use App\Support\CompanyYears;
use App\Support\PlainText;

/**
 * The home page's frequently asked questions as published in the admin
 * (the "home.faq.items" content block), for the page's crawlable content and
 * its FAQPage structured data.
 */
class PortfolioFaq
{
    private const KEY = 'home.faq.items';

    /**
     * @return array<int, array{question: string, answer: string}>
     */
    public function items(): array
    {
        $items = PortfolioContentBlock::query()->where('key', self::KEY)->value('value_json');

        if (! is_array($items)) {
            return [];
        }

        return array_values(array_filter(array_map(function (mixed $item): ?array {
            $question = PlainText::line(CompanyYears::fill(is_array($item) ? (string) ($item['question'] ?? '') : ''));
            $answer = PlainText::line(CompanyYears::fill(is_array($item) ? (string) ($item['answer'] ?? '') : ''));

            return $question !== null && $answer !== null ? ['question' => $question, 'answer' => $answer] : null;
        }, $items)));
    }
}
