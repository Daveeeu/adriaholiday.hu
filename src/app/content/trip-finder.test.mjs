import test from "node:test";
import assert from "node:assert/strict";

import { buildTripFinderQuestions, tripFinderSearchState } from "./trip-finder.ts";

const chips = [
  { slug: "buszos-utak", label: "Autóbuszos utak", icon: "bus", type: "travel_mode" },
  { slug: "repulos-utak", label: "Repülős utak", icon: "plane", type: "travel_mode" },
  { slug: "tengerpart", label: "Tengerpart", icon: "waves", type: "theme" },
  { slug: "varosnezes", label: "Városnézés", icon: "building-2", type: "theme" },
  { slug: "advent", label: "Adventi utak", icon: "sparkles", type: "category" },
  { slug: "kedvezo-ar", label: "Kedvező ár", icon: "wallet", type: "price" },
];

const questions = buildTripFinderQuestions(chips);
const today = new Date(2026, 9, 28);

function stateFor(answers, activeFilters = []) {
  return tripFinderSearchState(answers, { questions, chips, activeFilters, today });
}

test("theme options are the chips that say what kind of trip it is", () => {
  assert.deepEqual(
    questions.map((question) => question.id),
    ["theme", "transport", "duration", "timing", "budget"],
  );
  assert.deepEqual(questions[0].options.map((option) => option.value), ["tengerpart", "varosnezes", "advent"]);
  assert.deepEqual(questions[1].options.map((option) => option.value), ["buszos-utak", "repulos-utak"]);
});

test("a chip question without chips is not asked", () => {
  const ids = buildTripFinderQuestions(chips.filter((chip) => chip.type === "travel_mode")).map((question) => question.id);

  assert.deepEqual(ids, ["transport", "duration", "timing", "budget"]);
});

test("answers become the listing's search parameters", () => {
  assert.deepEqual(
    stateFor({ theme: "tengerpart", transport: "repulos-utak", duration: "medium", timing: "months", budget: "300000" }),
    {
      filters: "tengerpart,repulos-utak",
      duration: "medium",
      maxPrice: "300000",
      from: "2026-11-27",
      until: "2027-01-26",
    },
  );
});

test("the soonest window starts today and the latest has no end", () => {
  assert.deepEqual(stateFor({ timing: "soon" }).from, undefined);
  assert.equal(stateFor({ timing: "soon" }).until, "2026-11-27");
  assert.equal(stateFor({ timing: "later" }).from, "2027-01-26");
  assert.equal(stateFor({ timing: "later" }).until, undefined);
});

test("skipped questions clear their criterion", () => {
  assert.deepEqual(stateFor({}), {
    filters: undefined,
    duration: undefined,
    maxPrice: undefined,
    from: undefined,
    until: undefined,
  });
});

test("earlier theme and transport chips are replaced, other chips are kept", () => {
  assert.equal(
    stateFor({ theme: "varosnezes" }, ["tengerpart", "buszos-utak", "kedvezo-ar"]).filters,
    "kedvezo-ar,varosnezes",
  );
});

test("values that are not offered options are ignored", () => {
  const state = stateFor({ theme: "kedvezo-ar", transport: "hajo", duration: "forever", timing: "never", budget: "1" });

  assert.equal(state.filters, undefined);
  assert.equal(state.duration, undefined);
  assert.equal(state.maxPrice, undefined);
  assert.equal(state.from, undefined);
  assert.equal(state.until, undefined);
});
