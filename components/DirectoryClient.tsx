"use client";

import { useMemo, useState } from "react";
import { Programme } from "@/lib/types";
import { FilterBar, Filters } from "./FilterBar";
import { ProgrammeCard } from "./ProgrammeCard";

export function DirectoryClient({ programmes }: { programmes: Programme[] }) {
  const [filters, setFilters] = useState<Filters>({
    country: "all",
    degreeLevel: "all",
    status: "all",
    search: ""
  });

  const countries = useMemo(
    () => Array.from(new Set(programmes.map((p) => p.country))).sort(),
    [programmes]
  );

  const degreeLevels = useMemo(
    () =>
      Array.from(
        new Set(programmes.flatMap((p) => p.degree_level ?? []))
      ).sort(),
    [programmes]
  );

  const filtered = programmes.filter((p) => {
    if (filters.country !== "all" && p.country !== filters.country) return false;
    if (
      filters.degreeLevel !== "all" &&
      !(p.degree_level ?? []).includes(filters.degreeLevel)
    )
      return false;
    if (filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${p.university} ${p.programme_name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        filters={filters}
        countries={countries}
        degreeLevels={degreeLevels}
        onChange={setFilters}
      />
      {filtered.length === 0 ? (
        <p className="text-muted">No programmes match these filters yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProgrammeCard key={p.id} programme={p} />
          ))}
        </div>
      )}
    </div>
  );
}
