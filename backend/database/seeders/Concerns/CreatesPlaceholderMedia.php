<?php

namespace Database\Seeders\Concerns;

use Illuminate\Database\Eloquent\Model;

trait CreatesPlaceholderMedia
{
    protected function attachPlaceholderMedia(Model $model, string $collection, string $label): void
    {
        if (! method_exists($model, 'addMediaFromString')) {
            return;
        }

        $safeLabel = strtoupper(substr(preg_replace('/[^A-Za-z0-9]+/', '', $label) ?: 'IMG', 0, 6));
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#1f2937"/>
  <circle cx="960" cy="180" r="120" fill="#f59e0b" opacity="0.35"/>
  <circle cx="220" cy="620" r="180" fill="#10b981" opacity="0.25"/>
  <text x="80" y="220" fill="#ffffff" font-size="84" font-family="Arial, Helvetica, sans-serif" font-weight="700">{$safeLabel}</text>
  <text x="80" y="320" fill="#cbd5e1" font-size="34" font-family="Arial, Helvetica, sans-serif">Adria Holiday backend seed</text>
</svg>
SVG;

        $model
            ->addMediaFromString($svg)
            ->usingFileName(strtolower($safeLabel).'.svg')
            ->toMediaCollection($collection);
    }
}
