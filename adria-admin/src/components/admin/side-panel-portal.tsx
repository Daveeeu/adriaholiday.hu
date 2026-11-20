import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { focusMainContent } from '@/components/layout/main-content';
import { trapTabKey } from '@/lib/focus-trap';

type SidePanelPortalProps = {
  /** Read out by screen readers when the panel opens. */
  label: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Renders a side panel directly under the body as a keyboard usable dialog.
 * Inside the scrolling main area Safari measures the panel's sticky parts
 * against that area and pushes them down by the height of the page header.
 *
 * Opening moves the focus into the panel, Tab stays inside it, Escape closes
 * it and closing gives the focus back to the button that opened it. Pop-ups
 * opened from the panel (dropdowns, dialogs) keep their own Escape and Tab.
 */
export function SidePanelPortal({
  label,
  onClose,
  children,
}: SidePanelPortalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    containerRef.current?.focus({ preventScroll: true });

    return () => {
      // A list re-rendered while the panel was open may have replaced the
      // button, then the focus goes to the page instead of being lost.
      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
      } else {
        focusMainContent();
      }
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const container = containerRef.current;

    // Keys from pop-ups portaled elsewhere bubble here through React.
    if (!container || !container.contains(event.target as Node)) {
      return;
    }

    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      trapTabKey(event, container);
    }
  }

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="outline-none"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>,
    document.body,
  );
}
