import test from "node:test";
import assert from "node:assert/strict";

import {
  extractFunctionCalls,
  mergeRecommendations,
  nextPhase,
  parseArguments,
  reduceTranscript,
  visibleTranscript,
} from "./realtime-events.ts";

function apply(events) {
  return events.reduce((entries, event) => reduceTranscript(entries, event), []);
}

test("a user turn keeps its place before the answer although its transcript arrives later", () => {
  const entries = apply([
    { type: "input_audio_buffer.speech_started", item_id: "user-1" },
    { type: "response.output_audio_transcript.delta", item_id: "answer-1", delta: "Szia, " },
    { type: "response.output_audio_transcript.delta", item_id: "answer-1", delta: "segítek." },
    { type: "conversation.item.input_audio_transcription.completed", item_id: "user-1", transcript: " Horvátországba mennék. " },
    { type: "response.output_audio_transcript.done", item_id: "answer-1", transcript: "Szia, segítek." },
  ]);

  assert.deepEqual(entries, [
    { id: "user-1", role: "user", text: "Horvátországba mennék.", final: true },
    { id: "answer-1", role: "assistant", text: "Szia, segítek.", final: true },
  ]);
});

test("user turns that produced no words are hidden once transcribed", () => {
  const entries = apply([
    { type: "input_audio_buffer.speech_started", item_id: "noise" },
    { type: "conversation.item.input_audio_transcription.completed", item_id: "noise", transcript: "" },
    { type: "input_audio_buffer.speech_started", item_id: "pending" },
  ]);

  assert.deepEqual(
    visibleTranscript(entries).map((entry) => entry.id),
    ["pending"],
  );
});

test("events without an item are ignored by the transcript", () => {
  assert.deepEqual(apply([{ type: "response.output_audio_transcript.delta", delta: "x" }, { type: "session.updated" }]), []);
});

test("function calls are read from a finished response", () => {
  const calls = extractFunctionCalls({
    type: "response.done",
    response: {
      output: [
        { type: "message", content: [] },
        { type: "function_call", call_id: "call_1", name: "search_trips", arguments: '{"query":"Toszkána"}' },
        { type: "function_call", call_id: "call_2", name: "get_trip_details", arguments: "not json" },
        { type: "function_call", name: "missing_call_id", arguments: "{}" },
      ],
    },
  });

  assert.deepEqual(calls, [
    { callId: "call_1", name: "search_trips", arguments: { query: "Toszkána" } },
    { callId: "call_2", name: "get_trip_details", arguments: null },
  ]);
  assert.deepEqual(extractFunctionCalls({ type: "response.created", response: { output: [] } }), []);
});

test("arguments must be a JSON object", () => {
  assert.deepEqual(parseArguments(""), {});
  assert.deepEqual(parseArguments('{"passengers":2}'), { passengers: 2 });
  assert.equal(parseArguments("[1,2]"), null);
  assert.equal(parseArguments("null"), null);
  assert.equal(parseArguments("{broken"), null);
});

test("the phase follows speech, thinking and playback", () => {
  const step = (phase, type, extra = {}) => nextPhase(phase, { type, ...extra });

  assert.equal(step("listening", "input_audio_buffer.speech_started"), "userSpeaking");
  assert.equal(step("userSpeaking", "input_audio_buffer.speech_stopped"), "thinking");
  assert.equal(step("thinking", "output_audio_buffer.started"), "speaking");
  // The response is done before its audio has finished playing.
  assert.equal(step("speaking", "response.done", { response: { output: [] } }), "speaking");
  assert.equal(step("speaking", "output_audio_buffer.stopped"), "listening");
  assert.equal(
    step("listening", "response.done", { response: { output: [{ type: "function_call", call_id: "c", name: "search_trips" }] } }),
    "thinking",
  );
});

test("events never revive a conversation that is not live", () => {
  assert.equal(nextPhase("ended", { type: "output_audio_buffer.started" }), "ended");
  assert.equal(nextPhase("error", { type: "input_audio_buffer.speech_started" }), "error");
  assert.equal(nextPhase("connecting", { type: "response.created" }), "connecting");
});

test("a search replaces the recommended trips and a single trip comes to the front", () => {
  const a = { id: 1 };
  const b = { id: 2 };
  const c = { id: 3 };
  const d = { id: 4 };

  assert.deepEqual(mergeRecommendations([a, b], [c, d], true, 3), [c, d]);
  assert.deepEqual(mergeRecommendations([a, b, c], [b], false, 3), [b, a, c]);
  assert.deepEqual(mergeRecommendations([a, b, c], [d], false, 3), [d, a, b]);
  assert.deepEqual(mergeRecommendations([], [a, a, b, c, d], true, 3), [a, b, c]);
});
