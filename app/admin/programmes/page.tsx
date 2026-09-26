import { createClient } from "@/lib/supabase/server";
import { InternalAssessment, Programme } from "@/lib/types";
import { togglePublished, updateAssessment } from "./actions";

export default async function AdminProgrammesPage() {
  const supabase = createClient();

  const { data: programmes } = await supabase
    .from("programmes")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: assessments } = await supabase
    .from("internal_assessments")
    .select("*");

  const assessmentByProgramme = new Map<string, InternalAssessment>(
    (assessments as InternalAssessment[] | null)?.map((a) => [
      a.programme_id,
      a
    ]) ?? []
  );

  return (
    <div className="px-8 py-12 md:px-16">
      <h1 className="font-serif text-3xl font-semibold">Programmes</h1>
      <p className="mt-2 text-muted">
        Publish, unpublish and score every entry. Scores here never appear on
        the public site.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {((programmes as Programme[]) ?? []).map((p) => (
          <ProgrammeRow
            key={p.id}
            programme={p}
            assessment={assessmentByProgramme.get(p.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}

function ProgrammeRow({
  programme,
  assessment
}: {
  programme: Programme;
  assessment: InternalAssessment | null;
}) {
  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">
            {programme.programme_name}
          </h2>
          <p className="text-sm text-muted">
            {programme.university}, {programme.country} · {programme.status}
          </p>
        </div>

        <form action={togglePublished}>
          <input type="hidden" name="id" value={programme.id} />
          <input
            type="hidden"
            name="is_published"
            value={(!programme.is_published).toString()}
          />
          <button
            type="submit"
            className={`rounded-pill px-4 py-1.5 text-xs font-semibold ${
              programme.is_published
                ? "border border-ink"
                : "bg-terracotta text-cream"
            }`}
          >
            {programme.is_published ? "Unpublish" : "Publish"}
          </button>
        </form>
      </div>

      <form
        action={updateAssessment}
        className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-4"
      >
        <input type="hidden" name="programme_id" value={programme.id} />
        <ScoreField
          label="Funding (1-5)"
          name="funding_score"
          defaultValue={assessment?.funding_score}
        />
        <ScoreField
          label="Fit (1-5)"
          name="fit_score"
          defaultValue={assessment?.fit_score}
        />
        <ScoreField
          label="Success probability (1-5)"
          name="success_probability"
          defaultValue={assessment?.success_probability}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Recommended action</span>
          <input
            type="text"
            name="recommended_action"
            defaultValue={assessment?.recommended_action ?? ""}
            className="rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="col-span-full flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Internal notes</span>
          <textarea
            name="internal_notes"
            defaultValue={assessment?.internal_notes ?? ""}
            rows={2}
            className="rounded-lg border border-border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="col-span-full self-start rounded-pill border border-ink px-5 py-2 text-sm font-medium hover:bg-ink hover:text-cream"
        >
          Save internal notes
        </button>
      </form>
    </div>
  );
}

function ScoreField({
  label,
  name,
  defaultValue
}: {
  label: string;
  name: string;
  defaultValue?: number | null;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="number"
        name={name}
        min={1}
        max={5}
        defaultValue={defaultValue ?? undefined}
        className="rounded-lg border border-border px-3 py-2"
      />
    </label>
  );
}
