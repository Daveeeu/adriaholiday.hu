<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PortfolioContent\PublishPortfolioContentBlockRequest;
use App\Http\Requests\Admin\PortfolioContent\UploadPortfolioContentBlockMediaRequest;
use App\Http\Requests\Admin\PortfolioContent\UpdatePortfolioContentBlockRequest;
use App\Http\Resources\PortfolioContentBlockResource;
use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use App\Support\RichTextSanitizer;
use App\Support\MediaCategory;
use Illuminate\Http\Request;

class PortfolioContentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:portfolio-content.view')->only(['index']);
        $this->middleware('permission:portfolio-content.update')->only(['update', 'uploadMedia', 'deleteMedia']);
        $this->middleware('permission:portfolio-content.publish')->only(['publish', 'publishAll']);
    }

    public function index(Request $request)
    {
        $page = (string) $request->query('page', 'home');

        $blocks = PortfolioContentBlock::query()
            ->with('media')
            ->forPage($page)
            ->get()
            ->mapWithKeys(fn (PortfolioContentBlock $block) => [
                $block->key => (new PortfolioContentBlockResource($block))->resolve($request),
            ]);

        return response()->json($blocks);
    }

    public function update(UpdatePortfolioContentBlockRequest $request, string $key)
    {
        $block = PortfolioContentBlock::query()->where('key', $key)->firstOrFail();
        $validated = $request->validated();
        $draftValue = $validated['draft_value'] ?? null;

        $block->fill([
            'draft_value' => $block->type === 'richtext' ? RichTextSanitizer::sanitize($draftValue) : $draftValue,
            'draft_value_json' => $validated['draft_value_json'] ?? null,
            'updated_by' => $request->user()?->id,
        ]);
        $block->save();

        return new PortfolioContentBlockResource($block->refresh());
    }

    public function uploadMedia(UploadPortfolioContentBlockMediaRequest $request, string $key)
    {
        $block = PortfolioContentBlock::query()->where('key', $key)->firstOrFail();
        $collectionName = $block->draftMediaCollectionName();

        if ($collectionName === null) {
            abort(422, 'Ez a blokk nem médiatípus.');
        }

        $block->clearMediaCollection($collectionName);

        $file = $request->file('file');
        $media = $block->addMedia($file)
            ->usingName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
            ->usingFileName($file->getClientOriginalName())
            ->toMediaCollection($collectionName);

        $media->forceFill([
            'category' => MediaCategory::normalized($request->input('category', MediaCategory::PORTFOLIO->value)),
            'source_context' => $request->input('sourceContext', 'portfolio_content'),
            'source_id' => $request->input('sourceId', $block->id),
            'alt' => $request->input('alt'),
            'title' => $request->input('title'),
        ]);
        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => MediaCategory::normalized($request->input('category', MediaCategory::PORTFOLIO->value)),
            'source_context' => $request->input('sourceContext', 'portfolio_content'),
            'source_id' => $request->input('sourceId', $block->id),
            'alt' => $request->input('alt'),
            'title' => $request->input('title'),
        ], static fn ($value) => $value !== null && $value !== '');
        $media->save();

        $block->updateDraftMediaMetadata([
            'alt' => $request->input('alt'),
            'title' => $request->input('title'),
        ]);

        return new PortfolioContentBlockResource($block->refresh()->load('media'));
    }

    public function deleteMedia(Request $request, string $key)
    {
        $block = PortfolioContentBlock::query()->where('key', $key)->firstOrFail();
        $collectionName = $block->draftMediaCollectionName();

        if ($collectionName === null) {
            abort(422, 'Ez a blokk nem médiatípus.');
        }

        $block->clearDraftMedia();

        return new PortfolioContentBlockResource($block->refresh()->load('media'));
    }

    public function publish(Request $request, string $key)
    {
        $block = PortfolioContentBlock::query()->where('key', $key)->firstOrFail();

        $block->forceFill([
            'value' => $block->type === 'richtext'
                ? RichTextSanitizer::sanitize($block->draft_value ?? $block->value)
                : $block->draft_value ?? $block->value,
            'value_json' => $block->draft_value_json ?? $block->value_json,
            'draft_value' => null,
            'draft_value_json' => null,
            'is_published' => true,
            'updated_by' => $request->user()?->id,
        ])->save();

        $block->publishDraftMedia();

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);

        return new PortfolioContentBlockResource($block->refresh());
    }

    public function publishAll(PublishPortfolioContentBlockRequest $request)
    {
        $page = (string) $request->validated()['page'];

        $blocks = PortfolioContentBlock::query()->forPage($page)->get();

        foreach ($blocks as $block) {
            $block->forceFill([
                'value' => $block->type === 'richtext'
                    ? RichTextSanitizer::sanitize($block->draft_value ?? $block->value)
                    : $block->draft_value ?? $block->value,
                'value_json' => $block->draft_value_json ?? $block->value_json,
                'draft_value' => null,
                'draft_value_json' => null,
                'is_published' => true,
                'updated_by' => $request->user()?->id,
            ])->save();

            $block->publishDraftMedia();
        }

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);

        return response()->json([
            'page' => $page,
            'publishedCount' => $blocks->count(),
        ]);
    }
}
