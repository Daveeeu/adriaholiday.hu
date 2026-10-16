import { useSiteSettings } from "../site-settings/SiteSettingsProvider";
import { INSURANCE_PATH } from "./insurance";

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
          ? ` – ajándékba kapok egy ${settings.newsletterCouponValue.toLocaleString("hu-HU")} Ft-os kupont a következő utamhoz.`
          : "."}
      </span>
    </label>
  );
}
