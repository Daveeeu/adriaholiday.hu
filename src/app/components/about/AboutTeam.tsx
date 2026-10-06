import { motion } from "motion/react";

import { EditableFrame, EditableOptionalImage } from "../../content/EditableFields";
import { usePortfolioContent } from "../../content/PortfolioContentProvider";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback, TEAM_SIZE, useContentList, type AboutTeamMember } from "./about-content";

const MEMBERS_KEY = "about.team.members";
const memberImageKey = (index: number) => `about.team.member.${index + 1}.image`;

type ImageValue = { url?: string; alt?: string } | null;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Portraits of the team (names and roles in one list, each photo in its own image
 * field). A member shows up once they have a name; in the editor every slot is shown.
 */
export default function AboutTeam() {
  const { getValue, isEditorEnabled } = usePortfolioContent();
  const members = useContentList<AboutTeamMember>(MEMBERS_KEY, aboutFallback.team.members);
  const slots = Array.from({ length: TEAM_SIZE }, (_, index) => ({
    member: members[index] ?? { name: "", role: "" },
    index,
    image: getValue(memberImageKey(index), null) as ImageValue,
  })).filter(({ member }) => isEditorEnabled || member.name.trim() !== "");

  return (
    <section className="bg-gradient-to-b from-white to-[#f5fffb] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <AboutSectionHeader
          eyebrow={{ fieldKey: "about.team.eyebrow", fallback: aboutFallback.team.eyebrow }}
          title={{ fieldKey: "about.team.titleParts", fallbackParts: aboutFallback.team.titleParts }}
          description={{ fieldKey: "about.team.description", fallback: aboutFallback.team.description }}
        />

        {slots.length > 0 ? (
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {slots.map(({ member, index, image }) => (
              <motion.figure
                key={index}
                className="group relative aspect-[3/4] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#00c389] to-[#16b8ff] shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (index % 3) * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {image?.url ? (
                  <img
                    src={image.url}
                    alt={member.name || image.alt || ""}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-6xl font-black text-white/80">
                    {initials(member.name) || "?"}
                  </span>
                )}

                {isEditorEnabled ? (
                  <div className="absolute left-3 right-3 top-3">
                    <EditableOptionalImage
                      fieldKey={memberImageKey(index)}
                      placeholderLabel={`${index + 1}. fotó feltöltése`}
                      imgClassName="h-10 w-full rounded-xl object-cover opacity-80"
                    />
                  </div>
                ) : null}

                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071321]/90 via-[#071321]/40 to-transparent p-5 pt-16">
                  <EditableFrame target={{ kind: "field", fieldKey: MEMBERS_KEY }} className="rounded-xl">
                    <p className="text-lg font-bold text-white md:text-xl">{member.name || `${index + 1}. csapattag neve`}</p>
                    <p className="text-sm text-slate-200 transition-colors group-hover:text-[#5eead4]">{member.role || "Beosztás"}</p>
                  </EditableFrame>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1.6fr_1fr]">
          <EditableOptionalImage
            fieldKey="about.team.image"
            placeholderLabel="Csapatfotó feltöltése"
            className="rounded-[28px]"
            imgClassName="aspect-[16/10] w-full rounded-[28px] object-cover shadow-[0_24px_70px_rgba(15,23,42,0.11)]"
          />
          <EditableOptionalImage
            fieldKey="about.office.image"
            placeholderLabel="Irodafotó feltöltése"
            className="rounded-[28px]"
            imgClassName="aspect-[16/10] w-full rounded-[28px] object-cover shadow-[0_24px_70px_rgba(15,23,42,0.11)] md:aspect-auto md:h-full"
          />
        </div>
      </div>
    </section>
  );
}
