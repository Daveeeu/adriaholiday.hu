import { useState, type KeyboardEvent } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { suggestTourSearchKeywords } from '../lib/tours.api';
import type { TourFormValues } from '../lib/tours.types';

type TourSearchKeywordsFieldProps = {
  form: UseFormReturn<TourFormValues>;
};

const keywordKey = (keyword: string) =>
  keyword.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

function mergeKeywords(current: string[], added: string[]): string[] {
  const seen = new Set(current.map(keywordKey));
  const merged = [...current];

  for (const keyword of added.map((item) => item.trim()).filter(Boolean)) {
    if (!seen.has(keywordKey(keyword))) {
      seen.add(keywordKey(keyword));
      merged.push(keyword);
    }
  }

  return merged;
}

/**
 * The words the public search finds the tour by. Visitors match whole words,
 * so "Róma" finds this tour but "Románia" does not.
 */
export function TourSearchKeywordsField({ form }: TourSearchKeywordsFieldProps) {
  const keywords = useWatch({ control: form.control, name: 'searchKeywords' }) ?? [];
  const active = useWatch({ control: form.control, name: 'active' });
  const [draft, setDraft] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  const setKeywords = (next: string[]) => form.setValue('searchKeywords', next, { shouldDirty: true });

  const addDraft = () => {
    setKeywords(mergeKeywords(keywords, draft.split(',')));
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addDraft();
    } else if (event.key === 'Backspace' && draft === '' && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  };

  const suggest = async () => {
    setSuggesting(true);

    try {
      const suggested = await suggestTourSearchKeywords(form.getValues('shortDescription'));
      const merged = mergeKeywords(keywords, suggested);

      if (merged.length === keywords.length) {
        toast.info('Az ismertető szövegből nem találtunk új helyszínt.');
      }

      setKeywords(merged);
    } catch {
      toast.error('A javaslatok most nem kérhetők le.');
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <FormItem className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FormLabel htmlFor="tour-search-keywords">Keresési kulcsszavak</FormLabel>
        <Button type="button" variant="outline" size="sm" onClick={suggest} disabled={suggesting}>
          {suggesting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Javaslat az ismertető szövegből
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border px-3 py-2">
        {keywords.map((keyword) => (
          <span key={keyword} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
            {keyword}
            <button
              type="button"
              onClick={() => setKeywords(keywords.filter((item) => item !== keyword))}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`${keyword} törlése`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <Input
          id="tour-search-keywords"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft.trim() !== '' && addDraft()}
          placeholder={keywords.length === 0 ? 'pl. Róma, Vatikán, Firenze' : 'Új kulcsszó…'}
          className="h-8 min-w-[160px] flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Enterrel vagy vesszővel adhatsz hozzá újat. A látogatók egész szóra keresnek: a „Róma” megtalálja ezt az utat,
        a „Románia” nem. Az út neve, országai és régiója magától is kereshető.
      </p>

      {active && keywords.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Nincs kulcsszó: a látogatók csak az út neve, országa és régiója alapján találják meg.
        </p>
      ) : null}
    </FormItem>
  );
}
