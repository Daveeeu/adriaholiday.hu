/**
 * Asks for the microphone. Called only from the visitor's click on the
 * start button, so the browser's permission prompt never appears unasked.
 */
export async function requestMicrophone(): Promise<MediaStream> {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneError("A mikrofon használatához biztonságos (https) kapcsolat szükséges.");
  }

  if (typeof RTCPeerConnection === "undefined") {
    throw new MicrophoneError("Ez a böngésző nem támogatja a hangalapú beszélgetést. Próbáld meg Chrome, Safari vagy Firefox legújabb verziójával.");
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (error) {
    throw new MicrophoneError(microphoneErrorMessage(error));
  }
}

export class MicrophoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicrophoneError";
  }
}

function microphoneErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "A beszélgetéshez engedélyezd a mikrofon használatát a böngésző címsorában, majd próbáld újra.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "Nem található mikrofon. Csatlakoztass egyet, majd próbáld újra.";
    case "NotReadableError":
      return "A mikrofont most egy másik alkalmazás használja. Zárd be, majd próbáld újra.";
    default:
      return "Nem sikerült hozzáférni a mikrofonhoz.";
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
