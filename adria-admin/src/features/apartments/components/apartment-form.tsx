import type { UseFormReturn } from 'react-hook-form';

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
import type { Gallery, Location, Region } from '@/types/domain';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import {
  APARTMENT_TYPES,
  getApartmentTypeDefinition,
} from '@/features/apartments/constants/apartmentTypes';

import { ApartmentLocationSection } from './apartment-location-section';
import { ApartmentContentSection } from './apartment-content-section';
import { ApartmentPricingMatrix } from './apartment-pricing-matrix';
import { ApartmentPriceSeasonsSection } from './apartment-price-seasons-section';
import { ApartmentSeoSection } from './apartment-seo-section';
import { ApartmentServicesSection } from './apartment-services-section';
import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentFormProps = {
  form: UseFormReturn<ApartmentFormValues>;
  regions: Region[];
  locations: Location[];
  galleries: Gallery[];
  typeLocked?: boolean;
};

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      className={cn('min-w-24 justify-center')}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function ApartmentForm({
  form,
  regions,
  locations,
  galleries,
  typeLocked = false,
}: ApartmentFormProps) {
  const selectedType = form.watch('type');
  const typeDefinition = getApartmentTypeDefinition(selectedType);

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Apartman típusa</h3>
          <p className="text-sm text-muted-foreground">
            A típus meghatározza, melyik országkategóriába kerül az apartman.
          </p>
        </div>

        {typeLocked ? (
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Előre beállított típus
            </div>
            <div className="mt-1 text-sm font-medium">
              {typeDefinition?.formLabel ?? 'Nincs kiválasztva típus'}
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartman típusa *</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <option value="">-- Válassz típust --</option>
                    {APARTMENT_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.formLabel}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Állapot és alapjelölések</h3>
          <p className="text-sm text-muted-foreground">
            Aktív / inaktív, kiemelt és szállás jelölések.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktív</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    <ToggleButton
                      active={field.value}
                      label="Igen"
                      onClick={() => field.onChange(true)}
                    />
                    <ToggleButton
                      active={!field.value}
                      label="Nem"
                      onClick={() => field.onChange(false)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kiemelt</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    <ToggleButton
                      active={field.value}
                      label="Igen"
                      onClick={() => field.onChange(true)}
                    />
                    <ToggleButton
                      active={!field.value}
                      label="Nem"
                      onClick={() => field.onChange(false)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAccommodation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Szállás</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    <ToggleButton
                      active={field.value}
                      label="Igen"
                      onClick={() => field.onChange(true)}
                    />
                    <ToggleButton
                      active={!field.value}
                      label="Nem"
                      onClick={() => field.onChange(false)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Csillagok száma</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    value={String(field.value)}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  >
                    {[0, 1, 2, 3, 4, 5].map((stars) => (
                      <option key={stars} value={stars}>
                        {stars === 0 ? '0 - nincs megjelenítés' : `${stars} csillag`}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceHeader"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Árak fejléce</FormLabel>
                <FormControl>
                  <Input placeholder="Árak" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceInnerHeader"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Árak belső fejléce</FormLabel>
                <FormControl>
                  <Input placeholder="Kategória / ágyszám" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeDescription"
            render={({ field }) => (
              <FormItem className="md:col-span-2 xl:col-span-4">
                <FormLabel>Típus szerkesztése</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Típus leírása vagy marketing szöveg"
                    minHeight={160}
                    allowPreview
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allInclusiveDescription"
            render={({ field }) => (
              <FormItem className="md:col-span-2 xl:col-span-4">
                <FormLabel>All-inclusive szerkesztése</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="All-inclusive megjegyzések"
                    minHeight={160}
                    allowPreview
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Kapacitás és méret</h3>
          <p className="text-sm text-muted-foreground">
            Az örökölt alapkapacitás mezők változatlanul rendelkezésre állnak.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hálószobák</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fürdőszobák</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxGuests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max. vendégek</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sizeM2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terület (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <ApartmentSeoSection form={form} />

      <ApartmentLocationSection
        form={form}
        regions={regions}
        locations={locations}
        galleries={galleries}
      />

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Ismertető és kiegészítő információk</h3>
          <p className="text-sm text-muted-foreground">
            Az admin oldali szöveges blokkok külön szerkeszthetők.
          </p>
        </div>

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rövid ismertető</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Rövid összefoglaló szöveg"
                    minHeight={160}
                    allowPreview
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ismertető</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Rövid bemutató szöveg"
                    minHeight={180}
                    allowPreview
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInformation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kiegészítő információk</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="További információk"
                    minHeight={180}
                    allowPreview
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <ApartmentServicesSection form={form} />

      <ApartmentContentSection form={form} />

      <section className="space-y-2 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <h3 className="text-base font-semibold text-foreground">
          Előnézet és meta blokkok
        </h3>
        <p>
          Az automatikus SEO generálás külön kapcsolóval vezérelhető, a típus és
          a kód pedig a felület felső és SEO blokkjában szerkeszthető.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Árak kezelése</h3>
          <p className="text-sm text-muted-foreground">
            A mátrix vízszintesen görgethető, így a több dátumoszlop és
            kategóriasor kényelmesen szerkeszthető.
          </p>
        </div>

        <ApartmentPricingMatrix form={form} />
      </section>

      <ApartmentPriceSeasonsSection form={form} />
    </div>
  );
}
