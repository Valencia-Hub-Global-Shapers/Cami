const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

// Formats a Postgres `date` (YYYY-MM-DD) without going through the local
// timezone, so server and browser render the same text and a date never
// shifts back a day for visitors west of UTC.
export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function isEmail(value: string | null): boolean {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
