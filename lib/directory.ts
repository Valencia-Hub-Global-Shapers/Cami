import { createPublicClient } from "@/lib/supabase/public";
import { Programme, STATUS_ORDER } from "@/lib/types";
import { todayInPalestine, withEffectiveStatus } from "@/lib/programme-status";

// Published programmes, actionable ones first. Shared by the landing page,
// the directory and the programme pages.
export async function getPublishedProgrammes(): Promise<{
  programmes: Programme[];
  error: boolean;
}> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("programmes")
    .select("*")
    .eq("is_published", true);

  // Statuses are worked out from today's date on every render, so a
  // programme closes by itself the day after its deadline.
  const today = todayInPalestine();
  const programmes = ((data as Programme[] | null) ?? [])
    .map((p) => withEffectiveStatus(p, today))
    .sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      a.university.localeCompare(b.university)
  );
  return { programmes, error: !!error };
}

export async function getPublishedProgramme(
  id: string
): Promise<Programme | null> {
  // Ids are uuids; anything else cannot match and would only error.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("programmes")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  return data ? withEffectiveStatus(data as Programme) : null;
}
