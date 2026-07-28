import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflowWithSideEffect } from "../src/lib/workflow-side-effect.ts";

test("rejects when the required workflow action fails", async () => {
  let sideEffectCalled = false;

  await assert.rejects(
    runWorkflowWithSideEffect(
      async () => {
        throw new Error("transition failed");
      },
      async () => {
        sideEffectCalled = true;
      },
    ),
    /transition failed/,
  );
  assert.equal(sideEffectCalled, false);
});

test("preserves workflow success when the audit side effect fails", async () => {
  const result = await runWorkflowWithSideEffect(
    async () => undefined,
    async () => {
      throw new Error("comment failed");
    },
  );

  assert.match(String(result.sideEffectError), /comment failed/);
});
