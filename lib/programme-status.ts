import { Programme, ProgrammeStatus } from "./types";

// The calendar day in Palestine, as YYYY-MM-DD. Deadlines are whole days:
// a programme with deadline 5 October is still open all day on the 5th.
export function todayInPalestine(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hebron",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

export const DEADLINE_SOON_DAYS = 14;

type Dated = Pick<Programme, "status" | "opening_date" | "deadline_date">;

// Status shown to visitors. Exact dates override the reviewer's status, but
// only for Open and Expected: Renewal only, Monitor and Closed stay as set.
export function effectiveStatus(
  programme: Dated,
  today: string = todayInPalestine()
): ProgrammeStatus {
  const { status, opening_date, deadline_date } = programme;
  if (status !== "open" && status !== "expected") return status;
  if (deadline_date && deadline_date < today) return "closed";
  if (opening_date && opening_date > today) return "expected";
  if (opening_date && opening_date <= today) return "open";
  return status;
}

function dayNumber(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

// Whole days left until the deadline (0 on the deadline day), or null when
// the programme is not open or has no exact deadline.
export function daysUntilDeadline(
  programme: Dated,
  today: string = todayInPalestine()
): number | null {
  if (effectiveStatus(programme, today) !== "open") return null;
  if (!programme.deadline_date) return null;
  return dayNumber(programme.deadline_date) - dayNumber(today);
}

export function isDeadlineSoon(
  programme: Dated,
  today: string = todayInPalestine()
): boolean {
  const days = daysUntilDeadline(programme, today);
  return days !== null && days <= DEADLINE_SOON_DAYS;
}

export function deadlineSoonLabel(days: number): string {
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

export function formatDay(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}

export function withEffectiveStatus<T extends Dated>(
  programme: T,
  today: string = todayInPalestine()
): T {
  return { ...programme, status: effectiveStatus(programme, today) };
}
