<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, LogsActivity, Notifiable {
        HasRoles::hasPermissionTo as protected roleHasPermissionTo;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->dontLogEmptyChanges();
    }

    /**
     * Pin permission/role checks to the "web" guard regardless of which guard
     * Sanctum's Authenticate middleware makes the ambient default (it calls
     * Auth::shouldUse('sanctum') on every authenticated request), since every
     * permission and role is seeded under guard_name "web".
     */
    public function guardName(): string
    {
        return 'web';
    }

    /**
     * Permissions explicitly denied for this user, overriding any role-granted permission.
     */
    public function deniedPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_denied_permissions');
    }

    public function hasPermissionTo($permission, ?string $guardName = null): bool
    {
        $permissionName = $permission instanceof Permission ? $permission->name : (string) $permission;

        $isDenied = $this->relationLoaded('deniedPermissions')
            ? $this->deniedPermissions->contains('name', $permissionName)
            : $this->deniedPermissions()->where('name', $permissionName)->exists();

        if ($isDenied) {
            return false;
        }

        return $this->roleHasPermissionTo($permission, $guardName);
    }
}
