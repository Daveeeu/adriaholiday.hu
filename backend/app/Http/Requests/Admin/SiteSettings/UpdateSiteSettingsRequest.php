<?php

namespace App\Http\Requests\Admin\SiteSettings;

use App\Models\SiteSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSiteSettingsRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $items = collect($this->input('items', []))
            ->map(function (mixed $item): mixed {
                if (! is_array($item)) {
                    return $item;
                }

                $item['is_public'] = array_key_exists('is_public', $item)
                    ? filter_var($item['is_public'], FILTER_VALIDATE_BOOL)
                    : filter_var($item['isPublic'] ?? false, FILTER_VALIDATE_BOOL);

                return $item;
            })
            ->all();

        $this->merge([
            'items' => $items,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.group' => ['required', 'string', Rule::in(SiteSetting::GROUPS)],
            'items.*.key' => ['required', 'string', 'max:255'],
            'items.*.type' => ['required', 'string', Rule::in(SiteSetting::TYPES)],
            'items.*.is_public' => ['required', 'boolean'],
            'items.*.value' => ['nullable'],
        ];
    }
}
