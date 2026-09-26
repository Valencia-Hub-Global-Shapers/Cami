"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  missingRequired,
  parseProgrammeFields,
  parseStatus
} from "@/lib/programme-form";

function done(notice: string): never {
  revalidatePath("/");
  revalidatePath("/admin/programmes");
  redirect(`/admin/programmes?notice=${notice}`);
}

function fail(message: string): never {
  redirect(`/admin/programmes?error=${encodeURIComponent(message)}`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function createProgramme(formData: FormData) {
  const fields = parseProgrammeFields(formData);
  const missing = missingRequired(fields);
  if (missing) fail(missing);

  const supabase = createClient();
  const { error } = await supabase.from("programmes").insert({
    ...fields,
    status: parseStatus(formData),
    is_published: formData.get("is_published") === "on",
    last_verified_at: today()
  });

  if (error) fail(`Could not create the programme: ${error.message}`);
  done("created");
}

export async function updateProgramme(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fields = parseProgrammeFields(formData);
  const missing = missingRequired(fields);
  if (missing) fail(missing);

  const supabase = createClient();
  const { error } = await supabase
    .from("programmes")
    .update({
      ...fields,
      status: parseStatus(formData),
      ...(formData.get("mark_verified") === "on"
        ? { last_verified_at: today() }
        : {})
    })
    .eq("id", id);

  if (error) fail(`Could not save the programme: ${error.message}`);
  done("saved");
}

export async function deleteProgramme(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (formData.get("confirm") !== "on") {
    fail("Tick the confirmation box to delete a programme.");
  }

  const supabase = createClient();
  const { error } = await supabase.from("programmes").delete().eq("id", id);

  if (error) fail("Could not delete the programme.");
  done("deleted");
}

export async function togglePublished(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") ?? "");
  const nextValue = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("programmes")
    .update({ is_published: nextValue })
    .eq("id", id);

  if (error) fail("Could not change the published state.");
  done(nextValue ? "published" : "unpublished");
}

export async function updateAssessment(formData: FormData) {
  const supabase = createClient();
  const programme_id = String(formData.get("programme_id") ?? "");

  const toScore = (v: FormDataEntryValue | null) => {
    const n = Number(String(v ?? "").trim());
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
  };

  const payload = {
    programme_id,
    funding_score: toScore(formData.get("funding_score")),
    fit_score: toScore(formData.get("fit_score")),
    success_probability: toScore(formData.get("success_probability")),
    recommended_action:
      String(formData.get("recommended_action") ?? "").trim() || null,
    internal_notes: String(formData.get("internal_notes") ?? "").trim() || null
  };

  const { error } = await supabase
    .from("internal_assessments")
    .upsert(payload, { onConflict: "programme_id" });

  if (error) fail("Could not save the internal assessment.");
  done("saved");
}
