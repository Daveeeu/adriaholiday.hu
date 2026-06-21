import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { t } from '@/i18n';
import { saveSettings } from '@/services/dashboard-service';

const settingsSchema = z.object({
  companyName: z.string().min(2, t('validation.settings.companyName')),
  supportEmail: z.email(t('validation.settings.supportEmail')),
  timezone: z.string().min(3, t('validation.settings.timezone')),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const defaultValues: SettingsValues = {
  companyName: 'Adria Holiday',
  supportEmail: 'ops@adriaholiday.hu',
  timezone: 'Europe/Budapest',
};

export function SettingsPage() {
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values: SettingsValues) => saveSettings(values),
    onSuccess: () => {
      toast.success(t('settings.toast.success'));
    },
    onError: () => {
      toast.error(t('settings.toast.error'));
    },
  });

  function onSubmit(values: SettingsValues) {
    mutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t('settings.page.eyebrow')}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('settings.page.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('settings.page.description')}
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t('settings.card.title')}</CardTitle>
          <CardDescription>{t('settings.card.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.form.companyName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.form.companyNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('settings.form.companyNameHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.form.supportEmail')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.form.supportEmailPlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('settings.form.supportEmailHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.form.timezone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.form.timezonePlaceholder')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('settings.form.timezoneHelp')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={mutation.isPending}>
                <Save className="size-4" />
                {mutation.isPending ? t('common.loading') : t('settings.form.save')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
