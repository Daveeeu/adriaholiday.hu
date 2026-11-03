import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import type { GuideChapter } from '../lib/user-guide.types';

import { GuideTopicSection } from './guide-topic-section';

type GuideChapterViewProps = {
  chapter: GuideChapter;
  previous?: GuideChapter;
  next?: GuideChapter;
};

export function GuideChapterView({
  chapter,
  previous,
  next,
}: GuideChapterViewProps) {
  const Icon = chapter.icon;

  return (
    <article className="space-y-6">
      <header className="space-y-3 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <h2 className="text-3xl font-semibold tracking-tight">
          {chapter.title}
        </h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {chapter.description}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {chapter.topics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              {topic.title}
            </a>
          ))}
        </div>
      </header>

      {chapter.topics.map((topic) => (
        <GuideTopicSection key={topic.id} topic={topic} />
      ))}

      <nav
        aria-label="Lapozás a fejezetek között"
        className="flex flex-wrap justify-between gap-3"
      >
        {previous ? (
          <Button asChild variant="outline">
            <Link to={`/user-guide/${previous.id}`}>
              <ArrowLeft className="size-4" />
              {previous.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link to={`/user-guide/${next.id}`}>
              {next.title}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </nav>
    </article>
  );
}
