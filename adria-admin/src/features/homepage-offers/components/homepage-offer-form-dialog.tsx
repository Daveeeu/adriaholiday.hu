import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MediaPicker } from '@/components/media/media-picker';

import {
  getHomepageOfferFormDefaults,
  homepageOfferFormSchema,
  slugify,
  type HomepageOffer,
  type HomepageOfferFormValues,
  type HomepageOfferLanguage,
} from '../lib/homepage-offer-schema';

const languages: Array<{ key: HomepageOfferLanguage; label: string }> = [
  { key: 'hu', label: 'Magyar' },
  { key: 'en', label: 'Angol' },
  { key: 'de', label: 'Német' },
];

type HomepageOfferFormDialogProps = {
  open: boolean;
  offer?: HomepageOffer;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HomepageOfferFormValues) => void;
};

export function HomepageOfferFormDialog({
  open,
  offer,
  submitting = false,
  onOpenChange,
  onSubmit,
}: HomepageOfferFormDialogProps) {
  const form = useForm<HomepageOfferFormValues>({
    resolver: zodResolver(homepageOfferFormSchema),
    defaultValues: getHomepageOfferFormDefaults(offer),
  });

  const autoSeo = useWatch({
    control: form.control,
    name: 'autoSeo',
  });

  const imageUrl = useWatch({
    control: form.control,
    name: 'imageUrl',
  });

  const imageTitle = useWatch({
    control: form.control,
    name: 'imageTitle',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(getHomepageOfferFormDefaults(offer));
  }, [open, offer, form]);

  if (!open) {
    return null;
  }

  const title = offer
    ? 'Főoldali ajánlat szerkesztése'
    : 'Új főoldali ajánlat';

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Bezárás"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-background shadow-xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A főoldalon megjelenő ajánlat adatai, képe és nyelvi szövegei.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Státusz</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="active">Aktív</option>
                          <option value="inactive">Inaktív</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="korutazasok/regio/hatartalanul"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Relatív útvonal vagy teljes URL is megadható.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MediaPicker
                            label="Kép"
                            value={field.value || null}
                            onChange={(value) => field.onChange(value ?? '')}
                            description="Feltöltés gépről vagy médiatárból."
                            defaultCategory="homepage_offers"
                            sourceContext="homepage_offer"
                            uploadAlt={imageTitle || undefined}
                            uploadTitle={imageTitle || undefined}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageTitle"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Kép címe</FormLabel>
                      <FormControl>
                        <Input placeholder="Kép címe / alt szöveg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Előnézet"
                      className="h-24 w-36 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-36 items-center justify-center rounded-xl border bg-background text-muted-foreground">
                      <span className="text-xs">Nincs kép</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Itt látod a főoldali ajánlat képének előnézetét.
                  </p>
                </div>
              </div>

              <HomepageOfferTranslations
                key={offer?.id ?? 'new'}
                form={form}
                autoSeo={autoSeo}
              />
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Mégse
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Mentés...'
                  : offer
                    ? 'Módosítás mentése'
                    : 'Hozzáadás'}
              </Button>
            </div>
          </form>
        </Form>
      </aside>
    </div>
  );
}

function HomepageOfferTranslations({
  form,
  autoSeo,
}: {
  form: UseFormReturn<HomepageOfferFormValues>;
  autoSeo: boolean;
}) {
  const [activeLanguage, setActiveLanguage] =
    useState<HomepageOfferLanguage>('hu');

  return (
    <div className="rounded-2xl border">
      <div className="flex border-b bg-muted/30 px-4 pt-3">
        {languages.map((language) => (
          <button
            key={language.key}
            type="button"
            onClick={() => setActiveLanguage(language.key)}
            className={
              activeLanguage === language.key
                ? 'rounded-t-xl border border-b-background bg-background px-4 py-2 text-sm font-semibold text-primary'
                : 'px-4 py-2 text-sm font-medium text-muted-foreground'
            }
          >
            {language.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 p-4">
        <FormField
          control={form.control}
          name={`translations.${activeLanguage}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Név</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ajánlat neve"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event);

                    if (autoSeo) {
                      form.setValue(
                        `translations.${activeLanguage}.seoName`,
                        slugify(event.target.value),
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        },
                      );
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <FormField
            control={form.control}
            name={`translations.${activeLanguage}.seoName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO név</FormLabel>
                <FormControl>
                  <Input disabled={autoSeo} placeholder="seo-nev" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoSeo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex h-10 items-center gap-2 rounded-xl border px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                    Automatikus generálás
                  </label>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`translations.${activeLanguage}.shortDescription`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rövid szöveg</FormLabel>
              <FormControl>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Rövid leírás az ajánlathoz..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
