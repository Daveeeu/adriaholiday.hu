import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EntitySidePanel } from '@/components/admin/entity-side-panel';

import { BlogLanguageTabs } from './BlogLanguageTabs';
import { BLOG_CATEGORY_COLUMNS, BLOG_LANGUAGE_LABELS, slugifyBlogText } from '../lib/blog.constants';
import type { BlogLanguage } from '../lib/blog.types';
import {
  blogCategoryFormSchema,
  getBlogCategoryFormDefaults,
  normalizeBlogCategoryFormValues,
  type BlogCategory,
  type BlogCategoryFormValues,
  type BlogCategoryUpsertInput,
} from '../lib/blog.types';

type BlogCategorySidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  category?: BlogCategory;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BlogCategoryUpsertInput) => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
};

function BlogCategoryDetailView({ category }: { category: BlogCategory }) {
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{category.translations.hu.name || '—'}</h3>
            <p className="text-sm text-muted-foreground">{category.seoName}</p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', category.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
            {category.active ? 'Aktív' : 'Inaktív'}
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Oszlop</div>
            <div className="mt-1 text-sm font-medium">
              {BLOG_CATEGORY_COLUMNS.find((item) => item.value === category.column)?.label ?? category.column}
            </div>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">ID</div>
            <div className="mt-1 text-sm font-medium">{category.id}</div>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Nyelvi tartalmak</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(Object.keys(category.translations) as BlogLanguage[]).map((language) => {
            const translation = category.translations[language];
            return (
              <div key={language} className="rounded-xl border bg-background p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {BLOG_LANGUAGE_LABELS[language]}
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
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function BlogCategorySidePanel({
  open,
  mode,
  category,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
  onToggleActive,
}: BlogCategorySidePanelProps) {
  const [activeLanguage, setActiveLanguage] = useState<BlogLanguage>('hu');
  const form = useForm<BlogCategoryFormValues>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: getBlogCategoryFormDefaults(category),
  });

  const huName = useWatch({ control: form.control, name: 'translations.hu.name' });
  const huAuto = useWatch({ control: form.control, name: 'translations.hu.seoAutoGenerate' });
  const enName = useWatch({ control: form.control, name: 'translations.en.name' });
  const enAuto = useWatch({ control: form.control, name: 'translations.en.seoAutoGenerate' });
  const deName = useWatch({ control: form.control, name: 'translations.de.name' });
  const deAuto = useWatch({ control: form.control, name: 'translations.de.seoAutoGenerate' });
  const seoAutoByLanguage: Record<BlogLanguage, boolean> = {
    hu: !!huAuto,
    en: !!enAuto,
    de: !!deAuto,
  };

  useEffect(() => {
    if (open) {
      form.reset(getBlogCategoryFormDefaults(category));
    }
  }, [category, form, open]);

  useEffect(() => {
    if (huAuto) {
      form.setValue('translations.hu.seoName', slugifyBlogText(huName ?? ''), { shouldDirty: true });
    }
  }, [form, huAuto, huName]);
  useEffect(() => {
    if (enAuto) {
      form.setValue('translations.en.seoName', slugifyBlogText(enName ?? ''), { shouldDirty: true });
    }
  }, [enAuto, enName, form]);
  useEffect(() => {
    if (deAuto) {
      form.setValue('translations.de.seoName', slugifyBlogText(deName ?? ''), { shouldDirty: true });
    }
  }, [deAuto, deName, form]);

  if (!open) return null;

  const title =
    mode === 'create'
      ? 'Blog kategória hozzáadása'
      : mode === 'edit'
        ? 'Blog kategória szerkesztése'
        : 'Blog kategória részletei';

  return (
    <EntitySidePanel
      open={open}
      title={title}
      description={mode === 'detail' ? 'A blog kategória előnézete.' : 'Nyelvi nevek, SEO és oszlop beállítások.'}
      onOpenChange={onOpenChange}
      headerActions={
        mode === 'detail' && category ? (
          <>
            {onToggleActive ? (
              <Button type="button" variant="outline" onClick={onToggleActive}>
                {category.active ? 'Deaktiválás' : 'Aktiválás'}
              </Button>
            ) : null}
            {onDelete ? (
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                Törlés
              </Button>
            ) : null}
          </>
        ) : null
      }
      footer={
        mode === 'detail' ? null : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {mode === 'edit' && onDelete ? (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={submitting}>
                <Trash2 className="size-4" />
                Törlés
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Mégse
            </Button>
            <Button type="submit" disabled={submitting} form="blog-category-panel-form">
              Mentés
            </Button>
          </div>
        )
      }
    >
      {mode === 'detail' && category ? (
        <BlogCategoryDetailView category={category} />
      ) : (
        <Form {...form}>
          <form
            id="blog-category-panel-form"
            className="flex min-h-full flex-col gap-5"
            onSubmit={form.handleSubmit((values) => onSubmit(normalizeBlogCategoryFormValues(values)))}
          >
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem>
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                          <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                          Aktív
                        </label>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="column"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oszlop</FormLabel>
                        <FormControl>
                          <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" {...field}>
                            {BLOG_CATEGORY_COLUMNS.map((item) => (
                              <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <section className="rounded-2xl border bg-card p-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Nyelvi tartalom</h3>
                      <p className="text-sm text-muted-foreground">Minden nyelvnél külön név és SEO mező áll rendelkezésre.</p>
                    </div>
                    <div className="mt-4">
                      <BlogLanguageTabs activeLanguage={activeLanguage} onLanguageChange={setActiveLanguage}>
                        {(language) => (
                          <div className="space-y-4">
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
                                    <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                                    Automatikus generálás
                                  </label>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </BlogLanguageTabs>
                    </div>
                  </section>

          </form>
        </Form>
      )}
    </EntitySidePanel>
  );
}
