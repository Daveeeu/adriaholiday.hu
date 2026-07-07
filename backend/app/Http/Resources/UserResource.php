<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $rolePermissions = $this->getAllPermissions()->pluck('name');
        $deniedPermissions = $this->deniedPermissions->pluck('name');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'initials' => collect(explode(' ', trim((string) $this->name)))
                ->filter()
                ->map(fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)))
                ->take(2)
                ->implode(''),
            'isActive' => (bool) $this->is_active,
            'roles' => $this->getRoleNames()->values()->all(),
            'directPermissions' => $this->getDirectPermissions()->pluck('name')->values()->all(),
            'deniedPermissions' => $deniedPermissions->values()->all(),
            'permissions' => $rolePermissions->diff($deniedPermissions)->values()->all(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
