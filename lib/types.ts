export type ProgrammeStatus =
  | "open"
  | "expected"
  | "renewal_only"
  | "closed"
  | "monitor";

export type Programme = {
  id: string;
  university: string;
  country: string;
  city: string | null;
  programme_name: string;
  programme_type: string | null;
  target_group: string | null;
  degree_level: string[] | null;
  coverage: string | null;
  estimated_opening: string | null;
  estimated_deadline: string | null;
  opening_date: string | null; // YYYY-MM-DD
  deadline_date: string | null; // YYYY-MM-DD
  academic_year: string | null;
  language: string | null;
  main_eligibility: string | null;
  required_documents: string | null;
  status: ProgrammeStatus;
  website: string | null;
  contact: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  is_published: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InternalAssessment = {
  programme_id: string;
  funding_score: number | null;
  fit_score: number | null;
  success_probability: number | null;
  recommended_action: string | null;
  internal_notes: string | null;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  university: string;
  country: string;
  city: string | null;
  programme_name: string;
  programme_type: string | null;
  target_group: string | null;
  degree_level: string[] | null;
  coverage: string | null;
  estimated_opening: string | null;
  estimated_deadline: string | null;
  academic_year: string | null;
  language: string | null;
  main_eligibility: string | null;
  required_documents: string | null;
  website: string | null;
  contact: string | null;
  notes: string | null;
  submitter_name: string;
  submitter_hub: string;
  submitter_email: string;
  review_status: ReviewStatus;
  reviewer_notes: string | null;
  created_at: string;
};

export const STATUS_LABELS: Record<ProgrammeStatus, string> = {
  open: "Open",
  expected: "Expected next call",
  renewal_only: "Renewal only",
  closed: "Closed",
  monitor: "Monitor"
};

export const DEGREE_LEVELS = ["Bachelor", "Master's", "PhD"];

// Order used on the public directory: actionable entries first.
export const STATUS_ORDER: ProgrammeStatus[] = [
  "open",
  "expected",
  "monitor",
  "renewal_only",
  "closed"
];
