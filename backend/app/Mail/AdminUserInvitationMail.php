<?php

namespace App\Mail;

use App\Models\User;
use App\Services\User\UserInvitationService;
use App\Support\Mail\EmailCompany;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminUserInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly string $acceptUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Meghívó az Adria Holiday admin felületére',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.users.invitation',
            with: [
                'user' => $this->user,
                'acceptUrl' => $this->acceptUrl,
                'validDays' => intdiv((int) config('auth.passwords.'.UserInvitationService::BROKER.'.expire'), 60 * 24),
                'company' => EmailCompany::resolve(),
            ],
        );
    }
}
