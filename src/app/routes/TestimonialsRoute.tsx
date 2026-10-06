import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

import RichTextContent from "../components/RichTextContent";
import {
  fetchPortfolioTestimonials,
  formatTestimonialDate,
  testimonialAnchor,
  testimonialInitials,
  type PortfolioTestimonial,
} from "../content/portfolio-testimonials-api";
import Seo from "../seo/Seo";
import { absoluteUrl } from "../seo/site";

const PATH = "/rolunk-irtak";
const TITLE = "Rólunk írták";
const DESCRIPTION = "Utasaink levelei és élménybeszámolói az Adria Holiday utazásairól.";
const PER_PAGE = 50;

export default function TestimonialsRoute() {
  const [testimonials, setTestimonials] = useState<PortfolioTestimonial[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    fetchPortfolioTestimonials(page, PER_PAGE)
      .then((response) => {
        if (cancelled) return;
        setTestimonials((current) => (page === 1 ? response.items : [...current, ...response.items]));
        setTotalCount(response.totalCount);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // A letter linked from the home page may only exist once it has loaded.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && testimonials.length > 0) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fffb] via-white to-white">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        canonicalPath={PATH}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Főoldal", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: TITLE, item: absoluteUrl(PATH) },
            ],
          },
        ]}
      />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00c389]/8 text-[#00a878] text-sm font-bold mb-5">
          <span className="w-2 h-2 rounded-full bg-[#00c389]" />
          UTASVÉLEMÉNYEK
        </div>
        <h1 className="text-[#0f172a] font-bold tracking-tight" style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)" }}>
          Rólunk{" "}
          <span className="bg-gradient-to-r from-[#00c389] to-[#16b8ff] bg-clip-text text-transparent">írták</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">{DESCRIPTION}</p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-6">
        {status === "error" ? (
          <p className="text-center text-gray-500">A levelek most nem tölthetők be, kérjük, próbáld újra később.</p>
        ) : null}

        {testimonials.map((testimonial) => (
          <article
            key={testimonial.id}
            id={testimonialAnchor(testimonial.id)}
            className="scroll-mt-28 relative rounded-[28px] bg-white border border-gray-100 p-7 md:p-9 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
          >
            <Quote className="absolute top-7 right-7 w-8 h-8 text-[#00c389]/30" aria-hidden="true" />
            <header className="flex items-center gap-4 mb-5 pr-12">
              <div
                aria-hidden="true"
                className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#00c389] to-[#16b8ff] text-white font-bold flex items-center justify-center"
              >
                {testimonialInitials(testimonial.author)}
              </div>
              <div>
                <h2 className="text-[#0f172a] text-xl font-bold">{testimonial.title}</h2>
                <p className="text-sm text-gray-500">
                  {testimonial.author ? `${testimonial.author} · ` : ""}
                  {formatTestimonialDate(testimonial.publishedAt)}
                </p>
              </div>
            </header>
            <RichTextContent html={testimonial.body} />
          </article>
        ))}

        {status === "ready" && testimonials.length < totalCount ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-semibold shadow-lg"
            >
              További levelek
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
