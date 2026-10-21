import { useCallback, useEffect, useRef, useState } from "react";

import { PortfolioApiError } from "../content/portfolio-api";
import type { PortfolioOfferCard } from "../content/portfolio-offers-api";
import { MicrophoneError, requestMicrophone, stopStream } from "./microphone";
import { RealtimeVoiceConnection } from "./realtime-connection";
import {
  type AssistantPhase,
  type FunctionCall,
  type RealtimeServerEvent,
  type TranscriptEntry,
  LIVE_PHASES,
  extractFunctionCalls,
  mergeRecommendations,
  nextPhase,
  reduceTranscript,
} from "./realtime-events";
import { endSalesAssistantSession, executeSalesAssistantTool, startSalesAssistantSession } from "./sales-assistant-api";

const SESSION_EXPIRED_NOTICE = "A demóbeszélgetés időkerete lejárt. Indíts újat, ha folytatnád.";
const CONNECTION_LOST_NOTICE = "Megszakadt a kapcsolat. Indíts új beszélgetést.";

type ActiveConversation = {
  connection: RealtimeVoiceConnection;
  sessionToken: string;
  microphone: MediaStream;
  audio: HTMLAudioElement;
  expiryTimer: number;
};

/**
 * One voice conversation with the AI travel consultant: starts it on the
 * visitor's click, keeps the transcript, the phase and the recommended
 * trips, relays the model's function calls to the catalog tools, and ends
 * it on stop, expiry, lost connection or leaving the page. Nothing of the
 * conversation is stored.
 */
export function useSalesAssistant(maxRecommendations: number) {
  const [phase, setPhase] = useState<AssistantPhase>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [trips, setTrips] = useState<PortfolioOfferCard[]>([]);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [microphone, setMicrophone] = useState<MediaStream | null>(null);
  const [assistantVoice, setAssistantVoice] = useState<MediaStream | null>(null);
  const conversation = useRef<ActiveConversation | null>(null);

  const finish = useCallback((finalPhase: AssistantPhase, message: string | null) => {
    const active = conversation.current;
    conversation.current = null;

    if (active) {
      window.clearTimeout(active.expiryTimer);
      active.connection.close();
      stopStream(active.microphone);
      active.audio.srcObject = null;
      endSalesAssistantSession(active.sessionToken);
    }

    setMicrophone(null);
    setAssistantVoice(null);
    setMuted(false);
    setPhase(finalPhase);
    setNotice(message);
  }, []);

  const runFunctionCalls = useCallback(
    async (calls: FunctionCall[]) => {
      const active = conversation.current;
      if (!active) {
        return;
      }

      const outcomes = await Promise.all(calls.map((call) => executeSalesAssistantTool(active.sessionToken, call.name, call.arguments)));

      // The conversation may have ended while the catalog answered.
      if (conversation.current !== active) {
        return;
      }

      outcomes.forEach((outcome, index) => {
        active.connection.send({
          type: "conversation.item.create",
          item: { type: "function_call_output", call_id: calls[index].callId, output: JSON.stringify(outcome.output) },
        });

        if (outcome.trips.length > 0 || outcome.replacesRecommendations) {
          setTrips((current) => mergeRecommendations(current, outcome.trips, outcome.replacesRecommendations, maxRecommendations));
        }
      });
      active.connection.send({ type: "response.create" });
    },
    [maxRecommendations],
  );

  const handleEvent = useCallback(
    (event: RealtimeServerEvent) => {
      setTranscript((entries) => reduceTranscript(entries, event));
      setPhase((current) => nextPhase(current, event));

      const calls = extractFunctionCalls(event);
      if (calls.length > 0) {
        void runFunctionCalls(calls);
      }
    },
    [runFunctionCalls],
  );

  const start = useCallback(
    async (accessCode: string | null) => {
      if (conversation.current || phase === "connecting") {
        return;
      }

      setPhase("connecting");
      setNotice(null);
      setTranscript([]);
      setTrips([]);

      // Created within the click, so mobile browsers allow it to play.
      const audio = new Audio();
      audio.autoplay = true;
      let mic: MediaStream | null = null;
      let connection: RealtimeVoiceConnection | null = null;
      let sessionToken: string | null = null;

      try {
        mic = await requestMicrophone();
        const session = await startSalesAssistantSession(accessCode);
        sessionToken = session.sessionToken;

        connection = new RealtimeVoiceConnection({
          onEvent: handleEvent,
          onRemoteStream: (stream) => {
            audio.srcObject = stream;
            void audio.play().catch(() => undefined);
            setAssistantVoice(stream);
          },
          onDisconnected: () => finish("error", CONNECTION_LOST_NOTICE),
        });
        await connection.connect(session.clientSecret, mic);

        const remainingMs = Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
        conversation.current = {
          connection,
          sessionToken,
          microphone: mic,
          audio,
          expiryTimer: window.setTimeout(() => finish("ended", SESSION_EXPIRED_NOTICE), remainingMs),
        };
        setMicrophone(mic);
        setPhase("listening");
        // The instructions tell the consultant to open with a greeting.
        connection.send({ type: "response.create" });
      } catch (error) {
        connection?.close();
        stopStream(mic);
        if (sessionToken) {
          endSalesAssistantSession(sessionToken);
        }

        const message =
          error instanceof MicrophoneError || error instanceof PortfolioApiError
            ? error.message
            : "Nem sikerült kapcsolódni az AI tanácsadóhoz. Ellenőrizd az internetkapcsolatot, és próbáld újra.";
        setPhase("error");
        setNotice(message);
      }
    },
    [finish, handleEvent, phase],
  );

  const stop = useCallback(() => finish("ended", null), [finish]);

  const toggleMute = useCallback(() => {
    const active = conversation.current;
    if (!active) {
      return;
    }

    const nextMuted = !muted;
    active.microphone.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  }, [muted]);

  // Leaving the page (or closing the tab) ends the conversation and its session.
  useEffect(() => {
    const end = () => finish("ended", null);
    window.addEventListener("pagehide", end);

    return () => {
      window.removeEventListener("pagehide", end);
      end();
    };
  }, [finish]);

  return {
    phase,
    isLive: LIVE_PHASES.has(phase),
    transcript,
    trips,
    muted,
    notice,
    microphone,
    assistantVoice,
    start,
    stop,
    toggleMute,
  };
}
