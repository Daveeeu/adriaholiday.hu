// `?no-inline` keeps every flag as a separate asset, so the browser only downloads the flags it renders.
const FLAG_URLS = import.meta.glob<string>("/node_modules/flag-icons/flags/4x3/*.svg", {
  eager: true,
  import: "default",
  query: "?no-inline",
});

function flagUrl(countryCode: string) {
  return FLAG_URLS[`/node_modules/flag-icons/flags/4x3/${countryCode.trim().toLowerCase()}.svg`];
}

type CountryFlagProps = {
  /** ISO 3166-1 alpha-2 country code, e.g. "hr". */
  code: string;
  className?: string;
};

/** Decorative flag for a country; renders nothing for unknown codes. Always pair it with a visible label. */
export default function CountryFlag({ code, className = "" }: CountryFlagProps) {
  const src = flagUrl(code);

  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width={20}
      height={15}
      className={`h-[15px] w-5 shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.08)] ${className}`}
    />
  );
}
