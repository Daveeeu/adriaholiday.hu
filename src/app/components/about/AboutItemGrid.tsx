import { motion } from "motion/react";

import { EditableFrame } from "../../content/EditableFields";
import { renderContentIcon } from "../../content/icon-map";
import { useContentList, type AboutItem } from "./about-content";

export default function AboutItemGrid({
  fieldKey,
  fallback,
  variant = "card",
}: {
  fieldKey: string;
  fallback: AboutItem[];
  variant?: "card" | "plain";
}) {
  const items = useContentList(fieldKey, fallback);
  const isCard = variant === "card";

  return (
    <EditableFrame target={{ kind: "field", fieldKey }} className="rounded-[28px]">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={`${item.title}-${index}`}
            className={
              isCard
                ? "h-full rounded-[28px] border border-gray-100 bg-white p-7 shadow-[0_16px_50px_rgba(15,23,42,0.06)]"
                : "h-full p-2"
            }
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#00c389]/12 to-[#16b8ff]/12 text-[#00c389]">
              {renderContentIcon(item.icon, "h-6 w-6")}
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#0f172a]">{item.title}</h3>
            <p className="leading-relaxed text-gray-600">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </EditableFrame>
  );
}
