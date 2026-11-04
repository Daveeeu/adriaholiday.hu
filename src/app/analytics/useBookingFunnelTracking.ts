import { useCallback, useEffect, useRef, type FocusEvent } from "react";

import type { AnalyticsEntity } from "./event-catalog";
import { trackEvent } from "./trackEvent";

type BookingFunnelOptions = {
  entity: AnalyticsEntity;
  bookingType: string;
  /** The visitor has started filling in the form. */
  started: boolean;
  step: number;
  stepName: string;
  /** The booking was sent: leaving the page no longer counts as abandoning it. */
  completed: boolean;
};

/**
 * Reports where a booking form is left off: every step reached, the fields
 * that failed validation, and — when the visitor leaves the page or the site
 * mid-way — the last step and field they were on. Only field names are sent,
 * never what was typed into them.
 */
export function useBookingFunnelTracking({ entity, bookingType, started, step, stepName, completed }: BookingFunnelOptions) {
  const lastFieldRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const abandonReportedRef = useRef(false);
  const stateRef = useRef({ entity, bookingType, started, step, stepName, completed });
  stateRef.current = { entity, bookingType, started, step, stepName, completed };

  useEffect(() => {
    if (!started) {
      return;
    }

    startedAtRef.current ??= Date.now();
    trackEvent("booking_step", {
      entity: stateRef.current.entity,
      metadata: { booking_type: stateRef.current.bookingType, step_number: step, step_name: stateRef.current.stepName },
    });
  }, [started, step]);

  useEffect(() => {
    function reportAbandon() {
      const state = stateRef.current;

      if (!state.started || state.completed || abandonReportedRef.current) {
        return;
      }

      abandonReportedRef.current = true;
      trackEvent("booking_abandon", {
        entity: state.entity,
        metadata: {
          booking_type: state.bookingType,
          last_step_number: state.step,
          last_step_name: state.stepName,
          ...(lastFieldRef.current ? { last_field: lastFieldRef.current } : {}),
          ...(startedAtRef.current ? { form_seconds: Math.round((Date.now() - startedAtRef.current) / 1000) } : {}),
        },
      });
    }

    // pagehide: the tab is closed or the visitor leaves the site; unmount: they
    // navigate elsewhere within the site.
    window.addEventListener("pagehide", reportAbandon);

    return () => {
      window.removeEventListener("pagehide", reportAbandon);
      reportAbandon();
    };
  }, []);

  /** Attach to the form container as onFocusCapture to remember the last field touched. */
  const trackFieldFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    const field = event.target as HTMLElement & { name?: string };
    const name = field.name || field.id || field.getAttribute("aria-label");

    if (name) {
      lastFieldRef.current = name;
    }
  }, []);

  /** Reports the names of the fields that failed validation on the current step. */
  const trackFieldErrors = useCallback((fieldNames: string[]) => {
    if (fieldNames.length === 0) {
      return;
    }

    const state = stateRef.current;
    const unique = [...new Set(fieldNames)].sort();

    trackEvent("booking_field_error", {
      entity: state.entity,
      metadata: {
        booking_type: state.bookingType,
        step_number: state.step,
        step_name: state.stepName,
        error_fields: unique.join(",").slice(0, 100),
        error_count: unique.length,
      },
    });
  }, []);

  return { trackFieldFocus, trackFieldErrors };
}
