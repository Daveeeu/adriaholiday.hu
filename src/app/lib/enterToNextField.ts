import type { KeyboardEvent } from "react";

const FIELDS =
  "input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])";

/** A field the visitor can reach: shown, and not a further radio of a group already counted. */
function reachableFields(container: HTMLElement): HTMLElement[] {
  const seenRadioGroups = new Set<string>();

  return [...container.querySelectorAll<HTMLInputElement>(FIELDS)].filter(
    (field) => {
      // Visually hidden radios (styled switches) still count; display: none fields do not.
      if (field.getClientRects().length === 0 && field.type !== "radio") {
        return false;
      }

      if (field.type === "radio") {
        if (seenRadioGroups.has(field.name)) {
          return false;
        }

        seenRadioGroups.add(field.name);
      }

      return true;
    },
  );
}

/**
 * Attach as onKeyDown to a form container: Enter in a field moves to the next
 * one, as Tab does, instead of doing nothing (or sending the form). Text areas
 * keep Enter for a new line; buttons and links keep it for clicking.
 */
export function moveToNextFieldOnEnter(event: KeyboardEvent<HTMLElement>) {
  const target = event.target as HTMLElement;

  if (
    event.key !== "Enter" ||
    event.shiftKey ||
    event.nativeEvent.isComposing ||
    !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)
  ) {
    return;
  }

  const fields = reachableFields(event.currentTarget);
  const current =
    target instanceof HTMLInputElement && target.type === "radio"
      ? fields.findIndex(
          (field) =>
            field instanceof HTMLInputElement &&
            field.type === "radio" &&
            field.name === target.name,
        )
      : fields.indexOf(target);
  const next = current >= 0 ? fields[current + 1] : undefined;

  event.preventDefault();

  if (next) {
    // A radio group is entered on its chosen option, as Tab does.
    const chosen =
      next instanceof HTMLInputElement && next.type === "radio"
        ? (event.currentTarget.querySelector<HTMLInputElement>(
            `input[type=radio][name="${CSS.escape(next.name)}"]:checked`,
          ) ?? next)
        : next;

    chosen.focus();
  }
}
