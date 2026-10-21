import { motion } from "motion/react";
import { CreditCard, Info, Loader2, MicOff, PhoneCall, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { usePortfolioResource } from "../hooks/usePortfolioResource";
import Seo from "../seo/Seo";
import AssistantControls from "./AssistantControls";
import AssistantRecommendations from "./AssistantRecommendations";
import AssistantTranscript from "./AssistantTranscript";
import AssistantVoiceOrb from "./AssistantVoiceOrb";
import { PHASE_PRESENTATION } from "./assistant-phase";
import { type SalesAssistantStatus, fetchSalesAssistantStatus } from "./sales-assistant-api";
import { SALES_ASSISTANT_PATH } from "./sales-assistant-path";
import { useSalesAssistant } from "./useSalesAssistant";

const TITLE = "AI utazási tanácsadó (demó)";
const DESCRIPTION = "Beszélgess hangalapú AI utazási tanácsadónkkal, és találd meg a hozzád illő utat az Adria Holiday kínálatából.";

const ease = [0.16, 1, 0.3, 1] as const;

export default function SalesAssistantRoute() {
  const status = usePortfolioResource("sales-assistant-status", fetchSalesAssistantStatus);

  return (
    <div className="min-h-screen bg-[#f7fbff]">
      <Seo title={TITLE} description={DESCRIPTION} canonicalPath={SALES_ASSISTANT_PATH} noIndex />

      <section className="relative overflow-hidden bg-[#071321] pb-36 pt-32 md:pt-36">
        <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[#00c389]/20 blur-[120px]" />
        <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-[#16b8ff]/20 blur-[120px]" />
        <motion.div
          className="relative mx-auto max-w-4xl px-6 text-center md:px-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-semibold tracking-wide text-[#5eead4]">
            AI UTAZÁSI TANÁCSADÓ · DEMÓ
          </span>
          <h1 className="mt-5 text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.045em] text-white">
            Mondd el, hova vágysz,{" "}
            <span className="bg-gradient-to-r from-[#34d399] to-[#38bdf8] bg-clip-text text-transparent">mi megkeressük az utad</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Beszélgess magyarul a tanácsadónkkal: elmondod, mikor, hányan és mennyiért utaznátok, ő pedig a katalógusunkból ajánl
            neked utakat.
          </p>
        </motion.div>
      </section>

      <div className="relative mx-auto -mt-24 max-w-6xl space-y-12 px-4 pb-24 sm:px-6 md:px-10">
        {status.status === "ready" && status.data.available ? (
          <AssistantWorkspace status={status.data} />
        ) : (
          <StatusCard loading={status.status === "loading"} />
        )}
      </div>
    </div>
  );
}

function AssistantWorkspace({ status }: { status: SalesAssistantStatus }) {
  const assistant = useSalesAssistant(status.maxRecommendations);
  const presentation = PHASE_PRESENTATION[assistant.phase];
  const orbStream = assistant.phase === "speaking" ? assistant.assistantVoice : assistant.microphone;

  return (
    <>
      <motion.div
        className="grid gap-6 lg:grid-cols-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.8, ease }}
      >
        <section className="flex flex-col rounded-[32px] border border-[#dbe7f1] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-8 lg:col-span-2">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f1f5f9] px-4 py-1.5 text-sm font-semibold text-[#0f172a]" role="status">
              <span className={`size-2.5 rounded-full ${presentation.dotClassName}`} />
              {assistant.muted ? "Némítva" : presentation.label}
            </span>
          </div>

          <div className="my-6">
            <AssistantVoiceOrb phase={assistant.phase} muted={assistant.muted} stream={orbStream} />
          </div>

          <p className="mb-6 min-h-[3rem] text-center text-[#475569]">
            {assistant.muted ? "A mikrofonod némítva van: a tanácsadó nem hall téged." : presentation.hint}
          </p>

          {assistant.notice ? (
            <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {assistant.notice}
            </p>
          ) : null}

          <div className="mt-auto">
            <AssistantControls
              phase={assistant.phase}
              isLive={assistant.isLive}
              muted={assistant.muted}
              accessCodeRequired={status.accessCodeRequired}
              onStart={(accessCode) => void assistant.start(accessCode)}
              onStop={assistant.stop}
              onToggleMute={assistant.toggleMute}
            />
          </div>
        </section>

        <div className="lg:col-span-3">
          <AssistantTranscript entries={assistant.transcript} />
        </div>
      </motion.div>

      <AssistantRecommendations trips={assistant.trips} maxRecommendations={status.maxRecommendations} />

      <DemoDisclaimer />
    </>
  );
}

function DisclaimerItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[#00a878]">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function DemoDisclaimer() {
  return (
    <aside className="rounded-[28px] border border-[#dbe7f1] bg-white p-6 text-sm text-[#475569] md:p-8">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#0f172a]">
        <Info className="size-5 text-[#16b8ff]" />
        Jó tudni a demóról
      </h2>
      <ul className="grid gap-4 md:grid-cols-2">
        <DisclaimerItem icon={<ShieldCheck className="size-5" />}>
          Ez egy kísérleti AI tanácsadó, amely tévedhet. Csak a katalógusunk adataiból válaszol, az árak és a szabad helyek tájékoztató
          jellegűek.
        </DisclaimerItem>
        <DisclaimerItem icon={<PhoneCall className="size-5" />}>
          Foglalást nem rögzít: a kiválasztott út oldalán tudsz foglalni, vagy{" "}
          <Link to="/kapcsolat" className="font-semibold text-[#00a878] hover:text-[#0f8fc9]">
            keresd irodánkat
          </Link>
          .
        </DisclaimerItem>
        <DisclaimerItem icon={<CreditCard className="size-5" />}>
          Soha nem kér bankkártya- vagy egyéb fizetési adatot. Ne add meg ezeket a beszélgetésben.
        </DisclaimerItem>
        <DisclaimerItem icon={<MicOff className="size-5" />}>
          A mikrofont csak a beszélgetés indításakor kérjük. A hangot és az átiratot nem tároljuk, a hangfeldolgozást az OpenAI végzi.
        </DisclaimerItem>
      </ul>
    </aside>
  );
}

function StatusCard({ loading }: { loading: boolean }) {
  return (
    <section className="rounded-[32px] border border-[#dbe7f1] bg-white p-8 text-center shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-12">
      {loading ? (
        <Loader2 className="mx-auto size-8 animate-spin text-[#00c389]" aria-label="Betöltés" />
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">Az AI tanácsadó most nem érhető el</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#64748b]">
            Böngéssz az utaink között, vagy keresd kollégáinkat, akik szívesen segítenek a választásban.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/utazasok"
              className="rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,195,137,0.25)]"
            >
              Utazások
            </Link>
            <Link to="/kapcsolat" className="rounded-2xl border border-[#dbe7f1] px-6 py-3 font-semibold text-[#0f172a]">
              Kapcsolat
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
