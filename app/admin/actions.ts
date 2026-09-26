"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveSubmission(formData: FormData) {
  const supabase = createClient();
  const submissionId = String(formData.get("submission_id"));

  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return { ok: false, message: "Submission not found." };
  }

  // Allow light edits from the review form before publishing.
  const programmePayload = {
    university: String(formData.get("university") ?? submission.university),
    country: String(formData.get("country") ?? submission.country),
    city: submission.city,
    programme_name: String(formData.get("programme_name") ?? submission.programme_name),
    programme_type: submission.programme_type,
    target_group: submission.target_group,
    degree_level: submission.degree_level,
    coverage: submission.coverage,
    estimated_opening: submission.estimated_opening,
    estimated_deadline: submission.estimated_deadline,
    academic_year: submission.academic_year,
    language: submission.language,
    main_eligibility: submission.main_eligibility,
    required_documents: submission.required_documents,
    website: submission.website,
    contact: submission.contact,
    notes: submission.notes,
    status: "open" as const,
    is_published: true,
    last_verified_at: new Date().toISOString().slice(0, 10)
  };

  const { error: insertError } = await supabase
    .from("programmes")
    .insert(programmePayload);

  if (insertError) {
    return { ok: false, message: "Could not publish this programme." };
  }

  const { error: updateError } = await supabase
    .from("submissions")
    .update({ review_status: "approved" })
    .eq("id", submissionId);

  if (updateError) {
    return {
      ok: false,
      message: "Published, but could not mark the submission as approved."
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectSubmission(formData: FormData) {
  const supabase = createClient();
  const submissionId = String(formData.get("submission_id"));
  const reviewerNotes = String(formData.get("reviewer_notes") ?? "");

  const { error } = await supabase
    .from("submissions")
    .update({ review_status: "rejected", reviewer_notes: reviewerNotes || null })
    .eq("id", submissionId);

  if (error) {
    return { ok: false, message: "Could not reject this submission." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
