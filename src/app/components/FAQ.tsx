import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Plus,
  Minus,
  HelpCircle,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { EditableButton, EditableList, EditableText } from "../content/EditableFields";
import { renderContentIcon } from "../content/icon-map";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import { usePortfolioContent } from "../content/PortfolioContentProvider";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQHelpItem {
  text: string;
  icon: string;
}

const faqsFallback: FAQItem[] = [
  {
    question: "Mikor kell fizetnem az utazás árát?",
    answer:
      "A foglaláskor 30% előleget kell fizetni, a fennmaradó összeget pedig legkésőbb 30 nappal az indulás előtt.",
  },
  {
    question: "Mi van, ha le kell mondanom az utazást?",
    answer:
      "A lemondási feltételek az indulás előtti időponttól függenek. Javasoljuk utasbiztosítás megkötését.",
  },
  {
    question: "Milyen típusú buszokkal utazunk?",
    answer:
      "Modern, kényelmes, légkondicionált buszokkal utazunk, amelyek hosszabb utakra is alkalmasak.",
  },
  {
    question: "Van lehetőség egyéni programokra?",
    answer:
      "Igen, több utazásunkon van szabadprogram, amit saját elképzelés szerint lehet eltölteni.",
  },
  {
    question: "Milyen étkezés van az utazás során?",
    answer:
      "Az ellátás utazásonként változik, általában reggeli, félpanzió vagy teljes ellátás érhető el.",
  },
  {
    question: "Szükséges-e útiokmány a horvát tengerpartra?",
    answer:
      "Magyar állampolgárok személyi igazolvánnyal vagy útlevéllel utazhatnak Horvátországba.",
  },
];

export default function FAQ() {
  const { getValue } = usePortfolioContent();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = getValue("home.faq.items", faqsFallback) as FAQItem[];

  return (
    <section className="relative py-16 md:py-20 bg-[#071426] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-160px] left-[-120px] w-[620px] h-[620px] bg-[#00c389]/12 rounded-full blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-100px] w-[620px] h-[620px] bg-[#16b8ff]/12 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.5) 1px, transparent 0)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-9 lg:gap-14 items-start">
          <motion.div
            className="lg:sticky lg:top-24 rounded-[34px] bg-white/8 border border-white/10 backdrop-blur-2xl p-7 md:p-9 text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#00c389]/14 to-[#16b8ff]/8 rounded-full blur-3xl" />

            <div className="relative">
              <div className="w-14 h-14 rounded-[18px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] flex items-center justify-center mb-6 shadow-[0_12px_36px_rgba(0,195,137,0.28)]">
                <HelpCircle className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/8 text-[#60ffd0] text-xs font-bold mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                GYORS SEGÍTSÉG
              </div>

              <div className="mb-5">
                <EditablePortfolioHeading
                  fieldKey="home.faq.helpTitleParts"
                  fallbackParts={[
                    { text: "Kérdésed van" },
                    { text: "az utazás előtt?", variant: "gradient" },
                  ]}
                  as="h2"
                  mode="inline"
                  className="m-0"
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3.35rem)",
                    fontWeight: 760,
                    lineHeight: 1.05,
                    letterSpacing: "-0.045em",
                  }}
                />
              </div>

              <EditableText
                fieldKey="home.faq.helpDescription"
                fallback="Összegyűjtöttük a legfontosabb tudnivalókat, hogy magabiztosan foglalhass."
                as="p"
                className="text-white/68 leading-relaxed mb-7"
              />

              <EditableList
                fieldKey="home.faq.helpItems"
                fallback={[
                  { text: "Biztonságos foglalás", icon: "shieldCheck" },
                  { text: "Gyors ügyintézés", icon: "messageCircle" },
                  { text: "Segítőkész ügyfélszolgálat", icon: "sparkles" },
                ]}
                className="space-y-3.5 mb-7"
                renderItem={(item: FAQHelpItem) => (
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="text-[#00c389]">{renderContentIcon(item.icon, "w-5 h-5")}</div>
                    <span>{item.text}</span>
                  </div>
                )}
              />

              <EditableButton
                fieldKey="home.faq.button.url"
                labelKey="home.faq.button.label"
                fallback="Írj nekünk"
                hrefFallback="/kapcsolat"
                className="block"
              >
                <motion.div
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-semibold shadow-[0_12px_32px_rgba(0,195,137,0.25)] flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <EditableText
                    fieldKey="home.faq.button.label"
                    fallback="Írj nekünk"
                    as="span"
                  />
                </motion.div>
              </EditableButton>
            </div>
          </motion.div>

          <div>
            <motion.div
              className="mb-7"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 text-[#00c389] text-sm font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#00c389]" />
                <EditableText
                  fieldKey="home.faq.eyebrow"
                  fallback="FAQ"
                  as="span"
                />
              </div>

              <div className="mb-3">
                <EditablePortfolioHeading
                  fieldKey="home.faq.titleParts"
                  fallbackParts={[
                    { text: "Gyakran ismételt" },
                    { text: "kérdések", variant: "gradient" },
                  ]}
                  as="h3"
                  mode="inline"
                  className="m-0 text-white text-3xl md:text-4xl font-bold tracking-[-0.03em]"
                />
              </div>

              <EditableText
                fieldKey="home.faq.description"
                fallback="Minden, amit tudni kell az Adria Holiday utazásairól."
                as="p"
                className="text-white/58 text-lg"
              />
            </motion.div>

            <div className="space-y-3.5">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={faq.question}
                    className={`rounded-[22px] overflow-hidden border transition-all ${
                      isOpen
                        ? "bg-white border-white shadow-[0_20px_60px_rgba(0,195,137,0.14)]"
                        : "bg-white/8 border-white/10 hover:bg-white/12"
                    }`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.045 }}
                  >
                    <button
                      className="w-full px-5 md:px-6 py-4.5 md:py-5 flex items-center justify-between text-left gap-5"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <span
                        className={isOpen ? "text-[#0f172a]" : "text-white"}
                        style={{
                          fontSize: "1.02rem",
                          fontWeight: 700,
                          lineHeight: 1.4,
                        }}
                      >
                        {faq.question}
                      </span>

                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isOpen
                            ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white"
                            : "bg-white/10 text-white"
                        }`}
                        animate={{ rotate: isOpen ? 180 : 0 }}
                      >
                        {isOpen ? (
                          <Minus className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          <Plus className="w-4 h-4" strokeWidth={2.5} />
                        )}
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6">
                            <div className="w-12 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-4" />
                            <p className="text-gray-600 leading-relaxed text-[0.95rem]">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
