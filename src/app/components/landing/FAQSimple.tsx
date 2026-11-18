const faqs = [
  {
    q: "Mikor kell fizetnem az utazás árát?",
    a: "A foglaláskor 30% előleget kell fizetni, a fennmaradó összeget pedig legkésőbb 30 nappal az indulás előtt.",
  },
  {
    q: "Mi van, ha le kell mondanom az utazást?",
    a: "A lemondási feltételek az indulás előtti időponttól függenek. Javasoljuk utasbiztosítás megkötését.",
  },
  {
    q: "Milyen típusú buszokkal utazunk?",
    a: "Modern, kényelmes, légkondicionált buszokkal utazunk, amelyek hosszabb utakra is alkalmasak.",
  },
  {
    q: "Milyen étkezés van az utazás során?",
    a: "Az ellátás utazásonként változik, általában reggeli, félpanzió vagy teljes ellátás érhető el.",
  },
  {
    q: "Szükséges-e útiokmány a horvát tengerpartra?",
    a: "Magyar állampolgárok személyi igazolvánnyal vagy útlevéllel utazhatnak Horvátországba.",
  },
] as const;

export default function FAQSimple() {
  return (
    <section className="bg-white" aria-labelledby="faq-title">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-20 py-12 sm:py-14">
        <h2
          id="faq-title"
          className="text-slate-900 font-semibold tracking-[-0.03em] text-2xl sm:text-3xl"
        >
          Gyakran ismételt kérdések
        </h2>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Rövid válaszok, hogy gyorsabban dönthess.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-black/10 bg-white p-5 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-xl">
                <span className="select-none">{item.q}</span>
              </summary>
              <div className="mt-3 text-slate-600 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

