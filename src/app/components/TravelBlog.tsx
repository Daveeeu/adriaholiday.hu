import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Clock, Calendar } from "lucide-react";

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readingTime: string;
  featured?: boolean;
}

const articles: BlogArticle[] = [
  {
    id: "1",
    title: "10 rejtett kincs a horvát tengerparton",
    excerpt:
      "Fedezd fel Dalmácia legelbűvölőbb zugait, amelyeket a turisták ritkán látogatnak meg.",
    image:
      "https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400&q=90",
    category: "Tengerpartok",
    date: "2026. május 12",
    readingTime: "5 perc",
    featured: true,
  },
  {
    id: "2",
    title: "Hogyan csomagoljunk egy egyhetes körutazásra?",
    excerpt:
      "Praktikus tippek a hatékony csomagoláshoz és a súlykorlát betartásához.",
    image:
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=90",
    category: "Utazási tippek",
    date: "2026. május 10",
    readingTime: "4 perc",
  },
  {
    id: "3",
    title: "Velence tavasszal: a legjobb látnivalók",
    excerpt:
      "Miért érdemes tavasszal látogatni a lagúnák városát és mit ne hagyj ki.",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=90",
    category: "Városnézés",
    date: "2026. május 8",
    readingTime: "6 perc",
  },
  {
    id: "4",
    title: "Az olasz konyha titkai: mit kóstoljunk meg?",
    excerpt:
      "Autentikus olasz ételek, amelyeket minden utazónak meg kell kóstolnia.",
    image:
      "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=90",
    category: "Gasztronómia",
    date: "2026. május 5",
    readingTime: "7 perc",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Tengerpartok":
      return "from-[#00c389] to-[#16b8ff]";
    case "Utazási tippek":
      return "from-[#00c389] to-[#0ea5e9]";
    case "Városnézés":
      return "from-purple-500 to-pink-500";
    case "Gasztronómia":
      return "from-orange-500 to-red-500";
    case "Körutazások":
      return "from-indigo-500 to-blue-500";
    default:
      return "from-gray-500 to-gray-600";
  }
};

