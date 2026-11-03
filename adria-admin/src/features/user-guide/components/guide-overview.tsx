import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { GuideChapter } from '../lib/user-guide.types';

export function GuideOverview({ chapters }: { chapters: GuideChapter[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hogyan használd ezt a kézikönyvet?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
          <p>
            A kézikönyv az adminfelület minden menüpontját végigveszi: mire való
            az adott oldal, mit jelent az egyes mezők és kapcsolók beállítása,
            és hol látszik az eredmény – a publikus weboldalon, az ügyfeleknek
            küldött e-mailekben, a partnerek XML feedjeiben vagy csak itt, az
            adminban.
          </p>
          <p>
            A fejezetek a bal oldali menü sorrendjét követik. A képekre
            kattintva nagyobb méretben is megnézheted őket. A keresőmezőbe írva
            bármelyik mezőnévre vagy kifejezésre rákereshetsz (ékezet nélkül is
            működik).
          </p>
          <p>
            A kézikönyvet minden bejelentkezett felhasználó látja,
            jogosultságtól függetlenül. Azokhoz a menüpontokhoz azonban,
            amelyekhez nincs jogosultságod, a menüben sem kapsz hozzáférést –
            ilyenkor a rendszergazdától kérhetsz jogot.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {chapters.map((chapter) => {
          const Icon = chapter.icon;

          return (
            <Link
              key={chapter.id}
              to={`/user-guide/${chapter.id}`}
              className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition group-hover:border-primary/40 group-hover:shadow-md">
                <CardHeader className="space-y-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle className="flex items-center justify-between gap-2">
                    {chapter.title}
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardTitle>
                  <CardDescription>{chapter.description}</CardDescription>
                  <p className="text-xs font-medium text-muted-foreground">
                    {chapter.topics.length} témakör
                  </p>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
