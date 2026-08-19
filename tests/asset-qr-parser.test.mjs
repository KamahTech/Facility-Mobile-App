import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAssetIdFromQr } from "../src/lib/asset-qr-parser.ts";

test("parseAssetIdFromQr - direct numeric ID", () => {
  assert.equal(parseAssetIdFromQr("18"), "18");
  assert.equal(parseAssetIdFromQr("  2045  "), "2045");
});

test("parseAssetIdFromQr - Odoo QR URL", () => {
  assert.equal(
    parseAssetIdFromQr("https://example.odoo.com/asset_inspection/asset/18"),
    "18"
  );
  assert.equal(
    parseAssetIdFromQr("/asset_inspection/asset/99"),
    "99"
  );
});

test("parseAssetIdFromQr - Deep link", () => {
  assert.equal(
    parseAssetIdFromQr("facility-mobile://asset-inspection/assets/42"),
    "42"
  );
  assert.equal(
    parseAssetIdFromQr("app://assets/105"),
    "105"
  );
});

test("parseAssetIdFromQr - Query parameters", () => {
  assert.equal(
    parseAssetIdFromQr("https://facility.app/scan?id=300"),
    "300"
  );
  assert.equal(
    parseAssetIdFromQr("https://facility.app/scan?asset_id=500"),
    "500"
  );
});

test("parseAssetIdFromQr - JSON payload", () => {
  assert.equal(
    parseAssetIdFromQr(JSON.stringify({ id: 88 })),
    "88"
  );
  assert.equal(
    parseAssetIdFromQr(JSON.stringify({ assetId: 102 })),
    "102"
  );
});

test("parseAssetIdFromQr - alphanumeric asset codes", () => {
  assert.equal(parseAssetIdFromQr("AST-001"), "AST-001");
  assert.equal(parseAssetIdFromQr("AST/2026/00018"), "AST/2026/00018");
  assert.equal(parseAssetIdFromQr("HVAC-01"), "HVAC-01");
  assert.equal(
    parseAssetIdFromQr("https://example.odoo.com/asset_inspection/asset/AST-001"),
    "AST-001"
  );
  assert.equal(
    parseAssetIdFromQr("https://facility.app/scan?asset_code=HVAC-01"),
    "HVAC-01"
  );
  assert.equal(
    parseAssetIdFromQr(JSON.stringify({ assetCode: "EQ-992" })),
    "EQ-992"
  );
});

test("parseAssetIdFromQr - invalid formats return null", () => {
  assert.equal(parseAssetIdFromQr(""), null);
  assert.equal(parseAssetIdFromQr("hello world"), null);
  assert.equal(parseAssetIdFromQr("https://google.com"), null);
});
