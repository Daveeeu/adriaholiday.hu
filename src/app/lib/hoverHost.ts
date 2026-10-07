/**
 * Props for the element whose hover drives its children's "rest" / "hover"
 * motion variants (children declare `variants={{ rest, hover }}`).
 *
 * Put it on an element that neither moves on hover nor carries the
 * whileInView entrance:
 * - hover kept in React state re-rendered the list and replayed the
 *   entrance of every card (they faded out and slid in again: flicker);
 * - an element lifting itself on its own hover leaves the pointer behind at
 *   its edge, loses the hover and bounces;
 * - `animate` on the entrance element keeps whileInView from running.
 */
export const HOVER_HOST = {
  initial: "rest",
  animate: "rest",
  whileHover: "hover",
} as const;
