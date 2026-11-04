import { useEffect } from "react";

import type { AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";
import { describeClick, reachedScrollThresholds } from "./interaction-events.js";

type Dispatch = (eventName: AnalyticsEventName, payload?: AnalyticsTrackPayload) => void;

const CLICKABLE = "a[href], button, [role='button'], summary";

/**
 * Where on the page an element sits: an explicit data-analytics-section, the
 * id of its section, the page landmark (header, footer, nav), or else the
 * heading of its section.
 */
function sectionOf(element: Element): string | null {
  const named = element.closest("[data-analytics-section]")?.getAttribute("data-analytics-section");
  const landmark = element.closest("header, footer, nav");
  const section = element.closest("section");

  return named
    ?? section?.getAttribute("id")
    ?? (landmark ? landmark.getAttribute("id") ?? landmark.tagName.toLowerCase() : null)
    ?? section?.querySelector("h1, h2, h3")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60)
    ?? null;
}

/**
 * Reports what visitors click (links and buttons, by their visible label and
 * page section) and how far they scroll each page (25/50/75/90%). `pageKey`
 * changes on navigation, which restarts the scroll milestones.
 */
export function useInteractionTracking(dispatch: Dispatch, pageKey: string) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest(CLICKABLE) : null;

      if (!target) {
        return;
      }

      const click = describeClick({
        tagName: target.tagName,
        text: target.getAttribute("aria-label") || (target as HTMLElement).innerText || target.textContent || "",
        href: target.getAttribute("href"),
        origin: window.location.origin,
        section: sectionOf(target),
      });

      if (click) {
        dispatch("ui_click", { metadata: click });
      }
    }

    document.addEventListener("click", handleClick, { capture: true });

    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [dispatch]);

  useEffect(() => {
    const reported = new Set<number>();
    let frame = 0;

    function measure() {
      frame = 0;
      const page = document.documentElement;

      for (const threshold of reachedScrollThresholds(window.scrollY, window.innerHeight, page.scrollHeight)) {
        if (!reported.has(threshold)) {
          reported.add(threshold);
          dispatch("scroll_depth", { metadata: { percent_scrolled: threshold } });
        }
      }
    }

    function handleScroll() {
      frame ||= window.requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [dispatch, pageKey]);
}
