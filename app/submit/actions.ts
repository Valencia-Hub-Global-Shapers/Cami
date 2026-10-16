"use server";

import { createPublicClient } from "@/lib/supabase/public";
import {
  missingRequired,
  parseProgrammeFields,
  text
} from "@/lib/programme-form";

export type SubmitResult = { ok: true } | { ok: false; message: string };

export async function submitProgramme(
  formData: FormData
): Promise<SubmitResult> {
  const fields = parseProgrammeFields(formData);
  const submitter = {
    submitter_name: text(formData, "submitter_name") ?? "",
    submitter_hub: text(formData, "submitter_hub") ?? "",
    submitter_email: text(formData, "submitter_email") ?? ""
  };

  const missing = missingRequired(fields);
  if (missing) {
    return { ok: false, message: missing };
  }
  if (
    !submitter.submitter_name ||
    !submitter.submitter_hub ||
    !submitter.submitter_email
  ) {
    return {
      ok: false,
      message: "Please tell us who you are and which hub you're with."
    };
  }

  // Submissions are anonymous. The cookie-based client would send a stale
  // or expired sign-in token if the visitor ever signed in, and Supabase
  // rejects the insert instead of falling back to the anon role.
  const supabase = createPublicClient();
  const { error } = await supabase
    .from("submissions")
    .insert({ ...fields, ...submitter });

  if (error) {
    console.error("Submission insert failed", error);
    return {
      ok: false,
      message: "Something went wrong submitting this. Please try again."
    };
  }

  return { ok: true };
}
