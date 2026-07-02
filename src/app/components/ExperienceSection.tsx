import { motion } from "motion/react";
import { usePortfolioContent } from "../content/PortfolioContentProvider";
import { EditableMedia } from "../content/EditableFields";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";

export default function ExperienceSection() {
  const { getValue } = usePortfolioContent();
  const image = getValue("home.experience.image", {
    url: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90",
    alt: "Tengerpart az Adrián",
  }) as { url?: string; alt?: string };
  const quoteImage = getValue("home.experience.quote.image", {
    url: "https://i.pravatar.cc/150?img=47",
    alt: "B. Istvánné",
  }) as { url?: string; alt?: string; title?: string };
  const overlayEyebrow = String(
    getValue("home.experience.overlay.eyebrow", "Dalmácia • Horvátország"),
  );
  const badge = String(
    getValue("home.experience.badge", "MIÉRT AZ ADRIA HOLIDAY"),
  );
  const descriptionOne = String(
    getValue(
      "home.experience.description.one",
      "Naplementék az Adrián, mediterrán városok hangulata, autentikus élmények és gondtalan utazások.",
    ),
  );
  const descriptionTwo = String(
    getValue(
      "home.experience.description.two",
      "Minden út gondosan megtervezett, minden részlet átgondolt — te csak élvezd a pillanatot. Családok, párok, barátok — mindenkinek megtaláljuk a tökéletes utat.",
    ),
  );
  const stats = getValue("home.experience.stats", [
    { value: "10K+", label: "Elégedett utas" },
    { value: "15", label: "Év tapasztalat" },
    { value: "4.9", label: "Értékelés" },
  ]) as Array<{ value: string; label: string }>;
  const cta = String(getValue("home.experience.cta.label", "Ismerj meg minket"));
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-white via-[#fbfffd] to-[#f7fbff] overflow-hidden">
      {/* Premium Editorial Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fafc] to-white" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-18 items-center">
          {/* Left - Editorial Magazine-Style Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Main Hero Image - Full Bleed Editorial Style */}
            <div className="relative h-[560px] md:h-[620px] -ml-8 lg:-ml-20">
              <motion.div
                className="relative h-full rounded-r-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 1.2 }}
              >
                {/* Editorial Image */}
                <motion.div
                  className="w-full h-full"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  <EditableMedia
                    fieldKey="home.experience.image"
                    fallback={{
                      url: image.url ?? "",
                      alt: image.alt ?? "Tengerpart az Adrián",
                      title: image.alt ?? "Tengerpart az Adrián",
                    }}
                    className="w-full h-full"
                    mediaClassName="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/40 via-transparent to-transparent" />

                {/* Editorial Text Overlay - Magazine Style */}
                <div className="absolute bottom-12 left-12 right-12 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-white/80 mb-3" style={{ fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {overlayEyebrow}
                    </p>
                    <div className="mb-4">
                      <EditablePortfolioHeading
                        fieldKey="home.experience.overlay.titleParts"
                        fallbackParts={[
                          { text: "Smaragdzöld víz" },
                          { text: "és mediterrán szigetek", variant: "gradient" },
                        ]}
                        as="h3"
                        mode="inline"
                        className="m-0"
                        style={{
                          fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                        }}
                      />
                    </div>
                    <div className="w-20 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Quote Card - Premium Glassmorphism */}
              <motion.div
                className="absolute -bottom-8 -right-8 max-w-sm bg-white/95 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/40"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <div className="flex items-start gap-4">
                  <EditableMedia
                    fieldKey="home.experience.quote.image"
                    fallback={{
                      url: quoteImage.url ?? "https://i.pravatar.cc/150?img=47",
                      alt: quoteImage.alt ?? "B. Istvánné",
                      title: quoteImage.title ?? "B. Istvánné",
                    }}
                    className="shrink-0"
                    mediaClassName="w-14 h-14 rounded-full border-2 border-[#00c389]/20 object-cover"
                  />

                  <div className="flex-1">
                    <p
                      className="text-gray-700 italic mb-3"
                      style={{
                        fontSize: "0.9375rem",
                        lineHeight: 1.6,
                      }}
                    >
                      "Felejthetetlen csodás napokat töltöttünk el az Önök jóvoltából."
                    </p>

                    <div>
                      <p
                        className="text-gray-900"
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                        }}
                      >
                        B. Istvánné
                      </p>

                      <p className="text-gray-500 text-xs">
                        Bosznia körutazás
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Premium Editorial Content */}
          <motion.div
            className="lg:pl-8"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Premium Label */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00c389]/5 rounded-full mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff]" />
                <span className="text-[#00c389]" style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                {badge}
              </span>
            </motion.div>

            {/* Emotional Magazine-Style Headline */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <EditablePortfolioHeading
                fieldKey="home.experience.titleParts"
                fallbackParts={[
                  { text: "Élményeket adunk," },
                  { text: "amikre évek múlva is", variant: "gradient" },
                  { text: "emlékezni fogsz" },
                ]}
                as="h2"
                mode="inline"
                className="m-0 text-gray-900"
                style={{
                  fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              />
            </motion.div>

            {/* Premium Editorial Description */}
            <motion.div
              className="space-y-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <p
                className="text-gray-700 leading-relaxed"
                style={{ fontSize: "1.125rem", lineHeight: 1.8 }}
              >
                {descriptionOne}
              </p>

              <p className="text-gray-600 leading-relaxed">
                {descriptionTwo}
              </p>
            </motion.div>

            {/* Premium Stats - Editorial Style */}
            <motion.div
              className="grid grid-cols-3 gap-8 mb-12 pb-12 border-b border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div
                    className="text-gray-900 mb-1"
                    style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-gray-500" style={{ fontSize: "0.8125rem" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA - Premium Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              <motion.button
                className="group px-8 py-4 bg-gray-900 text-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden relative"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#00c389] to-[#16b8ff]"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative flex items-center gap-2" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {cta}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
