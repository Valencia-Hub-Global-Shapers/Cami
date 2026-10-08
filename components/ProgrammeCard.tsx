import Link from "next/link";
import { formatDate, isEmail } from "@/lib/format";
import { Programme } from "@/lib/types";
import { formatDay } from "@/lib/programme-status";
import { DeadlineSoon, StatusBadge } from "./StatusBadge";

export function ProgrammeCard({ programme }: { programme: Programme }) {
  const verified = formatDate(programme.last_verified_at);
  const details: [string, string | null][] = [
    ["Who it is for", programme.target_group],
    ["Eligibility", programme.main_eligibility],
    ["Required documents", programme.required_documents],
    ["Language", programme.language],
    ["Notes", programme.notes]
  ];
  const hasDetails = details.some(([, value]) => value);

  return (
    <article className="flex flex-col gap-4 rounded-card border border-border bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">
            {programme.university}
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold leading-snug">
            <Link
              href={`/directory/${programme.id}`}
              className="text-ink hover:text-terracotta"
            >
              {programme.programme_name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-faint">
            {[programme.city, programme.country].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={programme.status} />
          <DeadlineSoon programme={programme} />
        </div>
      </div>

      {programme.degree_level && programme.degree_level.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Degree levels">
          {programme.degree_level.map((level) => (
            <li
              key={level}
              className="rounded-pill border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {level}
            </li>
          ))}
        </ul>
      )}

      {programme.coverage && (
        <div>
          <p className="label-caps">Covers</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {programme.coverage}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-cream p-3 text-sm">
        <div>
          <dt className="label-caps">Opens</dt>
          <dd className="mt-0.5 text-ink">
            {programme.opening_date
              ? formatDay(programme.opening_date)
              : programme.estimated_opening ?? "Not listed"}
          </dd>
        </div>
        <div>
          <dt className="label-caps">Deadline</dt>
          <dd className="mt-0.5 text-ink">
            {programme.deadline_date
              ? formatDay(programme.deadline_date)
              : programme.estimated_deadline ?? "Not listed"}
          </dd>
        </div>
        {programme.academic_year && (
          <div className="col-span-2">
            <dt className="label-caps">Academic year</dt>
            <dd className="mt-0.5 text-ink">{programme.academic_year}</dd>
          </div>
        )}
      </dl>

      {hasDetails && (
        <details className="group text-sm">
          <summary className="cursor-pointer list-none font-medium text-ink marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block transition-transform group-open:rotate-90"
                aria-hidden="true"
              >
                ›
              </span>
              <span className="group-open:hidden">Eligibility and documents</span>
              <span className="hidden group-open:inline">Hide details</span>
            </span>
          </summary>
          <dl className="mt-3 flex flex-col gap-3">
            {details.map(([label, value]) =>
              value ? (
                <div key={label}>
                  <dt className="label-caps">{label}</dt>
                  <dd className="mt-0.5 leading-relaxed text-muted">{value}</dd>
                </div>
              ) : null
            )}
          </dl>
        </details>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
          {programme.website && (
            <a
              href={programme.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official page ↗
            </a>
          )}
          {programme.contact &&
            (isEmail(programme.contact) ? (
              <a href={`mailto:${programme.contact}`}>{programme.contact}</a>
            ) : (
              <span className="text-muted">Contact: {programme.contact}</span>
            ))}
        </div>
        <span className="text-xs text-faint">
          {verified ? `Last checked ${verified}` : "Not yet verified"}
        </span>
      </div>
    </article>
  );
}
