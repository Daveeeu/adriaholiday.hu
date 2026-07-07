<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:permissions.viewAny');
    }

    public function index()
    {
        $permissions = Permission::query()->where('guard_name', 'web')->orderBy('name')->get();

        return PermissionResource::collection($permissions);
    }
}
