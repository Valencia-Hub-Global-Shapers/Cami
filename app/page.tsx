import Link from "next/link";
import { getPublishedProgrammes } from "@/lib/directory";
import { ProgrammeCard } from "@/components/ProgrammeCard";

export const revalidate = 300; // refresh published listings every 5 minutes

export default async function HomePage() {
  const { programmes } = await getPublishedProgrammes();

  const countryCount = new Set(programmes.map((p) => p.country)).size;
  const openCount = programmes.filter((p) => p.status === "open").length;
  const expectedCount = programmes.filter(
    (p) => p.status === "expected"
  ).length;
  // Real listings instead of an illustration: the next ones to act on.
  const featured = programmes
    .filter((p) => p.status === "open" || p.status === "expected")
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      <section className="gutter flex flex-col gap-5 py-12 sm:py-20">
        <h1 className="max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          University admission and scholarship programmes in Europe for
          Palestinian students.
        </h1>
        <p className="max-w-2xl text-base text-muted sm:text-lg">
          A free directory of programmes that admit or fund Palestinian
          students, with what each one covers, who is eligible, the documents
          it asks for and its expected dates.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/directory" className="btn-primary px-7 py-3 text-base">
            Browse the directory
          </Link>
          <Link href="/directory?view=map" className="font-medium">
            View on a map
          </Link>
        </div>
        {programmes.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-6 text-sm sm:flex sm:flex-wrap">
            <Stat label="Programmes listed" value={programmes.length} />
            <Stat label="Countries" value={countryCount} />
            <Stat label="Open now" value={openCount} />
            <Stat label="Next call expected" value={expectedCount} />
          </dl>
        )}
      </section>

      {featured.length > 0 && (
        <section
          aria-labelledby="featured-heading"
          className="gutter border-t border-border bg-sand/50 py-12 sm:py-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="featured-heading"
                className="font-serif text-2xl font-semibold sm:text-3xl"
              >
                Open or opening soon
              </h2>
              <p className="mt-2 text-muted">
                A few of the programmes currently listed.
              </p>
            </div>
            <Link href="/directory" className="font-medium">
              See all {programmes.length} programmes →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((p) => (
              <ProgrammeCard key={p.id} programme={p} />
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="how-heading"
        className="gutter border-t border-border py-12 sm:py-16"
      >
        <h2
          id="how-heading"
          className="font-serif text-2xl font-semibold sm:text-3xl"
        >
          How it works
        </h2>
        <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Step
            n={1}
            title="Search the directory"
            body="Filter by country, degree level and status, as a list or on a map. Each programme has its own page you can share."
          />
          <Step
            n={2}
            title="Check the official source"
            body="Every entry links to the university's own page. Dates marked estimated are based on previous calls and should be confirmed there."
          />
          <Step
            n={3}
            title="Know of a programme? Submit it"
            body="Members of Global Shapers hubs submit programmes they find. A reviewer checks each one before it is published."
          />
        </ol>
      </section>

      <section
        id="about"
        className="gutter grid scroll-mt-4 gap-8 bg-sand py-12 sm:py-16 md:grid-cols-2"
      >
        <div>
          <p className="label-caps text-route">About</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
            How this directory is kept up to date
          </h2>
        </div>
        <div className="flex flex-col gap-4 text-muted">
          <p>
            Information about which European universities admit and fund
            Palestinian students is spread across many university websites
            and changes each academic year. This directory collects it in one
            place.
          </p>
          <p>
            A review team at the Valencia Hub checks each submission against
            the official source before publishing it, and each entry shows the
            date it was last checked.
          </p>
          <p className="flex flex-wrap gap-3 pt-2">
            <Link href="/directory" className="btn-primary">
              Browse the directory
            </Link>
            <Link href="/submit" className="btn-secondary">
              Submit a programme
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <dt className="order-2 text-faint">{label}</dt>
      <dd className="order-1 font-serif text-2xl font-semibold text-ink">
        {value}
      </dd>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex flex-col gap-2 rounded-card border border-border bg-white p-6">
      <span className="font-serif text-2xl font-semibold text-terracotta">
        {n}
      </span>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
