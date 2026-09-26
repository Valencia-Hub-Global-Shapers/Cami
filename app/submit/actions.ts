"use server";

import { createClient } from "@/lib/supabase/server";
import { missingRequired, parseProgrammeFields } from "@/lib/programme-form";

export type SubmitResult = { ok: true } | { ok: false; message: string };

export async function submitProgramme(
  formData: FormData
): Promise<SubmitResult> {
  const fields = parseProgrammeFields(formData);
  const submitter = {
    submitter_name: String(formData.get("submitter_name") ?? "").trim(),
    submitter_hub: String(formData.get("submitter_hub") ?? "").trim(),
    submitter_email: String(formData.get("submitter_email") ?? "").trim()
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

  const supabase = createClient();
  const { error } = await supabase
    .from("submissions")
    .insert({ ...fields, ...submitter });

  if (error) {
    return {
      ok: false,
      message: "Something went wrong submitting this. Please try again."
    };
  }

  return { ok: true };
}