export default function TravelBlog() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const featuredArticle = articles.find((a) => a.featured);
  const regularArticles = articles.filter((a) => !a.featured);

  return (
    <section className="relative pt-20 bg-white overflow-hidden">
      <div className="absolute top-0 left-[6%] w-[420px] h-[420px] bg-gradient-to-br from-[#00c389]/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-[8%] w-[420px] h-[420px] bg-gradient-to-tl from-[#16b8ff]/8 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2
            className="text-gray-900 mb-3"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Utazó{" "}
            <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
              Blog
            </span>
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Inspirációk, tippek és élmények a világ minden tájáról
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {featuredArticle && (
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onMouseEnter={() => setHoveredId(featuredArticle.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.article
                className="group relative h-[560px] rounded-[32px] overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.10)] hover:shadow-[0_18px_60px_rgba(0,195,137,0.18)] transition-all duration-700"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <motion.img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{
                    scale: hoveredId === featuredArticle.id ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/88 via-[#0f172a]/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/35 via-transparent to-transparent" />

                <motion.div
                  className={`absolute top-7 left-7 px-4 py-2 bg-gradient-to-r ${getCategoryColor(
                    featuredArticle.category
                  )} rounded-xl shadow-lg`}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="text-white text-sm font-semibold">
                    {featuredArticle.category}
                  </span>
                </motion.div>

                <motion.div
                  className="absolute top-7 right-7 px-3.5 py-2 bg-white/16 backdrop-blur-lg rounded-xl border border-white/25"
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" strokeWidth={2} />
                    <span className="text-white text-sm font-semibold">
                      {featuredArticle.readingTime} olvasás
                    </span>
                  </div>
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <motion.div
                    className="flex items-center gap-2 text-white/80 mb-4"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                  >
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm tracking-wide">
                      {featuredArticle.date}
                    </span>
                  </motion.div>

                  <motion.h3
                    className="text-white mb-4"
                    style={{
                      fontSize: "clamp(1.8rem, 3.2vw, 2.55rem)",
                      fontWeight: 750,
                      letterSpacing: "-0.035em",
                      lineHeight: 1.08,
                      textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                    }}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.32 }}
                  >
                    {featuredArticle.title}
                  </motion.h3>

                  <motion.p
                    className="text-white/88 max-w-2xl mb-6"
                    style={{
                      fontSize: "1.05rem",
                      lineHeight: 1.65,
                      textShadow: "0 1px 8px rgba(0,0,0,0.2)",
                    }}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    {featuredArticle.excerpt}
                  </motion.p>

                  <motion.button
                    className="group/btn px-6 py-3 bg-white/14 backdrop-blur-md text-white rounded-xl border border-white/25 hover:bg-white/22 hover:border-[#00c389]/50 transition-all shadow-lg"
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 8px 24px rgba(0,195,137,0.28)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.48,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  >
                    <span className="flex items-center gap-2 text-base font-semibold">
                      Elolvasom
                      <motion.div
                        animate={{
                          x: hoveredId === featuredArticle.id ? 3 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                      </motion.div>
                    </span>
                  </motion.button>
                </div>

                <motion.div
                  className="absolute inset-0 rounded-[32px] pointer-events-none"
                  animate={{
                    boxShadow:
                      hoveredId === featuredArticle.id
                        ? "inset 0 0 0 2px rgba(0,195,137,0.16)"
                        : "inset 0 0 0 0px rgba(0,195,137,0)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.article>
            </motion.div>
          )}

          <div className="lg:col-span-2 space-y-5">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                onMouseEnter={() => setHoveredId(article.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <motion.article
                  className="group relative bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_6px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_36px_rgba(0,195,137,0.14)] transition-all duration-500"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[190px_1fr] lg:grid-cols-1 xl:grid-cols-[190px_1fr]">
                    <div className="relative h-48 md:h-full lg:h-44 xl:h-full overflow-hidden">
                      <motion.img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        animate={{
                          scale: hoveredId === article.id ? 1.08 : 1,
                        }}
                        transition={{
                          duration: 0.7,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />

                      <motion.div
                        className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${getCategoryColor(
                          article.category
                        )} rounded-lg shadow-md`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08 + 0.15 }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {article.category}
                        </span>
                      </motion.div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-3 text-gray-500 mb-3 text-[0.8125rem]">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            className="w-3.5 h-3.5 text-[#00c389]"
                            strokeWidth={2}
                          />
                          <span>{article.date}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock
                            className="w-3.5 h-3.5 text-[#00c389]"
                            strokeWidth={2}
                          />
                          <span>{article.readingTime} olvasás</span>
                        </div>
                      </div>

                      <h3 className="text-gray-900 mb-2 text-[1.08rem] font-bold tracking-[-0.015em] leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2 text-sm">
                        {article.excerpt}
                      </p>

                      <div className="w-12 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-4 opacity-30" />

                      <motion.button
                        className="inline-flex items-center gap-2 text-[#00c389]"
                        whileHover={{ x: 2 }}
                      >
                        <span className="text-sm font-semibold">Tovább</span>

                        <motion.div
                          animate={{
                            x: hoveredId === article.id ? 3 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                        </motion.div>
                      </motion.button>
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0 rounded-[24px] pointer-events-none"
                    animate={{
                      boxShadow:
                        hoveredId === article.id
                          ? "inset 0 0 0 2px rgba(0,195,137,0.12)"
                          : "inset 0 0 0 0px rgba(0,195,137,0)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.article>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="group px-9 py-4 bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-md hover:border-[#00c389] hover:shadow-xl transition-all"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <span className="flex items-center gap-2 text-base font-semibold">
              Összes cikk megtekintése
              <ArrowRight
                className="w-5 h-5 text-[#00c389] group-hover:translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}