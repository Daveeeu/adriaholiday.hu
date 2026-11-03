import { ExternalLink, KeyRound, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { getRoutePermission } from '@/config/navigation-permissions';
import { useAuthStore } from '@/store/auth-store';

import type { GuideTopic } from '../lib/user-guide.types';

import { GuideBlockView } from './guide-block-view';

export function GuideTopicSection({ topic }: { topic: GuideTopic }) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const routePermission = topic.path
    ? getRoutePermission(topic.path)
    : undefined;
  const canOpen =
    Boolean(topic.path) && (!routePermission || hasPermission(routePermission));

  return (
    <section
      id={topic.id}
      className="scroll-mt-6 space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {topic.title}
          </h2>
          {topic.path && canOpen ? (
            <Button asChild variant="outline" size="sm">
              <Link to={topic.path}>
                <ExternalLink className="size-4" />
                Megnyitás az adminban
              </Link>
            </Button>
          ) : null}
        </div>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {topic.summary}
        </p>
        {topic.menu || topic.access ? (
          <div className="flex flex-wrap gap-2 text-xs">
            {topic.menu ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 font-medium">
                <Navigation className="size-3.5 text-primary" aria-hidden />
                Menü: {topic.menu}
              </span>
            ) : null}
            {topic.access ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 font-medium">
                <KeyRound className="size-3.5 text-primary" aria-hidden />
                Szükséges jogosultság: {topic.access}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="space-y-5">
        {topic.blocks.map((block, index) => (
          <GuideBlockView key={`${topic.id}-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}
