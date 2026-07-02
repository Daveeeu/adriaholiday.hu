import type { AnalyticsEventName, AnalyticsTrackPayload } from "./event-catalog";

export type AnalyticsDispatcher = (
  eventName: AnalyticsEventName,
  payload?: AnalyticsTrackPayload,
) => void | Promise<void>;

let dispatcher: AnalyticsDispatcher | null = null;

export function setAnalyticsDispatcher(nextDispatcher: AnalyticsDispatcher | null) {
  dispatcher = nextDispatcher;
}

export function getAnalyticsDispatcher() {
  return dispatcher;
}
