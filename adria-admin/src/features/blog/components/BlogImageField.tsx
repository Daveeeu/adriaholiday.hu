import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { UseFormReturn } from 'react-hook-form';

import type { BlogArticleFormValues } from '../lib/blog.types';

type BlogImageFieldProps = {
  form: UseFormReturn<BlogArticleFormValues>;
};

export function BlogImageField({ form }: BlogImageFieldProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Borítókép</FormLabel>
            <FormControl>
              <Input placeholder="/uploads/blog/cover.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="imageTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kép címe</FormLabel>
            <FormControl>
              <Input placeholder="Nyári körutazási ötletek" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
