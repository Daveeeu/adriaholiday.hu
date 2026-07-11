<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Role\StoreRoleRequest;
use App\Http\Requests\Admin\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Support\UserAccessGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Role::class, 'role');
        $this->middleware('permission:roles.viewAny')->only('index');
        $this->middleware('permission:roles.view')->only('show');
        $this->middleware('permission:roles.create')->only('store');
        $this->middleware('permission:roles.update')->only('update');
        $this->middleware('permission:roles.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Role::query()->with('permissions')->withCount('users');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));

        $paginator = $query->orderBy('name')->paginate($perPage);

        return $this->paginated(RoleResource::class, $paginator);
    }

    public function store(StoreRoleRequest $request)
    {
        $validated = $request->validated();
        $actor = $request->user();

        $role = DB::transaction(function () use ($validated, $actor): Role {
            $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
            UserAccessGuard::syncPermissions($actor, $role, $validated['permissions'] ?? []);

            return $role;
        });

        activity()->causedBy($actor)->performedOn($role)->log('role_created');

        return new RoleResource($role->load('permissions')->loadCount('users'));
    }

    public function show(Role $role)
    {
        return new RoleResource($role->load('permissions')->loadCount('users'));
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $validated = $request->validated();
        $actor = $request->user();

        DB::transaction(function () use ($validated, $role, $actor): void {
            $role->update(['name' => $validated['name']]);
            UserAccessGuard::syncPermissions($actor, $role, $validated['permissions'] ?? []);
        });

        activity()->causedBy($actor)->performedOn($role)->log('role_updated');

        return new RoleResource($role->refresh()->load('permissions')->loadCount('users'));
    }

    public function destroy(Request $request, Role $role)
    {
        UserAccessGuard::guardRoleDeletion($role);

        $roleName = $role->name;
        $role->delete();

        activity()->causedBy($request->user())->log("role_deleted: {$roleName}");

        return response()->noContent();
    }
}
