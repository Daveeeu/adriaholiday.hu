import { useMemo, useState, type ReactNode } from 'react';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getAllBookingFormTemplates,
  getBookingFormTemplateOptions,
} from '@/features/booking-form-templates/lib/booking-form-templates.api';
import type { BookingFormFieldVisibility } from '@/features/booking-form-templates/lib/booking-form-templates.types';
import { TOUR_DATE_STATUSES } from '../lib/tours.constants';
import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourContentSections } from './TourContentSections';
import { TourCreatableSelectField } from './TourCreatableSelectField';
import { TourFilterSections } from './TourFilterSections';
import { TourGallerySection } from './TourGallerySection';
import { TourProgramDaysSection } from './TourProgramDaysSection';
import { TourPriceItemsSection } from './TourPriceItemsSection';
import { TourSeoSection } from './TourSeoSection';

const bookingFormVisibilityLabels: Record<BookingFormFieldVisibility, string> = {
  required: 'Kötelező',
  optional: 'Opcionális',
  hidden: 'Rejtett',
};

type TourFormProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

type TourPanelSectionKey =
  | 'basic'
  | 'seo'
  | 'gallery'
  | 'priceBox'
  | 'content'
  | 'programDays'
  | 'priceItems'
  | 'filters'
  | 'dates'
  | 'bookingForm';

const DEFAULT_OPEN_SECTIONS: Record<TourPanelSectionKey, boolean> = {
  basic: true,
  seo: true,
  gallery: false,
  priceBox: true,
  content: false,
  programDays: false,
  priceItems: false,
  filters: true,
  dates: true,
  bookingForm: false,
};

function TourPanelSection({
  title,
  description,
  countLabel,
  open,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  countLabel?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/20"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {countLabel ? (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {countLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </span>
      </button>

      {open ? <div className="border-t px-4 py-4">{children}</div> : null}
    </section>
  );
}

function BooleanField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<TourFormValues>;
  name:
    | 'active'
    | 'xmlEnabled'
    | 'featured'
    | 'recommended'
    | 'partnerOffer'
    | 'imageOffer'
    | 'sliderImageEnabled'
    | 'sliderTextEnabled';
  label: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
            {label}
          </label>
        </FormItem>
      )}
    />
  );
}

