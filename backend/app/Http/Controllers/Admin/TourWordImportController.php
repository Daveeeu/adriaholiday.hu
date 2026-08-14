<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Tour\WordTourImportService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class TourWordImportController extends Controller
{
    private const ALLOWED_MIME_TYPES = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    public function __construct(private readonly WordTourImportService $importService)
    {
        $this->middleware('permission:tours.create');
    }

    /**
     * Parses one or more uploaded tour programs into draft data for admin
     * review. Nothing is persisted here. Each file is parsed independently
     * — including format rejection — so a single .doc file or otherwise
     * broken document in the batch doesn't fail the whole request; every
     * other file still gets parsed and only that one is reported as failed.
     */
    public function parse(Request $request)
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:20'],
            'files.*' => ['required', 'file', 'max:20480'],
        ]);

        $results = array_map(
            fn (UploadedFile $file) => $this->parseFile($file),
            $request->file('files'),
        );

        return response()->json(['results' => $results]);
    }

    /**
     * @return array<string, mixed>
     */
    private function parseFile(UploadedFile $file): array
    {
        $originalName = $file->getClientOriginalName();

        $isDocxExtension = strtolower($file->getClientOriginalExtension()) === 'docx';
        $isDocxMimeType = in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true);

        if (! $isDocxExtension || ! $isDocxMimeType) {
            return [
                'fileName' => $originalName,
                'success' => false,
                'data' => null,
                'error' => 'Csak .docx formátumú fájl tölthető fel. Kérjük, mentsd el a dokumentumot Word-ben "Word dokumentum (.docx)" formátumban, majd töltsd fel újra.',
            ];
        }

        try {
            $data = $this->importService->parse($file->getRealPath(), $originalName);

            return [
                'fileName' => $originalName,
                'success' => true,
                'data' => $data,
                'error' => null,
            ];
        } catch (Throwable $exception) {
            report($exception);

            return [
                'fileName' => $originalName,
                'success' => false,
                'data' => null,
                'error' => 'A dokumentum feldolgozása sikertelen volt. Kérjük ellenőrizd a fájlt, vagy add meg az adatokat kézzel.',
            ];
        }
    }
}
