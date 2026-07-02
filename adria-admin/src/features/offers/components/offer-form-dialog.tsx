import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MediaPicker } from '@/components/media/media-picker';
import { t } from '@/i18n';
import type {
  Offer,
  OfferContent,
  OfferGroup,
  Gallery,
  Region,
} from '@/types/domain';

import {
  getOfferFormDefaults,
  offerFormSchema,
  offerLocaleOrder,
  slugifyOfferTitle,
  type OfferFormValues,
} from '../lib/offer-schema';
import { OfferSeoPreview } from './offer-seo-preview';

type OfferFormDialogProps = {
  open: boolean;
  offer?: Offer;
  translations?: OfferContent[];
  regions: Region[];
  offerGroups: OfferGroup[];
  galleries: Gallery[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OfferFormValues) => void;
};

export function OfferFormDialog({
  open,
  offer,
  translations,
  regions,
  offerGroups,
  galleries,
  submitting = false,
  onOpenChange,
  onSubmit,
}: OfferFormDialogProps) {
  const [activeLocale, setActiveLocale] = useState<'hu' | 'en' | 'de'>('hu');

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: getOfferFormDefaults(offer, translations),
  });

  useEffect(() => {
    form.reset(getOfferFormDefaults(offer, translations));
  }, [form, offer, open, translations]);

  const titleValue = useWatch({
    control: form.control,
    name: 'title',
  });

  const regionId = useWatch({
    control: form.control,
    name: 'regionId',
  });

  const previewValues =
    (useWatch({
      control: form.control,
    }) as OfferFormValues | undefined) ??
    getOfferFormDefaults(offer, translations);

  const availableOfferGroups = useMemo(
    () => offerGroups.filter((group) => group.regionId === regionId),
    [offerGroups, regionId],
  );
  const availableGalleries = useMemo(
    () =>
      galleries.filter(
        (gallery) =>
          gallery.regionId === regionId && gallery.category === 'offer',
      ),
    [galleries, regionId],
  );

  useEffect(() => {
    const currentOfferGroupId = form.getValues('offerGroupId');
    const currentGalleryId = form.getValues('galleryId');

    if (
      availableOfferGroups.length > 0 &&
      !availableOfferGroups.some((group) => group.id === currentOfferGroupId)
    ) {
      form.setValue('offerGroupId', availableOfferGroups[0].id);
    }

    if (
      availableGalleries.length > 0 &&
      !availableGalleries.some((gallery) => gallery.id === currentGalleryId)
    ) {
      form.setValue('galleryId', availableGalleries[0].id);
    }
  }, [availableGalleries, availableOfferGroups, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {offer ? t('offers.form.editTitle') : t('offers.form.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('offers.form.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
          >
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('offers.form.title')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('offers.form.titlePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>{t('offers.form.slug')}</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs"
                            onClick={() =>
                              form.setValue(
                                'slug',
                                slugifyOfferTitle(titleValue),
                                {
                                  shouldValidate: true,
                                },
                              )
                            }
                          >
                            <WandSparkles className="size-3.5" />
                            {t('common.generate')}
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            placeholder={t('offers.form.slugPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="regionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('offers.form.region')}</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="">{t('offers.form.selectRegion')}</option>
                            {regions.map((region) => (
                              <option key={region.id} value={region.id}>
                                {region.name}
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
                    name="offerGroupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('offers.form.group')}</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="">{t('offers.form.selectGroup')}</option>
                            {availableOfferGroups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
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
                    name="galleryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('offers.form.gallery')}</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="">{t('offers.form.selectGallery')}</option>
                            {availableGalleries.map((gallery) => (
                              <option key={gallery.id} value={gallery.id}>
                                {gallery.title}
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
                    name="pdfUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MediaPicker
                            label={t('offers.form.pdf')}
                            value={field.value || null}
                            onChange={(value) => field.onChange(value ?? '')}
                            description={t('offers.form.pdfHelp')}
                            defaultCategory="homepage_offers"
                            allowedTypes={['pdf']}
                            sourceContext="homepage_offer"
                            uploadTitle={titleValue || undefined}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('offers.form.status')}</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="draft">{t('common.draft')}</option>
                            <option value="published">{t('common.published')}</option>
                            <option value="archived">{t('common.archived')}</option>
                          </select>
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
                        <FormLabel>{t('offers.form.featured')}</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            value={field.value ? 'yes' : 'no'}
                            onChange={(event) =>
                              field.onChange(event.target.value === 'yes')
                            }
                          >
                            <option value="yes">{t('common.featured')}</option>
                            <option value="no">{t('common.standard')}</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t('offers.form.translations')}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t('offers.form.translationsDescription')}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      <FileText className="size-4" />
                      {t('offers.form.editor')}
                    </div>
                  </div>

                  <Tabs
                    value={activeLocale}
                    onValueChange={(value) =>
                      setActiveLocale(value as 'hu' | 'en' | 'de')
                    }
                    className="mt-4"
                  >
                    <TabsList>
                      {offerLocaleOrder.map((locale) => (
                        <TabsTrigger key={locale} value={locale}>
                          {locale.toUpperCase()}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {offerLocaleOrder.map((locale) => (
                      <TabsContent
                        key={locale}
                        value={locale}
                        className="space-y-4"
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`translations.${locale}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('offers.form.localizedTitle')}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t('offers.form.localizedTitlePlaceholder')}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`translations.${locale}.teaser`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('offers.form.teaser')}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="min-h-[96px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {(
                          [
                            ['description', t('offers.form.descriptionBlock')],
                            ['program', t('offers.form.program')],
                            ['tickets', t('offers.form.tickets')],
                            ['optionalPrograms', t('offers.form.optionalPrograms')],
                            ['pricingInformation', t('offers.form.pricingInformation')],
                          ] as const
                        ).map(([fieldName, label]) => (
                          <FormField
                            key={fieldName}
                            control={form.control}
                            name={`translations.${locale}.${fieldName}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              <div className="space-y-4">
                <OfferSeoPreview values={previewValues} locale={activeLocale} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? t('offers.form.saving')
                  : offer
                    ? t('offers.form.submitEdit')
                    : t('offers.form.submitCreate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
