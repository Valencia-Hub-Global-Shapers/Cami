import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { Programme } from "@/lib/types";
import { DirectoryClient } from "@/components/DirectoryClient";

export const revalidate = 300; // refresh published listings every 5 minutes

export default async function HomePage() {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("programmes")
    .select("*")
    .eq("is_published", true);

  const programmes = (data as Programme[] | null) ?? [];
  const countryCount = new Set(programmes.map((p) => p.country)).size;
  const openCount = programmes.filter((p) => p.status === "open").length;
  const expectedCount = programmes.filter((p) => p.status === "expected").length;

  return (
    <div className="flex flex-col">
      <section className="gutter flex flex-col gap-5 py-12 sm:py-16">
        <h1 className="max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          University admission and scholarship programmes in Europe for
          Palestinian students.
        </h1>
        <p className="max-w-2xl text-base text-muted sm:text-lg">
          Each entry lists what the programme covers, who is eligible, the
          documents it asks for and its expected dates. Entries are submitted
          by Global Shapers hubs and reviewed before they are published.
        </p>
        {programmes.length > 0 && (
          <dl className="mt-2 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:flex sm:flex-wrap">
            <Stat label="Programmes listed" value={programmes.length} />
            <Stat label="Countries" value={countryCount} />
            <Stat label="Open now" value={openCount} />
            <Stat label="Next call expected" value={expectedCount} />
          </dl>
        )}
      </section>

      <section
        id="directory"
        aria-label="Directory"
        className="gutter scroll-mt-4 pb-20"
      >
        {error ? (
          <p role="alert" className="rounded-card border border-border bg-sand p-6 text-sm text-danger">
            Could not load the directory right now. Please refresh in a
            moment.
          </p>
        ) : (
          <DirectoryClient programmes={programmes} />
        )}
      </section>

      <section
        id="about"
        className="gutter grid scroll-mt-4 gap-8 bg-sand py-14 md:grid-cols-2 md:py-16"
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
            Members of Global Shapers hubs submit programmes they find. A
            review team at the Valencia Hub checks each submission against the
            official source before publishing it, and each entry shows the
            date it was last checked.
          </p>
          <p>
            Dates marked &quot;estimated&quot; are based on previous calls.
            Always confirm on the programme&apos;s official page.
          </p>
          <p>
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
