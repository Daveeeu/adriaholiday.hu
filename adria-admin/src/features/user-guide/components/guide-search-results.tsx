import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { GuideSearchResult } from '../lib/search-guide';

type GuideSearchResultsProps = {
  query: string;
  results: GuideSearchResult[];
  onSelect: () => void;
};

export function GuideSearchResults({
  query,
  results,
  onSelect,
}: GuideSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden />
        <p className="font-medium">Nincs találat erre: „{query}”</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Próbálj rövidebb vagy másik kifejezést, például egy mező nevét („SEO
          cím”, „kupon”, „felár”).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{results.length} találat</p>
      <ul className="space-y-3">
        {results.map(({ chapter, topic, excerpt }) => (
          <li key={`${chapter.id}-${topic.id}`}>
            <Link
              to={`/user-guide/${chapter.id}#${topic.id}`}
              onClick={onSelect}
              className="block rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-xs font-medium text-primary">
                {chapter.title}
              </p>
              <p className="mt-1 font-semibold">{topic.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
