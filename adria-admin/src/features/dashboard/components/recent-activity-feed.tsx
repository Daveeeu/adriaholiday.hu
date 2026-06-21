import {
  CalendarClock,
  Link2,
  Mail,
  Ticket,
  MapPin,
  Building2,
  BookOpen,
  BusFront,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DashboardActivity } from '@/services/dashboard-service';
import { cn } from '@/lib/utils';

type RecentActivityFeedProps = {
  items: DashboardActivity[];
};

const activityStyles: Record<
  DashboardActivity['kind'],
  { icon: LucideIcon; badge: string }
> = {
  booking: {
    icon: CalendarClock,
    badge:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
  },
  message: {
    icon: Mail,
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  coupon: {
    icon: Ticket,
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  },
  tour: {
    icon: MapPin,
    badge:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
  },
  apartment: {
    icon: Building2,
    badge:
      'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300',
  },
  blog: {
    icon: BookOpen,
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
  },
  offer: {
    icon: Link2,
    badge:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
  },
  bus: {
    icon: BusFront,
    badge:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300',
  },
  system: {
    icon: CalendarClock,
    badge:
      'border-border bg-muted text-muted-foreground',
  },
};

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('hu-HU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle>Legutóbbi aktivitások</CardTitle>
        <CardDescription>
          A rendszerben legutóbb történt, fontos műveletek.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
            Jelenleg nincs megjeleníthető aktivitás.
          </div>
        ) : (
          items.map((item) => {
            const config = activityStyles[item.kind];
            const Icon = config.icon;

            return (
              <Link
                key={item.id}
                to={item.targetUrl}
                className={cn(
                  'group flex gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40',
                )}
              >
                <div className={cn('rounded-2xl border border-border/60 bg-background p-2', config.badge)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <Badge className={config.badge}>{formatTimestamp(item.timestamp)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
