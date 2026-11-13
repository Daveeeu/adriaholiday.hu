<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AcceptInvitationRequest;
use App\Services\User\UserInvitationService;
use Illuminate\Http\JsonResponse;

class InvitationController extends Controller
{
    public function accept(AcceptInvitationRequest $request, UserInvitationService $invitations): JsonResponse
    {
        $validated = $request->validated();

        $invitations->accept($validated['email'], $validated['token'], $validated['password']);

        return response()->json([
            'message' => 'A jelszavad elmentve, most már beléphetsz.',
        ]);
    }
}
