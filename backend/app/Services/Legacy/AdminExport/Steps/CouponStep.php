<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\Coupon;
use App\Models\LegacyImportRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy coupons → coupons, matched by code too (a coupon the new site
 * already has keeps its record). The list view holds every coupon field.
 *
 * @extends RecordStep<Coupon>
 */
final class CouponStep extends RecordStep
{
    public function key(): string
    {
        return 'coupons';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::COUPON;
    }

    protected function modelClass(): string
    {
        return Coupon::class;
    }

    protected function sources(): array
    {
        return ['management.coupon'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $code = $record->field('coupon') ?? $record->listValue('Kupon');

        if ($code === null) {
            return null;
        }

        $usedAt = LegacyAdminExportRecord::dateTime($record->field('date_use') ?? $record->listValue('Felhasználva'));
        $coupon = $existing ?? Coupon::withTrashed()->where('code', $code)->first() ?? new Coupon(['active' => true]);
        $coupon->fill([
            'name' => $record->field('name') ?? $record->listValue('Név'),
            'email' => $record->field('email') ?? $record->listValue('E-mail'),
            'code' => $code,
            'value' => LegacyAdminExportRecord::amount($record->field('value') ?? $record->listValue('Érték')),
            'expires_at' => LegacyAdminExportRecord::dateTime($record->field('date_usable') ?? $record->listValue('Érvényes'))?->toDateString(),
            'used' => $usedAt !== null,
        ]);

        $createdAt = LegacyAdminExportRecord::dateTime($record->field('date_create') ?? $record->listValue('Kiosztva'));

        if ($createdAt !== null && ! $coupon->exists) {
            $coupon->created_at = $createdAt;
        }

        $coupon->save();

        return $coupon;
    }
}
