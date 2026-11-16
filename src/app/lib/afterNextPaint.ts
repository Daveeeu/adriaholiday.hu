/**
 * Runs work once the browser has painted the result of the current
 * interaction, so analytics never delays the screen's response to a tap
 * (Interaction to Next Paint). A hidden page paints no frames, so there the
 * work only waits for the current task to finish.
 */
export function afterNextPaint(callback: () => void) {
  if (document.visibilityState === "hidden") {
    window.setTimeout(callback, 0);
    return;
  }

  window.requestAnimationFrame(() => {
    window.setTimeout(callback, 0);
  });
}
