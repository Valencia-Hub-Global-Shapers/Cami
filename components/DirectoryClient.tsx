"use client";

import { useMemo, useState } from "react";
import { Programme, STATUS_ORDER } from "@/lib/types";
import { EMPTY_FILTERS, FilterBar, Filters } from "./FilterBar";
import { ProgrammeCard } from "./ProgrammeCard";

export function DirectoryClient({ programmes }: { programmes: Programme[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const sorted = useMemo(
    () =>
      [...programmes].sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          a.university.localeCompare(b.university)
      ),
    [programmes]
  );

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

  const statuses = useMemo(
    () => STATUS_ORDER.filter((s) => programmes.some((p) => p.status === s)),
    [programmes]
  );

  const filtered = sorted.filter((p) => {
    if (filters.country !== "all" && p.country !== filters.country) return false;
    if (
      filters.degreeLevel !== "all" &&
      !(p.degree_level ?? []).includes(filters.degreeLevel)
    )
      return false;
    if (filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      const haystack = [p.university, p.programme_name, p.city, p.country]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.country !== "all" ||
    filters.degreeLevel !== "all" ||
    filters.status !== "all";

  return (
    <div className="flex flex-col gap-5">
      <FilterBar
        filters={filters}
        countries={countries}
        degreeLevels={degreeLevels}
        statuses={statuses}
        onChange={setFilters}
      />

      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <p aria-live="polite">
          {isFiltered
            ? `Showing ${filtered.length} of ${programmes.length} programmes`
            : `${programmes.length} programmes`}
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="font-medium text-terracotta hover:text-terracotta-hover"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-8 text-center text-muted">
          <p>No programmes match these filters.</p>
          <p className="mt-2 text-sm">
            Know of one that should be here?{" "}
            <a href="/submit" className="font-medium">
              Submit it for review
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProgrammeCard key={p.id} programme={p} />
          ))}
        </div>
      )}
    </div>
  );
}
