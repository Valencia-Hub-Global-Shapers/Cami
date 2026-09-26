"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function togglePublished(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const nextValue = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("programmes")
    .update({ is_published: nextValue })
    .eq("id", id);

  if (error) return { ok: false };

  revalidatePath("/");
  revalidatePath("/admin/programmes");
  return { ok: true };
}

export async function updateAssessment(formData: FormData) {
  const supabase = createClient();
  const programme_id = String(formData.get("programme_id"));

  const toIntOrNull = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s ? Number(s) : null;
  };

  const payload = {
    programme_id,
    funding_score: toIntOrNull(formData.get("funding_score")),
    fit_score: toIntOrNull(formData.get("fit_score")),
    success_probability: toIntOrNull(formData.get("success_probability")),
    recommended_action: String(formData.get("recommended_action") ?? "").trim() || null,
    internal_notes: String(formData.get("internal_notes") ?? "").trim() || null
  };

  const { error } = await supabase
    .from("internal_assessments")
    .upsert(payload, { onConflict: "programme_id" });

  if (error) return { ok: false };

  revalidatePath("/admin/programmes");
  return { ok: true };
}
