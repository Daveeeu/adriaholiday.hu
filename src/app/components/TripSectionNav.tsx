import { type ReactNode, useEffect, useRef, useState } from "react";

import { TRIP_SECTION_ATTRIBUTE } from "../lib/tripSection";

type NavSection = { label: string; element: HTMLElement };

/** The space left between the bar and a section scrolled to. */
const SCROLL_GAP = 16;

/**
 * The trip page's sections below it as tabs, in a bar that sticks under the
 * site header while they scroll by: a tab scrolls to its section, and the
 * section being read is highlighted.
 */
export default function TripSectionNav({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [sections, setSections] = useState<NavSection[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // The sections are whatever the trip renders: an empty one is not on the page at all.
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const collect = () =>
      setSections(
        Array.from(container.querySelectorAll<HTMLElement>(`[${TRIP_SECTION_ATTRIBUTE}]`)).map((element) => ({
          label: element.getAttribute(TRIP_SECTION_ATTRIBUTE) ?? "",
          element,
        })),
      );

    collect();
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = barBottom(navRef.current) + SCROLL_GAP + 1;
      const passed = sections.filter((section) => section.element.getBoundingClientRect().top <= line).length;
      setActiveIndex(Math.max(0, passed - 1));
    };
    const schedule = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  // Keeps the highlighted tab in view when the bar scrolls sideways; only the
  // bar scrolls, so a smooth page scroll to a section is never cut short.
  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[activeIndex];

    if (!list || !tab) {
      return;
    }

    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;

    if (left < list.scrollLeft || right > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: left - SCROLL_GAP, behavior: "smooth" });
    }
  }, [activeIndex, sections]);

  function scrollToSection(section: NavSection) {
    const top = section.element.getBoundingClientRect().top + window.scrollY - barBottom(navRef.current) - SCROLL_GAP;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div ref={containerRef}>
      {sections.length > 1 ? (
        <nav
          ref={navRef}
          aria-label="Az utazás részletei"
          className="sticky top-0 z-30 -mx-8 mb-12 border-b border-gray-100 bg-white/90 px-8 py-3 backdrop-blur-md md:top-[77px] md:-mx-0 md:rounded-[24px] md:border md:px-3 md:shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
        >
          <ul ref={listRef} className="relative flex gap-2 overflow-x-auto pr-16 [scrollbar-width:none] md:pr-0 [&::-webkit-scrollbar]:hidden">
            {sections.map((section, index) => (
              <li key={`${section.label}-${index}`} className="shrink-0">
                <button
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => scrollToSection(section)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    index === activeIndex
                      ? "bg-[#00a878] text-white shadow-[0_8px_20px_rgba(0,168,120,0.25)]"
                      : "text-[#334155] hover:bg-[#f5f9fc] hover:text-[#00a878]"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {children}
    </div>
  );
}

/** Where the stuck bar ends, measured from the top of the viewport. */
function barBottom(nav: HTMLElement | null): number {
  if (!nav) {
    return 0;
  }

  return Number.parseFloat(getComputedStyle(nav).top) + nav.offsetHeight;
}
