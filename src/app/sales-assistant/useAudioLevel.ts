import { type RefObject, useEffect } from "react";

/**
 * Follows the loudness of an audio stream and writes it (0–1) to the
 * element's `--audio-level` CSS variable on every animation frame, so a
 * visualisation can react to it without re-rendering React.
 */
export function useAudioLevel(stream: MediaStream | null, target: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = target.current;

    if (!stream || !element || stream.getAudioTracks().length === 0) {
      element?.style.setProperty("--audio-level", "0");

      return;
    }

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    context.createMediaStreamSource(stream).connect(analyser);

    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;
    let level = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(samples);

      let sumOfSquares = 0;
      for (const sample of samples) {
        const centred = (sample - 128) / 128;
        sumOfSquares += centred * centred;
      }

      // Speech rarely exceeds an RMS of ~0.3; scale it to fill the range, with a gentle decay.
      const loudness = Math.min(1, Math.sqrt(sumOfSquares / samples.length) * 3.5);
      level = Math.max(loudness, level * 0.9);
      element.style.setProperty("--audio-level", level.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      element.style.setProperty("--audio-level", "0");
      void context.close();
    };
  }, [stream, target]);
}
