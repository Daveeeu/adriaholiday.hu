export type UrgencyMessage = { title: string; text: string };

/**
 * What the trip page's urgency toast says about the selected date: that its
 * seats are running low (at most 35% of them free), else the office's own
 * urgency text; null when there is nothing to urge.
 */
export function urgencyMessage({
  seatsRunningLow,
  seatsLeft,
  urgencyText,
}: {
  seatsRunningLow: boolean;
  seatsLeft: number | null;
  urgencyText?: string | null;
}): UrgencyMessage | null {
  if (seatsRunningLow && seatsLeft !== null && seatsLeft > 0) {
    return {
      title: "Fogynak a helyek!",
      text: `Erre az időpontra már csak ${seatsLeft} szabad hely maradt.`,
    };
  }

  const text = urgencyText?.trim();

  return text ? { title: "Ne maradj le!", text } : null;
}
