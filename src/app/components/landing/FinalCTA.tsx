import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function FinalCTA() {
  return (
    <section className="bg-slate-900" aria-label="Záró felhívás">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20 py-12 sm:py-14">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-white font-semibold tracking-[-0.03em] text-2xl sm:text-3xl">
              Készen állsz az utazásra?
            </h2>
            <p className="mt-2 text-white/70 max-w-2xl">
              Nézd meg a kiemelt ajánlatokat, válassz időpontot, és foglalj
              magabiztosan.
            </p>
          </div>

          <Link
            to="/utazasok"
            className="h-12 px-5 rounded-xl bg-[#00c389] text-white font-semibold shadow-[0_10px_26px_rgba(0,195,137,0.22)] inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Ajánlatok megtekintése
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

