"use server";

import { createClient } from "@/lib/supabase/server";

export type SubmitResult = { ok: true } | { ok: false; message: string };

export async function submitProgramme(
  formData: FormData
): Promise<SubmitResult> {
  const supabase = createClient();

  const website = String(formData.get("website") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  if (!website && !contact) {
    return {
      ok: false,
      message: "Please provide a website link or a contact so we can verify this."
    };
  }

  const degreeLevelRaw = formData.getAll("degree_level");
  const degree_level = degreeLevelRaw.length ? (degreeLevelRaw as string[]) : null;

  const payload = {
    university: String(formData.get("university") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim() || null,
    programme_name: String(formData.get("programme_name") ?? "").trim(),
    programme_type: String(formData.get("programme_type") ?? "").trim() || null,
    target_group: String(formData.get("target_group") ?? "").trim() || null,
    degree_level,
    coverage: String(formData.get("coverage") ?? "").trim() || null,
    estimated_opening: String(formData.get("estimated_opening") ?? "").trim() || null,
    estimated_deadline: String(formData.get("estimated_deadline") ?? "").trim() || null,
    academic_year: String(formData.get("academic_year") ?? "").trim() || null,
    language: String(formData.get("language") ?? "").trim() || null,
    main_eligibility: String(formData.get("main_eligibility") ?? "").trim() || null,
    required_documents: String(formData.get("required_documents") ?? "").trim() || null,
    website: website || null,
    contact: contact || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    submitter_name: String(formData.get("submitter_name") ?? "").trim(),
    submitter_hub: String(formData.get("submitter_hub") ?? "").trim(),
    submitter_email: String(formData.get("submitter_email") ?? "").trim()
  };

  if (!payload.university || !payload.country || !payload.programme_name) {
    return { ok: false, message: "University, country and programme name are required." };
  }
  if (!payload.submitter_name || !payload.submitter_hub || !payload.submitter_email) {
    return { ok: false, message: "Please tell us who you are and which hub you're with." };
  }

  const { error } = await supabase.from("submissions").insert(payload);

  if (error) {
    return { ok: false, message: "Something went wrong submitting this. Please try again." };
  }

  return { ok: true };
}
