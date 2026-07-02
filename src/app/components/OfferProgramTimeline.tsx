import { useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, TrendingUp } from "lucide-react";

import { trackEvent } from "@/app/analytics/trackEvent";
import { renderContentIcon } from "@/app/content/icon-map";
import { sanitizeRichTextHtml } from "@/lib/rich-text";

import type { PortfolioOfferProgramDay } from "@/app/content/portfolio-offer-detail-api";

type OfferProgramTimelineProps = {
  programDays?: PortfolioOfferProgramDay[] | null;
  intro?: string | null;
};

function descriptionHtml(description?: string | null, intro?: string | null) {
  const sanitizedDescription = sanitizeRichTextHtml(description);
  if (sanitizedDescription.trim() !== "") {
    return sanitizedDescription;
  }

  const sanitizedIntro = sanitizeRichTextHtml(intro);
  return sanitizedIntro.trim() !== "" ? sanitizedIntro : "<p></p>";
}

export default function OfferProgramTimeline({
  programDays = [],
  intro,
}: OfferProgramTimelineProps) {
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
    <div className="mb-20">
      <div className="inline-flex items-center gap-2 text-[#00a878] text-sm font-bold mb-4">
        <TrendingUp className="w-4 h-4" />
        PROGRAM
      </div>

      <h2 className="text-5xl font-bold text-[#0f172a] mb-4 tracking-tight">
        Részletes program
      </h2>

      <p className="text-gray-500 text-lg mb-14">
        Napokra bontott áttekintés az utazás főbb élményeiről.
      </p>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00c389] via-[#16b8ff] to-transparent" />

        <div className="space-y-7">
          {days.map((day, index) => {
            const badges = (day.badges ?? []).filter(
              (badge) => typeof badge === "string" && badge.trim() !== "",
            );

            return (
              <motion.div
                key={day.id}
                className="relative pl-20"
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
                <div className="absolute left-0 top-8 w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white flex items-center justify-center text-sm font-bold shadow-[0_12px_30px_rgba(0,195,137,0.25)]">
                  {day.dayNumber}
                </div>

                <div className="group relative overflow-hidden rounded-[34px] bg-white border border-gray-100 shadow-[0_12px_42px_rgba(15,23,42,0.05)]">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-[#00c389]/8 blur-3xl rounded-full" />

                  <div className="relative grid grid-cols-1 gap-6 p-7 md:p-8 lg:grid-cols-[1fr_220px]">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00c389]/8 text-[#00a878] text-xs font-bold mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {day.dayNumber}. nap
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">
                        {day.title}
                      </h3>

                      <div
                        className="text-gray-600 leading-relaxed max-w-3xl [&_p]:mb-0 [&_p]:leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: descriptionHtml(day.description, intro),
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

                    <div className="relative overflow-hidden rounded-[26px] min-h-[190px] p-5 flex flex-col justify-between group/preview">
                      {day.image ? (
                        <img
                          src={day.image}
                          alt={day.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(145deg,#07111f,#0d2240_58%,#12315d)]" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-br from-[#07111f]/78 via-[#07111f]/45 to-[#00c389]/30" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/85 via-transparent to-transparent" />

                      <div className="relative w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-[#00f0a8] flex items-center justify-center border border-white/10">
                        {renderContentIcon(day.icon, "w-6 h-6")}
                      </div>

                      <div className="relative">
                        <div className="text-white/65 text-xs mb-1">
                          Élmény típusa
                        </div>
                        <div className="text-white text-xl font-bold">
                          {day.experienceType?.trim() || "Program"}
                        </div>
                      </div>
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
