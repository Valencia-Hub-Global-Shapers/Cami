import { ProgrammeStatus, STATUS_LABELS } from "./types";

// Text fields shared by submissions and programmes, in form order.
export const TEXT_FIELDS = [
  "university",
  "country",
  "city",
  "programme_name",
  "programme_type",
  "target_group",
  "coverage",
  "estimated_opening",
  "estimated_deadline",
  "academic_year",
  "language",
  "main_eligibility",
  "required_documents",
  "website",
  "contact",
  "notes"
] as const;

export type ProgrammeFields = {
  [K in (typeof TEXT_FIELDS)[number]]: string | null;
} & { degree_level: string[] | null };

function text(formData: FormData, name: string): string | null {
  return String(formData.get(name) ?? "").trim() || null;
}

export function parseProgrammeFields(formData: FormData): ProgrammeFields {
  const fields = Object.fromEntries(
    TEXT_FIELDS.map((name) => [name, text(formData, name)])
  ) as ProgrammeFields;
  const degreeLevels = formData
    .getAll("degree_level")
    .map((v) => String(v).trim())
    .filter(Boolean);
  fields.degree_level = degreeLevels.length ? degreeLevels : null;
  return fields;
}

export function parseStatus(formData: FormData): ProgrammeStatus {
  const value = String(formData.get("status") ?? "");
  return value in STATUS_LABELS ? (value as ProgrammeStatus) : "monitor";
}

export function missingRequired(fields: ProgrammeFields): string | null {
  if (!fields.university || !fields.country || !fields.programme_name) {
    return "University, country and programme name are required.";
  }
  if (!fields.website && !fields.contact) {
    return "Add a website link or a contact so the entry can be verified.";
  }
  return null;
}

export type Location = { latitude: number | null; longitude: number | null };

// Accepts "41.5021, 2.1045" as copied from Google Maps or OpenStreetMap.
// Empty means "no pin". Returns an error message for anything else.
export function parseLocation(formData: FormData): Location | string {
  const raw = String(formData.get("coordinates") ?? "").trim();
  if (!raw) return { latitude: null, longitude: null };

  const parts = raw.split(/[,\s;]+/).filter(Boolean).map(Number);
  const [latitude, longitude] = parts;
  if (
    parts.length !== 2 ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return 'Coordinates should look like "41.5021, 2.1045" (latitude, longitude).';
  }
  return { latitude, longitude };
}

export function formatLocation(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): string {
  return latitude != null && longitude != null ? `${latitude}, ${longitude}` : "";
}

export type ProgrammeDates = {
  opening_date: string | null;
  deadline_date: string | null;
};

function isoDate(raw: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(raw)
    ? raw
    : null;
}

// Exact dates from <input type="date">. Empty means "no date". Returns an
// error message for an invalid date or a deadline before the opening.
export function parseDates(formData: FormData): ProgrammeDates | string {
  const dates: ProgrammeDates = { opening_date: null, deadline_date: null };
  for (const name of ["opening_date", "deadline_date"] as const) {
    const raw = String(formData.get(name) ?? "").trim();
    if (!raw) continue;
    const valid = isoDate(raw);
    if (!valid) return "Dates should be valid, for example 2026-10-05.";
    dates[name] = valid;
  }
  if (
    dates.opening_date &&
    dates.deadline_date &&
    dates.deadline_date < dates.opening_date
  ) {
    return "The deadline cannot be before the opening date.";
  }
  return dates;
}
