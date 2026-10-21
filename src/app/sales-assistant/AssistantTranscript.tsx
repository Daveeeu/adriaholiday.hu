import { MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { type TranscriptEntry, visibleTranscript } from "./realtime-events";

const EXAMPLE_REQUESTS = [
  "Júliusban mennénk Horvátországba busszal, ketten.",
  "Adventi vásárt keresek decemberre, fejenként 60 ezer forint alatt.",
  "Honnan lehet felszállni a buszra, és mennyibe kerül ketten?",
];

function TypingDots() {
  return (
    <span className="inline-flex gap-1 align-middle" aria-label="folyamatban">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="size-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}

export default function AssistantTranscript({ entries }: { entries: TranscriptEntry[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const visible = visibleTranscript(entries);

  useEffect(() => {
    const element = scroller.current;
    if (element) {
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    }
  }, [entries]);

  return (
    <section className="flex h-[420px] flex-col rounded-[32px] border border-[#dbe7f1] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.06)] lg:h-full lg:min-h-[520px]">
      <header className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e6faf4] text-[#00a878]">
          <MessageCircle className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">Beszélgetés</h2>
          <p className="text-sm text-[#64748b]">Élő átirat – a beszélgetés végén eltűnik.</p>
        </div>
      </header>

      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-6 py-6" aria-live="polite" aria-relevant="additions text">
        {visible.length === 0 ? (
          <div className="flex h-full flex-col justify-center gap-3 text-[#64748b]">
            <p className="font-semibold text-[#0f172a]">Mondd el a saját szavaiddal, például:</p>
            <ul className="space-y-2">
              {EXAMPLE_REQUESTS.map((example) => (
                <li key={example} className="rounded-2xl bg-[#f7fbff] px-4 py-3 text-sm italic">
                  „{example}”
                </li>
              ))}
            </ul>
          </div>
        ) : (
          visible.map((entry) => {
            const isUser = entry.role === "user";

            return (
              <div key={entry.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <span className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                  {isUser ? "Te" : "Adria tanácsadó"}
                </span>
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
                    isUser ? "rounded-br-lg bg-[#0f172a] text-white" : "rounded-bl-lg border border-[#d5f3ea] bg-[#f1fbf8] text-[#0f172a]"
                  }`}
                >
                  {entry.text || <TypingDots />}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
