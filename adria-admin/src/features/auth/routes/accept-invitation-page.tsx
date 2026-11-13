import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, CircleCheck, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthScreen } from '@/features/auth/components/auth-screen';
import { acceptInvitation } from '@/features/auth/lib/auth.api';
import { authButtonClassName, authInputClassName } from '@/features/auth/lib/auth-styles';
import { ApiError } from '@/lib/api-client';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Legalább 8 karakter szükséges.'),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'A jelszavak nem egyeznek.',
    path: ['passwordConfirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const INVALID_LINK_MESSAGE = 'A link érvénytelen vagy lejárt. Kérj új meghívót az adminisztrátortól.';

/** Where an invited admin user sets their first password from the emailed link. */
export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: PasswordFormValues) => acceptInvitation({ email, token, ...values }),
    onError: (error) => {
      const errors = error instanceof ApiError && error.status === 422
        ? (error.payload as { errors?: Record<string, string[]> } | null)?.errors
        : undefined;

      if (errors?.password?.[0]) {
        form.setError('password', { message: errors.password[0] });
        return;
      }

      form.setError('root', { message: errors ? INVALID_LINK_MESSAGE : 'Hiba történt, próbáld újra később.' });
    },
  });

  const frame = {
    heading: 'Állítsd be a jelszavadat.',
    lead: 'Utána az e-mail címeddel és az új jelszavaddal léphetsz be az admin felületre.',
    icon: KeyRound,
    title: 'Jelszó beállítása',
  };

  if (!token || !email) {
    return (
      <AuthScreen {...frame} description={INVALID_LINK_MESSAGE}>
        <BackToLoginButton />
      </AuthScreen>
    );
  }

  if (mutation.isSuccess) {
    return (
      <AuthScreen {...frame} icon={CircleCheck} title="Jelszó elmentve" description="Most már beléphetsz az új jelszavaddal.">
        <BackToLoginButton />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen {...frame} description={`Fiók: ${email}`}>
      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Új jelszó</FormLabel>
                <FormControl>
                  <Input autoComplete="new-password" type="password" className={authInputClassName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jelszó megerősítése</FormLabel>
                <FormControl>
                  <Input autoComplete="new-password" type="password" className={authInputClassName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root?.message ? (
            <p role="alert" className="text-sm text-red-300">{form.formState.errors.root.message}</p>
          ) : null}

          <Button className={authButtonClassName} type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Mentés...' : 'Jelszó mentése'}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </Form>
    </AuthScreen>
  );
}

function BackToLoginButton() {
  return (
    <Button asChild className={authButtonClassName}>
      <Link to="/">
        Tovább a belépéshez
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
