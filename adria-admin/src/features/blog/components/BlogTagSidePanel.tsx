import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EntitySidePanel } from '@/components/admin/entity-side-panel';

import { BlogLanguageTabs } from './BlogLanguageTabs';
import { BLOG_LANGUAGE_LABELS } from '../lib/blog.constants';
import type { BlogLanguage } from '../lib/blog.types';
import {
  blogTagFormSchema,
  getBlogTagFormDefaults,
  normalizeBlogTagFormValues,
  type BlogTag,
  type BlogTagFormValues,
  type BlogTagUpsertInput,
} from '../lib/blog.types';

type BlogTagSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  tag?: BlogTag;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BlogTagUpsertInput) => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
};

function BlogTagDetailView({ tag }: { tag: BlogTag }) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{tag.translations.hu.name || '—'}</h3>
          <p className="text-sm text-muted-foreground">Címke részletei</p>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', tag.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
          {tag.active ? 'Aktív' : 'Inaktív'}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(tag.translations) as BlogLanguage[]).map((language) => (
          <div key={language} className="rounded-xl border bg-background p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {BLOG_LANGUAGE_LABELS[language]}
            </div>
            <div className="mt-2 text-sm font-medium">{tag.translations[language].name || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogTagSidePanel({
  open,
  mode,
  tag,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
  onToggleActive,
}: BlogTagSidePanelProps) {
  const [activeLanguage, setActiveLanguage] = useState<BlogLanguage>('hu');
  const form = useForm<BlogTagFormValues>({
    resolver: zodResolver(blogTagFormSchema),
    defaultValues: getBlogTagFormDefaults(tag),
  });

  useEffect(() => {
    if (open) {
      form.reset(getBlogTagFormDefaults(tag));
    }
  }, [form, open, tag]);

  if (!open) return null;

  const title =
    mode === 'create'
      ? 'Blog címke hozzáadása'
      : mode === 'edit'
        ? 'Blog címke szerkesztése'
        : 'Blog címke részletei';

  return (
    <EntitySidePanel
      open={open}
      title={title}
      description={mode === 'detail' ? 'A blog címke előnézete.' : 'A címkék nyelvenkénti nevei szerkeszthetők.'}
      onOpenChange={onOpenChange}
      headerActions={
        mode === 'detail' && tag ? (
          <>
            {onToggleActive ? (
              <Button type="button" variant="outline" onClick={onToggleActive}>
                {tag.active ? 'Deaktiválás' : 'Aktiválás'}
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
            <Button type="submit" disabled={submitting} form="blog-tag-panel-form">
              Mentés
            </Button>
          </div>
        )
      }
    >
      {mode === 'detail' && tag ? (
        <BlogTagDetailView tag={tag} />
      ) : (
        <Form {...form}>
          <form
            id="blog-tag-panel-form"
            className="flex min-h-full flex-col gap-5"
            onSubmit={form.handleSubmit((values) => onSubmit(normalizeBlogTagFormValues(values)))}
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

            <section className="rounded-2xl border bg-card p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Nyelvi tartalom</h3>
                <p className="text-sm text-muted-foreground">Minden nyelvnél külön név szerkeszthető.</p>
              </div>
              <div className="mt-4">
                <BlogLanguageTabs activeLanguage={activeLanguage} onLanguageChange={setActiveLanguage}>
                  {(language) => (
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
