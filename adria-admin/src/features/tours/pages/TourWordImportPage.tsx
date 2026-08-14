import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth-store';

import { getRegionOptions, getTravelModeOptions } from '../lib/tour-select-options.api';
import { createTour, parseWordTourImport } from '../lib/tours.api';
import {
  mapTourToFormValues,
  type SelectOption,
  type Tour,
  type TourWordImportDraft,
  type TourWordImportResult,
} from '../lib/tours.types';

type DraftState = {
  key: string;
  fileName: string;
  name: string;
  subtitle: string;
  listDescription: string;
  price: string;
  inclusions: string;
  notes: string;
  regionId: string;
  travelModeId: string;
  dates: Array<{ startDate: string; endDate: string }>;
  programDays: Array<{ dayNumber: number; title: string; description: string }>;
  warnings: string[];
  status: 'idle' | 'importing' | 'success' | 'error';
  importError: string | null;
};

function matchOptionByHint(options: SelectOption[] | undefined, hint: string | null): string {
  if (!options || !hint) {
    return '';
  }

  const normalizedHint = hint.trim().toLowerCase();
  const match = options.find(
    (option) =>
      option.label.toLowerCase().includes(normalizedHint) ||
      normalizedHint.includes(option.label.toLowerCase()),
  );

  return match?.id ?? '';
}

function draftFromParsed(
  fileName: string,
  data: TourWordImportDraft,
  regions: SelectOption[] | undefined,
  travelModes: SelectOption[] | undefined,
): DraftState {
  return {
    key: fileName,
    fileName,
    name: data.name,
    subtitle: data.subtitle ?? '',
    listDescription: data.listDescription,
    price: data.price != null ? String(data.price) : '',
    inclusions: data.inclusions ?? '',
    notes: data.notes,
    regionId: matchOptionByHint(regions, data.regionHint),
    travelModeId: matchOptionByHint(travelModes, data.travelModeHint),
    dates: data.dates.map((date) => ({ startDate: date.startDate, endDate: date.endDate })),
    programDays: data.programDays.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
    })),
    warnings: data.warnings,
    status: 'idle',
    importError: null,
  };
}

