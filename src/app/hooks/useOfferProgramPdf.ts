import { useCallback, useEffect, useRef, useState } from "react";

import { PortfolioApiError } from "../content/portfolio-api";
import { fetchPortfolioOfferProgramPdf } from "../content/portfolio-offer-detail-api";

export type ProgramPdfAction = "download" | "print";

type ProgramPdfState =
  | { status: "idle" }
  | { status: "loading"; action: ProgramPdfAction }
  | { status: "error"; message: string };

type CachedPdf = { slug: string; url: string };

const UNEXPECTED_ERROR_MESSAGE = "Váratlan hiba történt, kérjük próbáld meg később.";

/**
 * Generates an offer's printable program PDF on demand and lets the visitor download or print it.
 * The generated file is kept for the lifetime of the page, so downloading and then printing
 * (or repeating either) does not generate it again.
 */
export function useOfferProgramPdf(slug: string, onSuccess?: (action: ProgramPdfAction) => void) {
  const [state, setState] = useState<ProgramPdfState>({ status: "idle" });
  const cachedPdfRef = useRef<CachedPdf | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  const removePrintFrame = useCallback(() => {
    printFrameRef.current?.remove();
    printFrameRef.current = null;
  }, []);

  useEffect(
    () => () => {
      removePrintFrame();

      if (cachedPdfRef.current) {
        URL.revokeObjectURL(cachedPdfRef.current.url);
        cachedPdfRef.current = null;
      }
    },
    [removePrintFrame, slug],
  );

  const resolvePdfUrl = useCallback(async () => {
    if (cachedPdfRef.current?.slug === slug) {
      return cachedPdfRef.current.url;
    }

    const blob = await fetchPortfolioOfferProgramPdf(slug);
    const url = URL.createObjectURL(blob);
    cachedPdfRef.current = { slug, url };

    return url;
  }, [slug]);

  const download = useCallback((url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug || "program"}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [slug]);

  const print = useCallback(
    (url: string) =>
      new Promise<void>((resolve, reject) => {
        removePrintFrame();

        const frame = document.createElement("iframe");
        frame.setAttribute("aria-hidden", "true");
        frame.tabIndex = -1;
        frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
        frame.onload = () => {
          try {
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        frame.src = url;

        document.body.appendChild(frame);
        printFrameRef.current = frame;
      }),
    [removePrintFrame],
  );

  const run = useCallback(
    async (action: ProgramPdfAction) => {
      if (state.status === "loading") {
        return;
      }

      setState({ status: "loading", action });

      try {
        const url = await resolvePdfUrl();

        if (action === "print") {
          try {
            await print(url);
          } catch {
            // Browsers that refuse to print an embedded PDF still get the file in their own viewer.
            window.open(url, "_blank", "noopener");
          }
        } else {
          download(url);
        }

        setState({ status: "idle" });
        onSuccess?.(action);
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof PortfolioApiError ? error.message : UNEXPECTED_ERROR_MESSAGE,
        });
      }
    },
    [download, onSuccess, print, resolvePdfUrl, state.status],
  );

  return {
    state,
    downloadPdf: () => run("download"),
    printPdf: () => run("print"),
  };
}
