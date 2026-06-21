import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,195,137,0.20),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(22,184,255,0.22),transparent_26%),linear-gradient(135deg,#09111f_0%,#0f172a_45%,#172554_100%)] px-6 py-10 text-white">
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="size-4 text-emerald-300" />
              Adria Holiday admin
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
                Belépés a tartalom- és foglaláskezelő felületre.
              </h1>
              <p className="max-w-xl text-base text-white/70 md:text-lg">
                Az admin felület most már a Laravel backend által hitelesített
                felhasználóval működik. Jelentkezz be a folytatáshoz.
              </p>
            </div>

            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                'Sanctum token alapú auth',
                'Role és permission kezelés',
                'API + SPA egy domainen',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/12 bg-white/6 p-4 text-sm text-white/80 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <CardHeader className="space-y-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <LockKeyhole className="size-5" />
                </div>
                <CardTitle className="text-2xl">Admin belépés</CardTitle>
                <CardDescription className="text-white/60">
                  Add meg a Laravel backend admin fiókodat.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
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
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      className="h-11 w-full gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      type="submit"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? 'Belépés...' : 'Belépés'}
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
