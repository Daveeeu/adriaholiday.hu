import { useRef, useState, type DragEvent } from 'react';

export type DragHandleProps = {
  draggable: true;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
};

/**
 * Reordering a list by dragging an item's handle onto another item: the
 * whole item is the drag image and the drop target, only the handle starts
 * the drag (so text in the item's fields can still be selected).
 */
export function useDragReorder(
  onMove: (key: string, toPosition: number) => void,
) {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const items = useRef<Record<string, HTMLElement | null>>({});

  const handleProps = (key: string): DragHandleProps => ({
    draggable: true,
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
      const item = items.current[key];
      if (item) {
        event.dataTransfer.setDragImage(item, 24, 24);
      }
      setDraggingKey(key);
    },
    onDragEnd: () => setDraggingKey(null),
  });

  const itemProps = (key: string, position: number) => ({
    ref: (element: HTMLElement | null) => {
      items.current[key] = element;
    },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (draggingKey) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (draggingKey) {
        onMove(draggingKey, position);
      }
      setDraggingKey(null);
    },
  });

  return { draggingKey, handleProps, itemProps };
}
