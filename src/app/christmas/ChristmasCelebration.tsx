import { motion } from "motion/react";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const SNOW_MS = 10_000;
const SNOW_FADE_MS = 2_000;
const GREETING_MS = 5_000;
const SLEIGH_MS = 6_000;

type Flake = { x: number; y: number; radius: number; speed: number; sway: number };

/** Snow falling over the whole page for a few seconds, then melting away. */
function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let width = 0;
    let height = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const flakes: Flake[] = Array.from({ length: Math.round(Math.min(160, width / 8)) }, () => ({
      x: Math.random() * width,
      y: -Math.random() * height,
      radius: 1.5 + Math.random() * 3,
      speed: 40 + Math.random() * 80,
      sway: Math.random() * Math.PI * 2,
    }));
    const startedAt = performance.now();
    let previous = startedAt;
    let frame = 0;

    const draw = (now: number) => {
      const seconds = Math.min((now - previous) / 1000, 0.05);
      const elapsed = now - startedAt;
      const opacity = Math.min(1, Math.max(0, (SNOW_MS - elapsed) / SNOW_FADE_MS));
      previous = now;

      context.clearRect(0, 0, width, height);
      context.fillStyle = `rgba(255, 255, 255, ${0.95 * opacity})`;
      // A soft shadow keeps the flakes visible over the white sections too.
      context.shadowColor = `rgba(15, 23, 42, ${0.35 * opacity})`;
      context.shadowBlur = 4;
      context.beginPath();

      for (const flake of flakes) {
        flake.y += flake.speed * seconds;
        flake.sway += seconds;
        flake.x += Math.sin(flake.sway) * 20 * seconds;

        if (flake.y > height + flake.radius) {
          flake.y = -flake.radius;
          flake.x = Math.random() * width;
        }

        context.moveTo(flake.x + flake.radius, flake.y);
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      }

      context.fill();

      if (elapsed < SNOW_MS) {
        frame = requestAnimationFrame(draw);
      }
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />;
}

/** Santa's sleigh crossing the sky, right to left. */
function Sleigh() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-[14%] z-[71] whitespace-nowrap text-4xl md:text-5xl drop-shadow-[0_6px_16px_rgba(15,23,42,0.35)]"
      initial={{ x: "110vw", y: 0 }}
      animate={{ x: "-40vw", y: [0, -24, 8, -16, 0] }}
      transition={{ duration: SLEIGH_MS / 1000, ease: "linear" }}
    >
      🦌🦌🛷🎅<span className="text-2xl md:text-3xl">✨</span>
    </motion.div>
  );
}

function Greeting() {
  return (
    <motion.div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-24 md:bottom-6 z-[72] mx-auto w-fit max-w-full rounded-2xl bg-gradient-to-r from-[#b91c1c] to-[#15803d] px-5 py-3 text-center text-sm md:text-base font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.30)]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: [0, 1, 1, 0], y: [24, 0, 0, 12] }}
      transition={{ duration: GREETING_MS / 1000, times: [0, 0.1, 0.85, 1] }}
    >
      Boldog karácsonyt az AdriaHoliday csapatától! 🎄
    </motion.div>
  );
}

/**
 * One go of the Christmas easter egg: a greeting, snow and, when asked for,
 * Santa's sleigh. Without motion (prefers-reduced-motion) only the greeting.
 */
export default function ChristmasCelebration({ withSleigh, onEnd }: { withSleigh: boolean; onEnd: () => void }) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(onEnd, reducedMotion ? GREETING_MS : SNOW_MS);

    return () => window.clearTimeout(timer);
  }, [onEnd, reducedMotion]);

  return (
    <>
      {reducedMotion ? null : <Snowfall />}
      {withSleigh && !reducedMotion ? <Sleigh /> : null}
      <Greeting />
    </>
  );
}
