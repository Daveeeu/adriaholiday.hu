<?php

namespace App\Http\Requests\Admin\SiteSettings;

use App\Models\SiteSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

    /**
     * Social profile links are rendered as public hrefs, so only web addresses are accepted.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ((array) $this->input('items', []) as $index => $item) {
                if (! is_array($item) || ($item['group'] ?? null) !== 'social') {
                    continue;
                }

                $value = $item['value'] ?? null;

                if ($value === null || $value === '') {
                    continue;
                }

                if (! is_string($value) || ! preg_match('#^https?://#i', $value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
                    $validator->errors()->add("items.{$index}.value", 'A közösségi profil linkje érvényes http(s) webcím legyen.');
                }
            }
        });
    }
}
