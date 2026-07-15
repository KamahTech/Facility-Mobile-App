export type AppDateTimeMode = "date" | "time";

export function parseDateTimeValue(value: string, mode: AppDateTimeMode): Date {
  const now = new Date();

  if (mode === "date") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  } else {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (match) {
      now.setHours(Number(match[1]), Number(match[2]), 0, 0);
    }
  }

  return now;
}

export function formatDateTimeValue(date: Date, mode: AppDateTimeMode): string {
  if (mode === "time") {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
