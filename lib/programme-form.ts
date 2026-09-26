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
