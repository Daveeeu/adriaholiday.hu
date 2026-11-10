import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { INSURANCE_PATH } from "./insurance";
import { formatHuf } from "../lib/price";

/**
 * The booking forms' required statement: the customer travels with the
 * agency and accepts its terms, the insurance product information and the
 * privacy policy.
 */
export function BookingTermsConsent({
  checked,
  error,
  onChange,
}: {
  checked: boolean;
  error?: string | null;
  onChange: (checked: boolean) => void;
}) {
  const { settings } = useSiteSettings();

  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 accent-[#00c389]"
        />
        <span>
          Kijelentem, hogy az Adria Holiday Utazási Iroda Kft. által szervezett utazáson részt veszek. Az{" "}
          <a href={settings.termsUrl || "/aszf"} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
            általános szerződési feltételeket
          </a>{" "}
          (benne az utazási szerződéshez kapcsolódó tájékoztatóval), a{" "}
          <a href={INSURANCE_PATH} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
            biztosítási termékismertetőt
          </a>{" "}
          (útlemondási biztosítás, betegség-, baleset-, poggyászbiztosítás) és az{" "}
          <a href={settings.privacyUrl || "/adatvedelem"} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
            adatkezelési tájékoztatót
          </a>{" "}
          elolvastam és elfogadom, a személyes adataim kezeléséhez hozzájárulok.*
        </span>
      </label>
      {error ? <p data-booking-error className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

/**
 * SimplePay's mandatory data transfer statement, accepted before the payment
 * starts. Its wording is prescribed: only the bracketed merchant details of
 * SimplePay's template are ours, and they have to match the contract.
 */
export function PaymentDataTransferConsent({
  checked,
  error,
  onChange,
}: {
  checked: boolean;
  error?: string | null;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 accent-[#00c389]"
        />
        <span>
          Tudomásul veszem, hogy a(z) Adria-Holiday Kft. (1076 Budapest, Garay utca 16 Fsz/4) adatkezelő által a(z)
          adriaholiday.hu felhasználói adatbázisában tárolt alábbi személyes adataim átadásra kerülnek a SimplePay
          Zrt., mint adatfeldolgozó részére. Az adatkezelő által továbbított adatok köre az alábbi: név, e-mail cím,
          telefonszám, számlázási cím. Az adatfeldolgozó által végzett adatfeldolgozási tevékenység jellege és célja a
          SimplePay Adatkezelési tájékoztatóban, az alábbi linken tekinthető meg:{" "}
          <a
            href="https://simplepay.hu/adatkezelesi-tajekoztatok/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#00a878] underline"
          >
            https://simplepay.hu/adatkezelesi-tajekoztatok/
          </a>
          *
        </span>
      </label>
      {error ? <p data-booking-error className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

/** Opting in to the newsletter (and its coupon, when the site offers one). */
export function NewsletterConsent({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { settings } = useSiteSettings();

  return (
    <label className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 accent-[#00c389]"
      />
      <span>
        Szeretnék hírlevélben értesülni további ajánlatokról
        {settings.newsletterCouponValue > 0
          ? ` – ajándékba kapok egy ${formatHuf(settings.newsletterCouponValue)}-os kupont a következő utamhoz.`
          : "."}
      </span>
    </label>
  );
}
