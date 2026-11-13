<?php

namespace App\Services\User;

use App\Mail\AdminUserInvitationMail;
use App\Models\User;
use App\Services\ActivityLog\AccessActivityLogger;
use App\Services\Mail\LoggedMailer;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

/**
 * Lets staff create an admin user without choosing their password: the user
 * gets an email with a one-time link and sets the password themself.
 */
class UserInvitationService
{
    public const BROKER = 'invitations';

    public function __construct(
        private readonly LoggedMailer $mailer,
        private readonly AccessActivityLogger $accessLog,
    ) {}

    /**
     * Emails the user a fresh set-password link; any earlier link stops working.
     */
    public function send(User $user): bool
    {
        $token = $this->broker()->createToken($user);

        return $this->mailer->send(new AdminUserInvitationMail($user, $this->acceptUrl($user, $token)), $user->email);
    }

    /**
     * Sets the password of the invited user, signs out their other sessions
     * and spends the link.
     *
     * @throws ValidationException when the link is invalid or has expired
     */
    public function accept(string $email, string $token, string $password): void
    {
        $status = $this->broker()->reset(
            [
                'email' => $email,
                'token' => $token,
                'password' => $password,
            ],
            function (User $user, string $password): void {
                $user->forceFill(['password' => $password])->save();
                $user->tokens()->delete();
                $this->accessLog->recordPasswordChange($user, $user);
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => 'A link érvénytelen vagy lejárt. Kérj új meghívót az adminisztrátortól.',
            ]);
        }
    }

    private function acceptUrl(User $user, string $token): string
    {
        return rtrim((string) config('app.url'), '/').'/admin/jelszo-beallitas?'.http_build_query([
            'token' => $token,
            'email' => $user->email,
        ]);
    }

    private function broker(): PasswordBroker
    {
        /** @var PasswordBroker */
        return Password::broker(self::BROKER);
    }
}
