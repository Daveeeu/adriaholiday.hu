import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

import type { GuideChapter } from '../lib/user-guide.types';

type GuideTocProps = {
  chapters: GuideChapter[];
  activeChapterId?: string;
};

export function GuideToc({ chapters, activeChapterId }: GuideTocProps) {
  return (
    <nav aria-label="Kézikönyv fejezetei" className="space-y-1">
      <NavLink
        to="/user-guide"
        end
        className={({ isActive }) =>
          cn(
            'block rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
            isActive && 'bg-primary/10 text-primary',
          )
        }
      >
        Áttekintés
      </NavLink>

      {chapters.map((chapter) => {
        const Icon = chapter.icon;
        const isActive = chapter.id === activeChapterId;

        return (
          <div key={chapter.id}>
            <NavLink
              to={`/user-guide/${chapter.id}`}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                isActive && 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span>{chapter.title}</span>
            </NavLink>

            {isActive ? (
              <ul className="mb-2 ml-5 mt-1 space-y-0.5 border-l pl-3">
                {chapter.topics.map((topic) => (
                  <li key={topic.id}>
                    <a
                      href={`#${topic.id}`}
                      className="block rounded-lg px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {topic.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
