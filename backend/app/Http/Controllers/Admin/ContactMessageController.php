<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Booking\StoreContactMessageRequest;
use App\Http\Requests\Admin\Booking\UpdateContactMessageRequest;
use App\Http\Requests\Admin\Booking\UpdateContactMessageStatusRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContactMessageController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(ContactMessage::class, 'contactMessage');
        $this->middleware('permission:messages.viewAny')->only('index');
        $this->middleware('permission:messages.view')->only('show');
        $this->middleware('permission:messages.create')->only('store');
        $this->middleware('permission:messages.update')->only('update');
        $this->middleware('permission:messages.delete')->only('destroy');
        $this->middleware('permission:messages.status')->only('status');
    }

    public function index(Request $request)
    {
        $query = ContactMessage::query();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        if (($status = $request->query('status')) !== null) {
            $query->where('status', $status);
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'created_at')));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'desc'));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $allowedSorts = ['id', 'name', 'email', 'phone', 'status', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc')
            ->paginate($perPage);

        return $this->paginated(ContactMessageResource::class, $paginator);
    }

    public function store(StoreContactMessageRequest $request)
    {
        $message = ContactMessage::create($request->validated());

        return new ContactMessageResource($message);
    }

    public function show(ContactMessage $contactMessage)
    {
        return new ContactMessageResource($contactMessage);
    }

    public function update(UpdateContactMessageRequest $request, ContactMessage $contactMessage)
    {
        $contactMessage->update($request->validated());

        return new ContactMessageResource($contactMessage->refresh());
    }

    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return response()->noContent();
    }

    public function status(UpdateContactMessageStatusRequest $request, ContactMessage $contactMessage)
    {
        $this->authorize('status', $contactMessage);

        $contactMessage->update([
            'status' => $request->validated()['status'],
        ]);

        return new ContactMessageResource($contactMessage->refresh());
    }
}
