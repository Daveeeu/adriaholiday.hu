/**
 * The "Segíts választani" trip finder: a few questions whose answers are turned into
 * the offer listing's own search parameters, so the results are the same list the
 * filters would show. Theme and transport answers are the admin's filter chips.
 */

import { BUDGET_OPTIONS, TRIP_DURATION_OPTIONS, type TripDuration } from "./offer-search.ts";

export type TripTiming = "soon" | "months" | "later";

export type TripFinderQuestionId = "theme" | "transport" | "duration" | "timing" | "budget";

export type TripFinderAnswers = Partial<Record<TripFinderQuestionId, string>>;

export type TripFinderOption = {
  value: string;
  label: string;
  /** A filter chip's icon key; the other questions have none. */
  icon: string | null;
};

export type TripFinderQuestion = {
  id: TripFinderQuestionId;
  title: string;
  hint: string;
  options: TripFinderOption[];
};

/** The subset of a listing filter chip the finder needs. */
export type TripFinderChip = {
  slug: string;
  label: string;
  icon: string | null;
  type: string;
};

/** Questions answered with filter chips, by the chip filter types that fit them. */
const CHIP_QUESTION_TYPES: Partial<Record<TripFinderQuestionId, string[]>> = {
  // Any chip that says what kind of trip it is: a theme, a category or a tag.
  theme: ["theme", "category", "tag"],
  transport: ["travel_mode"],
};

const TIMING_WINDOWS: Record<TripTiming, { label: string; fromDays: number; untilDays: number | null }> = {
  soon: { label: "A következő egy hónapban", fromDays: 0, untilDays: 30 },
  months: { label: "1–3 hónapon belül", fromDays: 30, untilDays: 90 },
  later: { label: "Több mint 3 hónap múlva", fromDays: 90, untilDays: null },
};

const DAY_MS = 24 * 60 * 60 * 1000;

function chipOptions(chips: TripFinderChip[], id: TripFinderQuestionId): TripFinderOption[] {
  const types = CHIP_QUESTION_TYPES[id] ?? [];

  return chips
    .filter((chip) => types.includes(chip.type))
    .map((chip) => ({ value: chip.slug, label: chip.label, icon: chip.icon }));
}

function plainOptions(options: ReadonlyArray<{ value: string; label: string }>): TripFinderOption[] {
  return options.map((option) => ({ ...option, icon: null }));
}

/**
 * The questions in asking order. A chip question is left out when the admin has
 * no chip of its type, so every option shown can narrow the list.
 */
export function buildTripFinderQuestions(chips: TripFinderChip[]): TripFinderQuestion[] {
  const questions: TripFinderQuestion[] = [
    {
      id: "theme",
      title: "Milyen élményre vágysz?",
      hint: "Válaszd azt, ami a legjobban leírja az álomutadat.",
      options: chipOptions(chips, "theme"),
    },
    {
      id: "transport",
      title: "Hogyan utaznál szívesen?",
      hint: "Autóbusszal kényelmesen, vagy repülővel gyorsan érkeznél?",
      options: chipOptions(chips, "transport"),
    },
    {
      id: "duration",
      title: "Mennyi időre mennél?",
      hint: "Egy hosszú hétvége vagy egy igazi nagy utazás?",
      options: plainOptions(TRIP_DURATION_OPTIONS),
    },
    {
      id: "timing",
      title: "Mikor indulnál?",
      hint: "Az indulás napja számít, a hazaérkezés lehet később is.",
      options: (Object.keys(TIMING_WINDOWS) as TripTiming[]).map((value) => ({
        value,
        label: TIMING_WINDOWS[value].label,
        icon: null,
      })),
    },
    {
      id: "budget",
      title: "Mennyit szánnál rá fejenként?",
      hint: "Az utak induló ára alapján keresünk.",
      options: plainOptions(BUDGET_OPTIONS),
    },
  ];

  return questions.filter((question) => question.options.length > 0);
}

function isoDateAfter(today: Date, days: number) {
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) + days * DAY_MS);

  return date.toISOString().slice(0, 10);
}

function timingRange(timing: string | undefined, today: Date) {
  const window = timing ? TIMING_WINDOWS[timing as TripTiming] : undefined;

  if (!window) {
    return { from: undefined, until: undefined };
  }

  return {
    // Today is the listing's default earliest start, so it needs no parameter.
    from: window.fromDays > 0 ? isoDateAfter(today, window.fromDays) : undefined,
    until: window.untilDays !== null ? isoDateAfter(today, window.untilDays) : undefined,
  };
}

function isOption(questions: TripFinderQuestion[], id: TripFinderQuestionId, value: string | undefined) {
  return value !== undefined && questions.some((question) => question.id === id && question.options.some((option) => option.value === value));
}

/**
 * The listing search parameters for the answers. The finder starts a fresh search on
 * what it asks about: a skipped question clears that criterion, and the theme and
 * transport chips replace any picked before. Other filters (countries, other chips,
 * text search) are kept.
 */
export function tripFinderSearchState(
  answers: TripFinderAnswers,
  context: { questions: TripFinderQuestion[]; chips: TripFinderChip[]; activeFilters: string[]; today: Date },
): Record<"filters" | "duration" | "maxPrice" | "from" | "until", string | undefined> {
  const { questions, chips, activeFilters, today } = context;
  const finderChipTypes = new Set(Object.values(CHIP_QUESTION_TYPES).flat());
  const finderChipSlugs = new Set(chips.filter((chip) => finderChipTypes.has(chip.type)).map((chip) => chip.slug));
  const answeredChips = (Object.keys(CHIP_QUESTION_TYPES) as TripFinderQuestionId[])
    .map((id) => (isOption(questions, id, answers[id]) ? answers[id] : undefined))
    .filter((slug): slug is string => slug !== undefined);
  const filters = [...activeFilters.filter((slug) => !finderChipSlugs.has(slug)), ...answeredChips];

  return {
    filters: filters.length > 0 ? filters.join(",") : undefined,
    duration: isOption(questions, "duration", answers.duration) ? (answers.duration as TripDuration) : undefined,
    maxPrice: isOption(questions, "budget", answers.budget) ? answers.budget : undefined,
    ...timingRange(isOption(questions, "timing", answers.timing) ? answers.timing : undefined, today),
  };
}
