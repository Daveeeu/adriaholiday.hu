import logo from "../../assets/payment/simplepay-bankcards.png";

const PAYMENT_INFO_URL = "https://simplepartner.hu/PaymentService/Fizetesi_tajekoztato.pdf";

/**
 * The official SimplePay logo with the accepted cards, shown as SimplePay's
 * merchant rules require: unmodified, on an opaque background, and linking to
 * its payment information. It has to be on the site's permanently visible part
 * (footer) and wherever a payment is started.
 */
export default function SimplePayLogo({ className = "" }: { className?: string }) {
  return (
    <a
      href={PAYMENT_INFO_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-block w-full max-w-[360px] rounded-lg bg-white p-2 ${className}`}
    >
      <img
        src={logo}
        width={1564}
        height={167}
        title="SimplePay - Online bankkártyás fizetés"
        alt="SimplePay vásárlói tájékoztató"
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
    </a>
  );
}
