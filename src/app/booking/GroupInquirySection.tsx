import { useState, type FormEvent } from "react";
import { Check, Users } from "lucide-react";
import { useAnalytics } from "../analytics/useAnalytics";
import { BookingApiError, BookingValidationError, submitTourInquiry } from "./bookings-api";

/** Groups from this size can ask for a tailored offer on a custom date. */
export const GROUP_INQUIRY_MIN_PASSENGERS = 20;

type GroupInquirySectionProps = {
  trip: { id: number | string; slug: string; title: string };
  /** The selected date cannot be booked (none scheduled, sold out, cancelled): the request form stays open; otherwise it opens on demand. */
  requestOnly: boolean;
};

type InquiryValues = {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  city: string;
  street: string;
  dateFrom: string;
  dateTo: string;
  passengerCount: string;
  message: string;
  privacyAccepted: boolean;
};

const EMPTY_VALUES: InquiryValues = {
  name: "",
  email: "",
  phone: "",
  postalCode: "",
  city: "",
  street: "",
  dateFrom: "",
  dateTo: "",
  passengerCount: String(GROUP_INQUIRY_MIN_PASSENGERS),
  message: "",
  privacyAccepted: false,
};

/** Maps the API's snake_case validation keys to the form's fields. */
const ERROR_FIELDS: Record<string, keyof InquiryValues> = {
  name: "name",
  email: "email",
  phone: "phone",
  postal_code: "postalCode",
  city: "city",
  street: "street",
  date_from: "dateFrom",
  date_to: "dateTo",
  passenger_count: "passengerCount",
  message: "message",
  privacy_accepted: "privacyAccepted",
};

type TextField = Exclude<keyof InquiryValues, "privacyAccepted">;

const TEXT_FIELDS: Array<{ key: TextField; label: string; type: string; required?: boolean }> = [
  { key: "name", label: "Név", type: "text", required: true },
  { key: "email", label: "E-mail", type: "email", required: true },
  { key: "phone", label: "Telefon", type: "tel" },
  { key: "postalCode", label: "Irányítószám", type: "text" },
  { key: "city", label: "Város", type: "text" },
  { key: "street", label: "Utca, házszám", type: "text" },
  { key: "dateFrom", label: "Dátum -tól", type: "date", required: true },
  { key: "dateTo", label: "Dátum -ig", type: "date", required: true },
  { key: "passengerCount", label: "Utasok száma", type: "number", required: true },
];

/**
 * Group quote request for a custom date ("egyedi időpont"), mirroring the
 * legacy site's offer: available for groups of at least 20 people, and the
 * only way to book tours that have no scheduled dates.
 */
export default function GroupInquirySection({ trip, requestOnly }: GroupInquirySectionProps) {
  const { trackEvent } = useAnalytics();
  const [openedOnDemand, setOpen] = useState(false);
  const open = requestOnly || openedOnDemand;
  const [values, setValues] = useState<InquiryValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function setValue<K extends keyof InquiryValues>(key: K, value: InquiryValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      await submitTourInquiry({
        tourId: trip.id,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        postalCode: values.postalCode || undefined,
        city: values.city || undefined,
        street: values.street || undefined,
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
        passengerCount: Number(values.passengerCount),
        message: values.message || undefined,
        privacyAccepted: values.privacyAccepted,
      });

      setStatus("success");
      trackEvent("lead_submit", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { source: "group_inquiry", passengers: Number(values.passengerCount) },
      });
    } catch (submitError) {
      setStatus("idle");

      if (submitError instanceof BookingValidationError) {
        const nextErrors: Partial<Record<keyof InquiryValues, string>> = {};

        Object.entries(submitError.errors).forEach(([key, messages]) => {
          const field = ERROR_FIELDS[key];
          if (field) {
            nextErrors[field] = messages[0];
          }
        });

        setErrors(nextErrors);
        setErrorMessage("Kérjük, javítsd a megjelölt mezőket.");
      } else if (submitError instanceof BookingApiError) {
        setErrorMessage(submitError.message);
      } else {
        setErrorMessage("Váratlan hiba történt az ajánlatkérés elküldése közben.");
      }
    }
  }

  return (
    <section id="ajanlatkeres" className="scroll-mt-[92px] rounded-[40px] bg-white border border-gray-100 p-6 md:p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#00c389]/10 text-[#00c389] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight">Egyedi ajánlatkérés</h2>
            <p className="text-gray-500 mt-1">
              Egyedi időpont és egyedi ajánlat igénylése min. {GROUP_INQUIRY_MIN_PASSENGERS} fő foglalás esetén lehetséges.
            </p>
          </div>
        </div>

        {!open && status !== "success" ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-12 px-6 rounded-xl bg-gray-100 text-[#0f172a] font-bold hover:bg-gray-200 transition-colors"
          >
            Ajánlatkérés
          </button>
        ) : null}
      </div>

      {status === "success" ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#00c389]/10 p-5 text-[#0f172a]">
          <Check className="w-5 h-5 text-[#00a878]" />
          Köszönjük, megkaptuk az ajánlatkérésedet. Kollégáink hamarosan felveszik veled a kapcsolatot.
        </div>
      ) : open ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEXT_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="block text-sm font-bold text-[#0f172a] mb-2">
                  {field.label}
                  {field.required ? "*" : ""}
                </span>
                <input
                  type={field.type}
                  min={field.key === "passengerCount" ? GROUP_INQUIRY_MIN_PASSENGERS : undefined}
                  value={values[field.key]}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className={inputClassName(errors[field.key])}
                />
                <FieldError error={errors[field.key]} />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="block text-sm font-bold text-[#0f172a] mb-2">Üzenet</span>
            <textarea
              rows={4}
              value={values.message}
              onChange={(event) => setValue("message", event.target.value)}
              className={`${inputClassName(errors.message)} h-auto py-3`}
            />
            <FieldError error={errors.message} />
          </label>

          <label className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
            <input
              type="checkbox"
              checked={values.privacyAccepted}
              onChange={(event) => setValue("privacyAccepted", event.target.checked)}
              className="mt-1 accent-[#00c389]"
            />
            <span>
              Az{" "}
              <a href="/adatvedelem" target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
                adatkezelési tájékoztatót
              </a>{" "}
              elolvastam, és hozzájárulok adataim kezeléséhez.*
            </span>
          </label>
          <FieldError error={errors.privacyAccepted} />

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{errorMessage}</div>
          ) : null}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="h-12 px-7 rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-bold disabled:opacity-60"
          >
            {status === "submitting" ? "Küldés..." : "Ajánlatkérés elküldése"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function inputClassName(error?: string) {
  return `w-full h-14 rounded-2xl border px-5 outline-none focus:ring-4 transition-all ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#00c389] focus:ring-[#00c389]/10"
  }`;
}

function FieldError({ error }: { error?: string }) {
  return error ? <span className="mt-1.5 block text-sm font-medium text-red-500">{error}</span> : null;
}
