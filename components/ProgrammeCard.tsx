import { Programme } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ProgrammeCard({ programme }: { programme: Programme }) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-semibold">
            {programme.programme_name}
          </h3>
          <p className="text-sm text-muted">
            {programme.university}
            {programme.city ? ` · ${programme.city}` : ""}, {programme.country}
          </p>
        </div>
        <StatusBadge status={programme.status} />
      </div>

      {programme.degree_level && programme.degree_level.length > 0 && (
        <p className="text-sm text-muted">
          {programme.degree_level.join(" / ")}
        </p>
      )}

      {programme.coverage && (
        <p className="text-sm leading-relaxed text-muted">
          {programme.coverage}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-faint">
        <span>
          {programme.estimated_deadline
            ? `Deadline: ${programme.estimated_deadline}`
            : "Deadline: not listed"}
        </span>
        <span>
          {programme.last_verified_at
            ? `Last checked: ${new Date(
                programme.last_verified_at
              ).toLocaleDateString()}`
            : "Not yet verified"}
        </span>
      </div>

      {programme.website && (
        <a
          href={programme.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-terracotta"
        >
          View details ↗
        </a>
      )}
    </article>
  );
}
