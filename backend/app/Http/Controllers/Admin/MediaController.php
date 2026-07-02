<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\AdminMediaItem;
use App\Support\MediaCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    public function __construct()
    {
        $this->middleware('permission:media.viewAny')->only('index');
        $this->middleware('permission:media.view')->only('show');
        $this->middleware('permission:media.create')->only('store');
        $this->middleware('permission:media.update')->only('update');
        $this->middleware('permission:media.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $perPage = max(1, min(50, (int) $request->query('perPage', $request->query('per_page', 24))));
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $sourceContext = trim((string) $request->query('sourceContext', $request->query('source_context', '')));
        $sort = (string) $request->query('sort', 'newest');

        $query = Media::query();

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%")
                    ->orWhere('alt', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($category !== '' && $category !== 'all') {
            $query->where('category', MediaCategory::normalized($category));
        }

        if ($sourceContext !== '') {
            $query->where('source_context', $sourceContext);
        }

        match ($sort) {
            'oldest' => $query->orderBy('id'),
            'name' => $query->orderBy('name')->orderByDesc('id'),
            default => $query->orderByDesc('id'),
        };

        $paginator = $query->paginate($perPage, ['*'], 'page', max(1, (int) $request->query('page', 1)));
        $items = $paginator->getCollection()
            ->values()
            ->map(fn (Media $media) => (new MediaResource($media))->resolve($request))
            ->all();

        return response()->json([
            'items' => $items,
            'totalCount' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
        ]);
    }

    public function show(Request $request, Media $media)
    {
        return response()->json((new MediaResource($media))->resolve($request));
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimetypes:'.implode(',', self::ALLOWED_MIME_TYPES),
            ],
            'category' => ['nullable', 'string', Rule::in(MediaCategory::values())],
            'sourceContext' => ['nullable', 'string', 'max:255'],
            'sourceId' => ['nullable', 'integer', 'min:1'],
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $item = AdminMediaItem::create();
        $file = $request->file('file');
        $media = $item->addMedia($file)
            ->usingName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
            ->usingFileName($file->getClientOriginalName())
            ->toMediaCollection('library');

        $media->forceFill([
            'category' => MediaCategory::normalized($request->input('category')),
            'source_context' => $request->input('sourceContext'),
            'source_id' => $request->input('sourceId'),
            'alt' => $request->input('alt'),
            'title' => $request->input('title'),
        ]);
        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => MediaCategory::normalized($request->input('category')),
            'source_context' => $request->input('sourceContext'),
            'source_id' => $request->input('sourceId'),
            'alt' => $request->input('alt'),
            'title' => $request->input('title'),
        ], static fn ($value) => $value !== null && $value !== '');
        $media->save();

        return response()->json((new MediaResource($media->fresh()))->resolve($request));
    }

    public function update(Request $request, Media $media)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string', Rule::in(MediaCategory::values())],
            'sourceContext' => ['nullable', 'string', 'max:255'],
            'sourceId' => ['nullable', 'integer', 'min:1'],
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $media->forceFill([
            'category' => MediaCategory::normalized($validated['category'] ?? $media->category ?? data_get($media->custom_properties, 'category')),
            'source_context' => $validated['sourceContext'] ?? $media->source_context ?? data_get($media->custom_properties, 'source_context'),
            'source_id' => $validated['sourceId'] ?? $media->source_id ?? data_get($media->custom_properties, 'source_id'),
            'alt' => array_key_exists('alt', $validated) ? $validated['alt'] : ($media->alt ?? data_get($media->custom_properties, 'alt')),
            'title' => array_key_exists('title', $validated) ? $validated['title'] : ($media->title ?? data_get($media->custom_properties, 'title')),
        ]);
        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => $media->category,
            'source_context' => $media->source_context,
            'source_id' => $media->source_id,
            'alt' => $media->alt,
            'title' => $media->title,
        ], static fn ($value) => $value !== null && $value !== '');
        $media->save();

        return response()->json((new MediaResource($media->fresh()))->resolve($request));
    }

    public function destroy(Media $media)
    {
        if ($media->model_type === AdminMediaItem::class && $media->model) {
            $media->model->delete();
        } else {
            $media->delete();
        }

        return response()->noContent();
    }
}
