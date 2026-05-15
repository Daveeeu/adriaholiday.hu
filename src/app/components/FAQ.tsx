import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Mikor kell fizetnem az utazás árát?",
    answer: "A foglaláskor 30% előleget kell fizetni, a fennmaradó összeget pedig legkésőbb 30 nappal az indulás előtt. Részletfizetési lehetőségekről érdeklődjön munkatársainknál.",
  },
  {
    question: "Mi van, ha le kell mondanom az utazást?",
    answer: "Lemondási feltételeink az indulás előtti időponttól függenek. 60 nappal az indulás előtt 10%, 30 nappal előtt 30%, 14 nappal előtt 50% lemondási díjat számítunk fel. Javasoljuk utasbiztosítás megkötését.",
  },
  {
    question: "Milyen típusú buszokkal utazunk?",
    answer: "Kényelmes, légkondicionált, modern buszokkal utazunk, melyek rendelkeznek klímával, toalettel, és WiFi kapcsolattal. A buszok maximum 5 éves korúak.",
  },
  {
    question: "Van lehetőség egyéni programokra?",
    answer: "Igen, számos utazásunkon van szabad program, amelyet saját elképzelései szerint tölthet. Az útvonal részleteiről az egyes utazások leírásában olvashat.",
  },
  {
    question: "Milyen étkezés van az utazás során?",
    answer: "Az étkezések az adott utazástól függenek. Általában félpanzió (reggeli + vacsora) vagy teljes ellátás érhető el. A pontos információkat minden utazásnál részletesen feltüntetjük.",
  },
  {
    question: "Szükséges-e útiokmány a horvát tengerpartra?",
    answer: "Magyar állampolgárok személyi igazolvánnyal vagy útlevéllel utazhatnak. Javasoljuk, hogy útlevéllel utazzon, ez minden esetben érvényes úti okmány.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-40 bg-gradient-to-b from-white via-[#f8fafc] to-white overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fafc] to-white opacity-60" />

      <div className="relative max-w-4xl mx-auto px-8 md:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Gyakran Ismételt{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              Kérdések
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Minden, amit tudni kell az utazásainkról
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,195,128,0.1)] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <motion.button
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  whileHover={{ backgroundColor: "rgba(0, 195, 128, 0.02)" }}
                >
                  <span
                    className="text-gray-900 pr-8"
                    style={{ fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.4 }}
                  >
                    {faq.question}
                  </span>

                  {/* Animated icon */}
                  <motion.div
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#00c389] to-[#16b8ff] flex items-center justify-center text-white shadow-md"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    )}
                  </motion.div>
                </motion.button>

                {/* Answer content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6">
                        {/* Subtle divider */}
                        <div className="w-12 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-4 opacity-30" />

                        <motion.p
                          className="text-gray-600 leading-relaxed"
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          style={{ fontSize: "0.9375rem" }}
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-600 mb-6" style={{ fontSize: "1rem" }}>
            Nem találod a válaszod?
          </p>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white rounded-2xl shadow-md"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 8px 24px rgba(0, 195, 128, 0.25)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <span style={{ fontSize: "1rem", fontWeight: 600 }}>
              Írj nekünk
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
