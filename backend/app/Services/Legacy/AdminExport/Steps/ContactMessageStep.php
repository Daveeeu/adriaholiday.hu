<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\ContactMessage;
use App\Models\LegacyImportRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy contact form messages → contact messages, marked read (the legacy
 * office has seen them). The legacy admin shows a message read-only, so its
 * text comes from the export's "view" labels.
 *
 * @extends RecordStep<ContactMessage>
 */
final class ContactMessageStep extends RecordStep
{
    public function key(): string
    {
        return 'contact-messages';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::CONTACT_MESSAGE;
    }

    protected function modelClass(): string
    {
        return ContactMessage::class;
    }

    protected function sources(): array
    {
        return ['management.message'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $text = $this->text($record->view('Üzenet'));

        if ($text === null) {
            return null;
        }

        $company = $record->view('Cég');
        $message = $existing ?? new ContactMessage(['status' => 'read']);
        $message->fill([
            'name' => $record->view('Név') ?? $record->listValue('Név'),
            'email' => $record->view('E-mail') ?? $record->listValue('E-mail'),
            'phone' => $record->view('Telefon') ?? $record->listValue('Telefonszám'),
            'message' => $company !== null ? "Cég: {$company}\n\n{$text}" : $text,
        ]);

        $createdAt = LegacyAdminExportRecord::dateTime($record->field('created_at') ?? $record->listValue('Létrehozva'));

        if ($createdAt !== null && ! $message->exists) {
            $message->created_at = $createdAt;
        }

        $message->save();

        return $message;
    }

    /**
     * The view export turns every line break into two; one is kept.
     */
    private function text(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $lines = array_map('trim', explode("\n", str_replace("\n\n", "\n", str_replace("\r", '', $value))));
        $text = trim((string) preg_replace("/\n{3,}/", "\n\n", implode("\n", $lines)));

        return $text === '' ? null : $text;
    }
}
