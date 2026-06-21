import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { BUS_LANGUAGE_LABELS, BUS_LANGUAGES } from '../lib/buses.constants';
import type { BusLanguage } from '../lib/buses.types';

type BusLanguageTabsProps = {
  activeLanguage: BusLanguage;
  onLanguageChange: (language: BusLanguage) => void;
};

export function BusLanguageTabs({
  activeLanguage,
  onLanguageChange,
}: BusLanguageTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BUS_LANGUAGES.map((language) => (
        <Button
          key={language}
          type="button"
          variant={activeLanguage === language ? 'default' : 'outline'}
          size="sm"
          className={cn('min-w-24 justify-center')}
          onClick={() => onLanguageChange(language)}
        >
          {BUS_LANGUAGE_LABELS[language]}
        </Button>
      ))}
    </div>
  );
}
