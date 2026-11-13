<?php

namespace Tests\Feature;

use App\Mail\AdminUserInvitationMail;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminUserInvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolePermissionSeeder::class);
        Mail::fake();
    }

    private function userWithRole(string $role, string $email): User
    {
        $user = User::query()->create([
            'name' => $role.' User',
            'email' => $email,
            'password' => 'password',
            'is_active' => true,
        ]);

        $user->assignRole($role);

        return $user;
    }

    private function inviteNewUser(): User
    {
        Sanctum::actingAs($this->userWithRole('Super Admin', 'super@example.test'));

        $this->postJson('/api/admin/users', [
            'name' => 'Meghívott',
            'email' => 'invited@example.test',
            'roles' => ['Viewer'],
        ])
            ->assertCreated()
            ->assertJsonPath('meta.invitationSent', true);

        return User::query()->where('email', 'invited@example.test')->firstOrFail();
    }

    private function sentAcceptUrl(): string
    {
        $url = null;

        Mail::assertSent(AdminUserInvitationMail::class, function (AdminUserInvitationMail $mail) use (&$url): bool {
            $url = $mail->acceptUrl;

            return true;
        });

        return $url;
    }

    /**
     * @return array{token: string, email: string}
     */
    private function linkParameters(string $url): array
    {
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        return ['token' => $query['token'], 'email' => $query['email']];
    }

    public function test_creating_a_user_without_password_sends_an_invitation(): void
    {
        $user = $this->inviteNewUser();

        Mail::assertSent(AdminUserInvitationMail::class, fn (AdminUserInvitationMail $mail): bool => $mail->hasTo('invited@example.test')
            && str_starts_with($mail->acceptUrl, rtrim((string) config('app.url'), '/').'/admin/jelszo-beallitas?'));
        $this->assertTrue($user->hasRole('Viewer'));
        $this->assertDatabaseHas('email_logs', ['to' => 'invited@example.test', 'status' => 'sent']);

        $html = (new AdminUserInvitationMail($user, 'https://example.test/accept'))->render();
        $this->assertStringContainsString('https://example.test/accept', $html);
        $this->assertStringContainsString('7 napig', $html);
    }

    public function test_creating_a_user_with_password_sends_no_invitation(): void
    {
        Sanctum::actingAs($this->userWithRole('Super Admin', 'super@example.test'));

        $this->postJson('/api/admin/users', [
            'name' => 'Jelszavas',
            'email' => 'with-password@example.test',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ])
            ->assertCreated()
            ->assertJsonPath('meta.invitationSent', false);

        Mail::assertNothingSent();
    }

    public function test_invited_user_sets_password_once_and_can_log_in(): void
    {
        $this->inviteNewUser();
        $link = $this->linkParameters($this->sentAcceptUrl());
        $this->app['auth']->forgetGuards();

        $this->postJson('/api/auth/invitation/accept', [
            ...$link,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('brand-new-password', User::query()->where('email', 'invited@example.test')->value('password')));
        $this->postJson('/api/auth/login', ['email' => 'invited@example.test', 'password' => 'brand-new-password'])->assertOk();

        $this->postJson('/api/auth/invitation/accept', [
            ...$link,
            'password' => 'another-password',
            'password_confirmation' => 'another-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');
    }

    public function test_invitation_link_expires(): void
    {
        $this->inviteNewUser();
        $link = $this->linkParameters($this->sentAcceptUrl());

        $this->travel(8)->days();

        $this->postJson('/api/auth/invitation/accept', [
            ...$link,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');
    }

    public function test_resending_replaces_the_previous_link(): void
    {
        $user = $this->inviteNewUser();
        $firstLink = $this->linkParameters($this->sentAcceptUrl());

        $this->postJson("/api/admin/users/{$user->id}/invitation")->assertOk();
        Mail::assertSent(AdminUserInvitationMail::class, 2);

        $this->app['auth']->forgetGuards();
        $this->postJson('/api/auth/invitation/accept', [
            ...$firstLink,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');
    }

    public function test_only_user_managers_can_send_invitations(): void
    {
        $target = $this->userWithRole('Viewer', 'target@example.test');
        Sanctum::actingAs($this->userWithRole('Content Editor', 'editor@example.test'));

        $this->postJson("/api/admin/users/{$target->id}/invitation")->assertForbidden();
        Mail::assertNothingSent();
    }

    public function test_accepting_with_a_wrong_token_is_rejected(): void
    {
        $user = $this->userWithRole('Viewer', 'target@example.test');

        $this->postJson('/api/auth/invitation/accept', [
            'email' => $user->email,
            'token' => 'not-a-real-token',
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('token');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
}
