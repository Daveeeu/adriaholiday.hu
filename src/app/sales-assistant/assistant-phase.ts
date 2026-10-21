import type { AssistantPhase } from "./realtime-events";

type PhasePresentation = {
  label: string;
  hint: string;
  /** Tailwind classes of the status dot. */
  dotClassName: string;
};

export const PHASE_PRESENTATION: Record<AssistantPhase, PhasePresentation> = {
  idle: {
    label: "Készen áll",
    hint: "Indítsd el a beszélgetést, és mondd el, hova utaznál.",
    dotClassName: "bg-slate-300",
  },
  connecting: {
    label: "Kapcsolódás…",
    hint: "Engedélyezd a mikrofont, ha a böngésző kéri.",
    dotClassName: "bg-amber-400 animate-pulse",
  },
  listening: {
    label: "Hallgatlak",
    hint: "Beszélj nyugodtan, a tanácsadó figyel.",
    dotClassName: "bg-[#00c389]",
  },
  userSpeaking: {
    label: "Hallgatlak",
    hint: "Beszélj nyugodtan, a tanácsadó figyel.",
    dotClassName: "bg-[#00c389] animate-pulse",
  },
  thinking: {
    label: "Gondolkodom…",
    hint: "Utánanézek a katalógusunkban.",
    dotClassName: "bg-[#16b8ff] animate-pulse",
  },
  speaking: {
    label: "Válaszolok",
    hint: "Közbe is szólhatsz, ha mást szeretnél.",
    dotClassName: "bg-[#16b8ff]",
  },
  ended: {
    label: "Befejezve",
    hint: "Bármikor indíthatsz új beszélgetést.",
    dotClassName: "bg-slate-300",
  },
  error: {
    label: "Hiba történt",
    hint: "Valami közbejött, a részleteket lent látod.",
    dotClassName: "bg-red-500",
  },
};
