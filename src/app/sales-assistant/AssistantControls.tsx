import { KeyRound, Loader2, Mic, MicOff, PhoneOff } from "lucide-react";
import { type FormEvent, useState } from "react";

import type { AssistantPhase } from "./realtime-events";

type AssistantControlsProps = {
  phase: AssistantPhase;
  isLive: boolean;
  muted: boolean;
  accessCodeRequired: boolean;
  onStart: (accessCode: string | null) => void;
  onStop: () => void;
  onToggleMute: () => void;
};

const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-4 font-semibold text-white shadow-[0_8px_24px_rgba(0,195,137,0.25)] transition hover:shadow-[0_12px_30px_rgba(0,195,137,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00c389]/30 disabled:cursor-not-allowed disabled:opacity-70";

export default function AssistantControls({
  phase,
  isLive,
  muted,
  accessCodeRequired,
  onStart,
  onStop,
  onToggleMute,
}: AssistantControlsProps) {
  const [accessCode, setAccessCode] = useState("");

  if (isLive) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={muted}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00c389]/30 ${
            muted ? "border-amber-200 bg-amber-50 text-amber-800" : "border-[#dbe7f1] bg-white text-[#0f172a] hover:border-[#00c389]/40"
          }`}
        >
          {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          {muted ? "Némítva" : "Némítás"}
        </button>
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
        >
          <PhoneOff className="size-5" />
          Befejezés
        </button>
      </div>
    );
  }

  const connecting = phase === "connecting";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onStart(accessCodeRequired ? accessCode.trim() : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {accessCodeRequired ? (
        <label className="relative block">
          <span className="sr-only">Hozzáférési kód</span>
          <KeyRound className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            required
            autoComplete="off"
            placeholder="Demó hozzáférési kód"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            disabled={connecting}
            className="w-full rounded-2xl border border-[#dbe7f1] bg-[#f7fbff] py-4 pl-12 pr-4 text-[#0f172a] placeholder-gray-400 focus:border-[#00c389] focus:outline-none disabled:opacity-60"
          />
        </label>
      ) : null}
      <button type="submit" disabled={connecting} className={primaryButton}>
        {connecting ? <Loader2 className="size-5 animate-spin" /> : <Mic className="size-5" />}
        {connecting ? "Kapcsolódás…" : phase === "idle" ? "Beszélgetés indítása" : "Új beszélgetés"}
      </button>
    </form>
  );
}
