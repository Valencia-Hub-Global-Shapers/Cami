"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  missingRequired,
  parseProgrammeFields,
  parseStatus
} from "@/lib/programme-form";

function fail(message: string): never {
  redirect(`/admin?error=${encodeURIComponent(message)}`);
}

export async function approveSubmission(formData: FormData) {
  const submissionId = String(formData.get("submission_id") ?? "");
  const fields = parseProgrammeFields(formData);

  const missing = missingRequired(fields);
  if (missing) fail(missing);

  // Inserting the programme and marking the submission approved happen in
  // one database transaction (see approve_submission in 0002 migration).
  const supabase = createClient();
  const { error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionId,
    p_programme: {
      ...fields,
      status: parseStatus(formData),
      is_published: true
    }
  });

  if (error) fail(`Could not publish this programme: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/programmes");
  redirect("/admin?notice=approved");
}

export async function rejectSubmission(formData: FormData) {
  const supabase = createClient();
  const submissionId = String(formData.get("submission_id") ?? "");
  const reviewerNotes = String(formData.get("reviewer_notes") ?? "").trim();

  const { error } = await supabase
    .from("submissions")
    .update({ review_status: "rejected", reviewer_notes: reviewerNotes || null })
    .eq("id", submissionId)
    .eq("review_status", "pending");

  if (error) fail("Could not reject this submission.");

  revalidatePath("/admin");
  redirect("/admin?notice=rejected");
}
