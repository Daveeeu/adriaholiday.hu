import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { BlogLanguageTabs } from './BlogLanguageTabs';
import { BlogImageField } from './BlogImageField';
import { BLOG_LANGUAGE_LABELS, slugifyBlogText } from '../lib/blog.constants';
import type { BlogLanguage } from '../lib/blog.types';
import {
  blogArticleFormSchema,
  getBlogArticleFormDefaults,
  normalizeBlogArticleFormValues,
  type BlogArticle,
  type BlogArticleFormValues,
  type BlogArticleUpsertInput,
} from '../lib/blog.types';

type BlogArticleSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  article?: BlogArticle;
  categoryOptions: Array<{ value: string; label: string }>;
  tagOptions: Array<{ value: string; label: string }>;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BlogArticleUpsertInput) => void;
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
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">
        {typeof value === 'boolean' ? (value ? 'Igen' : 'Nem') : value ?? '—'}
      </div>
    </div>
  );
}

function BlogArticleDetailView({ article }: { article: BlogArticle }) {
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {article.translations.hu.title || '—'}
            </h3>
            <p className="text-sm text-muted-foreground">{article.seoName}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              article.active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700',
            )}
          >
            {article.active ? 'Aktív' : 'Inaktív'}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard label="ID" value={article.id} />
          <DetailCard label="Dátum" value={article.publishedAt} />
          <DetailCard label="Megjelenik" value={article.showOnHomepage} />
          <DetailCard label="Megnyitva" value={article.views} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DetailCard label="Kép címe" value={article.imageTitle} />
          <DetailCard label="Kategóriák" value={article.categoryIds.length} />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Nyelvi tartalmak</h4>
        <div className="grid gap-3 md:grid-cols-3">
          {(Object.keys(article.translations) as BlogLanguage[]).map((language) => {
            const translation = article.translations[language];

            return (
              <div key={language} className="rounded-xl border bg-background p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {BLOG_LANGUAGE_LABELS[language]}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Cím: </span>
                    <span>{translation.title || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium">SEO: </span>
                    <span>{translation.seoName || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Kivonat: </span>
                    <span>{translation.excerpt || '—'}</span>
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

export function BlogArticleSidePanel({
  open,
  mode,
  article,
  categoryOptions,
  tagOptions,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
  onToggleActive,
}: BlogArticleSidePanelProps) {
  const [activeLanguage, setActiveLanguage] = useState<BlogLanguage>('hu');

  const form = useForm<BlogArticleFormValues>({
    resolver: zodResolver(blogArticleFormSchema),
    defaultValues: getBlogArticleFormDefaults(article),
  });

  const huTitle = useWatch({ control: form.control, name: 'translations.hu.title' });
  const huAuto = useWatch({ control: form.control, name: 'translations.hu.seoAutoGenerate' });
  const enTitle = useWatch({ control: form.control, name: 'translations.en.title' });
  const enAuto = useWatch({ control: form.control, name: 'translations.en.seoAutoGenerate' });
  const deTitle = useWatch({ control: form.control, name: 'translations.de.title' });
  const deAuto = useWatch({ control: form.control, name: 'translations.de.seoAutoGenerate' });
  const seoAutoByLanguage: Record<BlogLanguage, boolean> = {
    hu: !!huAuto,
    en: !!enAuto,
    de: !!deAuto,
  };

  useEffect(() => {
    if (open) {
      form.reset(getBlogArticleFormDefaults(article));
    }
  }, [article, form, open]);

  useEffect(() => {
    if (huAuto) {
      form.setValue('translations.hu.seoName', slugifyBlogText(huTitle ?? ''), {
        shouldDirty: true,
      });
    }
  }, [form, huAuto, huTitle]);

  useEffect(() => {
    if (enAuto) {
      form.setValue('translations.en.seoName', slugifyBlogText(enTitle ?? ''), {
        shouldDirty: true,
      });
    }
  }, [enAuto, enTitle, form]);

  useEffect(() => {
    if (deAuto) {
      form.setValue('translations.de.seoName', slugifyBlogText(deTitle ?? ''), {
        shouldDirty: true,
      });
    }
  }, [deAuto, deTitle, form]);

  const title =
    mode === 'create'
      ? 'Blog cikk hozzáadása'
      : mode === 'edit'
        ? 'Blog cikk szerkesztése'
        : 'Blog cikk részletei';

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
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,1200px)] flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'detail'
                ? 'A blog cikk teljes előnézete.'
                : 'Aktív státusz, főoldali megjelenés, borítókép és többnyelvű tartalom.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'detail' && article ? (
              <>
                {onToggleActive ? (
                  <Button type="button" variant="outline" onClick={onToggleActive}>
                    {article.active ? 'Deaktiválás' : 'Aktiválás'}
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
            {mode === 'detail' && article ? (
              <BlogArticleDetailView article={article} />
            ) : (
              <Form {...form}>
                <form
                  className="flex min-h-full flex-col gap-5"
                  onSubmit={form.handleSubmit((values) => onSubmit(normalizeBlogArticleFormValues(values)))}
                >
                  <div className="grid gap-4 md:grid-cols-2">
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
                      name="showOnHomepage"
                      render={({ field }) => (
                        <FormItem>
                          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(event) => field.onChange(event.target.checked)}
                            />
                            Megjelenjen a főoldalon?
                          </label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="publishedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dátum</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <BlogImageField form={form} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategóriák</FormLabel>
                          <FormControl>
                            <select
                              multiple
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(
                                  Array.from(event.target.selectedOptions).map((option) => option.value),
                                )
                              }
                              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            >
                              {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tagIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Címkék</FormLabel>
                          <FormControl>
                            <select
                              multiple
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(
                                  Array.from(event.target.selectedOptions).map((option) => option.value),
                                )
                              }
                              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            >
                              {tagOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <section className="rounded-2xl border bg-card p-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Nyelvi tartalom
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Minden nyelvnél a cím, SEO, kivonat és tartalom külön szerkeszthető.
                      </p>
                    </div>

                    <div className="mt-4">
                      <BlogLanguageTabs
                        activeLanguage={activeLanguage}
                        onLanguageChange={setActiveLanguage}
                      >
                        {(language) => (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`translations.${language}.title` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cím</FormLabel>
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
                                      <Input {...field} readOnly={seoAutoByLanguage[language]} />
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

                            <FormField
                              control={form.control}
                              name={`translations.${language}.excerpt` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kivonat</FormLabel>
                                  <FormControl>
                                    <Textarea className="min-h-28" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`translations.${language}.content` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tartalom</FormLabel>
                                  <FormControl>
                                    <Textarea className="min-h-56" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </BlogLanguageTabs>
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
