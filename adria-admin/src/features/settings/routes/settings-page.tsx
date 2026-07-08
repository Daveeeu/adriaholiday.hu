import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageLoader } from '@/components/common/page-loader';
import { MediaPickerField } from '@/features/portfolio-content/components/MediaPickerField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { MediaCategory } from '@/components/media/media.constants';
import type { MediaAsset } from '@/services/media-service';
import { uploadMedia } from '@/services/media-service';

import { getSiteSettings, toSiteSettingsFormValues, updateSiteSettings } from '../lib/site-settings.api';
import type { SiteSettingsFormValues, SiteSettingsMedia } from '../lib/site-settings.types';

const linkSchema = z.object({
  label: z.string().trim().min(1, 'A címke megadása kötelező.'),
  to: z.string().trim().min(1, 'A hivatkozás megadása kötelező.'),
});

const mediaSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    url: z.string().trim().min(1),
    thumbnailUrl: z.string().trim().nullable().optional(),
    alt: z.string().trim().nullable().optional(),
    title: z.string().trim().nullable().optional(),
    mimeType: z.string().trim().nullable().optional(),
    category: z.string().trim().nullable().optional(),
    categoryLabel: z.string().trim().nullable().optional(),
    sourceContext: z.string().trim().nullable().optional(),
    sourceId: z.union([z.string(), z.number()]).nullable().optional(),
    fileName: z.string().trim().nullable().optional(),
    name: z.string().trim().min(1),
    sizes: z
      .object({
        thumbnail: z.string().trim().nullable().optional(),
        preview: z.string().trim().nullable().optional(),
        large: z.string().trim().nullable().optional(),
        original: z.string().trim().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .nullable();

const settingsSchema = z.object({
  siteName: z.string().trim().min(2, 'A webhely neve kötelező.'),
  logo: mediaSchema,
  phone: z.string().trim(),
  email: z.string().trim().email('Adj meg érvényes e-mail címet.').or(z.literal('')),
  address: z.string().trim(),
  whatsapp: z.string().trim(),
  facebook: z.string().trim(),
  instagram: z.string().trim(),
  tiktok: z.string().trim(),
  footerDescription: z.string().trim(),
  footerCopyright: z.string().trim(),
  footerQuickLinks: z.array(linkSchema),
  headerNavigation: z.array(linkSchema),
  primaryCtaText: z.string().trim(),
  primaryCtaLink: z.string().trim(),
  defaultSeoTitle: z.string().trim(),
  defaultSeoDescription: z.string().trim(),
  defaultOgImage: mediaSchema,
  metaPixelEnabled: z.boolean(),
  metaPixelId: z.string().trim(),
  imprintUrl: z.string().trim(),
  privacyUrl: z.string().trim(),
  termsUrl: z.string().trim(),
  cookieUrl: z.string().trim(),
  aboutContent: z.string().trim(),
  contactContent: z.string().trim(),
  imprintContent: z.string().trim(),
  privacyContent: z.string().trim(),
  termsContent: z.string().trim(),
  cookieContent: z.string().trim(),
});

const emptyValues: SiteSettingsFormValues = {
  siteName: '',
  logo: null,
  phone: '',
  email: '',
  address: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  footerDescription: '',
  footerCopyright: '',
  footerQuickLinks: [],
  headerNavigation: [],
  primaryCtaText: '',
  primaryCtaLink: '',
  defaultSeoTitle: '',
  defaultSeoDescription: '',
  defaultOgImage: null,
  metaPixelEnabled: false,
  metaPixelId: '',
  imprintUrl: '',
  privacyUrl: '',
  termsUrl: '',
  cookieUrl: '',
  aboutContent: '',
  contactContent: '',
  imprintContent: '',
  privacyContent: '',
  termsContent: '',
  cookieContent: '',
};

function normalizeMediaAsset(asset: MediaAsset): SiteSettingsMedia {
  return {
    id: asset.id,
    url: asset.url,
    thumbnailUrl: asset.thumbnailUrl ?? null,
    sizes: asset.sizes ?? null,
    alt: asset.alt ?? null,
    title: asset.title ?? null,
    mimeType: asset.mimeType ?? null,
    category: asset.category ?? undefined,
    categoryLabel: asset.categoryLabel ?? undefined,
    sourceContext: asset.sourceContext ?? null,
    sourceId: asset.sourceId ?? null,
    fileName: asset.fileName ?? undefined,
    name: asset.name,
  };
}

function LinkArrayEditor({
  title,
  description,
  items,
  onAdd,
  onRemove,
  baseName,
  control,
}: {
  title: string;
  description: string;
  items: Array<{ id: string }>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  baseName: 'headerNavigation' | 'footerQuickLinks';
  control: Control<SiteSettingsFormValues, any, any>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="grid gap-3 rounded-2xl border border-border/60 p-4 md:grid-cols-[1fr_1fr_auto]">
            <FormField
              control={control as never}
              name={`${baseName}.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Címke</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Kapcsolat" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control as never}
              name={`${baseName}.${index}.to`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hivatkozás</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="/kapcsolat vagy https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={() => onRemove(index)}>
                <Trash2 className="size-4" />
                Törlés
              </Button>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="size-4" />
          Új link
        </Button>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false);

  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(settingsSchema) as never,
    defaultValues: emptyValues,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
  });

  useEffect(() => {
    if (data?.items) {
      form.reset(toSiteSettingsFormValues(data.items));
    }
  }, [data, form]);

  const headerNavigation = useFieldArray({
    control: form.control,
    name: 'headerNavigation',
  });
  const footerQuickLinks = useFieldArray({
    control: form.control,
    name: 'footerQuickLinks',
  });

  const mutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: (response) => {
      form.reset(toSiteSettingsFormValues(response.items));
      toast.success('A site settings beállítások elmentve.');
    },
    onError: () => {
      toast.error('A site settings mentése nem sikerült.');
    },
  });

  async function handleMediaUpload(
    field: 'logo' | 'defaultOgImage',
    file: File | null,
    metadata: {
      alt?: string;
      title?: string;
      category?: MediaCategory;
    } = {},
  ) {
    if (!file) {
      return;
    }

    const setUploading = field === 'logo' ? setIsUploadingLogo : setIsUploadingOgImage;
    setUploading(true);

    try {
      const asset = await uploadMedia(file, {
        category: metadata.category ?? 'general',
        sourceContext: 'site_setting',
        sourceId: field,
        alt: metadata.alt,
        title: metadata.title,
      });

      form.setValue(field, normalizeMediaAsset(asset), { shouldDirty: true, shouldValidate: true });
      toast.success('A médiafájl feltöltve.');
    } catch {
      toast.error('A médiafájl feltöltése nem sikerült.');
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Beállítások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Site Settings</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A publikus header, footer, kontakt, CTA, social és globális SEO adatok központi kezelőfelülete.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Alapvető webhely beállítások.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Adria Holiday" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>Publikus kapcsolatfelvételi adatok.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} placeholder="+36 1 234 5678" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} placeholder="info@adriaholiday.hu" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} placeholder="36123456789" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="md:col-span-2">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} placeholder="1051 Budapest&#10;Példa utca 12." /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Social</CardTitle>
                <CardDescription>Publikus social profilok linkjei.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField control={form.control} name="facebook" render={({ field }) => (
                  <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input {...field} placeholder="https://facebook.com/..." /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="instagram" render={({ field }) => (
                  <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input {...field} placeholder="https://instagram.com/..." /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tiktok" render={({ field }) => (
                  <FormItem><FormLabel>TikTok</FormLabel><FormControl><Input {...field} placeholder="https://tiktok.com/@..." /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CTA</CardTitle>
                <CardDescription>Globális elsődleges CTA beállítások.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField control={form.control} name="primaryCtaText" render={({ field }) => (
                  <FormItem><FormLabel>Primary CTA text</FormLabel><FormControl><Input {...field} placeholder="Ajánlatot kérek" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="primaryCtaLink" render={({ field }) => (
                  <FormItem><FormLabel>Primary CTA link</FormLabel><FormControl><Input {...field} placeholder="/kapcsolat" /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>Footer szöveg és gyors linkek.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="footerDescription" render={({ field }) => (
                  <FormItem><FormLabel>Leírás</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Prémium buszos utazások Európa legszebb úti céljaihoz..." /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="footerCopyright" render={({ field }) => (
                  <FormItem><FormLabel>Copyright</FormLabel><FormControl><Input {...field} placeholder="© 2026 Adria Holiday. Minden jog fenntartva." /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Globális SEO fallbackek és OG média.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField control={form.control} name="defaultSeoTitle" render={({ field }) => (
                  <FormItem><FormLabel>Default SEO title</FormLabel><FormControl><Input {...field} placeholder="Adria Holiday" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="defaultSeoDescription" render={({ field }) => (
                  <FormItem><FormLabel>Default SEO description</FormLabel><FormControl><Textarea {...field} placeholder="Prémium buszos és repülős utazások..." /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <MediaPickerField
                  title="Brand logo"
                  media={field.value}
                  accept="image/*"
                  previewMode="image"
                  alt={field.value?.alt ?? ''}
                  mediaTitle={field.value?.title ?? ''}
                  category={(field.value?.category as MediaCategory) ?? 'general'}
                  onCategoryChange={() => undefined}
                  onAltChange={(value) => field.onChange({ ...(field.value ?? {}), alt: value })}
                  onTitleChange={(value) => field.onChange({ ...(field.value ?? {}), title: value })}
                  onFileChange={(file) => void handleMediaUpload('logo', file, { alt: field.value?.alt ?? undefined, title: field.value?.title ?? undefined })}
                  onDelete={() => field.onChange(null)}
                  isSaving={isUploadingLogo}
                />
              )}
            />

            <FormField
              control={form.control}
              name="defaultOgImage"
              render={({ field }) => (
                <MediaPickerField
                  title="Default OG image"
                  media={field.value}
                  accept="image/*"
                  previewMode="image"
                  alt={field.value?.alt ?? ''}
                  mediaTitle={field.value?.title ?? ''}
                  category={(field.value?.category as MediaCategory) ?? 'general'}
                  onCategoryChange={() => undefined}
                  onAltChange={(value) => field.onChange({ ...(field.value ?? {}), alt: value })}
                  onTitleChange={(value) => field.onChange({ ...(field.value ?? {}), title: value })}
                  onFileChange={(file) => void handleMediaUpload('defaultOgImage', file, { alt: field.value?.alt ?? undefined, title: field.value?.title ?? undefined })}
                  onDelete={() => field.onChange(null)}
                  isSaving={isUploadingOgImage}
                />
              )}
            />
          </div>

          <LinkArrayEditor
            title="Header navigation"
            description="A felső navigáció publikus menüpontjai."
            items={headerNavigation.fields}
            onAdd={() => headerNavigation.append({ label: '', to: '' })}
            onRemove={(index) => headerNavigation.remove(index)}
            baseName="headerNavigation"
            control={form.control}
          />

          <LinkArrayEditor
            title="Footer quick links"
            description="A footer gyors link blokk elemei."
            items={footerQuickLinks.fields}
            onAdd={() => footerQuickLinks.append({ label: '', to: '' })}
            onRemove={(index) => footerQuickLinks.remove(index)}
            baseName="footerQuickLinks"
            control={form.control}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Privát analytics konfigurációk, nem kerülnek ki a publikus API-ba.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField control={form.control} name="metaPixelEnabled" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Pixel enabled</FormLabel>
                    <FormControl>
                      <label className="flex items-center gap-3 rounded-xl border border-input px-3 py-2 text-sm">
                        <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                        Bekapcsolva
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="metaPixelId" render={({ field }) => (
                  <FormItem><FormLabel>Meta Pixel ID</FormLabel><FormControl><Input {...field} placeholder="1234567890" /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal</CardTitle>
                <CardDescription>Jogi oldalak publikus útvonalai.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField control={form.control} name="imprintUrl" render={({ field }) => (
                  <FormItem><FormLabel>Impresszum URL</FormLabel><FormControl><Input {...field} placeholder="/impresszum" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="privacyUrl" render={({ field }) => (
                  <FormItem><FormLabel>Adatkezelés URL</FormLabel><FormControl><Input {...field} placeholder="/adatvedelem" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="termsUrl" render={({ field }) => (
                  <FormItem><FormLabel>ÁSZF URL</FormLabel><FormControl><Input {...field} placeholder="/aszf" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cookieUrl" render={({ field }) => (
                  <FormItem><FormLabel>Cookie URL</FormLabel><FormControl><Input {...field} placeholder="/sutik" /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Legal page content</CardTitle>
              <CardDescription>Publikus placeholder vagy végleges tartalom a statikus oldalakhoz.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="aboutContent" render={({ field }) => (
                <FormItem><FormLabel>Rólunk tartalom</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Márkabemutatás..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contactContent" render={({ field }) => (
                <FormItem><FormLabel>Kapcsolat tartalom</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Kapcsolatfelvételi információk..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imprintContent" render={({ field }) => (
                <FormItem><FormLabel>Impresszum tartalom</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Cégadatok, üzemeltető..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="privacyContent" render={({ field }) => (
                <FormItem><FormLabel>Adatkezelés tartalom</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Adatkezelési tájékoztató..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="termsContent" render={({ field }) => (
                <FormItem><FormLabel>ÁSZF tartalom</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Szerződési feltételek..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cookieContent" render={({ field }) => (
                <FormItem><FormLabel>Cookie tartalom</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Cookie tájékoztató..." /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending || isUploadingLogo || isUploadingOgImage}>
              <Save className="size-4" />
              {mutation.isPending ? 'Mentés...' : 'Site settings mentése'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
