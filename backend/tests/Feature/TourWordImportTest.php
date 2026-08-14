<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use PhpOffice\PhpWord\PhpWord;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TourWordImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAsAdmin();
    }

    public function test_parsing_a_docx_extracts_name_dates_price_and_program_days(): void
    {
        $file = $this->buildSampleDocx();

        $response = $this->postJson('/api/admin/tours/import/word/parse', [
            'files' => [$file],
        ]);

        $response->assertOk();
        $response->assertJsonPath('results.0.success', true);
        $response->assertJsonPath('results.0.data.name', 'Firenze és a mesés Cinque Terre');
        $response->assertJsonPath('results.0.data.price', 149800);
        $response->assertJsonCount(2, 'results.0.data.dates');
        $response->assertJsonPath('results.0.data.dates.0.startDate', '2026-06-11');
        $response->assertJsonCount(2, 'results.0.data.programDays');
        $response->assertJsonPath('results.0.data.programDays.0.dayNumber', 1);
        $response->assertJsonPath('results.0.data.warnings', []);
    }

    public function test_uploading_a_legacy_doc_file_is_rejected_with_a_clear_message(): void
    {
        $file = UploadedFile::fake()->create('program.doc', 10, 'application/msword');

        $response = $this->postJson('/api/admin/tours/import/word/parse', [
            'files' => [$file],
        ]);

        $response->assertOk();
        $response->assertJsonPath('results.0.success', false);
        $this->assertStringContainsString('.docx', $response->json('results.0.error'));
    }

    public function test_endpoint_requires_tours_create_permission(): void
    {
        $user = User::query()->create([
            'name' => 'No Permission User',
            'email' => 'no-permission@example.com',
            'password' => 'password',
        ]);
        Sanctum::actingAs($user);

        $file = $this->buildSampleDocx();

        $this->postJson('/api/admin/tours/import/word/parse', ['files' => [$file]])
            ->assertForbidden();
    }

    private function buildSampleDocx(): UploadedFile
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();

        $section->addText('3530 Miskolc, Városház tér 22., Tel/fax: 46/508-688, Eng.szám: U-000412');
        $section->addText('www.adriaholiday.hu    email: adriaholiday@adriaholiday.hu');
        $section->addText('');
        $section->addText('Firenze és a mesés Cinque Terre');
        $section->addText('');
        $section->addText('Időpont: 2026. 06. 11-14, 08.20-23');
        $section->addText('Utazás: autóbusz');
        $section->addText('');
        $section->addText('1.nap Indulás a hajnali órákban. Utazás rövid pihenőkkel Aquileia felé.');
        $section->addText('');
        $section->addText('2.nap Egész napos kirándulás a Cinque Terre Nemzeti Parkba.');
        $section->addText('');
        $section->addText('Részvételi díj: 149.800 Ft/fő, mely tartalmazza az utazást autóbusszal, 3 éj szállást és a reggelit. Nem tartalmazza az üdülőhelyi illetéket.');
        $section->addText('');
        $section->addText('Belépők (tájékoztató jelleggel):');
        $section->addText('Aquileia bazilika 5,00 Euro/fő');

        $path = tempnam(sys_get_temp_dir(), 'word_import_test_').'.docx';
        \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007')->save($path);

        return new UploadedFile(
            $path,
            'Olaszország-Toszkán impressziók-Firenze és a mesés Cinque Terre.docx',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            null,
            true,
        );
    }

    private function actingAsAdmin(): void
    {
        $permission = Permission::findOrCreate('tours.create', 'web');
        $role = Role::findOrCreate('Word Import Test Admin', 'web');
        $role->syncPermissions([$permission]);

        $user = User::query()->create([
            'name' => 'Word Import Test Admin',
            'email' => 'word-import-test-admin@example.com',
            'password' => 'password',
        ]);

        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
