import { useRef } from 'react';

type AutoFocusHandler = (event: Event) => void;

/**
 * Focus handlers for a Radix dialog's content that give the focus back to
 * the element that had it before the dialog opened. Radix only returns it
 * to a Dialog.Trigger, so dialogs opened from state would otherwise drop the
 * focus to the page body and the next Tab would start from the top.
 */
export function useReturnFocus(
  onOpenAutoFocus?: AutoFocusHandler,
  onCloseAutoFocus?: AutoFocusHandler,
) {
  const openerRef = useRef<HTMLElement | null>(null);

  return {
    onOpenAutoFocus: (event: Event) => {
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);

      const opener = openerRef.current;
      openerRef.current = null;

      if (!event.defaultPrevented && opener?.isConnected) {
        event.preventDefault();
        opener.focus({ preventScroll: true });
      }
    },
  };
}
