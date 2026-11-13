import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { authButtonClassName, authInputClassName } from '@/features/auth/lib/auth-styles';
import { useAuthStore } from '@/store/auth-store';
import { ApiError } from '@/lib/api-client';
import { t } from '@/i18n';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string; search?: string } } | null;
  const redirectPath = state?.from?.pathname
    ? `${state.from.pathname}${state.from.search ?? ''}`
    : '/';
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => signIn(values),
    onSuccess: () => {
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const payload = error.payload as {
          errors?: Record<string, string[]>;
          message?: string;
        } | null;

        if (payload?.errors) {
          for (const [name, messages] of Object.entries(payload.errors)) {
            form.setError(name as keyof LoginFormValues, {
              message: messages[0] ?? payload.message ?? t('common.error'),
            });
          }
          return;
        }

        form.setError('email', {
          message: payload?.message ?? t('common.error'),
        });
      }
    },
  });

  if (status === 'authenticated' && user) {
    return <Navigate replace to={redirectPath} />;
  }

  return (
    <AuthScreen
      heading="Belépés a tartalom- és foglaláskezelő felületre."
      lead="Jelentkezz be a folytatáshoz."
      icon={LockKeyhole}
      title="Admin belépés"
      description="Add meg az e-mail címedet és a jelszavadat."
    >
      <Form {...form}>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    placeholder="admin@example.com"
                    className={authInputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jelszó</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="current-password"
                    type="password"
                    placeholder="••••••••"
                    className={authInputClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className={authButtonClassName} type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Belépés...' : 'Belépés'}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </Form>
    </AuthScreen>
  );
}
