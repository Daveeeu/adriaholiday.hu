import { ArrowRight } from "lucide-react";

type OfferCardCTAProps = {
  label: string;
};

export default function OfferCardCTA({ label }: OfferCardCTAProps) {
  return (
    <div className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-5 py-3 text-white">
      <span className="relative flex items-center justify-center gap-2 text-sm font-semibold">
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
      </span>
    </div>
  );
}
