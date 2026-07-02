import { ArrowLeft, ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import LoadingScreen from "../components/LoadingScreen";
import StaticPage from "./StaticPage";
import Seo from "../seo/Seo";
import {
  fetchPortfolioBlogArticleDetail,
  fetchPortfolioBlogArticles,
  type PortfolioBlogArticleCard,
  type PortfolioBlogArticleDetail,
} from "../content/portfolio-blog-api";

function ArticleLinkCard({
  article,
  eyebrow,
}: {
  article: PortfolioBlogArticleCard;
  eyebrow: string;
}) {
  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_54px_rgba(15,23,42,0.1)]"
    >
      <div className="mb-3 text-xs font-bold tracking-[0.2em] text-[#00a878]">{eyebrow}</div>
      <div className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#0f172a]">
        {article.title}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span className="inline-flex items-center gap-2">
          <Calendar className="size-4 text-[#00c389]" />
          {article.publishedAtLabel ?? "Hamarosan"}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4 text-[#00c389]" />
          {article.readingTime}
        </span>
      </div>
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a878]">
        Megnyitás
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function BlogArticleRoute() {
  const { slug } = useParams();
  const [article, setArticle] = useState<PortfolioBlogArticleDetail | null>(null);
  const [articles, setArticles] = useState<PortfolioBlogArticleCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(false);
      setNotFound(false);

      const [detailResult, listResult] = await Promise.allSettled([
        fetchPortfolioBlogArticleDetail(slug),
        fetchPortfolioBlogArticles({ limit: 24, featuredOnly: false }),
      ]);

      if (cancelled) {
        return;
      }

      if (detailResult.status === "fulfilled") {
        setArticle(detailResult.value);
      } else {
        setArticle(null);
        setNotFound(detailResult.reason?.status === 404);
        setError(detailResult.reason?.status !== 404);
      }

      if (listResult.status === "fulfilled") {
        setArticles(listResult.value);
      } else {
        setArticles([]);
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const currentIndex = useMemo(
    () => articles.findIndex((entry) => entry.slug === slug),
    [articles, slug],
  );

  const previousArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < articles.length - 1
      ? articles[currentIndex + 1]
      : null;

  const relatedArticles = useMemo(() => {
    if (!article) {
      return [];
    }

    const primaryCategory = article.categorySlug;
    const related = articles.filter((entry) => entry.slug !== article.slug);
    const sameCategory = related.filter((entry) => entry.categorySlug === primaryCategory);
    const rest = related.filter((entry) => entry.categorySlug !== primaryCategory);

    return [...sameCategory, ...rest].slice(0, 3);
  }, [article, articles]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (notFound || !article) {
    return (
      <StaticPage title="A blog cikk nem található" noIndex canonicalPath={`/blog/${slug ?? ""}`}>
        <p>A keresett blog bejegyzés nem érhető el.</p>
      </StaticPage>
    );
  }

  if (error) {
    return (
      <StaticPage title="Nem sikerült betölteni a blog cikket" noIndex canonicalPath={`/blog/${slug ?? ""}`}>
        <p>A blog cikk betöltése közben hiba történt.</p>
      </StaticPage>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <Seo
        title={article.title}
        description={article.excerpt.replace(/<[^>]+>/g, " ").trim() || article.title}
        canonicalPath={`/blog/${article.slug}`}
        ogImageUrl={article.image ?? undefined}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          image: article.image ? [article.image] : [],
          datePublished: article.publishedAt,
          articleSection: article.category ?? undefined,
          description: article.excerpt.replace(/<[^>]+>/g, " ").trim() || article.title,
          author: {
            "@type": "Organization",
            name: "Adria Holiday",
          },
          publisher: {
            "@type": "Organization",
            name: "Adria Holiday",
          },
          mainEntityOfPage: `https://adriaholiday.hu/blog/${article.slug}`,
        }}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#071426] via-[#0d1f36] to-[#12314b] pb-16 pt-28 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,195,137,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(22,184,255,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Vissza a bloghoz
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-[#7ff2ca] backdrop-blur-md">
            <Sparkles className="size-4" />
            {article.category ?? "BLOG"}
          </div>

          <h1
            className="max-w-4xl text-white"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.8rem)",
              fontWeight: 760,
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
            }}
          >
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/72">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 text-[#00c389]" />
              {article.publishedAtLabel ?? "Hamarosan"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-[#00c389]" />
              {article.readingTime}
            </span>
          </div>
        </div>
      </section>

      <section className="-mt-8 pb-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
          <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            {article.image ? (
              <div className="relative h-[260px] md:h-[420px]">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-12 p-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_280px]">
              <article>
                {article.excerpt ? (
                  <div
                    className="mb-8 text-xl leading-9 text-gray-600"
                    dangerouslySetInnerHTML={{ __html: article.excerpt }}
                  />
                ) : null}

                <div
                  className="prose prose-lg max-w-none prose-headings:text-[#0f172a] prose-headings:tracking-[-0.03em] prose-p:text-gray-700 prose-p:leading-8 prose-a:text-[#00a878] prose-strong:text-[#0f172a] prose-ul:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </article>

              <aside className="space-y-5">
                <div className="rounded-[28px] border border-gray-100 bg-[#f7fbff] p-5">
                  <div className="mb-3 text-sm font-bold tracking-[0.18em] text-[#00a878]">
                    GYORS NAVIGÁCIÓ
                  </div>
                  <div className="space-y-3">
                    <Link
                      to="/blog"
                      className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] transition-all hover:border-[#00c389]/40"
                    >
                      Összes cikk
                      <ArrowRight className="size-4 text-[#00c389]" />
                    </Link>
                    {previousArticle ? (
                      <Link
                        to={`/blog/${previousArticle.slug}`}
                        className="block rounded-2xl border border-white bg-white px-4 py-3 transition-all hover:border-[#00c389]/40"
                      >
                        <div className="text-xs font-bold tracking-[0.16em] text-gray-400">
                          ELŐZŐ CIKK
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#0f172a]">
                          {previousArticle.title}
                        </div>
                      </Link>
                    ) : null}
                    {nextArticle ? (
                      <Link
                        to={`/blog/${nextArticle.slug}`}
                        className="block rounded-2xl border border-white bg-white px-4 py-3 transition-all hover:border-[#00c389]/40"
                      >
                        <div className="text-xs font-bold tracking-[0.16em] text-gray-400">
                          KÖVETKEZŐ CIKK
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#0f172a]">
                          {nextArticle.title}
                        </div>
                      </Link>
                    ) : null}
                  </div>
                </div>

                {article.tags.length > 0 ? (
                  <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 text-sm font-bold tracking-[0.18em] text-[#00a878]">
                      CÍMKÉK
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-[#f5f9fc] px-3 py-1.5 text-xs font-semibold text-gray-600"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>

          {relatedArticles.length > 0 ? (
            <div className="mt-16">
              <div className="mb-8">
                <div className="mb-2 text-sm font-bold text-[#00a878]">AJÁNLOTT OLVASNIVALÓ</div>
                <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#0f172a]">
                  További blog cikkek
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedArticles.map((entry, index) => (
                  <ArticleLinkCard
                    key={entry.id}
                    article={entry}
                    eyebrow={index === 0 ? "Kapcsolódó" : "Következő olvasmány"}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
