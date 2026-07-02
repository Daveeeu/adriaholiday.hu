import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MediaPicker } from '@/components/media/media-picker';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import type { BlogArticleFormValues } from '../lib/blog.types';

type BlogImageFieldProps = {
  form: UseFormReturn<BlogArticleFormValues>;
};

export function BlogImageField({ form }: BlogImageFieldProps) {
  const imageTitle = useWatch({
    control: form.control,
    name: 'imageTitle',
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <MediaPicker
                label="Borítókép"
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? '')}
                description="Kép feltöltése a gépről vagy kiválasztás a médiatárból."
                defaultCategory="blog"
                sourceContext="blog_article"
                uploadAlt={imageTitle || undefined}
                uploadTitle={imageTitle || undefined}
              />
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
              <input
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                placeholder="Nyári körutazási ötletek"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
