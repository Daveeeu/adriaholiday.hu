<?php

namespace App\Http\Requests\Admin\PortfolioContent;

use App\Support\MediaCategory;
use App\Support\MediaUploadRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadPortfolioContentBlockMediaRequest extends FormRequest
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/quicktime',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => MediaUploadRules::file(self::ALLOWED_MIME_TYPES, $this->file('file')),
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', Rule::in(MediaCategory::values())],
            'sourceContext' => ['nullable', 'string', 'max:255'],
            'sourceId' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
