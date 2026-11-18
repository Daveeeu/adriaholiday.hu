import { Phone } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

const PHONE_NUMBER = "+36123456789";

export default function MobileTripBookingBar({
  offerSlug,
  title,
  priceLabel,
  dateLabel,
}: {
  offerSlug: string;
  title: string;
  priceLabel: string;
  dateLabel: string;
}) {
  const contactUrl = useMemo(() => {
    const params = new URLSearchParams({
      offer: title,
      slug: offerSlug,
      date: dateLabel,
    });
    return `/kapcsolat?${params.toString()}`;
  }, [dateLabel, offerSlug, title]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-black/10 px-4 py-3">
        <div className="mx-auto max-w-[1500px] flex items-center gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-semibold leading-none">
              {dateLabel}
            </div>
            <div className="text-slate-900 font-semibold leading-tight truncate">
              {priceLabel}{" "}
              <span className="text-slate-500 text-xs font-semibold">-tól/fő</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="w-11 h-11 rounded-xl border border-black/10 bg-white text-slate-900 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Hívás"
            >
              <Phone className="w-5 h-5" />
            </a>

            <Link
              to={contactUrl}
              className="h-11 px-4 rounded-xl bg-[#00c389] text-white font-semibold inline-flex items-center justify-center shadow-[0_10px_26px_rgba(0,195,137,0.20)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Ajánlatot kérek"
            >
              Ajánlatot kérek
            </Link>
          </div>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

