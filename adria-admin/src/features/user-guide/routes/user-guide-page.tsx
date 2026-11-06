import { Search, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { GuideChapterView } from '../components/guide-chapter-view';
import { GuideOverview } from '../components/guide-overview';
import { GuideSearchResults } from '../components/guide-search-results';
import { GuideToc } from '../components/guide-toc';
import { USER_GUIDE_CHAPTERS } from '../content';
import { searchGuide } from '../lib/search-guide';

/** Brings the topic named in the URL hash into view once the chapter has rendered. */
function useScrollToHash(hash: string, chapterId?: string) {
  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    const target = id ? document.getElementById(id) : null;

    if (target) {
      target.scrollIntoView({ block: 'start' });
      return;
    }

    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [hash, chapterId]);
}

export function UserGuidePage() {
  const { chapterId } = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const chapterIndex = USER_GUIDE_CHAPTERS.findIndex(
    (chapter) => chapter.id === chapterId,
  );
  const chapter =
    chapterIndex >= 0 ? USER_GUIDE_CHAPTERS[chapterIndex] : undefined;
  const results = useMemo(
    () => searchGuide(USER_GUIDE_CHAPTERS, deferredQuery),
    [deferredQuery],
  );
  const isSearching = deferredQuery.trim() !== '';

  useScrollToHash(hash, chapterId);

  if (chapterId && !chapter) {
    return <Navigate replace to="/user-guide" />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Súgó</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Felhasználói kézikönyv
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Részletes leírás az adminfelület minden oldaláról és beállításáról:
          mire való, hogyan kell kitölteni és hol jelenik meg az eredménye.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Keresés a kézikönyvben (pl. kupon, SEO cím, felár, SimplePay)..."
          aria-label="Keresés a kézikönyvben"
          className="pl-9 pr-10"
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
            onClick={() => setQuery('')}
            aria-label="Keresés törlése"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-0 max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-2xl border bg-card p-2">
            <GuideToc
              chapters={USER_GUIDE_CHAPTERS}
              activeChapterId={chapter?.id}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <select
            value={chapter?.id ?? ''}
            onChange={(event) =>
              navigate(
                event.target.value
                  ? `/user-guide/${event.target.value}`
                  : '/user-guide',
              )
            }
            aria-label="Fejezet kiválasztása"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm xl:hidden"
          >
            <option value="">Áttekintés</option>
            {USER_GUIDE_CHAPTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>

          {isSearching ? (
            <GuideSearchResults
              query={deferredQuery}
              results={results}
              onSelect={() => setQuery('')}
            />
          ) : chapter ? (
            <GuideChapterView
              chapter={chapter}
              previous={USER_GUIDE_CHAPTERS[chapterIndex - 1]}
              next={USER_GUIDE_CHAPTERS[chapterIndex + 1]}
            />
          ) : (
            <GuideOverview chapters={USER_GUIDE_CHAPTERS} />
          )}
        </div>
      </div>
    </div>
  );
}
