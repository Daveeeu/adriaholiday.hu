<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StorePublicNewsletterSubscriptionRequest;
use App\Services\Newsletter\NewsletterSubscriptionService;
use Illuminate\Http\JsonResponse;

class PublicNewsletterController extends Controller
{
    public function store(
        StorePublicNewsletterSubscriptionRequest $request,
        NewsletterSubscriptionService $subscriptionService,
    ): JsonResponse {
        $subscribed = $subscriptionService->subscribe($request->validated()['email']);

        return response()->json([
            'status' => $subscribed ? 'subscribed' : 'already_subscribed',
        ], 201);
    }
}
