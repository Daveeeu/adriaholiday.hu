import { Bus, Calendar, Clock, Plane, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

import type { UnifiedOfferCardModel } from "../../content/portfolio-offer-card-model";

type OfferCardMetaProps = {
  offer: UnifiedOfferCardModel;
};

type MetaItem = { key: string; icon: ReactNode; label: string };

function MetaRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-gray-600">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-[#00c389] [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <span className="truncate text-[13px] font-medium">{label}</span>
    </div>
  );
}

export default function OfferCardMeta({ offer }: OfferCardMetaProps) {
  const TransportIcon = offer.transportLabel?.includes("Repül") ? Plane : Bus;

  const items: MetaItem[] = [
    offer.departureLabel
      ? { key: "departure", icon: <Calendar />, label: offer.departureLabel }
      : null,
    offer.durationLabel
      ? { key: "duration", icon: <Clock />, label: offer.durationLabel }
      : null,
    offer.transportLabel
      ? { key: "transport", icon: <TransportIcon />, label: offer.transportLabel }
      : null,
    offer.mealsLabel
      ? { key: "meals", icon: <UtensilsCrossed />, label: offer.mealsLabel }
      : null,
  ].filter((item): item is MetaItem => item !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-gray-100 pt-4">
      {items.map((item) => (
        <MetaRow key={item.key} icon={item.icon} label={item.label} />
      ))}
    </div>
  );
}
