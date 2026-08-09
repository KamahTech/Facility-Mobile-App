import assert from "node:assert/strict";
import test from "node:test";

import { isOfflineState } from "../src/lib/network.ts";

test("isOfflineState returns false for null state", () => {
  assert.equal(isOfflineState(null), false);
});

test("isOfflineState returns true when isConnected is false", () => {
  assert.equal(isOfflineState({ isConnected: false, isInternetReachable: false }), true);
  assert.equal(isOfflineState({ isConnected: false, isInternetReachable: true }), true);
  assert.equal(isOfflineState({ isConnected: false, isInternetReachable: null }), true);
});

test("isOfflineState returns true when isInternetReachable is false even if isConnected is true", () => {
  assert.equal(isOfflineState({ isConnected: true, isInternetReachable: false }), true);
});

test("isOfflineState returns false when online and reachable", () => {
  assert.equal(isOfflineState({ isConnected: true, isInternetReachable: true }), false);
});

test("isOfflineState returns false when online and isInternetReachable is null", () => {
  assert.equal(isOfflineState({ isConnected: true, isInternetReachable: null }), false);
});
