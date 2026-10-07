<?php

namespace Tests\Feature;

use App\Mail\NewContactMessageOfficeNotification;
use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PublicContactMessageTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Teszt Elek',
            'email' => 'teszt@example.com',
            'phone' => '+36301112233',
            'message' => 'Érdeklődnék a tavaszi körutazásokról.',
            'privacyAccepted' => true,
        ], $overrides);
    }

    public function test_a_message_is_stored_as_new_and_the_office_is_notified(): void
    {
        Mail::fake();
        config(['mail.office_notifications_address' => 'iroda@example.com']);

        $this->postJson('/api/contact-messages', $this->payload())->assertCreated();

        $message = ContactMessage::query()->sole();
        $this->assertSame('new', $message->status);
        $this->assertSame('Teszt Elek', $message->name);
        Mail::assertSent(NewContactMessageOfficeNotification::class, fn ($mail) => $mail->hasTo('iroda@example.com') && $mail->hasReplyTo('teszt@example.com'));
    }

    public function test_it_requires_contact_details_a_message_and_the_privacy_consent(): void
    {
        $this->postJson('/api/contact-messages', $this->payload(['name' => '', 'email' => 'nem-email', 'message' => '', 'privacyAccepted' => false]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message', 'privacy_accepted']);

        $this->assertSame(0, ContactMessage::query()->count());
    }

    public function test_bots_filling_the_honeypot_are_rejected(): void
    {
        $this->postJson('/api/contact-messages', $this->payload(['website' => 'http://spam.example']))->assertStatus(422);

        $this->assertSame(0, ContactMessage::query()->count());
    }
}
