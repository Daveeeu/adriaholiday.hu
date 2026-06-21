import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  BLOG_LANGUAGE_LABELS,
  BLOG_LANGUAGES,
} from '../lib/blog.constants';
import type { BlogLanguage } from '../lib/blog.types';

type BlogLanguageTabsProps = {
  activeLanguage: BlogLanguage;
  onLanguageChange: (language: BlogLanguage) => void;
  children: (language: BlogLanguage) => ReactNode;
};

export function BlogLanguageTabs({
  activeLanguage,
  onLanguageChange,
  children,
}: BlogLanguageTabsProps) {
  return (
    <Tabs
      value={activeLanguage}
      onValueChange={(value) => onLanguageChange(value as BlogLanguage)}
      className="space-y-4"
    >
      <TabsList>
        {BLOG_LANGUAGES.map((language) => (
          <TabsTrigger key={language} value={language}>
            {BLOG_LANGUAGE_LABELS[language]}
          </TabsTrigger>
        ))}
      </TabsList>
      {BLOG_LANGUAGES.map((language) => (
        <TabsContent key={language} value={language} className="space-y-4">
          {children(language)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
