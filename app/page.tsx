import { createClient } from "@/lib/supabase/server";
import { Programme } from "@/lib/types";
import { DirectoryClient } from "@/components/DirectoryClient";

export const revalidate = 300; // refresh published listings every 5 minutes

export default async function HomePage() {
  const supabase = createClient();

  const { data: programmes, error } = await supabase
    .from("programmes")
    .select("*")
    .eq("is_published", true)
    .order("estimated_deadline", { ascending: true });

  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-6 px-8 py-16 md:px-16">
        <h1 className="font-serif text-4xl font-semibold md:text-5xl">
          University and scholarship routes for Palestinian students in
          Europe.
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          A directory of real admission and scholarship programmes, submitted
          by Global Shapers hubs and reviewed before anything is published.
        </p>
      </section>

      <section id="directory" className="px-8 pb-24 md:px-16">
        {error && (
          <p className="text-sm text-[#9C4A3A]">
            Could not load the directory right now. Please refresh in a
            moment.
          </p>
        )}
        <DirectoryClient programmes={(programmes as Programme[]) ?? []} />
      </section>

      <section
        id="about"
        className="flex flex-col gap-6 bg-sand px-8 py-16 md:flex-row md:px-16"
      >
        <div className="md:w-1/2">
          <span className="text-xs font-semibold uppercase tracking-wider text-route">
            Where this comes from
          </span>
          <h2 className="mt-4 font-serif text-3xl font-semibold">
            One idea, one hub, now a shared tool.
          </h2>
        </div>
        <div className="flex flex-col gap-4 text-muted md:w-1/2">
          <p>
            A Shaper at Global Shapers Valencia proposed this after seeing how
            much time Palestinian students were losing to scattered, often
            outdated information about which European universities were
            actually admitting them.
          </p>
          <p>
            Camí collects verified routes in one place. Hubs across the
            network report what they find, and a small review team checks
            each one before it&apos;s published.
          </p>
        </div>
      </section>
    </div>
  );
}
