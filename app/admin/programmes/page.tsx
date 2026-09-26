import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { InternalAssessment, Programme, STATUS_ORDER } from "@/lib/types";
import { AdminNav } from "@/components/admin/AdminNav";
import { Notice } from "@/components/admin/Notice";
import { ProgrammeFieldset } from "@/components/admin/ProgrammeFieldset";
import { StatusBadge } from "@/components/StatusBadge";
import {
  createProgramme,
  deleteProgramme,
  togglePublished,
  updateAssessment,
  updateProgramme
} from "./actions";

export const metadata: Metadata = {
  title: "Programmes",
  robots: { index: false }
};
export const dynamic = "force-dynamic";

const ACTIONS = ["APPLY", "MONITOR", "SKIP"];

export default async function AdminProgrammesPage({
  searchParams
}: {
  searchParams: { notice?: string; error?: string };
}) {
  const supabase = createClient();

  const [{ data: programmes }, { data: assessments }] = await Promise.all([
    supabase.from("programmes").select("*"),
    supabase.from("internal_assessments").select("*")
  ]);

  const assessmentByProgramme = new Map<string, InternalAssessment>(
    ((assessments as InternalAssessment[] | null) ?? []).map((a) => [
      a.programme_id,
      a
    ])
  );

  const rows = ((programmes as Programme[] | null) ?? []).sort(
    (a, b) =>
      Number(b.is_published) - Number(a.is_published) ||
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      a.university.localeCompare(b.university)
  );

  return (
    <div className="gutter py-10">
      <AdminNav active="programmes" />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Programmes</h1>
          <p className="mt-2 text-muted">
            {rows.filter((p) => p.is_published).length} published,{" "}
            {rows.filter((p) => !p.is_published).length} hidden. Scores and
            internal notes never appear on the public site.
          </p>
        </div>
      </div>
      <Notice notice={searchParams.notice} error={searchParams.error} />

      <details className="mt-8 rounded-card border border-dashed border-border bg-white p-5 sm:p-6">
        <summary className="cursor-pointer font-medium">
          + Add a programme directly
        </summary>
        <form action={createProgramme} className="mt-6 flex flex-col gap-6">
          <ProgrammeFieldset idPrefix="new" status="expected" />
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_published" className="accent-terracotta" />
              Publish immediately
            </label>
            <button type="submit" className="btn-primary">
              Create programme
            </button>
          </div>
        </form>
      </details>

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((p) => (
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
  const verified = formatDate(programme.last_verified_at);

  return (
    <article
      id={`p-${programme.id}`}
      className={`rounded-card border border-border p-5 sm:p-6 ${
        programme.is_published ? "bg-white" : "bg-sand/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl font-semibold">
              {programme.programme_name}
            </h2>
            <StatusBadge status={programme.status} />
            {!programme.is_published && (
              <span className="rounded-pill border border-faint px-2.5 py-0.5 text-xs font-semibold text-faint">
                Hidden
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {programme.university}, {programme.country}
          </p>
          <p className="mt-1 text-xs text-faint">
            {verified ? `Last checked ${verified}` : "Never checked"}
            {assessment?.recommended_action &&
              ` · Internal: ${assessment.recommended_action}`}
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
            className={programme.is_published ? "btn-secondary" : "btn-primary px-5 py-2"}
          >
            {programme.is_published ? "Unpublish" : "Publish"}
          </button>
        </form>
      </div>

      <details className="mt-4 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-medium">
          Edit public details
        </summary>
        <form action={updateProgramme} className="mt-4 flex flex-col gap-6">
          <input type="hidden" name="id" value={programme.id} />
          <ProgrammeFieldset
            values={programme}
            status={programme.status}
            idPrefix={programme.id}
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="mark_verified"
                defaultChecked
                className="accent-terracotta"
              />
              Mark as checked today
            </label>
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </div>
        </form>
      </details>

      <details className="mt-4 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-medium">
          Internal assessment
          {assessment &&
            (assessment.funding_score ||
              assessment.fit_score ||
              assessment.success_probability) && (
              <span className="ml-2 font-normal text-faint">
                Funding {assessment.funding_score ?? "-"} · Fit{" "}
                {assessment.fit_score ?? "-"} · Success{" "}
                {assessment.success_probability ?? "-"}
              </span>
            )}
        </summary>
        <form
          action={updateAssessment}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
              list="recommended-actions"
              defaultValue={assessment?.recommended_action ?? ""}
              className="input"
            />
            <datalist id="recommended-actions">
              {ACTIONS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </label>
          <label className="col-span-full flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Internal notes</span>
            <textarea
              name="internal_notes"
              defaultValue={assessment?.internal_notes ?? ""}
              rows={2}
              className="input"
            />
          </label>
          <button type="submit" className="btn-secondary col-span-full justify-self-start">
            Save assessment
          </button>
        </form>
      </details>

      <details className="mt-4 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-medium text-danger">
          Delete
        </summary>
        <form
          action={deleteProgramme}
          className="mt-4 flex flex-wrap items-center gap-4"
        >
          <input type="hidden" name="id" value={programme.id} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="confirm" required className="accent-danger" />
            Permanently delete this programme and its assessment
          </label>
          <button type="submit" className="btn-danger">
            Delete
          </button>
        </form>
      </details>
    </article>
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
      <select name={name} defaultValue={defaultValue ?? ""} className="input">
        <option value="">Not scored</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
