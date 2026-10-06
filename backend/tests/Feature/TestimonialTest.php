<?php

namespace Tests\Feature;

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TestimonialTest extends TestCase
{
    use RefreshDatabase;

    private const ALL_PERMISSIONS = ['testimonials.viewAny', 'testimonials.view', 'testimonials.create', 'testimonials.update', 'testimonials.delete'];

    private const LETTER = '<p>Bosznia 2026.05.07.-10.<br />Kedves Bettina!</p>'
        .'<p>Felejthetetlen csodás napokat töltöttünk el az Önök jóvoltából, amiért nagyon hálásak vagyunk. Mind a programok, a szervezés, a szállások, az étkezés kitűnő volt.</p>'
        .'<p>B Istvánné</p>';

    public function test_admin_without_permission_cannot_manage_testimonials(): void
    {
        $this->actingAsAdmin(['testimonials.viewAny']);

        $this->getJson('/api/admin/testimonials')->assertOk();
        $this->postJson('/api/admin/testimonials', $this->payload())->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_a_testimonial_with_sanitized_body(): void
    {
        $this->actingAsAdmin(self::ALL_PERMISSIONS);

        $id = $this->postJson('/api/admin/testimonials', [
            ...$this->payload(),
            'body' => self::LETTER.'<script>alert(1)</script>',
        ])->assertCreated()
            ->assertJsonPath('data.author', 'B Istvánné')
            ->json('data.id');

        $this->assertStringNotContainsString('<script', Testimonial::query()->findOrFail($id)->body);

        $this->patchJson("/api/admin/testimonials/{$id}", [...$this->payload(), 'active' => false])
            ->assertOk()
            ->assertJsonPath('data.active', false);

        $this->deleteJson("/api/admin/testimonials/{$id}")->assertNoContent();
        $this->assertSame(0, Testimonial::query()->count());
    }

    public function test_public_list_shows_published_letters_newest_first_with_an_excerpt(): void
    {
        Testimonial::factory()->create(['title' => 'Régi', 'published_at' => '2019-06-01']);
        Testimonial::factory()->create(['title' => 'Friss', 'body' => self::LETTER, 'author' => 'B Istvánné', 'published_at' => '2026-05-11']);
        Testimonial::factory()->create(['title' => 'Rejtett', 'active' => false]);
        Testimonial::factory()->create(['title' => 'Időzített', 'published_at' => now()->addWeek()]);

        $response = $this->getJson('/api/portfolio/testimonials?perPage=10')->assertOk();

        $this->assertSame(['Friss', 'Régi'], array_column($response->json('items'), 'title'));
        $this->assertSame(2, $response->json('totalCount'));
        $this->assertStringStartsWith('Felejthetetlen csodás napokat', $response->json('items.0.excerpt'));
        $this->assertStringNotContainsString('B Istvánné', $response->json('items.0.excerpt'));
    }

    public function test_legacy_letters_are_imported_once_with_their_signature_and_a_sensible_date(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'testimonials');
        file_put_contents($path, json_encode([
            ['id' => 101, 'title' => 'Bosznia 2026.05.7-10.', 'createdAt' => '2026-05-11 12:35:23', 'content' => self::LETTER],
            ['id' => 96, 'title' => 'JÉGKATEDRÁLIS A TÁTRÁBAN 2023.01.28.', 'createdAt' => '2030-01-31 12:28:07', 'content' => '<p>Nagyon jó volt minden, köszönjük.</p>'],
        ]));

        $this->artisan('adria:import-legacy-testimonials', ['path' => $path])->assertSuccessful();
        $this->artisan('adria:import-legacy-testimonials', ['path' => $path])->assertSuccessful();
        unlink($path);

        $this->assertSame(2, Testimonial::query()->count());
        $this->assertSame('B Istvánné', Testimonial::query()->where('legacy_id', 101)->value('author'));
        $legacyWithFutureDate = Testimonial::query()->where('legacy_id', 96)->firstOrFail();
        $this->assertNull($legacyWithFutureDate->author);
        $this->assertSame('2023-01-28', $legacyWithFutureDate->published_at->toDateString());
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'title' => 'Bosznia 2026.05.7-10.',
            'author' => 'B Istvánné',
            'body' => self::LETTER,
            'publishedAt' => '2026-05-11',
            'active' => true,
        ];
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsAdmin(array $permissions): void
    {
        foreach (self::ALL_PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Testimonial Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
