import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import TestimonialCarousel from "../TestimonialCarousel";

/** What guests wrote: the newest letters, linking to all of them. */
export default function AboutLetters() {
  return (
    <section className="bg-gradient-to-b from-[#f5fffb] to-white py-24 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-[#00c389]/8 px-5 py-2 text-sm font-semibold text-[#00a878]">RÓLUNK ÍRTÁK</p>
          <h2 className="text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[#0f172a]">
            Nem mi mondjuk,{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">ők írták</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Utasaink levelei, ahogy megérkeztek – szerkesztés nélkül.
          </p>
          <Link
            to="/rolunk-irtak"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 font-semibold text-[#0f172a] shadow-sm transition-colors hover:border-[#00c389]/40 hover:text-[#00a878]"
          >
            Összes levél
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <TestimonialCarousel />
      </div>
    </section>
  );
}
