import type { AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";
import { getAnalyticsDispatcher } from "./runtime";

export function trackEvent(
  eventName: AnalyticsEventName,
  payload?: AnalyticsTrackPayload,
) {
  const dispatcher = getAnalyticsDispatcher();

  if (!dispatcher) {
    return;
  }

  void dispatcher(eventName, payload);
}
