/**
 * Pure handling of the OpenAI Realtime events the voice conversation
 * receives: the live transcript, the conversation phase shown to the
 * visitor, and the function calls to relay to the catalog tools.
 *
 * Kept free of imports (other than types) so it runs under plain Node for
 * its unit tests.
 */

export type AssistantPhase =
  | "idle"
  | "connecting"
  | "listening"
  | "userSpeaking"
  | "thinking"
  | "speaking"
  | "ended"
  | "error";

export type TranscriptRole = "user" | "assistant";

export type TranscriptEntry = {
  id: string;
  role: TranscriptRole;
  text: string;
  final: boolean;
};

export type FunctionCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown> | null;
};

export type RealtimeServerEvent = {
  type: string;
  [key: string]: unknown;
};

/** Phases in which the conversation is live (the microphone is open). */
export const LIVE_PHASES: ReadonlySet<AssistantPhase> = new Set([
  "listening",
  "userSpeaking",
  "thinking",
  "speaking",
]);

function stringField(event: RealtimeServerEvent, key: string): string | null {
  const value = event[key];

  return typeof value === "string" ? value : null;
}

function upsertEntry(
  entries: TranscriptEntry[],
  id: string,
  role: TranscriptRole,
  update: (current: TranscriptEntry) => TranscriptEntry,
): TranscriptEntry[] {
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return [...entries, update({ id, role, text: "", final: false })];
  }

  const next = entries.slice();
  next[index] = update(entries[index]);

  return next;
}

/**
 * The transcript after an event. A user turn gets its place when the
 * visitor starts speaking, so it stays before the answer even though its
 * transcription arrives later.
 */
export function reduceTranscript(entries: TranscriptEntry[], event: RealtimeServerEvent): TranscriptEntry[] {
  const itemId = stringField(event, "item_id");

  if (itemId === null) {
    return entries;
  }

  switch (event.type) {
    case "input_audio_buffer.speech_started":
      return upsertEntry(entries, itemId, "user", (entry) => entry);
    case "conversation.item.input_audio_transcription.delta":
      return upsertEntry(entries, itemId, "user", (entry) => ({
        ...entry,
        text: entry.text + (stringField(event, "delta") ?? ""),
      }));
    case "conversation.item.input_audio_transcription.completed":
      return upsertEntry(entries, itemId, "user", (entry) => ({
        ...entry,
        text: (stringField(event, "transcript") ?? entry.text).trim(),
        final: true,
      }));
    case "conversation.item.input_audio_transcription.failed":
      return upsertEntry(entries, itemId, "user", (entry) => ({ ...entry, final: true }));
    case "response.output_audio_transcript.delta":
      return upsertEntry(entries, itemId, "assistant", (entry) => ({
        ...entry,
        text: entry.text + (stringField(event, "delta") ?? ""),
      }));
    case "response.output_audio_transcript.done":
      return upsertEntry(entries, itemId, "assistant", (entry) => ({
        ...entry,
        text: (stringField(event, "transcript") ?? entry.text).trim(),
        final: true,
      }));
    default:
      return entries;
  }
}

/**
 * Drops user turns that never produced words (a cough, a noise burst), once
 * their transcription has finished.
 */
export function visibleTranscript(entries: TranscriptEntry[]): TranscriptEntry[] {
  return entries.filter((entry) => !(entry.final && entry.text === ""));
}

function responseOutput(event: RealtimeServerEvent): Array<Record<string, unknown>> {
  const response = event.response;

  if (typeof response !== "object" || response === null) {
    return [];
  }

  const output = (response as { output?: unknown }).output;

  return Array.isArray(output) ? output.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null) : [];
}

/**
 * The function calls a finished response asks for. Arguments that are not a
 * JSON object come through as null, so the tool answers with a validation
 * error the model can correct.
 */
export function extractFunctionCalls(event: RealtimeServerEvent): FunctionCall[] {
  if (event.type !== "response.done") {
    return [];
  }

  return responseOutput(event)
    .filter((item) => item.type === "function_call" && typeof item.call_id === "string" && typeof item.name === "string")
    .map((item) => ({
      callId: item.call_id as string,
      name: item.name as string,
      arguments: parseArguments(item.arguments),
    }));
}

export function parseArguments(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string" || raw.trim() === "") {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * The phase after an event. Speaking lasts until the answer's audio has
 * finished playing, which comes after the response itself is done.
 */
export function nextPhase(current: AssistantPhase, event: RealtimeServerEvent): AssistantPhase {
  if (!LIVE_PHASES.has(current)) {
    return current;
  }

  switch (event.type) {
    case "input_audio_buffer.speech_started":
      return "userSpeaking";
    case "input_audio_buffer.speech_stopped":
    case "response.created":
      return current === "speaking" ? current : "thinking";
    case "output_audio_buffer.started":
      return "speaking";
    case "output_audio_buffer.stopped":
    case "output_audio_buffer.cleared":
      return "listening";
    case "response.done":
      if (extractFunctionCalls(event).length > 0) {
        return "thinking";
      }

      return current === "speaking" ? current : "listening";
    default:
      return current;
  }
}

/**
 * The trips shown next to the conversation: a search replaces them, a
 * question about one trip brings it to the front. At most `max` are shown.
 */
export function mergeRecommendations<T extends { id: number | string }>(
  current: T[],
  incoming: T[],
  replaces: boolean,
  max: number,
): T[] {
  const ordered = replaces ? incoming : [...incoming, ...current];
  const seen = new Set<number | string>();

  return ordered
    .filter((trip) => {
      if (seen.has(trip.id)) {
        return false;
      }

      seen.add(trip.id);

      return true;
    })
    .slice(0, max);
}
