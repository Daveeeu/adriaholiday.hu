import { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

const DEFAULT_MESSAGE =
  'Nem mentett módosításaid vannak. Biztosan elhagyod az oldalt?';

/**
 * Asks before the user leaves a page with unsaved changes: another admin page
 * (a confirm dialog) or the site itself (the browser's own warning on reload or
 * closing the tab). Returns a function that lets the next navigation through,
 * for leaving right after a save, before the form has caught up with it.
 */
export function useUnsavedChangesGuard(
  hasUnsavedChanges: boolean,
  message = DEFAULT_MESSAGE,
) {
  const allowNextNavigationRef = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      !allowNextNavigationRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    if (window.confirm(message)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedChanges]);

  return useCallback(() => {
    allowNextNavigationRef.current = true;
  }, []);
}
