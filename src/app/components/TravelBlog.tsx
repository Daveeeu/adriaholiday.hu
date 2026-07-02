import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { EditableText } from "../content/EditableFields";
import { EditablePortfolioHeading } from "../content/PortfolioHeading";
import {
  fetchPortfolioBlogArticles,
  type PortfolioBlogArticleCard,
} from "../content/portfolio-blog-api";

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categorySlug: string;
  slug: string;
  publishedAtLabel: string;
  readingTime: string;
  featured?: boolean;
}

const articlesFallback: BlogArticle[] = [
  {
    id: "1",
    title: "Horvátország 10 legszebb strandja",
    excerpt:
      "Kristálytiszta víz, rejtett öblök és mediterrán hangulat — fedezd fel Horvátország legszebb tengerpartjait.",
    image:
      "https://adriaholiday.hu/framework/img.php?p=files/brela.jpeg&op=;1200x900;",
    category: "Tengerpartok",
    categorySlug: "tengerpartok",
    slug: "horvatorszag-10-legszebb-strandja",
    publishedAtLabel: "2026. január 25",
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
    categorySlug: "varosnezes",
    slug: "karnevali-maszkok-velenceben",
    publishedAtLabel: "2026. január 19",
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
    categorySlug: "vilag-erdekessegei",
    slug: "erdekes-szobrok-a-nagyvilagban",
    publishedAtLabel: "2026. április 12",
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
    categorySlug: "gasztronomia",
    slug: "miert-ismert-vilagszerte-a-kubai-szivar",
    publishedAtLabel: "2026. november 25",
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
    case "Világ érdekességei":
      return "from-[#16b8ff] to-[#00c389]";
    default:
      return "from-gray-500 to-gray-600";
  }
};

