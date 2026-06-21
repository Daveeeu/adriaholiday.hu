import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import {
  slugifyHomepageOffer,
} from '../lib/homepage-offers.constants';
import type {
  HomepageOfferFormValues,
  HomepageOfferLanguage,
} from '../lib/homepage-offers.types';
import { HomepageOfferImageField } from './HomepageOfferImageField';
import { HomepageOfferLanguageTabs } from './HomepageOfferLanguageTabs';

type HomepageOfferFormProps = {
  form: UseFormReturn<HomepageOfferFormValues>;
  activeLanguage: HomepageOfferLanguage;
  onLanguageChange: (language: HomepageOfferLanguage) => void;
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

export function HomepageOfferForm({
  form,
  activeLanguage,
  onLanguageChange,
}: HomepageOfferFormProps) {
  const translationName = form.watch(`translations.${activeLanguage}.name`);
  const seoAutoGenerate = form.watch(`translations.${activeLanguage}.seoAutoGenerate`);

  useEffect(() => {
    if (!seoAutoGenerate) {
      return;
    }

    const generated = slugifyHomepageOffer(translationName ?? '');
    const current = form.getValues(`translations.${activeLanguage}.seoName`);
    if (current !== generated) {
      form.setValue(`translations.${activeLanguage}.seoName`, generated, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [activeLanguage, form, seoAutoGenerate, translationName]);

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Alapadatok</h3>
          <p className="text-sm text-muted-foreground">
            Aktív státusz, sorrend, kép és link.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aktív</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    <ToggleButton active={field.value} label="Igen" onClick={() => field.onChange(true)} />
                    <ToggleButton active={!field.value} label="Nem" onClick={() => field.onChange(false)} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sorrend</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <HomepageOfferImageField form={form} />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input placeholder="/utazasok/korutazasok" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="text-base font-semibold">Nyelvi tartalmak</h3>
          <p className="text-sm text-muted-foreground">
            A név és SEO mezők nyelvenként szerkeszthetők.
          </p>
        </div>

        <HomepageOfferLanguageTabs
          activeLanguage={activeLanguage}
          onLanguageChange={onLanguageChange}
        />

        <div className="grid gap-4">
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
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <FormField
              control={form.control}
              name={`translations.${activeLanguage}.seoName`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>SEO név</FormLabel>
                    <FormField
                      control={form.control}
                      name={`translations.${activeLanguage}.seoAutoGenerate`}
                      render={({ field: autoField }) => (
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={autoField.value}
                            onChange={(event) =>
                              autoField.onChange(event.target.checked)
                            }
                          />
                          Automatikus generálás
                        </label>
                      )}
                    />
                  </div>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="ajanlat-nev"
                        value={field.value}
                        disabled={seoAutoGenerate}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const generated = slugifyHomepageOffer(translationName ?? '');
                          form.setValue(
                            `translations.${activeLanguage}.seoName`,
                            generated,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          );
                          form.setValue(
                            `translations.${activeLanguage}.seoAutoGenerate`,
                            true,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          );
                        }}
                      >
                        Generálás
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
