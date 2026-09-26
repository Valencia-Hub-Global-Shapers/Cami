"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Programme,
  ProgrammeStatus,
  STATUS_LABELS,
  STATUS_ORDER
} from "@/lib/types";
import { EMPTY_FILTERS, FilterBar, Filters } from "@/components/FilterBar";
import { ProgrammeCard } from "@/components/ProgrammeCard";
import { StatusBadge } from "@/components/StatusBadge";

// Leaflet needs `window`, so the map only ever renders in the browser.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[60vh] min-h-[360px] w-full animate-pulse rounded-card border border-border bg-sand" />
  )
});

type View = "list" | "map";
type Sort = "status" | "university" | "checked";

const SORT_LABELS: Record<Sort, string> = {
  status: "Open first",
  university: "University A-Z",
  checked: "Recently checked"
};

// Filters, sort and view live in the URL so a filtered view can be shared.
function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const sort = params.get("sort");
  return {
    view: (params.get("view") === "map" ? "map" : "list") as View,
    sort: (sort && sort in SORT_LABELS ? sort : "status") as Sort,
    filters: {
      search: params.get("q") ?? "",
      country: params.get("country") ?? "all",
      degreeLevel: params.get("degree") ?? "all",
      status: (status && status in STATUS_LABELS
        ? status
        : "all") as ProgrammeStatus | "all"
    }
  };
}

function writeUrlState(view: View, sort: Sort, filters: Filters) {
  const params = new URLSearchParams();
  if (view !== "list") params.set("view", view);
  if (sort !== "status") params.set("sort", sort);
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.country !== "all") params.set("country", filters.country);
  if (filters.degreeLevel !== "all") params.set("degree", filters.degreeLevel);
  if (filters.status !== "all") params.set("status", filters.status);
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`
  );
}

export function DirectoryClient({ programmes }: { programmes: Programme[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<View>("list");
  const [sort, setSort] = useState<Sort>("status");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const state = readUrlState();
    setFilters(state.filters);
    setView(state.view);
    setSort(state.sort);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeUrlState(view, sort, filters);
  }, [hydrated, view, sort, filters]);

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

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const result = programmes.filter((p) => {
      if (filters.country !== "all" && p.country !== filters.country)
        return false;
      if (
        filters.degreeLevel !== "all" &&
        !(p.degree_level ?? []).includes(filters.degreeLevel)
      )
        return false;
      if (filters.status !== "all" && p.status !== filters.status)
        return false;
      if (q) {
        const haystack = [p.university, p.programme_name, p.city, p.country]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    const byUniversity = (a: Programme, b: Programme) =>
      a.university.localeCompare(b.university);
    if (sort === "university") return result.sort(byUniversity);
    if (sort === "checked") {
      return result.sort(
        (a, b) =>
          (b.last_verified_at ?? "").localeCompare(a.last_verified_at ?? "") ||
          byUniversity(a, b)
      );
    }
    return result.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
        byUniversity(a, b)
    );
  }, [programmes, filters, sort]);

  const located = filtered.filter(
    (p) => p.latitude != null && p.longitude != null
  );
  const unlocated = filtered.filter(
    (p) => p.latitude == null || p.longitude == null
  );

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

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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

        <div className="flex flex-wrap items-center gap-3">
          {view === "list" && (
            <label className="flex items-center gap-2">
              <span className="text-faint">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-pill border border-border bg-white px-3 py-1.5 text-sm text-ink"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div
            role="group"
            aria-label="View"
            className="inline-flex rounded-pill border border-border bg-white p-1"
          >
            {(["list", "map"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`rounded-pill px-4 py-1 text-sm font-medium transition-colors ${
                  view === v ? "bg-ink text-cream" : "text-ink hover:bg-sand"
                }`}
              >
                {v === "list" ? "List" : "Map"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-8 text-center text-muted">
          <p>No programmes match these filters.</p>
          <p className="mt-2 text-sm">
            Know of one that should be here?{" "}
            <Link href="/submit" className="font-medium">
              Submit it for review
            </Link>
            .
          </p>
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProgrammeCard key={p.id} programme={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <MapView
              programmes={located}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto lg:min-h-[360px]">
              {located.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    aria-current={selectedId === p.id ? "true" : undefined}
                    className={`flex w-full items-start justify-between gap-3 rounded-card border p-3 text-left transition-colors ${
                      selectedId === p.id
                        ? "border-terracotta bg-white"
                        : "border-border bg-white hover:border-faint"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-faint">
                        {p.university}
                      </span>
                      <span className="block font-serif text-sm font-semibold leading-snug">
                        {p.programme_name}
                      </span>
                      <span className="block text-xs text-faint">
                        {[p.city, p.country].filter(Boolean).join(", ")}
                      </span>
                    </span>
                    <StatusBadge status={p.status} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <MapLegend statuses={statuses} />

          {unlocated.length > 0 && (
            <div className="rounded-card border border-border bg-sand p-4 text-sm">
              <p className="font-medium text-ink">
                Not on the map ({unlocated.length})
              </p>
              <p className="mt-1 text-faint">
                These programmes are not tied to a single campus, or their
                location has not been added yet.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {unlocated.map((p) => (
                  <li key={p.id}>
                    <Link href={`/directory/${p.id}`} className="font-medium">
                      {p.programme_name}
                    </Link>{" "}
                    <span className="text-faint">
                      · {p.university}, {p.country}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MapLegend({ statuses }: { statuses: ProgrammeStatus[] }) {
  return (
    <ul
      aria-label="Map legend"
      className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted"
    >
      {statuses.map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className={`cami-pin cami-pin--${s}`} aria-hidden="true" />
          {STATUS_LABELS[s]}
        </li>
      ))}
    </ul>
  );
}
