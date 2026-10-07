import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Link } from "react-router";

import {
  ContactMessageValidationError,
  sendContactMessage,
  type ContactMessageErrors,
  type ContactMessageInput,
} from "../content/contact-api";

const EMPTY: ContactMessageInput = { name: "", email: "", phone: "", message: "", privacyAccepted: false, website: "" };

const inputClassName =
  "w-full rounded-2xl border border-[#dbe7f1] bg-white px-4 py-3 text-[#0f172a] outline-none transition focus:border-[#00c389] focus:ring-4 focus:ring-[#00c389]/10";

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1.5 block text-sm font-medium text-red-500">{message}</span> : null;
}

/** Message form of the contact page; messages arrive in the admin under "Üzenetek". */
export default function ContactForm() {
  const [values, setValues] = useState<ContactMessageInput>(EMPTY);
  const [errors, setErrors] = useState<ContactMessageErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const update = <K extends keyof ContactMessageInput>(key: K, value: ContactMessageInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setErrors({});

    try {
      await sendContactMessage(values);
      setStatus("sent");
      setValues(EMPTY);
    } catch (error) {
      if (error instanceof ContactMessageValidationError) {
        setErrors(error.errors);
        setStatus("idle");
      } else {
        setStatus("error");
      }
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-[#a7f3d0] bg-[#ecfdf5] p-8 text-center">
        <CheckCircle2 className="size-10 text-[#00a878]" />
        <p className="text-xl font-bold text-[#0f172a]">Köszönjük, megkaptuk az üzeneted!</p>
        <p className="text-[#475569]">Munkatársunk hamarosan válaszol a megadott elérhetőségen.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-2 font-semibold text-[#00a878] hover:text-[#0f8fc9]">
          Új üzenet írása
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-[28px] border border-[#dbe7f1] bg-[#f8fcff] p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">Írj nekünk</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-[#0f172a]">Név*</span>
          <input className={inputClassName} value={values.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" />
          <FieldError message={errors.name} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-[#0f172a]">E-mail*</span>
          <input type="email" className={inputClassName} value={values.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" />
          <FieldError message={errors.email} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-[#0f172a]">Telefonszám</span>
        <input type="tel" className={inputClassName} value={values.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" />
        <FieldError message={errors.phone} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-[#0f172a]">Üzenet*</span>
        <textarea rows={5} className={inputClassName} value={values.message} onChange={(event) => update("message", event.target.value)} />
        <FieldError message={errors.message} />
      </label>

      <label aria-hidden="true" className="hidden">
        Weboldal
        <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
      </label>

      <label className="flex items-start gap-3 text-sm text-[#475569]">
        <input
          type="checkbox"
          className="mt-1 accent-[#00c389]"
          checked={values.privacyAccepted}
          onChange={(event) => update("privacyAccepted", event.target.checked)}
        />
        <span>
          Elolvastam és elfogadom az{" "}
          <Link to="/adatvedelem" className="font-semibold text-[#00a878] hover:text-[#0f8fc9]">
            adatkezelési tájékoztatót
          </Link>
          .*
        </span>
      </label>
      <FieldError message={errors.privacy_accepted} />

      {status === "error" ? (
        <p className="text-sm font-medium text-red-500">Az üzenetet most nem sikerült elküldeni, kérjük, próbáld újra, vagy hívj minket.</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-7 py-3.5 font-semibold text-white shadow-[0_16px_40px_rgba(0,195,137,0.25)] transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        <Send className="size-4" />
        {status === "sending" ? "Küldés…" : "Üzenet küldése"}
      </button>
    </form>
  );
}
