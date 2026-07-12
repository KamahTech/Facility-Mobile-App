const FAMILY_MEMBER_UNIT_TYPES = new Set(["residential", "apartment"]);

export function allowsFamilyMembers(unitType?: string | null) {
  return FAMILY_MEMBER_UNIT_TYPES.has(unitType?.trim().toLocaleLowerCase("en-US") ?? "");
}
