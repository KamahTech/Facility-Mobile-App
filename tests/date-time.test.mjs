import assert from "node:assert/strict";
import test from "node:test";

import {
  formatDateTimeValue,
  parseDateTimeValue,
} from "../src/lib/date-time.ts";

test("date-only values round-trip in local time", () => {
  const value = "2026-07-28";
  assert.equal(formatDateTimeValue(parseDateTimeValue(value, "date"), "date"), value);
});

test("time values round-trip", () => {
  const value = "09:05";
  assert.equal(formatDateTimeValue(parseDateTimeValue(value, "time"), "time"), value);
});
