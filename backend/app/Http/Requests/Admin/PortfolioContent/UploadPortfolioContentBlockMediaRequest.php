<?php

namespace App\Http\Requests\Admin\PortfolioContent;

use App\Support\MediaCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadPortfolioContentBlockMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime',
            ],
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', Rule::in(MediaCategory::values())],
            'sourceContext' => ['nullable', 'string', 'max:255'],
            'sourceId' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
