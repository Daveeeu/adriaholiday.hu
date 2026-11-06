import bannerDark from "../../assets/payment/barion-banner-dark.png";
import bannerLight from "../../assets/payment/barion-banner-light.png";

/**
 * Official Barion "Smart Payment Banner" (accepted payment methods), shown
 * unmodified as the Barion shop approval requires: on the main page (footer)
 * and on the payment pages. Use the dark variant on dark backgrounds.
 */
const BANNERS = {
  light: bannerLight,
  dark: bannerDark,
} as const;

export default function BarionPaymentBanner({
  variant,
  className = "",
}: {
  variant: keyof typeof BANNERS;
  className?: string;
}) {
  return (
    <img
      src={BANNERS[variant]}
      width={1183}
      height={165}
      alt="Barion – elfogadott fizetési módok: Barion, Mastercard, Visa, Diners Club, Discover, Apple Pay, Google Pay"
      loading="lazy"
      decoding="async"
      className={`h-auto w-full max-w-[340px] ${className}`}
    />
  );
}
