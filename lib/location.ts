import "server-only";
import { geocodeUniversity } from "./geocode";
import { Location, ProgrammeFields, parseLocation } from "./programme-form";

export type ResolvedLocation = Location & { lookedUp: boolean };

// Coordinates typed by an admin always win. Otherwise, if "find
// automatically" is ticked, look the university up by name.
export async function resolveLocation(
  formData: FormData,
  fields: ProgrammeFields
): Promise<ResolvedLocation | string> {
  const manual = parseLocation(formData);
  if (typeof manual === "string") return manual;
  if (manual.latitude != null) return { ...manual, lookedUp: false };
  if (formData.get("auto_locate") !== "on" || !fields.university || !fields.country) {
    return { latitude: null, longitude: null, lookedUp: false };
  }
  const found = await geocodeUniversity(
    fields.university,
    fields.city,
    fields.country
  );
  return {
    latitude: found?.latitude ?? null,
    longitude: found?.longitude ?? null,
    lookedUp: true
  };
}

// Notice key to show after saving: flags a lookup that found nothing.
export function locationNotice(base: string, resolved: ResolvedLocation) {
  return resolved.lookedUp && resolved.latitude == null ? `${base}_no_pin` : base;
}
