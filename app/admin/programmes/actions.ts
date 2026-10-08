"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { geocodeUniversity, sleep } from "@/lib/geocode";
import { locationNotice, resolveLocation } from "@/lib/location";
import {
  missingRequired,
  parseDates,
  parseProgrammeFields,
  parseStatus
} from "@/lib/programme-form";

function done(notice: string): never {
  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/directory/[id]", "page");
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
  const resolved = await resolveLocation(formData, fields);
  if (typeof resolved === "string") fail(resolved);
  const { latitude, longitude } = resolved;
  const dates = parseDates(formData);
  if (typeof dates === "string") fail(dates);

  const supabase = createClient();
  const { error } = await supabase.from("programmes").insert({
    ...fields,
    latitude,
    longitude,
    ...dates,
    status: parseStatus(formData),
    is_published: formData.get("is_published") === "on",
    last_verified_at: today()
  });

  if (error) fail(`Could not create the programme: ${error.message}`);
  done(locationNotice("created", resolved));
}

export async function updateProgramme(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fields = parseProgrammeFields(formData);
  const missing = missingRequired(fields);
  if (missing) fail(missing);
  const resolved = await resolveLocation(formData, fields);
  if (typeof resolved === "string") fail(resolved);
  const { latitude, longitude } = resolved;
  const dates = parseDates(formData);
  if (typeof dates === "string") fail(dates);

  const supabase = createClient();
  const { error } = await supabase
    .from("programmes")
    .update({
      ...fields,
      latitude,
      longitude,
      ...dates,
      status: parseStatus(formData),
      ...(formData.get("mark_verified") === "on"
        ? { last_verified_at: today() }
        : {})
    })
    .eq("id", id);

  if (error) fail(`Could not save the programme: ${error.message}`);
  done(locationNotice("saved", resolved));
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

// Looks up every programme without a pin, one per second as Nominatim's
// usage policy asks. Capped per click to stay well inside the serverless
// time limit; click again to continue.
const LOCATE_BATCH = 8;

export async function locateMissing() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("programmes")
    .select("id, university, city, country")
    .is("latitude", null)
    .order("created_at")
    .limit(LOCATE_BATCH);

  if (error) fail("Could not load programmes to locate.");

  let found = 0;
  let missed = 0;
  for (const [i, p] of (data ?? []).entries()) {
    if (i > 0) await sleep(1100);
    const result = await geocodeUniversity(p.university, p.city, p.country);
    if (!result) {
      missed += 1;
      continue;
    }
    const { error: updateError } = await supabase
      .from("programmes")
      .update({ latitude: result.latitude, longitude: result.longitude })
      .eq("id", p.id);
    if (updateError) missed += 1;
    else found += 1;
  }

  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/admin/programmes");
  redirect(`/admin/programmes?notice=located&found=${found}&missed=${missed}`);
}
