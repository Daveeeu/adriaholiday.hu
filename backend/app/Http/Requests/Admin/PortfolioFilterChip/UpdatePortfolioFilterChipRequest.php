<?php

namespace App\Http\Requests\Admin\PortfolioFilterChip;

use App\Models\PortfolioFilterChip;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdatePortfolioFilterChipRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'scope_type' => $this->input('scope_type', $this->input('scopeType', 'global')),
            'scope_value' => $this->input('scope_value', $this->input('scopeValue')),
            'filter_type' => $this->input('filter_type', $this->input('filterType')),
            'filter_value' => $this->input('filter_value', $this->input('filterValue')),
            'filter_config' => $this->input('filter_config', $this->input('filterConfig')),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
            'hide_when_zero' => $this->boolean('hide_when_zero', $this->boolean('hideWhenZero', false)),
            'active' => $this->boolean('active', true),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var PortfolioFilterChip|null $chip */
        $chip = $this->route('portfolio_filter_chip');

        return [
            'scope_type' => ['required', 'in:global,category,homepage_offer'],
            'scope_value' => ['nullable', 'string', 'max:255'],
            'label' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('portfolio_filter_chips', 'slug')->ignore($chip?->id)],
            'icon' => ['nullable', 'string', 'max:100'],
            'filter_type' => ['required', 'in:tag,category,travel_mode,country,price,theme,custom'],
            'filter_value' => ['nullable', 'string', 'max:255'],
            'filter_config' => ['nullable', 'array'],
            'sort_order' => ['integer', 'min:0'],
            'active' => ['boolean'],
            'hide_when_zero' => ['boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $scopeType = (string) $this->input('scope_type');
            $filterType = (string) $this->input('filter_type');
            $filterValue = trim((string) $this->input('filter_value', ''));
            $filterConfig = $this->input('filter_config');

            if ($scopeType !== 'global' && trim((string) $this->input('scope_value', '')) === '') {
                $validator->errors()->add('scope_value', 'A scope érték megadása kötelező.');
            }

            if (! in_array($filterType, ['price', 'custom'], true) && $filterValue === '') {
                $validator->errors()->add('filter_value', 'A filter érték megadása kötelező.');
            }

            if ($filterType === 'price') {
                $hasMin = is_array($filterConfig) && array_key_exists('min', $filterConfig) && $filterConfig['min'] !== null && $filterConfig['min'] !== '';
                $hasMax = is_array($filterConfig) && array_key_exists('max', $filterConfig) && $filterConfig['max'] !== null && $filterConfig['max'] !== '';

                if (! $hasMin && ! $hasMax) {
                    $validator->errors()->add('filter_config', 'Ár típusnál minimum vagy maximum ár megadása kötelező.');
                }
            }
        });
    }
}
