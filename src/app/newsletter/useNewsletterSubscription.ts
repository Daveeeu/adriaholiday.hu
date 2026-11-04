import { useState, type FormEvent } from "react";

import { trackEvent } from "../analytics/trackEvent";
import { NewsletterApiError, subscribeToNewsletter } from "./newsletter-api";

export type NewsletterSubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Email field state and submit handling shared by every newsletter sign-up
 * form; `placement` names the form in analytics.
 */
export function useNewsletterSubscription(placement: string) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterSubmitStatus>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    setStatus("submitting");

    try {
      const response = await subscribeToNewsletter(email.trim());
      trackEvent("newsletter_signup", {
        metadata: { placement, already_subscribed: response.status === "already_subscribed" },
      });
      setStatus("success");
      setFeedback(
        response.status === "already_subscribed"
          ? "Ezzel az email címmel már korábban feliratkoztál."
          : "Köszönjük a feliratkozást! A kedvezménykupont elküldtük az email címedre.",
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof NewsletterApiError
          ? error.message
          : "Váratlan hiba történt, kérjük, próbáld meg később.",
      );
    }
  }

  return {
    email,
    setEmail,
    status,
    feedback,
    isSubmitting: status === "submitting",
    handleSubmit,
  };
}
