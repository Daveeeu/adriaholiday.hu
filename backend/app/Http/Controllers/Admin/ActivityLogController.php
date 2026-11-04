<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ActivityLog\ActivityLogIndexRequest;
use App\Http\Resources\ActivityLogResource;
use App\Services\ActivityLog\ActivityLogQuery;
use Illuminate\Http\JsonResponse;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    use RespondsWithPagination;

    public function index(ActivityLogIndexRequest $request, ActivityLogQuery $activityLog): JsonResponse
    {
        return $this->paginated(ActivityLogResource::class, $activityLog->paginate($request->validated()));
    }

    public function filters(ActivityLogQuery $activityLog): JsonResponse
    {
        $this->authorize('viewAny', Activity::class);

        return response()->json(['data' => $activityLog->filterOptions()]);
    }
}
