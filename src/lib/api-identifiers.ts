export function toPositiveIntegerId(value: string | number, fieldName: string) {
  const normalized =
    typeof value === "string" && /^\d+$/.test(value.trim())
      ? Number(value)
      : value;

  if (
    typeof normalized !== "number" ||
    !Number.isSafeInteger(normalized) ||
    normalized <= 0
  ) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  return normalized;
}

export function toPositiveNumber(value: number, fieldName: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return value;
}
