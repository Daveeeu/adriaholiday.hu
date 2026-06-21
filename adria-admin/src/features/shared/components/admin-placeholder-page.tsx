import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AdminPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
};

export function AdminPlaceholderPage({
  eyebrow,
  title,
  description,
  metrics,
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                {metric.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {metric.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
