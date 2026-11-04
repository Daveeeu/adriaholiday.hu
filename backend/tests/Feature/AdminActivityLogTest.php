<?php

namespace Tests\Feature;

use App\Models\SeoRedirect;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminActivityLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolePermissionSeeder::class);
    }

    /**
     * @param  array<int, string>  $roles
     */
    private function userWithRoles(array $roles, string $password = 'password', bool $isActive = true): User
    {
        $user = User::query()->create([
            'name' => implode(' ', $roles).' User',
            'email' => Str::slug(implode('-', $roles)).'-'.Str::random(6).'@example.test',
            'password' => Hash::make($password),
            'is_active' => $isActive,
        ]);

        $user->assignRole($roles);

        return $user;
    }

    public function test_only_super_admins_can_read_the_activity_log(): void
    {
        $this->getJson('/api/admin/activity-log')->assertUnauthorized();

        foreach (['Admin', 'Viewer', 'Sales', 'Marketing'] as $role) {
            Sanctum::actingAs($this->userWithRoles([$role]));

            $this->getJson('/api/admin/activity-log')->assertForbidden();
            $this->getJson('/api/admin/activity-log/filters')->assertForbidden();
        }

        Sanctum::actingAs($this->userWithRoles(['Super Admin', 'Admin']));

        $this->getJson('/api/admin/activity-log')
            ->assertOk()
            ->assertJsonStructure(['items', 'totalCount', 'page', 'perPage']);
        $this->getJson('/api/admin/activity-log/filters')
            ->assertOk()
            ->assertJsonStructure(['data' => ['users' => [['id', 'name', 'email', 'isActive']], 'subjectTypes' => [['key', 'label']], 'events']]);
    }

    public function test_the_permission_is_granted_to_super_admin_only(): void
    {
        $this->assertTrue(Role::findByName('Super Admin', 'web')->hasPermissionTo('activity.viewAny'));

        foreach (['Admin', 'Viewer', 'Sales', 'Marketing', 'Content Editor', 'Operator'] as $role) {
            $this->assertFalse(Role::findByName($role, 'web')->hasPermissionTo('activity.viewAny'), "{$role} must not see the activity log.");
        }
    }

    public function test_successful_login_and_logout_are_logged_with_ip_and_browser(): void
    {
        $user = $this->userWithRoles(['Admin'], 'secret-password');

        $token = $this->withHeader('User-Agent', 'Mozilla/5.0 Test')
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret-password'])
            ->assertOk()
            ->json('token');

        $user->refresh();
        $this->assertNotNull($user->last_login_at);
        $this->assertSame('127.0.0.1', $user->last_login_ip);

        $login = Activity::query()->where('event', 'login')->sole();
        $this->assertSame('auth', $login->log_name);
        $this->assertSame($user->id, (int) $login->causer_id);
        $this->assertSame($user->id, (int) $login->subject_id);
        $this->assertSame('127.0.0.1', $login->properties->get('ip'));
        $this->assertSame('Mozilla/5.0 Test', $login->properties->get('user_agent'));
        $this->assertSame(0, Activity::query()->where('event', 'updated')->where('subject_type', User::class)->count(), 'Recording the sign-in must not log a user edit.');

        $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/auth/logout')->assertOk();

        $logout = Activity::query()->where('event', 'logout')->sole();
        $this->assertSame($user->id, (int) $logout->causer_id);
    }

    public function test_failed_logins_are_logged_without_the_password(): void
    {
        $user = $this->userWithRoles(['Admin'], 'secret-password');
        $inactive = $this->userWithRoles(['Viewer'], 'secret-password', isActive: false);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong-password'])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => 'nobody@example.test', 'password' => 'wrong-password'])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => $inactive->email, 'password' => 'secret-password'])->assertUnprocessable();

        $failures = Activity::query()->where('event', 'login_failed')->orderBy('id')->get();

        $this->assertCount(3, $failures);
        $this->assertNull($failures[0]->causer_id);
        $this->assertSame($user->id, (int) $failures[0]->subject_id);
        $this->assertSame('invalid_credentials', $failures[0]->properties->get('reason'));
        $this->assertNull($failures[1]->subject_id);
        $this->assertSame('nobody@example.test', $failures[1]->properties->get('email'));
        $this->assertSame('inactive', $failures[2]->properties->get('reason'));
        $this->assertNull($user->refresh()->last_login_at);

        $this->assertStringNotContainsString('password', Activity::query()->pluck('properties')->toJson());
    }

    public function test_an_admin_edit_is_logged_with_its_author_and_old_and_new_values(): void
    {
        $editor = $this->userWithRoles(['Marketing']);
        $redirect = SeoRedirect::factory()->create(['target' => '/regi-cel']);

        Sanctum::actingAs($editor);
        $this->patchJson("/api/admin/seo-redirects/{$redirect->id}", ['sourcePath' => $redirect->source_path, 'target' => '/uj-cel'])->assertOk();

        Sanctum::actingAs($this->userWithRoles(['Super Admin']));

        $response = $this->getJson('/api/admin/activity-log?subjectType=seo_redirect&event=updated')->assertOk();

        $response->assertJsonPath('totalCount', 1)
            ->assertJsonPath('items.0.causer.id', (string) $editor->id)
            ->assertJsonPath('items.0.subject.type', 'seo_redirect')
            ->assertJsonPath('items.0.subject.typeLabel', 'Átirányítás')
            ->assertJsonPath('items.0.subject.exists', true);

        $changes = collect($response->json('items.0.changes'))->keyBy('field');
        $this->assertSame(['field' => 'target', 'old' => '/regi-cel', 'new' => '/uj-cel'], $changes->get('target'));
        $this->assertFalse($changes->has('updated_at'));
    }

    public function test_user_password_and_role_changes_are_logged_without_the_hash(): void
    {
        $superAdmin = $this->userWithRoles(['Super Admin']);
        $target = $this->userWithRoles(['Viewer']);

        Sanctum::actingAs($superAdmin);
        $this->putJson("/api/admin/users/{$target->id}", [
            'name' => 'Renamed User',
            'email' => $target->email,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
            'roles' => ['Sales'],
        ])->assertOk();

        $logged = Activity::query()->where('subject_type', User::class)->where('subject_id', $target->id)->get();

        $this->assertStringNotContainsString($target->refresh()->password, $logged->pluck('attribute_changes')->toJson());
        $this->assertTrue($logged->contains(fn (Activity $activity): bool => $activity->description === 'password_changed'));

        $access = $logged->firstWhere('description', 'user_access');
        $this->assertSame(['Sales'], $access->attribute_changes['attributes']['roles']);
        $this->assertSame(['Viewer'], $access->attribute_changes['old']['roles']);

        $rename = $logged->first(fn (Activity $activity): bool => $activity->event === 'updated' && isset($activity->attribute_changes['attributes']['name']));
        $this->assertSame('Renamed User', $rename->attribute_changes['attributes']['name']);
        $this->assertSame($superAdmin->id, (int) $rename->causer_id);
    }

    public function test_role_lifecycle_is_logged(): void
    {
        Sanctum::actingAs($this->userWithRoles(['Super Admin']));

        $roleId = $this->postJson('/api/admin/roles', ['name' => 'Iroda', 'permissions' => ['tours.viewAny']])->assertCreated()->json('data.id');
        $this->deleteJson("/api/admin/roles/{$roleId}")->assertNoContent();

        $events = Activity::query()->where('subject_type', Role::class)->where('subject_id', $roleId)->orderBy('id')->get();

        $this->assertSame(['created', 'deleted'], $events->pluck('event')->all());
        $this->assertSame(['tours.viewAny'], $events[0]->attribute_changes['attributes']['permissions']);
        $this->assertSame('Iroda', $events[1]->attribute_changes['old']['name']);
    }

    public function test_filters_narrow_the_log_by_user_event_and_date(): void
    {
        $office = $this->userWithRoles(['Admin'], 'secret-password');
        $other = $this->userWithRoles(['Sales'], 'secret-password');

        $this->postJson('/api/auth/login', ['email' => $office->email, 'password' => 'secret-password'])->assertOk();
        $this->postJson('/api/auth/login', ['email' => $office->email, 'password' => 'wrong-password'])->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => $other->email, 'password' => 'secret-password'])->assertOk();

        Activity::query()->where('causer_id', $other->id)->update(['created_at' => now()->subDays(10)]);

        Sanctum::actingAs($this->userWithRoles(['Super Admin']));

        $this->getJson("/api/admin/activity-log?userId={$office->id}")
            ->assertOk()
            ->assertJsonPath('totalCount', 2);

        $this->getJson("/api/admin/activity-log?userId={$office->id}&event=login_failed")
            ->assertOk()
            ->assertJsonPath('totalCount', 1)
            ->assertJsonPath('items.0.context.reason', 'invalid_credentials')
            ->assertJsonPath('items.0.causer', null);

        $today = now('Europe/Budapest')->toDateString();
        $this->getJson("/api/admin/activity-log?event=login&dateFrom={$today}&dateTo={$today}")
            ->assertOk()
            ->assertJsonPath('totalCount', 1)
            ->assertJsonPath('items.0.causer.id', (string) $office->id);

        $this->getJson('/api/admin/activity-log?perPage=1&event=login')
            ->assertOk()
            ->assertJsonPath('perPage', 1)
            ->assertJsonCount(1, 'items')
            ->assertJsonPath('totalCount', 2);
    }

    public function test_filters_are_validated(): void
    {
        Sanctum::actingAs($this->userWithRoles(['Super Admin']));

        $this->getJson('/api/admin/activity-log?subjectId=5')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['subjectType']);

        $this->getJson('/api/admin/activity-log?subjectType=users;drop&event=hack&perPage=500&dateFrom=2026-11-05&dateTo=2026-11-01&userId=999999')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['subjectType', 'event', 'perPage', 'dateTo', 'userId']);
    }
}
