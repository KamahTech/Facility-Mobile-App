const ASSET_CODE_PATTERN = /^[A-Za-z0-9_\-\/]+$/;

export function parseAssetIdFromQr(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1. JSON string pattern: {"id": 18} or {"assetId": "AST-001"} or {"code": "HVAC-01"}
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const val =
        parsed.id ??
        parsed.assetId ??
        parsed.asset_id ??
        parsed.assetCode ??
        parsed.asset_code ??
        parsed.code;
      if (val != null) {
        const strVal = String(val).trim();
        if (strVal && ASSET_CODE_PATTERN.test(strVal)) {
          return strVal;
        }
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // 2. Odoo URL pattern: /asset_inspection/asset/{assetId}
  const odooMatch = trimmed.match(/\/asset_inspection\/asset\/([A-Za-z0-9_\-\/]+)/i);
  if (odooMatch && odooMatch[1] && ASSET_CODE_PATTERN.test(odooMatch[1])) {
    return odooMatch[1];
  }

  // 3. Deep link or route pattern: /assets/{assetId} or /asset/{assetId}
  const assetRouteMatch = trimmed.match(/\/assets?\/([A-Za-z0-9_\-\/]+)/i);
  if (assetRouteMatch && assetRouteMatch[1] && ASSET_CODE_PATTERN.test(assetRouteMatch[1])) {
    return assetRouteMatch[1];
  }

  // 4. URL query param pattern: id=18 or asset_id=AST-001 or code=HVAC-01
  const queryMatch = trimmed.match(/[?&](?:id|asset_id|assetId|asset_code|assetCode|code)=([A-Za-z0-9_\-\/]+)/i);
  if (queryMatch && queryMatch[1] && ASSET_CODE_PATTERN.test(queryMatch[1])) {
    return queryMatch[1];
  }

  // 5. If it is a full web URL (http/https) that did not match any asset pattern above, return null
  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  // 6. Direct numeric ID or alphanumeric asset code (e.g. "18", "AST-001", "AST/2026/00018", "HVAC-01")
  // Exclude strings containing spaces or symbols outside the asset code pattern
  if (ASSET_CODE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return null;
}
