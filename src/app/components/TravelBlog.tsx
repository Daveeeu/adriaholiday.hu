import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Clock, Calendar, Sparkles } from "lucide-react";

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
    title: "Horvátország 10 legszebb strandja",
    excerpt:
      "Kristálytiszta víz, rejtett öblök és mediterrán hangulat — fedezd fel Horvátország legszebb tengerpartjait.",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/brela.jpeg&op=;1200x900;",
    category: "Tengerpartok",
    date: "2026. január 25",
    readingTime: "5 perc",
    featured: true,
  },

  {
    id: "2",
    title: "Karneváli maszkok Velencében",
    excerpt:
      "A velencei karnevál története, legendás maszkjai és a város különleges hangulata.",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/carnival_venice_italy031-2.jpg&op=;800x720;",
    category: "Városnézés",
    date: "2026. január 19",
    readingTime: "4 perc",
  },

  {
    id: "3",
    title: "Érdekes szobrok a nagyvilágban",
    excerpt:
      "Különleges és ikonikus szobrok, amelyek mellett utazás közben egyszer mindenképp érdemes megállni.",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/28279603_1824636157580731_3729580786296626111_n.jpg&op=;800x720;",
    category: "Világ érdekességei",
    date: "2026. április 12",
    readingTime: "6 perc",
  },

  {
    id: "4",
    title: "Miért ismert világszerte a kubai szivar?",
    excerpt:
      "Hagyomány, kézművesség és kubai kultúra — ezért vált legendává a kubai szivar.",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/shutterstock_301377860%20%28002%29.jpg&op=;800x720;",
    category: "Gasztronómia",
    date: "2026. november 25",
    readingTime: "5 perc",
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
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-[#f5fffb] via-[#f7fbff] to-white overflow-hidden">
      <div className="absolute top-0 left-[6%] w-[420px] h-[420px] bg-gradient-to-br from-[#00c389]/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-[8%] w-[420px] h-[420px] bg-gradient-to-tl from-[#16b8ff]/8 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-[1450px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-end mb-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#00c389]/15 text-[#00a878] text-sm font-bold mb-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <Sparkles className="w-4 h-4" />
              ÚTI INSPIRÁCIÓK
            </div>

            <h2
              className="text-[#0f172a] mb-4"
              style={{
                fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)",
                fontWeight: 760,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
              }}
            >
              Utazó{" "}
              <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">
                Blog
              </span>
            </h2>

            <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
              Inspirációk, tippek és élmények a világ minden tájáról — röviden,
              hasznosan, utazásra hangolva.
            </p>
          </motion.div>

          <motion.div
            className="hidden lg:block rounded-[28px] bg-[#071426] p-7 text-white shadow-[0_20px_70px_rgba(7,20,38,0.18)]"
            initial={{ opacity: 0, x: 26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/60 text-sm mb-3">Adria Holiday tipp</p>
            <h3 className="text-2xl font-bold tracking-[-0.03em] mb-3">
              Utazás előtt 5 perc inspiráció is elég.
            </h3>
            <p className="text-white/62 leading-relaxed">
              Cikkek, amik segítenek választani, csomagolni és még jobban megélni az utazást.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
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
                className="group relative h-[520px] md:h-[560px] rounded-[34px] overflow-hidden shadow-[0_18px_65px_rgba(15,23,42,0.14)] hover:shadow-[0_24px_80px_rgba(0,195,137,0.18)] transition-all duration-700"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <motion.img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{ scale: hoveredId === featuredArticle.id ? 1.05 : 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/92 via-[#071426]/38 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/38 via-transparent to-transparent" />

                <motion.div
                  className={`absolute top-6 left-6 px-4 py-2 bg-gradient-to-r ${getCategoryColor(featuredArticle.category)} rounded-xl shadow-lg`}
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
                  className="absolute top-6 right-6 px-3.5 py-2 bg-white/16 backdrop-blur-lg rounded-xl border border-white/25"
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

                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
                  <motion.div
                    className="flex items-center gap-2 text-white/80 mb-4"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                  >
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm tracking-wide">{featuredArticle.date}</span>
                  </motion.div>

                  <motion.h3
                    className="text-white mb-4"
                    style={{
                      fontSize: "clamp(1.8rem, 3.2vw, 2.55rem)",
                      fontWeight: 760,
                      letterSpacing: "-0.04em",
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
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </span>
                  </motion.button>
                </div>
              </motion.article>
            </motion.div>
          )}

          <div className="lg:col-span-2 grid grid-cols-1 gap-5">
            {regularArticles.map((article, index) => (
              <motion.article
                key={article.id}
                className="group relative bg-white/92 backdrop-blur-xl rounded-[26px] overflow-hidden border border-gray-100 shadow-[0_10px_34px_rgba(15,23,42,0.07)] hover:shadow-[0_18px_48px_rgba(0,195,137,0.15)] transition-all duration-500"
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setHoveredId(article.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr] lg:grid-cols-1 xl:grid-cols-[190px_1fr]">
                  <div className="relative h-48 sm:h-full lg:h-44 xl:h-full overflow-hidden">
                    <motion.img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      animate={{ scale: hoveredId === article.id ? 1.08 : 1 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />

                    <motion.div
                      className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${getCategoryColor(article.category)} rounded-lg shadow-md`}
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
                        <Calendar className="w-3.5 h-3.5 text-[#00c389]" strokeWidth={2} />
                        <span>{article.date}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00c389]" strokeWidth={2} />
                        <span>{article.readingTime} olvasás</span>
                      </div>
                    </div>

                    <h3 className="text-[#0f172a] mb-2 text-[1.08rem] font-bold tracking-[-0.015em] leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2 text-sm">
                      {article.excerpt}
                    </p>

                    <div className="w-12 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-4 opacity-30" />

                    <motion.button className="inline-flex items-center gap-2 text-[#00c389]" whileHover={{ x: 2 }}>
                      <span className="text-sm font-semibold">Tovább</span>
                      <motion.div
                        animate={{ x: hoveredId === article.id ? 3 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="group px-8 py-4 bg-white/90 text-[#0f172a] rounded-2xl border border-gray-200 shadow-md hover:border-[#00c389] hover:shadow-xl transition-all"
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
