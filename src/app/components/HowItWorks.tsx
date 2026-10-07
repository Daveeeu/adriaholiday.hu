import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import LazyLottie from "./LazyLottie";

import { useLottieAnimation } from "../hooks/useLottieAnimation";
import { EditableText } from "../content/EditableFields";
import { renderContentIcon } from "../content/icon-map";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import { usePortfolioContent } from "../content/PortfolioContentProvider";
import MotionLink from "./MotionLink";
import { HOVER_HOST } from "../lib/hoverHost";

type StepContent = {
  number: string;
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
};

const STEP_CONTENT_FALLBACK: StepContent[] = [
  {
    number: "01",
    icon: "compass",
    eyebrow: "Felfedezés",
    title: "Válassz utat",
    description:
      "Böngéssz gondosan összeállított utazásaink között, és találd meg a hozzád illő úti célt.",
  },
  {
    number: "02",
    icon: "calendar",
    eyebrow: "Foglalás",
    title: "Foglalj online",
    description: "Foglalj gyorsan, átláthatóan és biztonságosan néhány kattintással.",
  },
  {
    number: "03",
    icon: "bus",
    eyebrow: "Utazás",
    title: "Indulj velünk",
    description: "Dőlj hátra, mi intézzük a részleteket — neked csak az élmény marad.",
  },
];

const STEP_COLORS = [
  "from-[#00c389] to-[#16b8ff]",
  "from-[#16b8ff] to-[#0ea5e9]",
  "from-[#0ea5e9] to-[#00c389]",
];

const STEP_LIFT: Variants = { rest: { y: 0 }, hover: { y: -6 } };

const ICON_LIFT: Variants = { rest: { y: 0 }, hover: { y: -4 } };

const BADGE_WIGGLE: Variants = {
  rest: { rotate: 0 },
  hover: { rotate: [0, 6, -6, 0], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
};

const STEP_OUTLINE: Variants = {
  rest: { boxShadow: "inset 0 0 0 0px rgba(0,195,137,0)" },
  hover: { boxShadow: "inset 0 0 0 1.5px rgba(0,195,137,0.16)" },
};

export default function HowItWorks() {
  const { getValue } = usePortfolioContent();
  const loadingAnimation = useLottieAnimation("loading.json");
  const earthPlaneAnimation = useLottieAnimation("rotating-earth-and-paper-plane.json");
  const onlinePlaneAnimation = useLottieAnimation("earth.json");

  const stepContent = getValue("home.howItWorks.steps", STEP_CONTENT_FALLBACK) as StepContent[];
  const ctaUrl = String(getValue("home.howItWorks.cta.url", "/utazasok"));
  const stepAnimations = [loadingAnimation, onlinePlaneAnimation, earthPlaneAnimation];

  // CMS content carries only text and icon names; the visual design (gradient
  // and animation) is owned by the component and assigned by step position.
  const steps = stepContent.map((content, index) => ({
    ...content,
    color: STEP_COLORS[index % STEP_COLORS.length],
    lottieAnimation: stepAnimations[index % stepAnimations.length],
  }));

  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-b from-white via-[#f3fbff] to-[#f5fffb]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[#00c389]/6 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-[-120px] w-[520px] h-[520px] bg-[#16b8ff]/7 blur-3xl rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,195,137,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(22,184,255,.45) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          className="text-center mb-12 md:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#00c389]/15 text-[#00a878] text-sm font-bold mb-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <span className="w-2 h-2 rounded-full bg-[#00c389]" />
            <EditableText
              fieldKey="home.howItWorks.eyebrow"
              fallback="EGYSZERŰ FOLYAMAT"
              as="span"
            />
          </div>

          <div className="mb-4">
            <EditablePortfolioHeading
              fieldKey="home.howItWorks.titleParts"
              fallbackParts={[
                { text: "Hogyan" },
                { text: "zajlik?", variant: "gradient" },
              ]}
              as="h2"
              mode="inline"
              className="m-0 text-[#0f172a]"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.7rem)",
                fontWeight: 760,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
              }}
            />
          </div>

          <EditableText
            fieldKey="home.howItWorks.subtitle"
            fallback="3 egyszerű lépés a következő élményedig"
            as="p"
            className="text-gray-900 mb-2 text-lg md:text-xl font-semibold tracking-[-0.02em]"
          />

          <EditableText
            fieldKey="home.howItWorks.description"
            fallback="Gyors foglalás, gondos szervezés és felejthetetlen utazások."
            as="p"
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          />
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[98px] left-[17%] right-[17%] h-px bg-gradient-to-r from-transparent via-[#16b8ff]/35 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="h-full"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div className="h-full" {...HOVER_HOST}>
                  <motion.article
                    className="group relative h-full min-h-[405px] rounded-[34px] bg-white/86 backdrop-blur-xl border border-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] p-7 md:p-8 overflow-hidden"
                    variants={STEP_LIFT}
                    transition={{ type: "spring", stiffness: 360, damping: 26 }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.045] transition-opacity duration-500`}
                    />

                    <div
                      className={`absolute top-4 right-5 text-[118px] font-black leading-none bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-[0.055] pointer-events-none select-none`}
                    >
                      {step.number}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <motion.div
                        className="relative mb-7"
                        variants={ICON_LIFT}
                        transition={{ type: "spring", stiffness: 360, damping: 26 }}
                      >
                        <div className="relative w-[138px] h-[138px] rounded-[30px] bg-gradient-to-br from-[#f4fffb] to-[#eef8ff] border border-white shadow-[0_15px_42px_rgba(15,23,42,0.08)] flex items-center justify-center overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-[0.08]`} />

                          <div className="relative w-28 h-28">
                            {step.lottieAnimation ? (
                              <LazyLottie animationData={step.lottieAnimation} loop autoplay />
                            ) : null}
                          </div>

                          <motion.div
                            className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-lg`}
                            variants={BADGE_WIGGLE}
                          >
                            {renderContentIcon(step.icon, "w-4 h-4")}
                          </motion.div>
                        </div>
                      </motion.div>

                      <div className="flex items-center gap-3 mb-5">
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-[#f8fafc] shadow-sm">
                          <span className={`bg-gradient-to-r ${step.color} bg-clip-text text-transparent text-base font-black tracking-[0.08em]`}>
                            {step.number}
                          </span>
                        </div>

                        <span className="text-sm font-semibold text-gray-500">
                          {step.eyebrow}
                        </span>
                      </div>

                      <h3 className="text-[#0f172a] text-[1.8rem] font-bold tracking-[-0.035em] leading-tight mb-4">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        {step.description}
                      </p>

                      <div className="mt-auto">
                        <div className={`h-[4px] w-full rounded-full bg-gradient-to-r ${step.color} opacity-75`} />
                      </div>
                    </div>

                    <motion.div
                      className="absolute inset-0 rounded-[34px] pointer-events-none"
                      variants={STEP_OUTLINE}
                      transition={{ duration: 0.25 }}
                    />
                  </motion.article>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
              <MotionLink
                to={ctaUrl}
                className="group relative inline-block px-8 py-4 rounded-[24px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white shadow-[0_14px_42px_rgba(0,195,137,0.27)] overflow-hidden"
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.8 }}
            />

            <span className="relative flex items-center gap-2 text-base font-semibold">
              <EditableText
                fieldKey="home.howItWorks.cta.label"
                fallback="Kezdjük el"
                as="span"
              />
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}
