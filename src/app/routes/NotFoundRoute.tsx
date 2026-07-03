import { Compass, Home, Search } from "lucide-react";
import { Link, useLocation } from "react-router";

import Seo from "../seo/Seo";

export default function NotFoundRoute() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e7fff5,transparent_28%),linear-gradient(180deg,#f8fcff_0%,#eef6fb_100%)]">
      <Seo
        title="Az oldal nem található"
        description="A keresett oldal nem érhető el vagy már nem létezik."
        canonicalPath={location.pathname || "/"}
        noIndex
      />

      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-8 py-16 md:px-12 lg:px-20">
        <div className="w-full rounded-[40px] border border-[#dce7ef] bg-white p-10 shadow-[0_26px_90px_rgba(15,23,42,0.08)] md:p-14">
          <div className="mb-6 inline-flex rounded-full bg-[#e8fff6] px-4 py-2 text-sm font-bold text-[#00a878]">
            404
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[#0f172a] md:text-6xl">
            A keresett oldal nem található.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#475569]">
            Lehet, hogy a cím megváltozott, az oldal már nem elérhető, vagy egy régi linkre érkeztél.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3 font-semibold text-white"
            >
              <Home className="size-4" />
              Főoldal
            </Link>
            <Link
              to="/utazasok"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-6 py-3 font-semibold text-[#0f172a]"
            >
              <Compass className="size-4" />
              Utazások
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-6 py-3 font-semibold text-[#0f172a]"
            >
              <Search className="size-4" />
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