export function TourWordImportPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canImport = hasPermission('tours.create');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [drafts, setDrafts] = useState<DraftState[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<TourWordImportResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: regionOptions } = useQuery({
    queryKey: ['tour-select-options', 'regions'],
    queryFn: () => getRegionOptions(),
  });
  const { data: travelModeOptions } = useQuery({
    queryKey: ['tour-select-options', 'travel-modes'],
    queryFn: () => getTravelModeOptions(),
  });

  const parseMutation = useMutation({
    mutationFn: (files: File[]) => parseWordTourImport(files),
    onSuccess: (response) => {
      const succeeded = response.results.filter((result) => result.success && result.data);
      const failed = response.results.filter((result) => !result.success || !result.data);

      setDrafts(
        succeeded.map((result) =>
          draftFromParsed(result.fileName, result.data as TourWordImportDraft, regionOptions, travelModeOptions),
        ),
      );
      setRejectedFiles(failed);

      if (succeeded.length > 0) {
        toast.success(`${succeeded.length} dokumentum feldolgozva, ellenőrizd az adatokat importálás előtt.`);
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} dokumentum feldolgozása sikertelen volt.`);
      }
    },
    onError: () => {
      toast.error('A dokumentumok feldolgozása sikertelen volt.');
    },
  });

  const importMutation = useMutation({
    mutationFn: createTour,
  });

  const hasResults = drafts.length > 0 || rejectedFiles.length > 0;

  const updateDraft = (key: string, patch: Partial<DraftState>) => {
    setDrafts((current) => current.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));
  };

  const removeDraft = (key: string) => {
    setDrafts((current) => current.filter((draft) => draft.key !== key));
  };

  const importDraft = async (draft: DraftState) => {
    if (draft.name.trim() === '') {
      toast.error('A program neve nem lehet üres.');
      return;
    }

    updateDraft(draft.key, { status: 'importing', importError: null });

    const partialTour: Partial<Tour> = {
      name: draft.name,
      subtitle: draft.subtitle,
      listDescription: draft.listDescription,
      shortDescription: draft.listDescription,
      inclusions: draft.inclusions,
      notes: draft.notes,
      price: draft.price,
      displayedPrice: draft.price,
      regionId: draft.regionId,
      travelModeId: draft.travelModeId,
      active: false,
      couponable: false,
      seoAutoGenerate: true,
      programDays: draft.programDays.map((day, index) => ({
        id: `draft-day-${index}`,
        sortOrder: index + 1,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description,
        image: '',
        icon: '',
        experienceType: '',
        badges: [],
        active: true,
      })),
      dates: draft.dates.map((date, index) => ({
        id: `draft-date-${index}`,
        startDate: date.startDate,
        endDate: date.endDate,
        price: draft.price,
        displayedPrice: '',
        status: 'planned',
      })),
    };

    try {
      await importMutation.mutateAsync(mapTourToFormValues(partialTour));
      updateDraft(draft.key, { status: 'success' });
      toast.success(`„${draft.name}" sikeresen importálva (inaktív állapotban).`);
    } catch {
      updateDraft(draft.key, {
        status: 'error',
        importError: 'Az importálás sikertelen volt. Ellenőrizd az adatokat és próbáld újra.',
      });
    }
  };

  const importableCount = useMemo(
    () => drafts.filter((draft) => draft.status !== 'success').length,
    [drafts],
  );

  const importAll = async () => {
    for (const draft of drafts) {
      if (draft.status === 'success') {
        continue;
      }

      await importDraft(draft);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Programok</p>
        <h1 className="text-3xl font-semibold tracking-tight">Word import</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Tölts fel egy vagy több .docx formátumú programleírást a meghatározott sablon alapján. A
          feldolgozás után minden program adatai átnézhetők és javíthatók, mielőtt ténylegesen
          létrejönnének (inaktív állapotban).
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">1. Dokumentumok feltöltése</h3>
          <p className="text-sm text-muted-foreground">
            Csak .docx formátum támogatott. Ha a fájl .doc formátumú, előbb mentsd el Word-ben
            „Word dokumentum (.docx)" formátumban.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setSelectedFiles(files);
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" />
            Fájlok kiválasztása
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} fájl kiválasztva`
              : 'Nincs fájl kiválasztva'}
          </span>
          <Button
            type="button"
            disabled={selectedFiles.length === 0 || parseMutation.isPending || !canImport}
            onClick={() => parseMutation.mutate(selectedFiles)}
          >
            {parseMutation.isPending ? 'Feldolgozás...' : 'Feldolgozás'}
          </Button>
        </div>
      </section>

      {rejectedFiles.length > 0 ? (
        <section className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="font-semibold text-destructive">Sikertelen feldolgozás</h3>
          {rejectedFiles.map((result) => (
            <div key={result.fileName} className="text-sm text-destructive">
              <span className="font-medium">{result.fileName}:</span> {result.error}
            </div>
          ))}
        </section>
      ) : null}

      {hasResults ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">2. Előnézet és ellenőrzés</h3>
            {importableCount > 0 ? (
              <Button type="button" onClick={() => void importAll()} disabled={!canImport}>
                Összes importálása ({importableCount})
              </Button>
            ) : null}
          </div>

          {drafts.map((draft) => (
            <DraftCard
              key={draft.key}
              draft={draft}
              regionOptions={regionOptions ?? []}
              travelModeOptions={travelModeOptions ?? []}
              canImport={canImport}
              onChange={(patch) => updateDraft(draft.key, patch)}
              onRemove={() => removeDraft(draft.key)}
              onImport={() => void importDraft(draft)}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function DraftCard({
  draft,
  regionOptions,
  travelModeOptions,
  canImport,
  onChange,
  onRemove,
  onImport,
}: {
  draft: DraftState;
  regionOptions: SelectOption[];
  travelModeOptions: SelectOption[];
  canImport: boolean;
  onChange: (patch: Partial<DraftState>) => void;
  onRemove: () => void;
  onImport: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{draft.fileName}</div>
          <Input
            value={draft.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Program neve"
            className="mt-1 text-lg font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          {draft.status === 'success' ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="size-4" />
              Importálva
            </span>
          ) : (
            <Button type="button" size="sm" onClick={onImport} disabled={!canImport || draft.status === 'importing'}>
              {draft.status === 'importing' ? 'Importálás...' : 'Importálás'}
            </Button>
          )}
          <Button type="button" variant="outline" size="icon" onClick={onRemove}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {draft.importError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {draft.importError}
        </div>
      ) : null}

      {draft.warnings.length > 0 ? (
        <div className="space-y-1 rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" />
            Ellenőrizendő mezők
          </div>
          <ul className="list-disc space-y-0.5 pl-5">
            {draft.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          value={draft.subtitle}
          onChange={(event) => onChange({ subtitle: event.target.value })}
          placeholder="Alcím (opcionális)"
        />
        <Input
          type="number"
          value={draft.price}
          onChange={(event) => onChange({ price: event.target.value })}
          placeholder="Részvételi díj (Ft)"
        />
        <select
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          value={draft.regionId}
          onChange={(event) => onChange({ regionId: event.target.value })}
        >
          <option value="">-- Régió kiválasztása --</option>
          {regionOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          value={draft.travelModeId}
          onChange={(event) => onChange({ travelModeId: event.target.value })}
        >
          <option value="">-- Utazás módja --</option>
          {travelModeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-1 text-xs text-muted-foreground">Rövid összefoglaló</div>
        <Input
          value={draft.listDescription}
          onChange={(event) => onChange({ listDescription: event.target.value })}
        />
      </div>

      <DateRangesEditor
        dates={draft.dates}
        onChange={(dates) => onChange({ dates })}
      />

      <ProgramDaysEditor
        programDays={draft.programDays}
        onChange={(programDays) => onChange({ programDays })}
      />

      <div>
        <div className="mb-1 text-xs text-muted-foreground">Ár tartalmazza / nem tartalmazza</div>
        <Textarea
          value={draft.inclusions}
          onChange={(event) => onChange({ inclusions: event.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}

function DateRangesEditor({
  dates,
  onChange,
}: {
  dates: Array<{ startDate: string; endDate: string }>;
  onChange: (dates: Array<{ startDate: string; endDate: string }>) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Indulási időpontok ({dates.length})</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...dates, { startDate: '', endDate: '' }])}
        >
          <Plus className="size-4" />
          Időpont
        </Button>
      </div>
      {dates.map((date, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
          <Input
            type="date"
            value={date.startDate}
            onChange={(event) => {
              const next = [...dates];
              next[index] = { ...next[index], startDate: event.target.value };
              onChange(next);
            }}
          />
          <Input
            type="date"
            value={date.endDate}
            onChange={(event) => {
              const next = [...dates];
              next[index] = { ...next[index], endDate: event.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange(dates.filter((_, i) => i !== index))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function ProgramDaysEditor({
  programDays,
  onChange,
}: {
  programDays: Array<{ dayNumber: number; title: string; description: string }>;
  onChange: (programDays: Array<{ dayNumber: number; title: string; description: string }>) => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Program napok ({programDays.length})</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...programDays, { dayNumber: programDays.length + 1, title: '', description: '' }])
          }
        >
          <Plus className="size-4" />
          Nap
        </Button>
      </div>
      {programDays.map((day, index) => (
        <div key={index} className="space-y-2 rounded-lg border bg-background p-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={day.dayNumber}
              onChange={(event) => {
                const next = [...programDays];
                next[index] = { ...next[index], dayNumber: Number(event.target.value) || 1 };
                onChange(next);
              }}
              className="w-20"
            />
            <Input
              value={day.title}
              onChange={(event) => {
                const next = [...programDays];
                next[index] = { ...next[index], title: event.target.value };
                onChange(next);
              }}
              placeholder="Nap címe"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onChange(programDays.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <Textarea
            value={day.description}
            onChange={(event) => {
              const next = [...programDays];
              next[index] = { ...next[index], description: event.target.value };
              onChange(next);
            }}
            rows={3}
            placeholder="Nap leírása"
          />
        </div>
      ))}
    </div>
  );
}
