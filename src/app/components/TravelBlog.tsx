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
    excerpt: "Fedezd fel Dalmácia legelbűvölőbb zugait, amelyeket a turisták ritkán látogatnak meg.",
    image: "https://images.unsplash.com/photo-1566043527683-c6d0e0a91430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400&q=90",
    category: "Tengerpartok",
    date: "2026. május 12",
    readingTime: "5 perc",
    featured: true,
  },
  {
    id: "2",
    title: "Hogyan csomagoljunk egy egyhetes körutazásra?",
    excerpt: "Praktikus tippek a hatékony csomagoláshoz és a súlykorlát betartásához.",
    image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=90",
    category: "Utazási tippek",
    date: "2026. május 10",
    readingTime: "4 perc",
  },
  {
    id: "3",
    title: "Velence tavasszal: a legjobb látnivalók",
    excerpt: "Miért érdemes tavasszal látogatni a lagúnák városát és mit ne hagyj ki.",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=90",
    category: "Városnézés",
    date: "2026. május 8",
    readingTime: "6 perc",
  },
  {
    id: "4",
    title: "Az olasz konyha titkai: mit kóstoljunk meg?",
    excerpt: "Autentikus olasz ételek, amelyeket minden utazónak meg kell kóstolnia.",
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=90",
    category: "Gasztronómia",
    date: "2026. május 5",
    readingTime: "7 perc",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Tengerpartok":
      return "from-[#00c389] to-[#0ea5e9]";
    case "Utazási tippek":
      return "from-[#00c389] to-[#16b8ff]";
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
    <section className="relative py-40 bg-white overflow-hidden">

      <div className="relative max-w-[1500px] mx-auto px-8 md:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-gray-900 mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
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

        {/* Premium Magazine Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Featured Article - Large Cinematic Left */}
          {featuredArticle && (
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onMouseEnter={() => setHoveredId(featuredArticle.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.article
                className="group relative rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,195,128,0.2)] transition-all duration-700 h-full"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Full-height cinematic image with text overlay */}
                <div className="relative h-[700px] overflow-hidden">
                  <motion.img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === featuredArticle.id ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Magazine-style gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-transparent to-transparent" />

                  {/* Category Badge */}
                  <motion.div
                    className={`absolute top-8 left-8 px-4 py-2 bg-gradient-to-r ${getCategoryColor(
                      featuredArticle.category
                    )} rounded-xl shadow-lg`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-white" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {featuredArticle.category}
                    </span>
                  </motion.div>

                  {/* Reading Time Badge */}
                  <motion.div
                    className="absolute top-8 right-8 px-3.5 py-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white" strokeWidth={2} />
                      <span className="text-white" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {featuredArticle.readingTime} olvasás
                      </span>
                    </div>
                  </motion.div>

                  {/* Editorial text overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-10">
                    {/* Date */}
                    <motion.div
                      className="flex items-center gap-2 text-white/80 mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <Calendar className="w-4 h-4" strokeWidth={2} />
                      <span style={{ fontSize: "0.875rem", letterSpacing: "0.02em" }}>
                        {featuredArticle.date}
                      </span>
                    </motion.div>

                    {/* Title - Large editorial */}
                    <motion.h3
                      className="text-white mb-4"
                      style={{
                        fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        lineHeight: 1.15,
                        textShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      {featuredArticle.title}
                    </motion.h3>

                    {/* Excerpt */}
                    <motion.p
                      className="text-white/90 max-w-2xl mb-6"
                      style={{
                        fontSize: "1.0625rem",
                        lineHeight: 1.6,
                        textShadow: "0 1px 8px rgba(0, 0, 0, 0.2)",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                    >
                      {featuredArticle.excerpt}
                    </motion.p>

                    {/* CTA Button */}
                    <motion.button
                      className="group/btn px-6 py-3 bg-white/15 backdrop-blur-md text-white rounded-xl border border-white/30 hover:bg-white/25 hover:border-[#00c389]/50 transition-all shadow-lg"
                      whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0, 195, 137, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <span className="flex items-center gap-2" style={{ fontSize: "1rem", fontWeight: 600 }}>
                        Elolvasom
                        <motion.div
                          animate={{
                            x: hoveredId === featuredArticle.id ? 3 : 0,
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </motion.div>
                      </span>
                    </motion.button>
                  </div>
                </div>

                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 rounded-[32px] pointer-events-none"
                  animate={{
                    boxShadow:
                      hoveredId === featuredArticle.id
                        ? "inset 0 0 0 2px rgba(0, 195, 128, 0.15)"
                        : "inset 0 0 0 0px rgba(0, 195, 128, 0)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.article>
            </motion.div>
          )}

          {/* Editorial Articles - Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredId(article.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <motion.article
                  className="group relative bg-white rounded-[24px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,195,128,0.15)] transition-all duration-500"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                  {/* Vertical layout: Image on top */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      animate={{
                        scale: hoveredId === article.id ? 1.08 : 1,
                      }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <motion.div
                      className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${getCategoryColor(
                        article.category
                      )} rounded-lg shadow-md`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <span className="text-white" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {article.category}
                      </span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-gray-500 mb-3" style={{ fontSize: "0.8125rem" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#00c389]" strokeWidth={2} />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00c389]" strokeWidth={2} />
                        <span>{article.readingTime} olvasás</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-gray-900 mb-3"
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        letterSpacing: "-0.015em",
                        lineHeight: 1.3,
                      }}
                    >
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2" style={{ fontSize: "0.875rem" }}>
                      {article.excerpt}
                    </p>

                    {/* Divider */}
                    <div className="w-12 h-[2px] bg-gradient-to-r from-[#00c389] to-transparent mb-4 opacity-30" />

                    {/* CTA */}
                    <motion.button
                      className="inline-flex items-center gap-2 text-[#00c389]"
                      whileHover={{ x: 2 }}
                    >
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        Tovább
                      </span>
                      <motion.div
                        animate={{
                          x: hoveredId === article.id ? 3 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-[24px] pointer-events-none"
                    animate={{
                      boxShadow:
                        hoveredId === article.id
                          ? "inset 0 0 0 2px rgba(0, 195, 128, 0.12)"
                          : "inset 0 0 0 0px rgba(0, 195, 128, 0)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.article>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className="group px-10 py-4 bg-white text-gray-900 rounded-2xl border-2 border-gray-200 shadow-md hover:border-[#00c389] hover:shadow-xl transition-all"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <span className="relative flex items-center gap-2" style={{ fontSize: "1rem", fontWeight: 600 }}>
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
