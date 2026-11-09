import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders a side panel directly under the body. Inside the scrolling main
 * area Safari measures the panel's sticky parts against that area and pushes
 * them down by the height of the page header.
 */
export function SidePanelPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
