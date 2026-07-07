<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'roles' => $this->input('roles', []),
            'permissions' => $this->input('permissions', []),
            'denied_permissions' => $this->input('denied_permissions', $this->input('deniedPermissions', [])),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_active' => ['boolean'],
            'roles' => ['array'],
            'roles.*' => [Rule::exists('roles', 'name')->where('guard_name', 'web')],
            'permissions' => ['array'],
            'permissions.*' => [Rule::exists('permissions', 'name')->where('guard_name', 'web')],
            'denied_permissions' => ['array'],
            'denied_permissions.*' => [Rule::exists('permissions', 'name')->where('guard_name', 'web')],
        ];
    }
}
