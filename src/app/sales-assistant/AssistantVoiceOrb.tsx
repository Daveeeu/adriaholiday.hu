import { AudioLines, Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { type CSSProperties, useRef } from "react";

import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useAudioLevel } from "./useAudioLevel";
import type { AssistantPhase } from "./realtime-events";

type AssistantVoiceOrbProps = {
  phase: AssistantPhase;
  muted: boolean;
  /** The stream the orb follows: the visitor's voice, or the consultant's while it speaks. */
  stream: MediaStream | null;
};

function PhaseIcon({ phase, muted }: { phase: AssistantPhase; muted: boolean }) {
  const className = "size-11 text-white drop-shadow-[0_2px_8px_rgba(7,19,33,0.25)]";

  if (phase === "connecting") {
    return <Loader2 className={`${className} animate-spin`} />;
  }

  if (phase === "speaking") {
    return <AudioLines className={className} />;
  }

  if (phase === "thinking") {
    return <Sparkles className={className} />;
  }

  return muted ? <MicOff className={className} /> : <Mic className={className} />;
}

/**
 * The consultant's presence: a sea-coloured orb that swells with the voice
 * being heard and turns while the consultant looks something up.
 */
export default function AssistantVoiceOrb({ phase, muted, stream }: AssistantVoiceOrbProps) {
  const levelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  useAudioLevel(muted ? null : stream, levelRef);

  const isActive = phase !== "idle" && phase !== "ended" && phase !== "error";
  const style = { "--audio-level": 0 } as CSSProperties;

  return (
    <div ref={levelRef} style={style} className="relative mx-auto flex size-56 items-center justify-center" aria-hidden="true">
      {/* Ripples that open up with the voice. */}
      <span
        className="absolute inset-0 rounded-full bg-[#00c389]/15 transition-transform duration-150 ease-out"
        style={{ transform: "scale(calc(0.82 + var(--audio-level) * 0.3))" }}
      />
      <span
        className="absolute inset-5 rounded-full bg-[#16b8ff]/15 transition-transform duration-150 ease-out"
        style={{ transform: "scale(calc(0.9 + var(--audio-level) * 0.22))" }}
      />

      {phase === "thinking" && !reducedMotion ? (
        <span className="absolute inset-7 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#16b8ff_120deg,transparent_240deg)] opacity-70 [animation-duration:1.6s]" />
      ) : null}

      <span
        className={`relative flex size-36 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_18px_50px_rgba(0,195,137,0.35)] transition-[transform,filter] duration-150 ease-out ${
          isActive ? "from-[#00c389] to-[#16b8ff]" : "from-[#7dd3c0] to-[#93c5fd] saturate-[0.85]"
        } ${phase === "idle" && !reducedMotion ? "animate-[orb-breathe_4s_ease-in-out_infinite]" : ""}`}
        style={{ transform: "scale(calc(1 + var(--audio-level) * 0.12))" }}
      >
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_55%)]" />
        <PhaseIcon phase={phase} muted={muted} />
      </span>
    </div>
  );
}
