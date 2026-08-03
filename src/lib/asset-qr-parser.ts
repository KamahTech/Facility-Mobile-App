export function parseAssetIdFromQr(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1. Direct numeric ID (e.g. "18")
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Odoo URL pattern: /asset_inspection/asset/{assetId}
  const odooMatch = trimmed.match(/\/asset_inspection\/asset\/(\d+)/i);
  if (odooMatch && odooMatch[1]) {
    return odooMatch[1];
  }

  // 3. Deep link or route pattern: /assets/{assetId} or /asset/{assetId}
  const assetRouteMatch = trimmed.match(/\/assets?\/(\d+)/i);
  if (assetRouteMatch && assetRouteMatch[1]) {
    return assetRouteMatch[1];
  }

  // 4. URL query param pattern: id=18 or asset_id=18 or assetId=18
  const queryMatch = trimmed.match(/[?&](?:id|asset_id|assetId)=(\d+)/i);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1];
  }

  // 5. JSON string pattern: {"id": 18} or {"assetId": 18}
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      const val = parsed.id ?? parsed.assetId ?? parsed.asset_id ?? parsed.code;
      if (val != null && /^\d+$/.test(String(val))) {
        return String(val);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return null;
}
