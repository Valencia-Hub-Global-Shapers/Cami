import "server-only";

// Finds a university's location with OpenStreetMap's Nominatim service.
// Usage policy (https://operations.osmfoundation.org/policies/nominatim/):
// at most 1 request per second, an identifying User-Agent, and results
// must be stored rather than looked up on every page view. We only call it
// when an admin approves or saves a programme, and store the result.

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Cami/1.0 (https://cami-gs.vercel.app)";

// Only campus-like places count as a match. A foundation or a city name
// gets no pin rather than a misleading one.
const CAMPUS_TYPES = new Set(["university", "college"]);

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  label: string;
};

type NominatimPlace = {
  lat: string;
  lon: string;
  display_name: string;
  category?: string;
  type?: string;
};

export function pickCampus(places: NominatimPlace[]): GeocodeResult | null {
  const match = places.find((p) => CAMPUS_TYPES.has(p.type ?? ""));
  if (!match) return null;
  const latitude = Number(match.lat);
  const longitude = Number(match.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude, label: match.display_name };
}

export function searchQueries(
  university: string,
  city: string | null,
  country: string
): string[] {
  // "Universitat Pompeu Fabra (UPF)" matches better without the acronym.
  const name = university.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const list = [
    [name, city, country],
    [name, country]
  ].map((parts) => parts.filter(Boolean).join(", "));
  return Array.from(new Set(list));
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function geocodeUniversity(
  university: string,
  city: string | null,
  country: string
): Promise<GeocodeResult | null> {
  const queries = searchQueries(university, city, country);
  for (const [i, q] of queries.entries()) {
    if (i > 0) await sleep(1100);
    const url = `${ENDPOINT}?${new URLSearchParams({
      q,
      format: "jsonv2",
      limit: "5",
      "accept-language": "en"
    })}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(6000),
        cache: "no-store"
      });
      if (!res.ok) return null;
      const found = pickCampus((await res.json()) as NominatimPlace[]);
      if (found) return found;
    } catch {
      return null;
    }
  }
  return null;
}
