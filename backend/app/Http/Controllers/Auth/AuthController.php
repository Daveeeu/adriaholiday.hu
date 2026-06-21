<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\AuthUserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->userCandidate();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $token = $user->createToken('admin-ui')->plainTextToken;

        return response()->json([
            'token' => $token,
            'tokenType' => 'Bearer',
            'user' => new AuthUserResource($user->loadMissing('roles', 'permissions')),
        ]);
    }

    public function me(Request $request): AuthUserResource
    {
        return new AuthUserResource($request->user()->loadMissing('roles', 'permissions'));
    }

    public function logout(Request $request): JsonResponse
    {
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            PersonalAccessToken::findToken($bearerToken)?->delete();
        }

        $request->user()?->currentAccessToken()?->delete();
        $request->user()?->tokens()->delete();
        Auth::forgetGuards();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }
}
