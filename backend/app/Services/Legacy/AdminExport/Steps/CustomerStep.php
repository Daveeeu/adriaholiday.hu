<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\Customer;
use App\Models\LegacyImportRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy site accounts → customers. The two admin accounts (user group 3) are
 * left out; passwords never leave the legacy site.
 *
 * @extends RecordStep<Customer>
 */
final class CustomerStep extends RecordStep
{
    private const ADMIN_GROUP = '3';

    public function key(): string
    {
        return 'customers';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::CUSTOMER;
    }

    protected function modelClass(): string
    {
        return Customer::class;
    }

    protected function sources(): array
    {
        return ['users.user'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $email = mb_strtolower((string) ($record->field('email') ?? $record->listValue('E-mail')));

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL) || $this->isAdmin($record)) {
            return null;
        }

        $customer = $existing ?? Customer::withTrashed()->where('email', $email)->first() ?? new Customer;
        $referralCode = $record->field('user_data.partner_id') ?? $record->listValue('Ajánlói kód');
        $couponValue = $record->field('user_data.reg_coupon');

        $customer->fill([
            'email' => $email,
            'name' => $record->field('user_data.name') ?? $record->listValue('Név'),
            'phone' => $record->field('user_data.phone'),
            'postal_code' => $record->field('user_data.zip'),
            'city' => $record->field('user_data.city'),
            'address' => $record->field('user_data.address'),
            'referral_code' => $referralCode !== null && ! $this->referralCodeTaken($referralCode, $customer) ? $referralCode : null,
            'registration_coupon_value' => is_numeric($couponValue) && (int) $couponValue > 0 ? (int) $couponValue : null,
            'note' => $record->field('user_data.note'),
            'registered_at' => LegacyAdminExportRecord::dateTime($record->listValue('Reg dátum')),
            'first_login_at' => LegacyAdminExportRecord::dateTime($record->listValue('Első belépés')),
        ])->save();

        return $customer;
    }

    private function isAdmin(LegacyAdminExportRecord $record): bool
    {
        return collect($record->fieldArray('groups'))->flatten()->contains(self::ADMIN_GROUP);
    }

    private function referralCodeTaken(string $code, Customer $customer): bool
    {
        return Customer::withTrashed()
            ->where('referral_code', $code)
            ->when($customer->exists, fn ($query) => $query->whereKeyNot($customer->getKey()))
            ->exists();
    }
}
