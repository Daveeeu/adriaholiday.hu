import { useCallback } from "react";
import { Download, FileText, Loader2, Printer, type LucideIcon } from "lucide-react";

import { useAnalytics } from "../analytics/useAnalytics";
import { useOfferProgramPdf, type ProgramPdfAction } from "../hooks/useOfferProgramPdf";

type OfferPrintableVersionProps = {
  slug: string;
};

const ACTION_BUTTONS: Array<{ action: ProgramPdfAction; label: string; icon: LucideIcon }> = [
  { action: "download", label: "Letöltés", icon: Download },
  { action: "print", label: "Nyomtatás", icon: Printer },
];

export default function OfferPrintableVersion({ slug }: OfferPrintableVersionProps) {
  const { trackEvent } = useAnalytics();

  const handleSuccess = useCallback(
    (action: ProgramPdfAction) => {
      trackEvent(action === "print" ? "program_pdf_print" : "program_pdf_download", {
        entity: { type: "tour", slug },
      });
    },
    [slug, trackEvent],
  );

  const { state, downloadPdf, printPdf } = useOfferProgramPdf(slug, handleSuccess);
  const isLoading = state.status === "loading";
  const handlers: Record<ProgramPdfAction, () => void> = { download: downloadPdf, print: printPdf };

  return (
    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f172a]">
        <FileText className="h-4 w-4 text-[#00c389]" />
        Nyomtatható verzió
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ACTION_BUTTONS.map(({ action, label, icon: Icon }) => {
          const isActive = isLoading && state.action === action;

          return (
            <button
              key={action}
              type="button"
              onClick={handlers[action]}
              disabled={isLoading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#0f172a] transition-all hover:border-[#00c389]/40 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <p className="mt-2 text-center text-xs text-gray-500" role="status">
          A nyomtatható program elkészítése folyamatban van, kérem várjon…
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="mt-2 text-center text-xs text-red-500" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
