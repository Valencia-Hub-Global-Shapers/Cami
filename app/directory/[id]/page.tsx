import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProgramme } from "@/lib/directory";
import { formatDate, isEmail } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgrammeMap } from "./ProgrammeMap";

export const revalidate = 300;

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const programme = await getPublishedProgramme(params.id);
  if (!programme) return { title: "Programme not found" };
  return {
    title: `${programme.programme_name}, ${programme.university}`,
    description:
      programme.coverage ??
      `${programme.programme_name} at ${programme.university}, ${programme.country}.`
  };
}

export default async function ProgrammePage({ params }: Props) {
  const programme = await getPublishedProgramme(params.id);
  if (!programme) notFound();

  const verified = formatDate(programme.last_verified_at);
  const sections: [string, string | null][] = [
    ["What it covers", programme.coverage],
    ["Who it is for", programme.target_group],
    ["Main eligibility", programme.main_eligibility],
    ["Required documents", programme.required_documents],
    ["Language", programme.language],
    ["Notes", programme.notes]
  ];
  const hasLocation =
    programme.latitude != null && programme.longitude != null;

  return (
    <div className="gutter py-10 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href="/directory" className="font-medium">
          ← All programmes
        </Link>
      </nav>

      <header className="mt-6 flex flex-col gap-3">
        <p className="font-medium text-muted">{programme.university}</p>
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            {programme.programme_name}
          </h1>
          <StatusBadge status={programme.status} />
        </div>
        <p className="text-faint">
          {[programme.city, programme.country].filter(Boolean).join(", ")}
          {programme.programme_type && ` · ${programme.programme_type}`}
        </p>
        {programme.degree_level && programme.degree_level.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Degree levels">
            {programme.degree_level.map((level) => (
              <li
                key={level}
                className="rounded-pill border border-border bg-white px-3 py-0.5 text-sm text-muted"
              >
                {level}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          {sections.map(([label, value]) =>
            value ? (
              <section key={label}>
                <h2 className="label-caps">{label}</h2>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-muted">
                  {value}
                </p>
              </section>
            ) : null
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-4 rounded-card border border-border bg-white p-5 text-sm">
            <div>
              <dt className="label-caps">Opens</dt>
              <dd className="mt-0.5 text-ink">
                {programme.estimated_opening ?? "Not listed"}
              </dd>
            </div>
            <div>
              <dt className="label-caps">Deadline</dt>
              <dd className="mt-0.5 text-ink">
                {programme.estimated_deadline ?? "Not listed"}
              </dd>
            </div>
            {programme.academic_year && (
              <div className="col-span-2">
                <dt className="label-caps">Academic year</dt>
                <dd className="mt-0.5 text-ink">{programme.academic_year}</dd>
              </div>
            )}
            <div className="col-span-2 flex flex-col gap-2 border-t border-border pt-4">
              {programme.website && (
                <a
                  href={programme.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Official page ↗
                </a>
              )}
              {programme.contact &&
                (isEmail(programme.contact) ? (
                  <a
                    href={`mailto:${programme.contact}`}
                    className="btn-secondary"
                  >
                    Email {programme.contact}
                  </a>
                ) : (
                  <p className="text-muted">Contact: {programme.contact}</p>
                ))}
            </div>
            <p className="col-span-2 text-xs text-faint">
              {verified ? `Last checked ${verified}` : "Not yet verified"}
            </p>
          </dl>

          {hasLocation && <ProgrammeMap programme={programme} />}

          <p className="text-sm text-faint">
            Something out of date or wrong?{" "}
            <Link href="/submit">Send an update</Link> and a reviewer will
            check it.
          </p>
        </aside>
      </div>
    </div>
  );
}
