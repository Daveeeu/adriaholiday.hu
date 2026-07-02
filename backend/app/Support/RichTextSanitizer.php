<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;

class RichTextSanitizer
{
    private const ALLOWED_TAGS = [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'h2',
        'h3',
        'ul',
        'ol',
        'li',
        'blockquote',
        'a',
        'span',
    ];

    private const ALLOWED_STYLES = [
        'color',
        'background-color',
        'text-align',
        'font-size',
        'font-family',
    ];

    private const ALLOWED_TEXT_ALIGN = ['left', 'center', 'right', 'justify'];

    public static function sanitize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return '';
        }

        $source = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);

        $source->loadHTML(
            '<?xml encoding="UTF-8"><div id="richtext-root">'.$value.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = (new DOMXPath($source))->query('//*[@id="richtext-root"]')->item(0);

        if (! $root instanceof DOMElement) {
            return $value;
        }

        $output = new DOMDocument('1.0', 'UTF-8');
        $container = $output->createElement('div');
        $output->appendChild($container);

        self::appendChildren($root, $output, $container);

        $sanitized = '';
        foreach (iterator_to_array($container->childNodes) as $child) {
            $sanitized .= $output->saveHTML($child);
        }

        return trim($sanitized);
    }

    private static function appendChildren(DOMNode $source, DOMDocument $output, DOMElement $target): void
    {
        foreach (iterator_to_array($source->childNodes) as $child) {
            self::appendNode($child, $output, $target);
        }
    }

    private static function appendNode(DOMNode $source, DOMDocument $output, DOMElement $target): void
    {
        if ($source->nodeType === XML_TEXT_NODE) {
            $target->appendChild($output->createTextNode($source->nodeValue ?? ''));

            return;
        }

        if ($source->nodeType !== XML_ELEMENT_NODE) {
            return;
        }

        $tag = strtolower($source->nodeName);

        if (! in_array($tag, self::ALLOWED_TAGS, true)) {
            self::appendChildren($source, $output, $target);

            return;
        }

        $element = $output->createElement($tag);

        foreach (iterator_to_array($source->attributes ?? []) as $attribute) {
            $name = strtolower($attribute->nodeName);
            $value = trim((string) $attribute->nodeValue);

            if (str_starts_with($name, 'on')) {
                continue;
            }

            if ($name === 'style') {
                $sanitizedStyle = self::sanitizeStyle($value);

                if ($sanitizedStyle !== null) {
                    $element->setAttribute('style', $sanitizedStyle);
                }

                continue;
            }

            if ($tag === 'a' && in_array($name, ['href', 'target', 'rel', 'title'], true)) {
                $sanitizedValue = match ($name) {
                    'href' => self::sanitizeHref($value),
                    'target' => self::sanitizeTarget($value),
                    'rel' => self::sanitizeRel($value, $source),
                    default => $value !== '' ? $value : null,
                };

                if ($sanitizedValue !== null && $sanitizedValue !== '') {
                    $element->setAttribute($name, $sanitizedValue);
                }

                continue;
            }
        }

        self::appendChildren($source, $output, $element);
        $target->appendChild($element);
    }

    private static function sanitizeStyle(string $style): ?string
    {
        $pairs = array_filter(array_map('trim', explode(';', $style)));
        $sanitized = [];

        foreach ($pairs as $pair) {
            if (! str_contains($pair, ':')) {
                continue;
            }

            [$property, $value] = array_map('trim', explode(':', $pair, 2));
            $property = strtolower($property);
            $value = trim($value);

            if (! in_array($property, self::ALLOWED_STYLES, true)) {
                continue;
            }

            $cleanValue = match ($property) {
                'text-align' => self::sanitizeTextAlign($value),
                'font-size' => self::sanitizeFontSize($value),
                'font-family' => self::sanitizeFontFamily($value),
                default => self::sanitizeCssColor($value),
            };

            if ($cleanValue !== null) {
                $sanitized[$property] = $cleanValue;
            }
        }

        if ($sanitized === []) {
            return null;
        }

        $css = [];

        foreach ($sanitized as $property => $value) {
            $css[] = "{$property}: {$value}";
        }

        return implode('; ', $css);
    }

    private static function sanitizeCssColor(string $value): ?string
    {
        if ($value === '' || preg_match('/[;{}<>]/', $value) || preg_match('/url\s*\(|expression\s*\(/i', $value)) {
            return null;
        }

        if (preg_match('/^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z][a-z-]*)$/i', $value)) {
            return $value;
        }

        return null;
    }

    private static function sanitizeTextAlign(string $value): ?string
    {
        $value = strtolower(trim($value));

        return in_array($value, self::ALLOWED_TEXT_ALIGN, true) ? $value : null;
    }

    private static function sanitizeFontSize(string $value): ?string
    {
        if (preg_match('/^\d+(?:\.\d+)?(px|rem|em|%)$/i', trim($value))) {
            return trim($value);
        }

        return null;
    }

    private static function sanitizeFontFamily(string $value): ?string
    {
        $value = trim($value);

        if ($value === '' || preg_match('/[;{}<>]/', $value) || preg_match('/url\s*\(|expression\s*\(/i', $value)) {
            return null;
        }

        if (preg_match('/^[a-z0-9\s,"\'\-]+$/i', $value)) {
            return $value;
        }

        return null;
    }

    private static function sanitizeHref(string $value): ?string
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^(javascript|vbscript|data):/i', $value)) {
            return null;
        }

        if (
            str_starts_with($value, '/')
            || str_starts_with($value, '#')
            || str_starts_with($value, './')
            || str_starts_with($value, '../')
        ) {
            return $value;
        }

        return filter_var($value, FILTER_VALIDATE_URL) ? $value : null;
    }

    private static function sanitizeTarget(string $value): ?string
    {
        return in_array($value, ['_blank', '_self', '_parent', '_top'], true) ? $value : null;
    }

    private static function sanitizeRel(string $value, DOMNode $source): ?string
    {
        $rel = array_filter(array_map('trim', preg_split('/\s+/', $value) ?: []));
        $rel = array_values(array_unique($rel));

        if ($rel === [] && $source instanceof DOMElement && $source->getAttribute('target') === '_blank') {
            $rel = ['noopener', 'noreferrer'];
        }

        return $rel === [] ? null : implode(' ', $rel);
    }
}
