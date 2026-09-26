import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProgrammes } from "@/lib/directory";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

export const revalidate = 300; // refresh published listings every 5 minutes

export const metadata: Metadata = {
  title: "Directory",
  description:
    "Search and filter university admission and scholarship programmes in Europe open to Palestinian students, as a list or on a map."
};

export default async function DirectoryPage() {
  const { programmes, error } = await getPublishedProgrammes();

  return (
    <div className="gutter py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
            Directory
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Every published programme, with what it covers, who can apply and
            when. Dates marked &quot;estimated&quot; are based on previous
            calls, so always confirm on the official page.
          </p>
        </div>
        <Link href="/submit" className="btn-secondary">
          Submit a programme
        </Link>
      </div>

      <div className="mt-8">
        {error ? (
          <p
            role="alert"
            className="rounded-card border border-border bg-sand p-6 text-sm text-danger"
          >
            Could not load the directory right now. Please refresh in a
            moment.
          </p>
        ) : (
          <DirectoryClient programmes={programmes} />
        )}
      </div>
    </div>
  );
}
