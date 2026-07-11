import { useState } from "react";
import { Link } from "react-router";

import { useAnalytics } from "../analytics/useAnalytics";

export default function CookieConsentBanner() {
  const { consent, setConsent, isConsentBannerOpen } = useAnalytics();
  const [showDetails, setShowDetails] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(consent.analytics);
  const [draftMarketing, setDraftMarketing] = useState(consent.marketing);

  if (!isConsentBannerOpen) {
    return null;
  }

  function acceptAll() {
    setConsent({ necessary: true, analytics: true, marketing: true });
  }

  function rejectAll() {
    setConsent({ necessary: true, analytics: false, marketing: false });
  }

  function saveSelection() {
    setConsent({ necessary: true, analytics: draftAnalytics, marketing: draftMarketing });
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-[200] px-4 pb-4 md:px-6 md:pb-6"
    >
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0A1628] via-[#0F1E35] to-[#1A2942] p-6 text-white shadow-[0_22px_70px_rgba(15,23,42,0.35)] md:p-8">
        <h2 id="cookie-consent-title" className="text-lg font-bold">
          Süti beállítások
        </h2>
        <p id="cookie-consent-description" className="mt-2 text-sm leading-6 text-white/70">
          Az oldal működéséhez szükséges sütiket mindig használjuk. A statisztikai (analitikai) és
          marketing célú sütiket csak a hozzájárulásod után aktiváljuk. A részletekért lásd a{" "}
          <Link to="/sutik" className="underline decoration-white/40 underline-offset-2 hover:text-[#00c389]">
            Süti tájékoztatót
          </Link>
          .
        </p>

        {showDetails ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="flex items-start gap-3 text-sm text-white/80">
              <input type="checkbox" checked disabled className="mt-1 size-4 accent-[#00c389]" />
              <span>
                <span className="font-semibold text-white">Szükséges</span> – mindig aktív, az oldal
                alapműködéséhez kell.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={draftAnalytics}
                onChange={(event) => setDraftAnalytics(event.target.checked)}
                className="mt-1 size-4 accent-[#00c389]"
              />
              <span>
                <span className="font-semibold text-white">Statisztikai</span> – segít megérteni, hogyan
                használják a látogatók az oldalt.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={draftMarketing}
                onChange={(event) => setDraftMarketing(event.target.checked)}
                className="mt-1 size-4 accent-[#00c389]"
              />
              <span>
                <span className="font-semibold text-white">Marketing</span> – személyre szabott ajánlatok
                és hirdetések méréséhez.
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Mind elfogadása
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Csak a szükséges
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={saveSelection}
              className="inline-flex items-center justify-center rounded-2xl border border-[#00c389]/50 bg-[#00c389]/10 px-6 py-3 text-sm font-semibold text-[#00c389] hover:bg-[#00c389]/20"
            >
              Kiválasztottak mentése
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-sm font-semibold text-white/70 underline decoration-white/30 underline-offset-2 hover:text-white"
            >
              Beállítások testreszabása
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
