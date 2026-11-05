import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowDownWideNarrow, ArrowUp, ExternalLink, GripVertical, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/features/bookings/lib/bookings.utils';
import { cn } from '@/lib/utils';

import {
  getOrderedTourListItems,
  getOrderedTourLists,
  resetOrderedTourList,
  saveOrderedTourList,
} from '../lib/tours.api';
import type { OrderedTourList, OrderedTourListItem } from '../lib/tours.types';

const listsQueryKey = ['tour-list-orders'];

function listQueryKey(list: OrderedTourList) {
  return [...listsQueryKey, list.type, list.key];
}

function sameList(a: OrderedTourList | null, b: OrderedTourList) {
  return a?.type === b.type && a.key === b.key;
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
}

/** Cheapest first; tours without a price go last, keeping their current order. */
function sortByPrice(items: OrderedTourListItem[]) {
  return [...items].sort((a, b) => {
    if (a.price === null || b.price === null) {
      return Number(a.price === null) - Number(b.price === null);
    }

    return a.price - b.price;
  });
}

function sameOrder(a: OrderedTourListItem[], b: OrderedTourListItem[]) {
  return a.length === b.length && a.every((item, index) => item.id === b[index].id);
}

function ListPicker({
  title,
  description,
  lists,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  lists: OrderedTourList[];
  selected: OrderedTourList | null;
  onSelect: (list: OrderedTourList) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{description}</p>
      {lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nincs ilyen lista.</p>
      ) : (
        <div className="space-y-1">
          {lists.map((list) => (
            <button
              key={`${list.type}-${list.key}`}
              type="button"
              onClick={() => onSelect(list)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                sameList(selected, list) && 'bg-primary/10 font-semibold text-primary hover:bg-primary/10',
              )}
            >
              <span className="min-w-0 truncate">{list.label}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                {list.ordered ? <Badge className="border-primary/30 text-primary">kézi</Badge> : null}
                <span className="text-xs text-muted-foreground">{list.tourCount}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListEditor({ list, onDirtyChange }: { list: OrderedTourList; onDirtyChange: (dirty: boolean) => void }) {
  const queryClient = useQueryClient();
  // The order being edited; null while it matches the saved one.
  const [draft, setDraft] = useState<OrderedTourListItem[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: listQueryKey(list),
    queryFn: () => getOrderedTourListItems(list),
  });

  const items = draft ?? data ?? [];
  const isDirty = draft !== null && data !== undefined && !sameOrder(draft, data);
  const hasPlacedTours = (data ?? []).some((item) => item.placed);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSaved = (saved: OrderedTourListItem[], message: string) => {
    queryClient.setQueryData(listQueryKey(list), saved);
    queryClient.invalidateQueries({ queryKey: listsQueryKey, exact: true });
    setDraft(null);
    toast.success(message);
  };

  const saveMutation = useMutation({
    mutationFn: (orderedIds: string[]) => saveOrderedTourList(list, orderedIds),
    onSuccess: (saved) => onSaved(saved, 'A sorrend elmentve, a honlapon már így látszik.'),
  });
  const resetMutation = useMutation({
    mutationFn: () => resetOrderedTourList(list),
    onSuccess: (saved) => onSaved(saved, 'A lista visszaállt az alapértelmezett sorrendre.'),
  });
  const isBusy = saveMutation.isPending || resetMutation.isPending;

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a lista útjait.
      </div>
    );
  }

  const move = (from: number, to: number) => setDraft(moveItem(items, from, to));

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">{list.label}</h2>
          <p className="text-sm text-muted-foreground">
            {list.type === 'category'
              ? `A csempe kategóriaoldala (${list.categoryName}), országszűrővel együtt is.`
              : 'Az Utazások oldal, ha a látogató csak erre az országra szűr.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={isBusy || items.length < 2} onClick={() => setDraft(sortByPrice(items))}>
            <ArrowDownWideNarrow className="size-4" />
            Ár szerint
          </Button>
          {isDirty ? (
            <Button type="button" variant="outline" disabled={isBusy} onClick={() => setDraft(null)}>
              Mégse
            </Button>
          ) : null}
          {hasPlacedTours ? (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => {
                if (window.confirm('Visszaállítod a listát az alapértelmezett (Ajánlatok oldali) sorrendre?')) {
                  resetMutation.mutate();
                }
              }}
            >
              <RotateCcw className="size-4" />
              Alapértelmezett sorrend
            </Button>
          ) : null}
          <Button type="button" disabled={isBusy || !isDirty} onClick={() => saveMutation.mutate(items.map((item) => item.id))}>
            <Save className="size-4" />
            Mentés
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">Ezen a listán most nincs a honlapon megjelenő út.</p>
      ) : (
        <ol className="divide-y">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDraggingId(item.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggingId) {
                  move(items.findIndex((candidate) => candidate.id === draggingId), index);
                }
                setDraggingId(null);
              }}
              className={cn('flex items-center gap-3 px-4 py-2.5', draggingId === item.id && 'opacity-60')}
            >
              <span className="cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden>
                <GripVertical className="size-4" />
              </span>
              <span className="w-8 shrink-0 text-right text-sm font-semibold text-muted-foreground">{index + 1}.</span>
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" loading="lazy" />
              ) : (
                <span className="size-10 shrink-0 rounded-lg bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 truncate text-sm font-medium hover:underline"
                >
                  <span className="truncate">{item.name}</span>
                  <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                </a>
                {hasPlacedTours && !item.placed ? (
                  <p className="text-xs text-muted-foreground">Új a listán: még nincs elmentett helye</p>
                ) : null}
              </div>
              <span className="w-28 shrink-0 text-right text-sm text-muted-foreground">
                {item.price !== null ? formatMoney(item.price) : 'nincs ár'}
              </span>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Feljebb"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Lejjebb"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * The tour order of each homepage tile's category page and of each country,
 * set apart from the global order on the Ajánlatok page.
 */
export function TourListOrderPage() {
  const [selected, setSelected] = useState<OrderedTourList | null>(null);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: listsQueryKey,
    queryFn: getOrderedTourLists,
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Nem sikerült betölteni a listákat.
      </div>
    );
  }

  const current = selected ?? data.tiles[0] ?? data.countries[0] ?? null;
  const select = (list: OrderedTourList) => {
    if (sameList(current, list)) return;
    if (hasUnsavedOrder && !window.confirm('A lista sorrendje nincs elmentve. Elveted a módosítást?')) return;

    setHasUnsavedOrder(false);
    setSelected(list);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Körutazások</p>
        <h1 className="text-3xl font-semibold tracking-tight">Sorrend listánként</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Minden csempe és ország saját sorrendet kaphat, a többitől függetlenül. Húzd az utakat, vagy használd a nyilakat,
          az „Ár szerint” gomb a legolcsóbbal kezdi a listát. A „Mentés” után a honlap azonnal ezt a sorrendet mutatja.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <ListPicker
            title="Csempék"
            description="A főoldali ajánlatcsempék kategóriaoldalai."
            lists={data.tiles}
            selected={current}
            onSelect={select}
          />
          <ListPicker
            title="Országok"
            description="Az Utazások oldal egy országra szűrve."
            lists={data.countries}
            selected={current}
            onSelect={select}
          />
        </div>
        {current ? (
          <ListEditor key={`${current.type}-${current.key}`} list={current} onDirtyChange={setHasUnsavedOrder} />
        ) : (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Nincs rendezhető lista.</div>
        )}
      </div>
    </div>
  );
}
