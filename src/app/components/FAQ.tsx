import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Plus,
  Minus,
  HelpCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24 bg-[#071426] overflow-hidden">
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-[#00c389]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#16b8ff]/10 rounded-full blur-3xl" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
          <motion.div
            className="sticky top-24 rounded-[34px] bg-white/8 border border-white/10 backdrop-blur-2xl p-8 md:p-10 text-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 rounded-[18px] bg-gradient-to-r from-[#00c389] to-[#16b8ff] flex items-center justify-center mb-7 shadow-[0_12px_36px_rgba(0,195,137,0.28)]">
              <HelpCircle className="w-7 h-7" />
            </div>

            <h2
              className="mb-5"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 750,
                lineHeight: 1.05,
                letterSpacing: "-0.045em",
              }}
            >
              Kérdésed van az{" "}
              <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                utazás előtt?
              </span>
            </h2>

            <p className="text-white/70 leading-relaxed mb-8">
              Összegyűjtöttük a legfontosabb tudnivalókat, hogy magabiztosan
              foglalhass.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-white/80">
                <ShieldCheck className="w-5 h-5 text-[#00c389]" />
                <span>Biztonságos foglalás</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Clock className="w-5 h-5 text-[#00c389]" />
                <span>Gyors ügyintézés</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="w-5 h-5 text-[#00c389]" />
                <span>Segítőkész ügyfélszolgálat</span>
              </div>
            </div>

            <motion.button
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-semibold shadow-[0_12px_32px_rgba(0,195,137,0.25)] flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5" />
              Írj nekünk
            </motion.button>
          </motion.div>

          <div>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 text-[#00c389] text-sm font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#00c389]" />
                FAQ
              </div>

              <h3 className="text-white text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-3">
                Gyakran ismételt kérdések
              </h3>

              <p className="text-white/60 text-lg">
                Minden, amit tudni kell az Adria Holiday utazásairól.
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={faq.question}
                    className={`rounded-[24px] overflow-hidden border transition-all ${
                      isOpen
                        ? "bg-white border-white shadow-[0_20px_60px_rgba(0,195,137,0.14)]"
                        : "bg-white/8 border-white/10 hover:bg-white/12"
                    }`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-5"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <span
                        className={isOpen ? "text-[#0f172a]" : "text-white"}
                        style={{
                          fontSize: "1.05rem",
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
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 pb-6">
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