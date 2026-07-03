import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import LoadingScreen from "../components/LoadingScreen";
import Seo from "../seo/Seo";
import {
  fetchPortfolioBlogArticles,
  type PortfolioBlogArticleCard,
} from "../content/portfolio-blog-api";
import { absoluteUrl } from "../seo/site";

function ArticleCard({ article }: { article: PortfolioBlogArticleCard }) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-[0_10px_34px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
      <Link to={`/blog/${article.slug}`} className="block">
        <div className="relative h-64 overflow-hidden">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#dff8ef] to-[#e5f4ff]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/72 via-[#071426]/18 to-transparent" />
          {article.category ? (
            <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              {article.category}
            </div>
          ) : null}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {article.publishedAtLabel ?? "Hamarosan"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {article.readingTime}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <h2 className="line-clamp-2 text-2xl font-bold tracking-[-0.03em] text-[#0f172a]">
            {article.title}
          </h2>
          <div
            className="line-clamp-3 text-sm leading-7 text-gray-600"
            dangerouslySetInnerHTML={{ __html: article.excerpt || "" }}
          />
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a878]">
            Elolvasom
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogRoute() {
  const [articles, setArticles] = useState<PortfolioBlogArticleCard[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioBlogArticles({ limit: 24, featuredOnly: false })
      .then((items) => {
        if (!cancelled) {
          setArticles(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setArticles([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => articles?.[0] ?? null, [articles]);
  const rest = useMemo(() => (articles ?? []).slice(1), [articles]);

  if (articles === null) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <Seo
        title="Utazó Blog"
        description="Utazási inspirációk, tippek és történetek az Adria Holiday blogján."
        canonicalPath="/blog"
        ogType="article"
        ogImageUrl={featured?.image ?? undefined}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Utazó blog",
            description: "Utazási inspirációk, tippek és történetek az Adria Holiday blogján.",
            url: absoluteUrl("/blog"),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
            ],
          },
        ]}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#071426] via-[#0d1f36] to-[#12314b] pb-20 pt-28 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,195,137,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(22,184,255,0.16),transparent_28%)]" />
        <div className="relative mx-auto max-w-[1450px] px-6 md:px-10 lg:px-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-[#7ff2ca] backdrop-blur-md">
              <Sparkles className="size-4" />
              BLOG
            </div>
            <h1
              className="mb-5 text-white"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                fontWeight: 760,
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
              }}
            >
              Utazó blog
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/72">
              Inspirációk, tippek és történetek, hogy az utazás már az indulás előtt elkezdődhessen.
            </p>
          </div>
        </div>
      </section>

      <section className="-mt-12 pb-20">
        <div className="mx-auto max-w-[1450px] px-6 md:px-10 lg:px-16">
          {featured ? (
            <div className="mb-12 overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative min-h-[380px]">
                  {featured.image ? (
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/72 via-[#071426]/24 to-transparent" />
                </div>

                <div className="flex flex-col justify-center p-8 md:p-10">
                  <div className="mb-3 text-sm font-semibold tracking-[0.22em] text-[#00a878]">
                    KIEMELT CIKK
                  </div>
                  <h2 className="mb-4 text-4xl font-bold tracking-[-0.04em] text-[#0f172a]">
                    {featured.title}
                  </h2>
                  <div
                    className="mb-6 text-base leading-8 text-gray-600"
                    dangerouslySetInnerHTML={{ __html: featured.excerpt || "" }}
                  />
                  <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="size-4 text-[#00c389]" />
                      {featured.publishedAtLabel ?? "Hamarosan"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="size-4 text-[#00c389]" />
                      {featured.readingTime}
                    </span>
                  </div>
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3.5 text-white font-semibold shadow-[0_20px_40px_rgba(0,195,137,0.24)]"
                  >
                    Részletek
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 text-sm font-bold text-[#00a878]">CIKKEK</div>
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#0f172a]">
                Minden bejegyzés
              </h2>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm">
              {articles.length} cikk
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-[30px] border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
              {error ? "A blog cikkek betöltése közben hiba történt." : "Még nincs elérhető blog cikk."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {(featured ? rest : articles).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
