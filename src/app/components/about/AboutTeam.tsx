import { EditableOptionalImage } from "../../content/EditableFields";
import AboutSectionHeader from "./AboutSectionHeader";
import { aboutFallback } from "./about-content";

const photoClassName = "h-full w-full rounded-[28px] object-cover shadow-[0_24px_70px_rgba(15,23,42,0.11)]";

export default function AboutTeam() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <AboutSectionHeader
          align="center"
          eyebrow={{ fieldKey: "about.team.eyebrow", fallback: aboutFallback.team.eyebrow }}
          title={{ fieldKey: "about.team.titleParts", fallbackParts: aboutFallback.team.titleParts }}
          description={{ fieldKey: "about.team.description", fallback: aboutFallback.team.description }}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-[1.6fr_1fr]">
          <EditableOptionalImage
            fieldKey="about.team.image"
            placeholderLabel="Csapatfotó feltöltése"
            className="aspect-[4/3] rounded-[28px] md:aspect-auto md:min-h-[420px]"
            imgClassName={photoClassName}
          />
          <EditableOptionalImage
            fieldKey="about.office.image"
            placeholderLabel="Irodafotó feltöltése"
            className="aspect-[4/3] rounded-[28px] md:aspect-auto md:min-h-[420px]"
            imgClassName={photoClassName}
          />
        </div>
      </div>
    </section>
  );
}
