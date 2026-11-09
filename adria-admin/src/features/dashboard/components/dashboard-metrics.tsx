import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import type { DashboardMetric } from '@/services/dashboard-service';

type DashboardMetricsProps = {
  items: Array<DashboardMetric & { icon: LucideIcon }>;
};

export function DashboardMetrics({ items }: DashboardMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Link key={item.label} to={item.to} className="rounded-xl transition-opacity hover:opacity-80">
        <Card
          className="h-full overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/40"
        >
          <CardContent className="relative p-6">
            <div className="absolute right-4 top-4 rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
              <item.icon className="size-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {item.value}
            </p>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-muted-foreground">{item.hint}</p>
            </div>
          </CardContent>
        </Card>
        </Link>
      ))}
    </div>
  );
}
