<?php

namespace App\Services\ActivityLog;

use App\Models\User;
use App\Support\ActivityLog\ActivityEvents;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

/**
 * Records changes the model events cannot see: the roles and permissions
 * synced onto users and roles through pivot tables, role lifecycle (Spatie's
 * Role model does not log itself) and password changes, whose value is never
 * written to the log.
 */
class AccessActivityLogger
{
    /**
     * @return array<string, mixed>
     */
    public function snapshot(User|Role $target): array
    {
        if ($target instanceof Role) {
            $target->load('permissions');

            return [
                'name' => $target->name,
                'permissions' => $this->sortedNames($target->permissions),
            ];
        }

        $target->load('roles', 'permissions', 'deniedPermissions');

        return [
            'roles' => $this->sortedNames($target->roles),
            'permissions' => $this->sortedNames($target->permissions),
            'denied_permissions' => $this->sortedNames($target->deniedPermissions),
        ];
    }

    /**
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     */
    public function recordChanges(User $actor, User|Role $target, string $event, array $before, array $after): void
    {
        $changedKeys = collect(array_keys($before + $after))
            ->reject(fn (string $key): bool => $this->isSame($before[$key] ?? null, $after[$key] ?? null))
            ->values();

        if ($changedKeys->isEmpty()) {
            return;
        }

        $changes = match ($event) {
            ActivityEvents::CREATED => ['attributes' => collect($after)->only($changedKeys)->all()],
            ActivityEvents::DELETED => ['old' => collect($before)->only($changedKeys)->all()],
            default => [
                'attributes' => collect($after)->only($changedKeys)->all(),
                'old' => collect($before)->only($changedKeys)->all(),
            ],
        };

        $this->log($actor, $target, $event, $changes, $target instanceof Role ? 'role_access' : 'user_access');
    }

    public function recordPasswordChange(User $actor, User $target): void
    {
        $this->log($actor, $target, ActivityEvents::UPDATED, [
            'attributes' => ['password' => '(új jelszó)'],
            'old' => ['password' => '(régi jelszó)'],
        ], 'password_changed');
    }

    /**
     * @param  array<string, array<string, mixed>>  $changes
     */
    private function log(User $actor, Model $target, string $event, array $changes, string $description): void
    {
        activity()
            ->causedBy($actor)
            ->performedOn($target)
            ->event($event)
            ->withChanges($changes)
            ->log($description);
    }

    /**
     * An empty list and a missing value both mean "nothing assigned".
     */
    private function isSame(mixed $before, mixed $after): bool
    {
        return (empty($before) && empty($after)) || $before === $after;
    }

    /**
     * @param  iterable<int, Model>  $models
     * @return array<int, string>
     */
    private function sortedNames(iterable $models): array
    {
        return collect($models)->pluck('name')->sort()->values()->all();
    }
}
