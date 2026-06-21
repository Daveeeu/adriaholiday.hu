<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        $roles = $this->getRoleNames()->values()->all();
        $permissions = $this->getAllPermissions()->pluck('name')->values()->all();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'initials' => collect(explode(' ', trim((string) $this->name)))
                ->filter()
                ->map(fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)))
                ->take(2)
                ->implode(''),
            'roles' => $roles,
            'permissions' => $permissions,
            'role' => $roles[0] ?? null,
            'isSuperAdmin' => in_array('Super Admin', $roles, true),
        ];
    }
}
