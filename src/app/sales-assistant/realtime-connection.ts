import type { RealtimeServerEvent } from "./realtime-events";

/** Where the browser exchanges its WebRTC offer, authorised by the ephemeral client secret. */
const OPENAI_REALTIME_CALLS_URL = "https://api.openai.com/v1/realtime/calls";

const DATA_CHANNEL_LABEL = "oai-events";

const CHANNEL_OPEN_TIMEOUT_MS = 15_000;

type RealtimeConnectionHandlers = {
  onEvent: (event: RealtimeServerEvent) => void;
  onRemoteStream: (stream: MediaStream) => void;
  /** The connection dropped after it was established. */
  onDisconnected: () => void;
};

/**
 * One WebRTC voice connection to the OpenAI Realtime API: the microphone
 * goes up, the assistant's voice comes down, and events travel on the
 * data channel.
 */
export class RealtimeVoiceConnection {
  private peer: RTCPeerConnection | null = null;

  private channel: RTCDataChannel | null = null;

  private closed = false;

  constructor(private readonly handlers: RealtimeConnectionHandlers) {}

  async connect(clientSecret: string, microphone: MediaStream): Promise<void> {
    const peer = new RTCPeerConnection();
    this.peer = peer;

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        this.handlers.onRemoteStream(stream);
      }
    };
    peer.onconnectionstatechange = () => {
      // "disconnected" often recovers by itself; "failed" does not.
      if (!this.closed && peer.connectionState === "failed") {
        this.handlers.onDisconnected();
      }
    };

    microphone.getAudioTracks().forEach((track) => peer.addTrack(track, microphone));

    const channel = peer.createDataChannel(DATA_CHANNEL_LABEL);
    this.channel = channel;
    channel.onmessage = (message) => {
      const event = parseEvent(message.data);
      if (event) {
        this.handlers.onEvent(event);
      }
    };
    const channelOpen = waitForOpen(channel);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const response = await fetch(OPENAI_REALTIME_CALLS_URL, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        "Content-Type": "application/sdp",
      },
    });

    if (!response.ok) {
      throw new Error(`Realtime call setup failed with status ${response.status}`);
    }

    await peer.setRemoteDescription({ type: "answer", sdp: await response.text() });
    await channelOpen;
  }

  send(event: Record<string, unknown>): void {
    if (this.channel?.readyState === "open") {
      this.channel.send(JSON.stringify(event));
    }
  }

  close(): void {
    this.closed = true;
    this.channel?.close();
    this.peer?.getSenders().forEach((sender) => sender.track?.stop());
    this.peer?.close();
    this.channel = null;
    this.peer = null;
  }
}

function parseEvent(data: unknown): RealtimeServerEvent | null {
  if (typeof data !== "string") {
    return null;
  }

  try {
    const event: unknown = JSON.parse(data);

    return typeof event === "object" && event !== null && typeof (event as { type?: unknown }).type === "string"
      ? (event as RealtimeServerEvent)
      : null;
  } catch {
    return null;
  }
}

function waitForOpen(channel: RTCDataChannel): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Realtime data channel did not open")), CHANNEL_OPEN_TIMEOUT_MS);

    channel.addEventListener("open", () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
    channel.addEventListener("error", () => {
      window.clearTimeout(timeout);
      reject(new Error("Realtime data channel failed"));
    }, { once: true });
  });
}
