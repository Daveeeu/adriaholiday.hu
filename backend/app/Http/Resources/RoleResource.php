<?php

namespace App\Http\Resources;

use App\Support\UserAccessGuard;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'permissions' => $this->permissions->pluck('name')->values()->all(),
            'permissionsCount' => $this->permissions->count(),
            'usersCount' => $this->whenCounted('users', fn () => $this->users_count, fn () => $this->users()->count()),
            'isSystemRole' => in_array($this->name, [UserAccessGuard::SUPER_ADMIN_ROLE, 'Admin'], true),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
