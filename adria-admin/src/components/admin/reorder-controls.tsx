import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { DragHandleProps } from '@/lib/use-drag-reorder';

type ReorderControlsProps = {
  /** The item's place in the list, from 0. */
  position: number;
  count: number;
  /** Names the item in its position badge ("kép" → "2. kép"). */
  itemLabel: string;
  onMove: (toPosition: number) => void;
  dragHandleProps: DragHandleProps;
};

/** A list item's drag handle, position and up/down buttons. */
export function ReorderControls({
  position,
  count,
  itemLabel,
  onMove,
  dragHandleProps,
}: ReorderControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        {...dragHandleProps}
        className="cursor-grab rounded-lg border bg-muted/60 p-2 text-muted-foreground active:cursor-grabbing"
        aria-label="Áthúzás máshová"
        title="Fogd meg és húzd az új helyére"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        {position + 1}. {itemLabel}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onMove(position - 1)}
          disabled={position === 0}
          aria-label="Feljebb"
          title="Feljebb"
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onMove(position + 1)}
          disabled={position === count - 1}
          aria-label="Lejjebb"
          title="Lejjebb"
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </div>
  );
}
