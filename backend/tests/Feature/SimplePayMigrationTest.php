<?php

namespace Tests\Feature;

use App\Models\BookingFormField;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimplePayMigrationTest extends TestCase
{
    use RefreshDatabase;

    private const BARION_OPTION = 'Online bankkártyás fizetés (Barion)';

    private const SIMPLEPAY_OPTION = 'Online bankkártyás fizetés (SimplePay)';

    private const BANK_OPTION = 'Banki befizetés / átutalás';

    public function test_the_card_option_is_renamed_and_stays_under_development(): void
    {
        $field = $this->paymentMethodField();
        $field->update(['options' => [self::BARION_OPTION, self::BANK_OPTION], 'disabled_options' => [self::BARION_OPTION]]);

        $this->migration()->up();

        $field->refresh();
        $this->assertSame([self::SIMPLEPAY_OPTION, self::BANK_OPTION], $field->options);
        $this->assertSame([self::SIMPLEPAY_OPTION], $field->disabled_options);
    }

    public function test_an_option_the_office_made_selectable_stays_selectable(): void
    {
        $field = $this->paymentMethodField();
        $field->update(['options' => [self::BARION_OPTION, self::BANK_OPTION], 'disabled_options' => null]);

        $this->migration()->up();

        $field->refresh();
        $this->assertSame([self::SIMPLEPAY_OPTION, self::BANK_OPTION], $field->options);
        $this->assertNull($field->disabled_options);
    }

    private function paymentMethodField(): BookingFormField
    {
        return BookingFormField::query()->firstOrCreate(
            ['key' => 'extra_payment_method'],
            ['label' => 'Fizetési mód', 'field_type' => 'radio', 'input_group' => 'extra', 'sort_order' => 17],
        );
    }

    private function migration(): Migration
    {
        return require database_path('migrations/2026_11_06_100000_replace_barion_with_simplepay.php');
    }
}
