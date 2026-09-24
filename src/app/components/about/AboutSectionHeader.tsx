import { EditableText } from "../../content/EditableFields";
import { EditablePortfolioHeading, type PortfolioHeadingPart } from "../../content/PortfolioHeading";

type EditableCopy = {
  fieldKey: string;
  fallback: string;
};

export default function AboutSectionHeader({
  eyebrow,
  title,
  description,
  as = "h2",
  align = "left",
}: {
  eyebrow?: EditableCopy;
  title: { fieldKey: string; fallbackParts: PortfolioHeadingPart[] };
  description?: EditableCopy;
  as?: "h1" | "h2";
  align?: "left" | "center";
}) {
  const isCentered = align === "center";

  return (
    <div className={isCentered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <EditableText
          fieldKey={eyebrow.fieldKey}
          fallback={eyebrow.fallback}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#00c389]/8 px-5 py-2 text-sm font-semibold text-[#00a878]"
        />
      ) : null}

      <EditablePortfolioHeading
        fieldKey={title.fieldKey}
        fallbackParts={title.fallbackParts}
        as={as}
        className="m-0 text-[#0f172a]"
        style={{
          fontSize: as === "h1" ? "clamp(2.4rem, 5vw, 4.4rem)" : "clamp(2rem, 3.6vw, 3.2rem)",
          fontWeight: 750,
          letterSpacing: "-0.045em",
          lineHeight: 1.04,
        }}
      />

      {description ? (
        <EditableText
          fieldKey={description.fieldKey}
          fallback={description.fallback}
          as="p"
          className="mt-5 text-[1.05rem] leading-relaxed text-gray-600"
        />
      ) : null}
    </div>
  );
}
