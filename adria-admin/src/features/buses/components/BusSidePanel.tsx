import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { BUS_LANGUAGE_LABELS, BUS_LANGUAGES, BUS_VEHICLE_OPTIONS, slugifyBusText } from '../lib/buses.constants';
import { BusLanguageTabs } from './BusLanguageTabs';
import {
  busFormSchema,
  getBusFormDefaults,
  normalizeBusFormValues,
  type Bus,
  type BusFormValues,
  type BusLanguage,
  type BusUpsertInput,
} from '../lib/buses.types';

type BusSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  bus?: Bus;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BusUpsertInput) => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
};

function DetailCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">
        {typeof value === 'boolean' ? (value ? 'Igen' : 'Nem') : value ?? '—'}
      </div>
    </div>
  );
}

function BusDetailView({ bus }: { bus: Bus }) {
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{bus.translations.hu.name || '—'}</h3>
            <p className="text-sm text-muted-foreground">{bus.vehicleCode}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              bus.active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700',
            )}
          >
            {bus.active ? 'Aktív' : 'Inaktív'}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <DetailCard label="ID" value={bus.id} />
          <DetailCard label="Jármű kód" value={bus.vehicleCode} />
          <DetailCard label="Módosítva" value={bus.updatedAt.slice(0, 10)} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Nyelvi tartalmak</h4>
        <div className="grid gap-3 md:grid-cols-3">
          {(Object.keys(bus.translations) as BusLanguage[]).map((language) => {
            const translation = bus.translations[language];
            return (
              <div key={language} className="rounded-xl border bg-background p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {BUS_LANGUAGE_LABELS[language]}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Név: </span>
                    <span>{translation.name || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium">SEO: </span>
                    <span>{translation.seoName || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Auto: </span>
                    <span>{translation.seoAutoGenerate ? 'Igen' : 'Nem'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function BusSidePanel({
  open,
  mode,
  bus,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
  onToggleActive,
}: BusSidePanelProps) {
  const [activeLanguage, setActiveLanguage] = useState<BusLanguage>('hu');
  const form = useForm<BusFormValues>({
    resolver: zodResolver(busFormSchema),
    defaultValues: getBusFormDefaults(bus),
  });

  const huName = useWatch({ control: form.control, name: 'translations.hu.name' });
  const huAuto = useWatch({ control: form.control, name: 'translations.hu.seoAutoGenerate' });
  const enName = useWatch({ control: form.control, name: 'translations.en.name' });
  const enAuto = useWatch({ control: form.control, name: 'translations.en.seoAutoGenerate' });
  const deName = useWatch({ control: form.control, name: 'translations.de.name' });
  const deAuto = useWatch({ control: form.control, name: 'translations.de.seoAutoGenerate' });
  const vehicleCode = useWatch({ control: form.control, name: 'vehicleCode' });

  const seoAutoByLanguage: Record<BusLanguage, boolean> = {
    hu: !!huAuto,
    en: !!enAuto,
    de: !!deAuto,
  };

  useEffect(() => {
    if (open) {
      form.reset(getBusFormDefaults(bus));
    }
  }, [bus, form, open]);

  useEffect(() => {
    if (huAuto) {
      form.setValue('translations.hu.seoName', slugifyBusText(huName ?? ''), { shouldDirty: true });
    }
  }, [form, huAuto, huName]);

  useEffect(() => {
    if (enAuto) {
      form.setValue('translations.en.seoName', slugifyBusText(enName ?? ''), { shouldDirty: true });
    }
  }, [enAuto, enName, form]);

  useEffect(() => {
    if (deAuto) {
      form.setValue('translations.de.seoName', slugifyBusText(deName ?? ''), { shouldDirty: true });
    }
  }, [deAuto, deName, form]);

  const title =
    mode === 'create'
      ? 'Busz hozzáadása'
      : mode === 'edit'
        ? 'Busz szerkesztése'
        : 'Busz részletei';

  const vehicleOption = useMemo(
    () => BUS_VEHICLE_OPTIONS.find((option) => option.value === vehicleCode),
    [vehicleCode],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Bezárás"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,1100px)] flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'detail'
                ? 'A busz teljes előnézete.'
                : 'Aktív státusz, jármű választás és többnyelvű SEO mezők.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'detail' && bus ? (
              <>
                {onToggleActive ? (
                  <Button type="button" variant="outline" onClick={onToggleActive}>
                    {bus.active ? 'Deaktiválás' : 'Aktiválás'}
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button type="button" variant="destructive" onClick={onDelete}>
                    <Trash2 className="size-4" />
                    Törlés
                  </Button>
                ) : null}
              </>
            ) : null}
            <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-5">
            {mode === 'detail' && bus ? (
              <BusDetailView bus={bus} />
            ) : (
              <Form {...form}>
                <form
                  className="flex min-h-full flex-col gap-5"
                  onSubmit={form.handleSubmit((values) => onSubmit(normalizeBusFormValues(values)))}
                >
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem>
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                          />
                          Aktív
                        </label>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Busz kiválasztása</FormLabel>
                        <FormControl>
                          <Select value={field.value} onChange={field.onChange}>
                            <option value="">Válassz buszt</option>
                            {BUS_VEHICLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Jelenlegi érték: {vehicleOption?.label ?? '—'}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jármű kód</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="man-lions-coach-r08-2019"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <section className="rounded-2xl border bg-card p-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Nyelvi tartalom
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Minden nyelvnél külön név és SEO mező áll rendelkezésre.
                      </p>
                    </div>

                    <div className="mt-4">
                      <BusLanguageTabs
                        activeLanguage={activeLanguage}
                        onLanguageChange={setActiveLanguage}
                      />
                      <div className="mt-4">
                        {BUS_LANGUAGES.map((language) => (
                          <div
                            key={language}
                            className={cn(activeLanguage === language ? 'block' : 'hidden', 'space-y-4')}
                          >
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`translations.${language}.name` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Név</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`translations.${language}.seoName` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SEO név</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        readOnly={seoAutoByLanguage[language]}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`translations.${language}.seoAutoGenerate` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={(event) => field.onChange(event.target.checked)}
                                    />
                                    Automatikus generálás
                                  </label>
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <div className="sticky bottom-0 mt-2 border-t bg-background/95 py-4 backdrop-blur">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      {mode === 'edit' && onDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={onDelete}
                          disabled={submitting}
                        >
                          <Trash2 className="size-4" />
                          Törlés
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                      >
                        Mégse
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        Mentés
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