function formatPublishedAtLabel(value?: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

function normalizePortfolioArticles(
  articles: PortfolioBlogArticleCard[],
): BlogArticle[] {
  return articles.map((article, index) => ({
    id: String(article.id),
    title: article.title,
    excerpt: article.excerpt,
    image:
      article.image ??
      "https://adriaholiday.hu/framework/img.php?p=files/brela.jpeg&op=;1200x900;",
    category: article.category ?? "Utazási tippek",
    categorySlug: article.categorySlug ?? "utazasi-tippek",
    slug: article.slug,
    publishedAtLabel:
      article.publishedAtLabel ?? formatPublishedAtLabel(article.publishedAt),
    readingTime: article.readingTime || `${Math.max(1, 4 + index)} perc`,
  }));
}

export default function TravelBlog() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [portfolioArticles, setPortfolioArticles] = useState<BlogArticle[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioBlogArticles({ limit: 6, featuredOnly: true })
      .then((articles) => {
        if (!cancelled) {
          setPortfolioArticles(normalizePortfolioArticles(articles));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPortfolioArticles([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const articles = useMemo(() => {
    if (portfolioArticles && portfolioArticles.length > 0) {
      return portfolioArticles;
    }

    return articlesFallback;
  }, [portfolioArticles]);

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1, 4);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5fffb] via-[#f7fbff] to-white py-16 md:py-20">
      <div className="absolute left-[6%] top-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#00c389]/8 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-[8%] h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-[#16b8ff]/8 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-[1450px] px-6 md:px-10 lg:px-16">
        <div className="mb-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00c389]/15 bg-white/80 px-4 py-2 text-sm font-bold text-[#00a878] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <Sparkles className="h-4 w-4" />
              <EditableText
                fieldKey="home.blog.eyebrow"
                fallback="ÚTI INSPIRÁCIÓK"
                as="span"
              />
            </div>

            <div className="mb-4">
              <EditablePortfolioHeading
                fieldKey="home.blog.titleParts"
                fallbackParts={[
                  { text: "Utazó" },
                  { text: "Blog", variant: "gradient" },
                ]}
                as="h2"
                mode="inline"
                className="m-0 text-[#0f172a]"
                style={{
                  fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)",
                  fontWeight: 760,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.05,
                }}
              />
            </div>

            <EditableText
              fieldKey="home.blog.description"
              fallback="Inspirációk, tippek és élmények a világ minden tájáról — röviden, hasznosan, utazásra hangolva."
              as="p"
              className="max-w-2xl text-lg leading-relaxed text-gray-600"
            />
          </motion.div>

          <motion.div
            className="hidden rounded-[28px] bg-[#071426] p-7 text-white shadow-[0_20px_70px_rgba(7,20,38,0.18)] lg:block"
            initial={{ opacity: 0, x: 26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-sm text-white/60">Adria Holiday tipp</p>
            <div className="mb-3">
              <EditablePortfolioHeading
                fieldKey="home.blog.tip.titleParts"
                fallbackParts={[
                  { text: "Utazás előtt" },
                  { text: "5 perc inspiráció is elég.", variant: "gradient" },
                ]}
                as="h3"
                mode="inline"
                className="m-0 text-2xl font-bold tracking-[-0.03em]"
              />
            </div>
            <EditableText
              fieldKey="home.blog.tip.description"
              fallback="Cikkek, amik segítenek választani, csomagolni és még jobban megélni az utazást."
              as="p"
              className="leading-relaxed text-white/62"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
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
                className="group relative h-[520px] overflow-hidden rounded-[34px] shadow-[0_18px_65px_rgba(15,23,42,0.14)] transition-all duration-700 hover:shadow-[0_24px_80px_rgba(0,195,137,0.18)] md:h-[560px]"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <motion.img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  animate={{ scale: hoveredId === featuredArticle.id ? 1.05 : 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/92 via-[#071426]/38 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/38 via-transparent to-transparent" />

                <motion.div
                  className={`absolute left-6 top-6 rounded-xl bg-gradient-to-r px-4 py-2 shadow-lg ${getCategoryColor(featuredArticle.category)}`}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="text-sm font-semibold text-white">
                    {featuredArticle.category}
                  </span>
                </motion.div>

                <motion.div
                  className="absolute right-6 top-6 rounded-xl border border-white/25 bg-white/16 px-3.5 py-2 backdrop-blur-lg"
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white" strokeWidth={2} />
                    <span className="text-sm font-semibold text-white">
                      {featuredArticle.readingTime} olvasás
                    </span>
                  </div>
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
                  <motion.div
                    className="mb-4 flex flex-wrap items-center gap-3 text-white/80"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" strokeWidth={2} />
                      <span className="text-sm tracking-wide">
                        {featuredArticle.publishedAtLabel}
                      </span>
                    </div>
                    <span className="text-sm text-white/55">•</span>
                    <span className="font-mono text-xs tracking-[0.16em] text-white/70">
                      /{featuredArticle.slug}
                    </span>
                  </motion.div>

                  <motion.h3
                    className="mb-4 text-white"
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
                    className="mb-6 max-w-2xl text-white/88"
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

                  <motion.div
                    className="group/btn rounded-xl border border-white/25 bg-white/14 px-6 py-3 text-white backdrop-blur-md transition-all hover:border-[#00c389]/50 hover:bg-white/22"
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
                    <Link to={`/blog/${featuredArticle.slug}`} className="flex items-center gap-2 text-base font-semibold">
                      Elolvasom
                      <ArrowRight
                        className="h-5 w-5 transition-transform group-hover/btn:translate-x-1"
                        strokeWidth={2.5}
                      />
                    </Link>
                  </motion.div>
                </div>
              </motion.article>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:col-span-2">
            {regularArticles.map((article, index) => (
              <motion.article
                key={article.id}
                className="group relative overflow-hidden rounded-[26px] border border-gray-100 bg-white/92 shadow-[0_10px_34px_rgba(15,23,42,0.07)] transition-all duration-500 hover:shadow-[0_18px_48px_rgba(0,195,137,0.15)] backdrop-blur-xl"
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setHoveredId(article.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr] lg:grid-cols-1 xl:grid-cols-[190px_1fr]">
                  <div className="relative h-48 overflow-hidden sm:h-full lg:h-44 xl:h-full">
                    <motion.img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover"
                      animate={{ scale: hoveredId === article.id ? 1.08 : 1 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />

                    <motion.div
                      className={`absolute left-3 top-3 rounded-lg bg-gradient-to-r px-3 py-1.5 shadow-md ${getCategoryColor(article.category)}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 + 0.15 }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {article.category}
                      </span>
                    </motion.div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[0.8125rem] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#00c389]" strokeWidth={2} />
                        <span>{article.publishedAtLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#00c389]" strokeWidth={2} />
                        <span>{article.readingTime} olvasás</span>
                      </div>
                    </div>

                    <div className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-gray-400">
                      /{article.slug}
                    </div>

                    <h3 className="mb-2 text-[1.08rem] font-bold tracking-[-0.015em] leading-snug text-[#0f172a]">
                      {article.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {article.excerpt}
                    </p>

                    <div className="mb-4 h-[2px] w-12 bg-gradient-to-r from-[#00c389] to-transparent opacity-30" />

                    <motion.div
                      className="inline-flex items-center gap-2 text-[#00c389]"
                      whileHover={{ x: 2 }}
                    >
                      <Link to={`/blog/${article.slug}`} className="inline-flex items-center gap-2">
                        <span className="text-sm font-semibold">Tovább</span>
                        <motion.div
                          animate={{ x: hoveredId === article.id ? 3 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="group rounded-2xl border border-gray-200 bg-white/90 px-8 py-4 text-[#0f172a] shadow-md transition-all hover:border-[#00c389] hover:shadow-xl"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Link to="/blog" className="flex items-center gap-2 text-base font-semibold">
              Összes cikk megtekintése
              <ArrowRight
                className="h-5 w-5 text-[#00c389] transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
