import test from "node:test";
import assert from "node:assert/strict";
import { getLifecycleState, lifecycleIndex } from "./lifecycle";

test("lifecycleIndex maps status and flags to expected stage", () => {
  assert.equal(lifecycleIndex("open", false, false, false), 0);
  assert.equal(lifecycleIndex("open", true, false, false), 1);
  assert.equal(lifecycleIndex("open", true, true, false), 2);
  assert.equal(lifecycleIndex("in_progress", true, true, false), 3);
  assert.equal(lifecycleIndex("completed", true, true, true), 4);
});

test("builder sees reviewer as next actor while request is open", () => {
  const state = getLifecycleState({
    status: "open",
    hasQuotes: false,
    hasPaidQuote: false,
    hasCompletedReview: false,
    role: "builder",
  });
  assert.equal(state.current, 0);
  assert.equal(state.nextActor, "reviewer");
  assert.equal(state.statusTone, "waiting");
});

test("reviewer sees builder as next actor after quotes arrive", () => {
  const state = getLifecycleState({
    status: "open",
    hasQuotes: true,
    hasPaidQuote: false,
    hasCompletedReview: false,
    role: "reviewer",
  });
  assert.equal(state.current, 1);
  assert.equal(state.nextActor, "builder");
});

test("cancelled request always maps to attention state with no next actor", () => {
  const state = getLifecycleState({
    status: "cancelled",
    hasQuotes: true,
    hasPaidQuote: true,
    hasCompletedReview: false,
    role: "builder",
  });
  assert.equal(state.statusTone, "attention");
  assert.equal(state.nextActor, "none");
});
