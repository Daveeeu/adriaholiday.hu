import { Badge } from '@/components/ui/badge';

type TourBooleanBadgeProps = {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
};

export function TourBooleanBadge({
  value,
  trueLabel = 'Igen',
  falseLabel = 'Nem',
}: TourBooleanBadgeProps) {
  return (
    <Badge
      className={[
        'whitespace-nowrap',
        value
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-50 text-slate-700',
      ].join(' ')}
    >
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}
