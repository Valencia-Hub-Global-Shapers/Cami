"use client";

import { ProgrammeStatus, STATUS_LABELS } from "@/lib/types";

export type Filters = {
  country: string;
  degreeLevel: string;
  status: ProgrammeStatus | "all";
  search: string;
};

export const EMPTY_FILTERS: Filters = {
  country: "all",
  degreeLevel: "all",
  status: "all",
  search: ""
};

export function FilterBar({
  filters,
  countries,
  degreeLevels,
  statuses,
  onChange
}: {
  filters: Filters;
  countries: string[];
  degreeLevels: string[];
  statuses: ProgrammeStatus[];
  onChange: (filters: Filters) => void;
}) {
  const selectClass =
    "w-full rounded-pill border border-border bg-white px-4 py-2 text-base sm:w-auto sm:text-sm";

  return (
    <div
      role="search"
      className="flex flex-col gap-3 rounded-card border border-border bg-sand p-3 sm:flex-row sm:flex-wrap sm:p-4"
    >
      <input
        type="search"
        aria-label="Search university, programme or city"
        placeholder="Search university, programme or city"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="w-full rounded-pill border border-border bg-white px-4 py-2 text-base sm:min-w-[220px] sm:flex-1 sm:text-sm"
      />
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:flex">
        <select
          aria-label="Country"
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
          className={selectClass}
        >
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Degree level"
          value={filters.degreeLevel}
          onChange={(e) => onChange({ ...filters, degreeLevel: e.target.value })}
          className={selectClass}
        >
          <option value="all">All degree levels</option>
          {degreeLevels.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as ProgrammeStatus | "all"
            })
          }
          className={selectClass}
        >
          <option value="all">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
