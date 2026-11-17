export type UrgencyMessage = { title: string; text: string };

/**
 * What the trip page's urgency toast says about the selected date: that its
 * seats are running low (at most 35% of them free); null otherwise.
 */
export function urgencyMessage({
  seatsRunningLow,
  seatsLeft,
}: {
  seatsRunningLow: boolean;
  seatsLeft: number | null;
}): UrgencyMessage | null {
  if (seatsRunningLow && seatsLeft !== null && seatsLeft > 0) {
    return {
      title: "Fogynak a helyek!",
      text: `Erre az időpontra már csak ${seatsLeft} szabad hely maradt.`,
    };
  }

  return null;
}
