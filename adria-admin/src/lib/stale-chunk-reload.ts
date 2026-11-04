const RELOADED_AT_KEY = 'adria-admin:stale-chunk-reloaded-at';
/** A second failure this soon after a reload is a real outage; reloading again would loop. */
const RELOAD_COOLDOWN_MS = 30_000;

function readLastReloadAt() {
  try {
    const value = Number(window.sessionStorage.getItem(RELOADED_AT_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function rememberReload(now: number) {
  try {
    window.sessionStorage.setItem(RELOADED_AT_KEY, String(now));
  } catch {
    // Without storage the cooldown cannot be kept; the reload still fixes a stale tab.
  }
}

/**
 * A tab opened before a deploy still asks for the previous build's page chunks,
 * which the deploy removed; reloading once loads the current build instead.
 */
export function reloadOnStaleChunk() {
  window.addEventListener('vite:preloadError', (event) => {
    const now = Date.now();
    const lastReloadAt = readLastReloadAt();

    if (lastReloadAt !== null && now - lastReloadAt <= RELOAD_COOLDOWN_MS) {
      return;
    }

    event.preventDefault();
    rememberReload(now);
    window.location.reload();
  });
}
