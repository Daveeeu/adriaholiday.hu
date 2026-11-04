<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use App\Http\Requests\Admin\User\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLog\AccessActivityLogger;
use App\Support\ActivityLog\ActivityEvents;
use App\Support\UserAccessGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
        $this->middleware('permission:users.viewAny')->only('index');
        $this->middleware('permission:users.view')->only('show');
        $this->middleware('permission:users.create')->only('store');
        $this->middleware('permission:users.update')->only(['update', 'status']);
        $this->middleware('permission:users.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = User::query()->with(['roles', 'deniedPermissions']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->whereHas('roles', fn ($builder) => $builder->where('name', $role));
        }

        if (($isActive = $request->query('is_active', $request->query('isActive'))) !== null && $isActive !== '' && $isActive !== 'all') {
            $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true);
        }

        $sortBy = (string) $request->query('sort_by', $request->query('sortBy', 'name'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));

        $allowedSorts = ['id', 'name', 'email', 'is_active', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'name';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(UserResource::class, $paginator);
    }

    public function store(StoreUserRequest $request, AccessActivityLogger $accessLog)
    {
        $validated = $request->validated();
        $actor = $request->user();

        $user = DB::transaction(function () use ($validated, $actor, $accessLog): User {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            UserAccessGuard::syncRoles($actor, $user, $validated['roles'] ?? []);
            UserAccessGuard::syncPermissions($actor, $user, $validated['permissions'] ?? []);
            $this->syncDeniedPermissions($user, $validated['denied_permissions'] ?? []);
            $accessLog->recordChanges($actor, $user, ActivityEvents::UPDATED, [], $accessLog->snapshot($user));

            return $user;
        });

        return new UserResource($user->load('roles', 'deniedPermissions'));
    }

    public function show(User $user)
    {
        return new UserResource($user->load('roles', 'deniedPermissions'));
    }

    public function update(UpdateUserRequest $request, User $user, AccessActivityLogger $accessLog)
    {
        $validated = $request->validated();
        $actor = $request->user();

        DB::transaction(function () use ($validated, $user, $actor, $accessLog): void {
            $accessBefore = $accessLog->snapshot($user);

            $user->fill([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'is_active' => $validated['is_active'] ?? $user->is_active,
            ]);

            $passwordChanged = ! empty($validated['password']);

            if ($passwordChanged) {
                $user->password = $validated['password'];
            }

            $user->save();

            if ($passwordChanged) {
                $accessLog->recordPasswordChange($actor, $user);
            }

            UserAccessGuard::syncRoles($actor, $user, $validated['roles'] ?? []);
            UserAccessGuard::syncPermissions($actor, $user, $validated['permissions'] ?? []);
            $this->syncDeniedPermissions($user, $validated['denied_permissions'] ?? []);
            $accessLog->recordChanges($actor, $user, ActivityEvents::UPDATED, $accessBefore, $accessLog->snapshot($user));
        });

        return new UserResource($user->refresh()->load('roles', 'deniedPermissions'));
    }

    public function destroy(Request $request, User $user)
    {
        $actor = $request->user();

        UserAccessGuard::guardDeactivation($actor, $user);

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->noContent();
    }

    public function status(UpdateUserStatusRequest $request, User $user)
    {
        $validated = $request->validated();
        $actor = $request->user();

        if (! $validated['is_active']) {
            UserAccessGuard::guardDeactivation($actor, $user);
        }

        $user->update(['is_active' => $validated['is_active']]);

        if (! $validated['is_active']) {
            $user->tokens()->delete();
        }

        return new UserResource($user->refresh()->load('roles', 'deniedPermissions'));
    }

    /**
     * @param  array<int, string>  $permissionNames
     */
    private function syncDeniedPermissions(User $user, array $permissionNames): void
    {
        $permissionIds = Permission::query()
            ->whereIn('name', $permissionNames)
            ->where('guard_name', 'web')
            ->pluck('id');

        $user->deniedPermissions()->sync($permissionIds);
    }
}
