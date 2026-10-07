<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StoreContactMessageRequest;
use App\Mail\NewContactMessageOfficeNotification;
use App\Models\ContactMessage;
use App\Services\Mail\LoggedMailer;
use Illuminate\Http\JsonResponse;

class PublicContactMessageController extends Controller
{
    /**
     * Stores a message sent from the contact page (listed in the admin under
     * "Üzenetek") and notifies the office when an address is configured.
     */
    public function store(StoreContactMessageRequest $request, LoggedMailer $mailer): JsonResponse
    {
        $message = ContactMessage::query()->create([
            ...$request->safe()->only(['name', 'email', 'phone', 'message']),
            'status' => 'new',
        ]);

        if ($officeAddress = config('mail.office_notifications_address')) {
            $mailer->send(new NewContactMessageOfficeNotification($message), $officeAddress);
        }

        return response()->json(['id' => $message->id], 201);
    }
}
