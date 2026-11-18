import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { isChristmasSeason } from "./christmas-season";

const ChristmasCelebration = lazy(() => import("./ChristmasCelebration"));

/** What set the celebration off: five quick clicks on the logo, typing "hoho", or the gift box in the footer. */
export type ChristmasTrigger = "logo" | "hoho" | "gift";

type ChristmasContextValue = {
  inSeason: boolean;
  /** The logo wears a Santa hat once the visitor has found the easter egg. */
  hatOn: boolean;
  celebrate: (trigger: ChristmasTrigger) => void;
  tapLogo: () => void;
};

const OUT_OF_SEASON: ChristmasContextValue = {
  inSeason: false,
  hatOn: false,
  celebrate: () => undefined,
  tapLogo: () => undefined,
};

const ChristmasContext = createContext<ChristmasContextValue>(OUT_OF_SEASON);

const LOGO_TAPS = 5;
const LOGO_TAP_WINDOW_MS = 2000;
const MAGIC_WORD = "hoho";

function isTypingField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * The Christmas easter egg of the site, on during the Christmas season only
 * (see christmas-season.ts): five quick clicks on the logo or typing "hoho"
 * anywhere outside a form field lets it snow (the latter with a sleigh), and
 * the gift box in the footer hands out a coupon. The effects load on demand.
 */
export function ChristmasProvider({ children }: { children: ReactNode }) {
  const [inSeason] = useState(() => isChristmasSeason(new Date()));
  const [hatOn, setHatOn] = useState(false);
  const [celebration, setCelebration] = useState<{ id: number; trigger: ChristmasTrigger } | null>(null);
  const logoTaps = useRef<number[]>([]);

  const celebrate = useCallback((trigger: ChristmasTrigger) => {
    setHatOn(true);
    setCelebration((current) => ({ id: (current?.id ?? 0) + 1, trigger }));
  }, []);

  const endCelebration = useCallback(() => setCelebration(null), []);

  const tapLogo = useCallback(() => {
    const now = Date.now();
    const recent = [...logoTaps.current.filter((at) => now - at < LOGO_TAP_WINDOW_MS), now];

    logoTaps.current = recent.length >= LOGO_TAPS ? [] : recent;

    if (recent.length >= LOGO_TAPS) {
      celebrate("logo");
    }
  }, [celebrate]);

  useEffect(() => {
    if (!inSeason) {
      return;
    }

    let typed = "";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingField(event.target)) {
        return;
      }

      typed = (typed + event.key.toLowerCase()).slice(-MAGIC_WORD.length);

      if (typed === MAGIC_WORD) {
        typed = "";
        celebrate("hoho");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [celebrate, inSeason]);

  const value = useMemo(
    () => (inSeason ? { inSeason, hatOn, celebrate, tapLogo } : OUT_OF_SEASON),
    [celebrate, hatOn, inSeason, tapLogo],
  );

  return (
    <ChristmasContext.Provider value={value}>
      {children}
      {celebration ? (
        <Suspense fallback={null}>
          <ChristmasCelebration
            key={celebration.id}
            withSleigh={celebration.trigger === "hoho"}
            onEnd={endCelebration}
          />
        </Suspense>
      ) : null}
    </ChristmasContext.Provider>
  );
}

export function useChristmas(): ChristmasContextValue {
  return useContext(ChristmasContext);
}
