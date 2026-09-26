"use client";

import { ProgrammeStatus, STATUS_LABELS } from "@/lib/types";

export type Filters = {
  country: string;
  degreeLevel: string;
  status: ProgrammeStatus | "all";
  search: string;
};

export function FilterBar({
  filters,
  countries,
  degreeLevels,
  onChange
}: {
  filters: Filters;
  countries: string[];
  degreeLevels: string[];
  onChange: (filters: Filters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 rounded-card border border-border bg-sand p-4">
      <input
        type="search"
        placeholder="Search university or programme"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="min-w-[220px] flex-1 rounded-pill border border-border bg-white px-4 py-2 text-sm"
      />
      <select
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
        className="rounded-pill border border-border bg-white px-4 py-2 text-sm"
      >
        <option value="all">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={filters.degreeLevel}
        onChange={(e) => onChange({ ...filters, degreeLevel: e.target.value })}
        className="rounded-pill border border-border bg-white px-4 py-2 text-sm"
      >
        <option value="all">All degree levels</option>
        {degreeLevels.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as ProgrammeStatus | "all" })
        }
        className="rounded-pill border border-border bg-white px-4 py-2 text-sm"
      >
        <option value="all">All statuses</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