export function TourForm({ form, tour }: TourFormProps) {
  const dates = useFieldArray({
    control: form.control,
    name: 'dates',
  });

  const bonuses = useFieldArray({
    control: form.control,
    name: 'partnerBonuses',
  });

  const gallery = useWatch({ control: form.control, name: 'gallery' }) ?? [];
  const programDays = useWatch({ control: form.control, name: 'programDays' }) ?? [];
  const priceItems = useWatch({ control: form.control, name: 'priceItems' }) ?? [];
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);

  const sectionCounts = useMemo(
    () => ({
      gallery: gallery.length,
      programDays: programDays.length,
      priceItems: priceItems.length,
      dates: dates.fields.length,
    }),
    [dates.fields.length, gallery.length, priceItems.length, programDays.length],
  );

  const toggleSection = (key: TourPanelSectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const setAllSections = (open: boolean) => {
    setOpenSections({
      basic: open,
      seo: open,
      gallery: open,
      priceBox: open,
      content: open,
      programDays: open,
      priceItems: open,
      filters: open,
      dates: open,
      bookingForm: open,
    });
  };

  const bookingFormTemplateId = useWatch({ control: form.control, name: 'bookingFormTemplateId' });

  const { data: bookingFormTemplates = [] } = useQuery({
    queryKey: ['tour-select-options', 'booking-form-templates-detail'],
    queryFn: getAllBookingFormTemplates,
  });

  const selectedBookingFormTemplate = bookingFormTemplates.find(
    (template) => String(template.id) === bookingFormTemplateId,
  );

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/95 px-4 py-3 backdrop-blur">
        <div>
          <div className="text-sm font-semibold text-foreground">Körutazás szekciók</div>
          <div className="text-xs text-muted-foreground">
            Nyisd le csak azt, amin dolgozol.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAllSections(true)}>
            <Plus className="size-4" />
            Összes lenyitása
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAllSections(false)}>
            <Minus className="size-4" />
            Összes csukása
          </Button>
        </div>
      </div>

      <TourPanelSection
        title="Alapadatok"
        description="Aktív, megjelenési és alap kapcsolóbeállítások."
        open={openSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sorrend</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <BooleanField form={form} name="active" label="Aktív?" />
          <BooleanField form={form} name="xmlEnabled" label="XML-ben szerepel?" />
          <BooleanField form={form} name="imageOffer" label="Képes ajánlat?" />
          <BooleanField form={form} name="sliderImageEnabled" label="Slider kép" />
          <BooleanField form={form} name="sliderTextEnabled" label="Slider szöveg" />
        </div>
      </TourPanelSection>

      <TourPanelSection
        title="SEO és elnevezés"
        description="Név, slug és akciós címkeszövegek kezelése."
        open={openSections.seo}
        onToggle={() => toggleSection('seo')}
      >
        <TourSeoSection form={form} />
      </TourPanelSection>

      <TourPanelSection
        title="Galéria és média"
        description="Hero, galéria és médiatári képek."
        countLabel={`${sectionCounts.gallery} elem`}
        open={openSections.gallery}
        onToggle={() => toggleSection('gallery')}
      >
        <TourGallerySection form={form} />
      </TourPanelSection>

      <TourPanelSection
        title="Ár / PriceBox"
        description="Kártya- és detail oldali ármegjelenítés, CTA-k, férőhely adatok."
        open={openSections.priceBox}
        onToggle={() => toggleSection('priceBox')}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="priceBox.price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alapár</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="199000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.displayedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Megjelenített ár szöveg</FormLabel>
                <FormControl>
                  <Input placeholder="199 000 Ft-tól" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pénznem</FormLabel>
                <FormControl>
                  <Input placeholder="HUF" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.priceSuffix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ár utótag</FormLabel>
                <FormControl>
                  <Input placeholder="/ fő" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.discountBadge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kedvezmény badge</FormLabel>
                <FormControl>
                  <Input placeholder="-15%" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.discountText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kedvezmény szöveg</FormLabel>
                <FormControl>
                  <Input placeholder="Előfoglalási kedvezmény" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.urgencyText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency / érdeklődő szöveg</FormLabel>
                <FormControl>
                  <Input placeholder="18 fő érdeklődött az elmúlt 72 órában" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.ratingText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Értékelés szöveg</FormLabel>
                <FormControl>
                  <Input placeholder="4.9/5 utasértékelés" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.minParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum fő</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum fő</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="49" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.availableSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Szabad férőhely</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kapacitás</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="49" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.ctaPrimaryLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Elsődleges CTA felirat</FormLabel>
                <FormControl>
                  <Input placeholder="Ajánlatot kérek" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceBox.ctaSecondaryLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Másodlagos CTA felirat</FormLabel>
                <FormControl>
                  <Input placeholder="Lefoglalom az utat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TourPanelSection>

      <TourPanelSection
        title="Tartalmi blokkok"
        description="Leírások, szolgáltatási információk, PDF és rich text tartalom."
        open={openSections.content}
        onToggle={() => toggleSection('content')}
      >
        <TourContentSections form={form} />
      </TourPanelSection>

      <TourPanelSection
        title="Program napok"
        description="Napi bontás, ikonok, képek és badge-ek."
        countLabel={`${sectionCounts.programDays} nap`}
        open={openSections.programDays}
        onToggle={() => toggleSection('programDays')}
      >
        <TourProgramDaysSection form={form} />
      </TourPanelSection>

      <TourPanelSection
        title="Ár tartalma"
        description="Mit tartalmaz és mit nem tartalmaz az ár."
        countLabel={`${sectionCounts.priceItems} tétel`}
        open={openSections.priceItems}
        onToggle={() => toggleSection('priceItems')}
      >
        <TourPriceItemsSection form={form} />
      </TourPanelSection>

      <TourPanelSection
        title="Szűrők és kapcsolatok"
        description="Régiók, kategóriák, címkék, országok és ajánlati csoportok."
        open={openSections.filters}
        onToggle={() => toggleSection('filters')}
      >
        <TourFilterSections form={form} tour={tour} />
      </TourPanelSection>

      <TourPanelSection
        title="Időpontok"
        description="Indulási dátumok, státuszok és dátumspecifikus árak."
        countLabel={`${sectionCounts.dates} időpont`}
        open={openSections.dates}
        onToggle={() => toggleSection('dates')}
      >
        <div className="space-y-3">
          {dates.fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border bg-background p-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <FormField
                  control={form.control}
                  name={`dates.${index}.startDate`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Indulás</FormLabel>
                      <FormControl>
                        <Input type="date" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.endDate`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Érkezés</FormLabel>
                      <FormControl>
                        <Input type="date" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.price`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Ár</FormLabel>
                      <FormControl>
                        <Input placeholder="1200" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.status`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Státusz</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                          {...dateField}
                        >
                          {TOUR_DATE_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => dates.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 border-t pt-3">
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.price`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Ár</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="199000" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.displayedPrice`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Megjelenített ár</FormLabel>
                      <FormControl>
                        <Input placeholder="199 000 Ft-tól" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.availableSeats`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Szabad férőhely</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="12" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.capacity`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Kapacitás</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="49" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.minParticipants`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Minimum fő</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="1" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.maxParticipants`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Maximum fő</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="49" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dates.${index}.priceBox.discountBadge`}
                  render={({ field: dateField }) => (
                    <FormItem>
                      <FormLabel>Kedvezmény badge</FormLabel>
                      <FormControl>
                        <Input placeholder="-15%" {...dateField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  dates.append({
                    id: crypto.randomUUID(),
                    startDate: '',
                    endDate: '',
                    price: '',
                    displayedPrice: '',
                    status: 'planned',
                    priceBox: {
                      price: '',
                      displayedPrice: '',
                      discountBadge: '',
                      minParticipants: '',
                      maxParticipants: '',
                      availableSeats: '',
                      capacity: '',
                    },
                  })
                }
              >
            <Plus className="size-4" />
            Időpont hozzáadása
          </Button>
        </div>
      </TourPanelSection>

      <TourPanelSection
        title="Foglalási űrlap beállításai"
        description="Válaszd ki, milyen sablon alapján kérje be a publikus foglalási űrlap az adatokat."
        countLabel={
          selectedBookingFormTemplate
            ? `${selectedBookingFormTemplate.fields.filter((field) => field.visibility !== 'hidden').length} látható mező`
            : undefined
        }
        open={openSections.bookingForm}
        onToggle={() => toggleSection('bookingForm')}
      >
        <div className="space-y-4">
          <TourCreatableSelectField
            control={form.control}
            name="bookingFormTemplateId"
            label="Foglalási űrlap sablon"
            placeholder="Buszos út, Repülős út vagy egyedi sablon..."
            queryKey={['tour-select-options', 'booking-form-templates']}
            queryFn={getBookingFormTemplateOptions}
            description="A sablonokat a Foglalások / Foglalási űrlap sablonok oldalon lehet létrehozni és szerkeszteni."
          />

          {selectedBookingFormTemplate ? (
            <div className="rounded-xl border bg-background p-3">
              <div className="text-sm font-medium text-foreground">
                Mezők előnézete – {selectedBookingFormTemplate.name}
              </div>
              <div className="mt-3 space-y-2">
                {selectedBookingFormTemplate.fields
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium">{field.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.inputGroup === 'contact' ? 'Kapcsolattartó' : 'Utas'}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          field.visibility === 'required' && 'bg-emerald-100 text-emerald-700',
                          field.visibility === 'optional' && 'bg-sky-100 text-sky-700',
                          field.visibility === 'hidden' && 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {bookingFormVisibilityLabels[field.visibility]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nincs sablon kiválasztva – a foglalási űrlap alapértelmezett mezőit fogja megjeleníteni.
            </p>
          )}
        </div>
      </TourPanelSection>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">Partner bónuszok</h3>
          <p className="text-sm text-muted-foreground">
            Partner bónuszok listája és értékei.
          </p>
        </div>

        <div className="space-y-3">
          {bonuses.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-xl border bg-background p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <FormField
                control={form.control}
                name={`partnerBonuses.${index}.label`}
                render={({ field: bonusField }) => (
                  <FormItem>
                    <FormLabel>Név</FormLabel>
                    <FormControl>
                      <Input placeholder="Bónusz neve" {...bonusField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`partnerBonuses.${index}.value`}
                render={({ field: bonusField }) => (
                  <FormItem>
                    <FormLabel>Érték</FormLabel>
                    <FormControl>
                      <Input placeholder="Érték" {...bonusField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => bonuses.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              bonuses.append({
                id: crypto.randomUUID(),
                sortOrder: bonuses.fields.length + 1,
                label: '',
                value: '',
              })
            }
          >
            <Plus className="size-4" />
            Bónusz hozzáadása
          </Button>
        </div>
      </section>
    </div>
  );
}
