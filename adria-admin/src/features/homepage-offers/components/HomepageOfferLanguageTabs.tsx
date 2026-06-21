import { cn } from '@/lib/utils';

import {
  HOMEPAGE_OFFER_LANGUAGE_LABELS,
} from '../lib/homepage-offers.constants';
import type { HomepageOfferLanguage } from '../lib/homepage-offers.types';

type HomepageOfferLanguageTabsProps = {
  activeLanguage: HomepageOfferLanguage;
  onLanguageChange: (language: HomepageOfferLanguage) => void;
};

export function HomepageOfferLanguageTabs({
  activeLanguage,
  onLanguageChange,
}: HomepageOfferLanguageTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(HOMEPAGE_OFFER_LANGUAGE_LABELS) as HomepageOfferLanguage[]).map(
        (language) => (
          <button
            key={language}
            type="button"
            onClick={() => onLanguageChange(language)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              activeLanguage === language
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {HOMEPAGE_OFFER_LANGUAGE_LABELS[language]}
          </button>
        ),
      )}
    </div>
  );
}
