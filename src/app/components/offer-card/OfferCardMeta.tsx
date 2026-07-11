import { Bus, Calendar, Hotel } from "lucide-react";
import type { ReactNode } from "react";

import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";

type OfferCardMetaProps = {
  offer: UnifiedOfferCardModel;
};

type MetaPillData = { key: string; icon: ReactNode; value: string };

function MetaPill({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1">
      <span className="text-[#00c389] [&>svg]:h-3 [&>svg]:w-3">{icon}</span>
      <span className="text-[11px] font-medium text-gray-600">{value}</span>
    </div>
  );
}

export default function OfferCardMeta({ offer }: OfferCardMetaProps) {
  const metaPills = [
    offer.transportShortLabel
      ? { key: "transport", icon: <Bus />, value: offer.transportShortLabel }
      : null,
    offer.accommodationLabel
      ? { key: "accommodation", icon: <Hotel />, value: offer.accommodationLabel }
      : null,
  ].filter(Boolean) as MetaPillData[];

  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-800">
          <Calendar className="h-4 w-4 text-[#00c389]" />
          <span className="text-sm font-semibold">{offer.departureLabel ?? "Érdeklődjön"}</span>
        </div>

        {offer.departureCountText ? (
          <span className="whitespace-nowrap text-[11px] font-semibold text-[#00c389]">
            + további időpontok
          </span>
        ) : null}
      </div>

      {metaPills.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {metaPills.map((pill) => (
            <MetaPill key={pill.key} icon={pill.icon} value={pill.value} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
