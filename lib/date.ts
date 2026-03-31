const DAY_IN_MS = 1000 * 60 * 60 * 24;

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateInput(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateInput(value: string) {
  const trimmedValue = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

export function addDaysToDateInput(days: number, baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

export function getCalendarDayDifference(
  value: string | Date,
  compareDate = new Date(),
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  const diffInMs =
    getStartOfDay(date).getTime() - getStartOfDay(compareDate).getTime();

  return Math.round(diffInMs / DAY_IN_MS);
}
