import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Location } from '@/types/domain';

import { getLocationFormDefaults, locationFormSchema, type LocationFormValues } from '../lib/location-form';

type LocationFormSheetProps = {
  location: Location | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LocationFormValues) => void;
};

const textFields = [
  { name: 'seoTitle', label: 'Oldal címe (title)', placeholder: 'Üresen: „{hely} apartmanok”' },
  { name: 'seoDescription', label: 'Meta leírás', placeholder: 'Üresen a bevezető eleje' },
  { name: 'seoRobots', label: 'Robots', placeholder: 'pl. noindex, follow' },
] as const;

const richTextFields = [
  { name: 'description', label: 'Bevezető', description: 'Az apartmanlista fölött jelenik meg.' },
  { name: 'guide', label: 'Helyismertető', description: 'Az apartmanlista alatt jelenik meg; a fejezetcímek horgonyai (#strand_bibione) megmaradnak.' },
  {
    name: 'apartmentInformation',
    label: 'Információk az apartmanokhoz',
    description: 'A hely minden apartmanjának oldalán megjelenik (díjak, foglalási és fizetési feltételek).',
  },
] as const;

/**
 * Edits a location's public apartment page: where it lives, its texts above
 * and under the apartment list, the information block of its apartments and
 * its SEO fields.
 */
export function LocationFormSheet({ location, submitting, onOpenChange, onSubmit }: LocationFormSheetProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: location ? getLocationFormDefaults(location) : undefined,
  });

  const slug = useWatch({ control: form.control, name: 'slug' });

  useEffect(() => {
    if (location) {
      form.reset(getLocationFormDefaults(location));
    }
  }, [form, location]);

  return (
    <Sheet open={location !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{location?.name ?? 'Hely'}</SheetTitle>
          <SheetDescription>A hely apartmanoldalának címe, szövegei és SEO adatai.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form className="space-y-5 px-4 pb-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
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
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aktív</FormLabel>
                    <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm">
                      <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                      Az apartmanoldal megjelenik, ha van aktív apartmanja
                    </label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areaSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terület az URL-ben</FormLabel>
                    <FormControl>
                      <Input placeholder="veneto" {...field} />
                    </FormControl>
                    <FormDescription>/apartmanok/{field.value || '…'}/{slug}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terület neve</FormLabel>
                    <FormControl>
                      <Input placeholder="Veneto" {...field} />
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
                    <FormLabel>URL név</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {richTextFields.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{item.label}</FormLabel>
                    <FormDescription>{item.description}</FormDescription>
                    <FormControl>
                      <RichTextEditor value={field.value} onChange={field.onChange} minHeight={200} allowPreview />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="grid gap-4 md:grid-cols-2">
              {textFields.map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem className={item.name === 'seoRobots' ? undefined : 'md:col-span-2'}>
                      <FormLabel>{item.label}</FormLabel>
                      <FormControl>
                        <Input placeholder={item.placeholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Mégse
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Mentés…' : 'Mentés'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
