import { useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, TrendingUp } from "lucide-react";

import { trackEvent } from "@/app/analytics/trackEvent";
import { renderContentIcon } from "@/app/content/icon-map";
import { sanitizeRichTextHtml } from "@/lib/rich-text";

import type { PortfolioOfferProgramDay } from "@/app/content/portfolio-offer-detail-api";
import { useKeywordHighlight } from "@/app/content/keyword-highlight-context";
import { JUSTIFIED_TEXT } from "../lib/justifiedText";
import { TRIP_SECTION_HEADING, TRIP_SECTION_SUBTITLE } from "../lib/tripTypography";
import { responsiveImage } from "../lib/responsiveImage";
import { tripSection } from "../lib/tripSection";

type OfferProgramTimelineProps = {
  programDays?: PortfolioOfferProgramDay[] | null;
  intro?: string | null;
};

function descriptionHtml(description?: string | null) {
  const sanitizedDescription = sanitizeRichTextHtml(description);
  return sanitizedDescription.trim() !== "" ? sanitizedDescription : "<p></p>";
}

export default function OfferProgramTimeline({
  programDays = [],
  intro,
}: OfferProgramTimelineProps) {
  const highlight = useKeywordHighlight();
  // The text before the days (an opening note, the program's own subtitle).
  const introHtml = sanitizeRichTextHtml(intro);
  const days = (programDays ?? [])
    .filter((day) => day.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.dayNumber - b.dayNumber);

  useEffect(() => {
    if (days.length === 0) {
      return;
    }

    trackEvent("program_view", {
      metadata: {
        day_count: days.length,
      },
    });
  }, [days.length]);

  if (days.length === 0) {
    return null;
  }

  return (
    <div className="mb-20" {...tripSection("Program")}>
      <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
        <TrendingUp className="w-4 h-4" />
        PROGRAM
      </div>

      <h2 className={`${TRIP_SECTION_HEADING} mb-4`}>
        Részletes program
      </h2>

      <p className={`${TRIP_SECTION_SUBTITLE} mb-12`}>
        Napokra bontott áttekintés az utazás főbb élményeiről.
      </p>

      {introHtml.trim() !== "" ? (
        <div
          className={`mb-10 rounded-[34px] bg-white border border-gray-100 p-6 md:p-8 shadow-[0_12px_42px_rgba(15,23,42,0.05)] text-[0.95rem] text-gray-600 leading-relaxed [&_p]:mb-0 [&_p+p]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0f172a] [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#0f172a] ${JUSTIFIED_TEXT}`}
          dangerouslySetInnerHTML={{ __html: highlight(introHtml) }}
        />
      ) : null}

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 hidden w-px md:block bg-gradient-to-b from-[#00c389] via-[#16b8ff] to-transparent" />

        <div className="space-y-7">
          {days.map((day, index) => {
            const badges = (day.badges ?? []).filter(
              (badge) => typeof badge === "string" && badge.trim() !== "",
            );
            const experienceType = day.experienceType?.trim();

            return (
              <motion.div
                key={day.id}
                className="relative md:pl-20"
                onViewportEnter={() => {
                  trackEvent("program_day_open", {
                    entity: {
                      type: "program_day",
                      id: day.id,
                    },
                    metadata: {
                      day_number: day.dayNumber,
                      title: day.title,
                    },
                  });
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <div className="absolute left-0 top-8 hidden w-12 h-12 rounded-2xl md:flex bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white items-center justify-center text-sm font-bold shadow-[0_12px_30px_rgba(0,195,137,0.25)]">
                  {day.dayNumber}
                </div>

                <div className="group relative overflow-hidden rounded-[34px] bg-white border border-gray-100 shadow-[0_12px_42px_rgba(15,23,42,0.05)]">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-[#00c389]/8 blur-3xl rounded-full" />

                  <div className="relative grid grid-cols-1 gap-6 p-5 sm:p-7 md:p-8 lg:grid-cols-[1fr_220px]">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00c389]/8 text-[#00a878] text-xs font-bold mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {day.dayNumber}. nap
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] mb-3">
                        {day.title}
                      </h3>

                      <div
                        className={`text-[0.95rem] text-gray-600 leading-relaxed max-w-3xl [&_p]:mb-0 [&_p]:leading-relaxed [&_p+p]:mt-3 ${JUSTIFIED_TEXT}`}
                        dangerouslySetInnerHTML={{
                          __html: highlight(descriptionHtml(day.description)),
                        }}
                      />

                      {badges.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {badges.map((badge) => (
                            <span
                              key={badge}
                              className="px-3 py-1.5 rounded-full bg-[#f5f9fc] text-gray-600 text-xs font-semibold"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* A fixed-size tile, so every day's picture is the same size whatever its text's length. */}
                    <div className="group/preview relative isolate flex h-56 flex-col justify-between overflow-hidden rounded-[26px] p-4 ring-1 ring-black/5 shadow-[0_18px_40px_rgba(15,23,42,0.18)] lg:h-[260px] lg:self-center">
                      {day.image ? (
                        <img
                          {...responsiveImage(day.image)}
                          sizes="(min-width: 1024px) 220px, 100vw"
                          alt={day.title}
                          className="absolute inset-0 -z-10 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover/preview:scale-110"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(0,195,137,0.35),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(22,184,255,0.3),transparent_45%),linear-gradient(145deg,#07111f,#0d2240_58%,#12315d)]" />
                      )}

                      {/* The dark fade only backs the experience type text; without it the picture stays clear. */}
                      <div
                        className={`absolute inset-0 -z-10 ${
                          experienceType
                            ? "bg-gradient-to-t from-[#07111f]/90 via-[#07111f]/25 to-[#07111f]/10"
                            : "bg-gradient-to-b from-[#07111f]/25 via-transparent to-transparent"
                        }`}
                      />

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-[#00f0a8] shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
                        {renderContentIcon(day.icon, "w-5 h-5")}
                      </div>

                      {experienceType ? (
                        <div>
                          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                            Élmény típusa
                          </div>
                          <div className="text-lg font-bold leading-tight text-white">
                            {experienceType}
                          </div>
                          <div className="mt-3 h-1 w-10 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] transition-all duration-500 group-hover/preview:w-16" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
