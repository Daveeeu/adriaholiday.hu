import { Sparkles, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AuthScreenProps = {
  heading: string;
  lead: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

/** The dark, full-screen frame of the pages used before signing in. */
export function AuthScreen({ heading, lead, icon: Icon, title, description, children }: AuthScreenProps) {
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
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">{heading}</h1>
              <p className="max-w-xl text-base text-white/70 md:text-lg">{lead}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-white/10 bg-slate-950/70 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <CardHeader className="space-y-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription className="text-white/60">{description}</CardDescription>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
