import { Badge } from '@/components/ui/badge';

export function HomepageOfferStatusBadge({
  active,
}: {
  active: boolean;
}) {
  const className =
    active
      ? 'border-transparent bg-emerald-500/10 text-emerald-700'
      : 'border-transparent bg-muted text-muted-foreground';

  return <Badge className={className}>{active ? 'Aktív' : 'Inaktív'}</Badge>;
}
