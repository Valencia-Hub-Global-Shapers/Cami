import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Submission } from "@/lib/types";
import { approveSubmission, rejectSubmission } from "./actions";

export default async function AdminQueuePage() {
  const supabase = createClient();

  const { data: pending } = await supabase
    .from("submissions")
    .select("*")
    .eq("review_status", "pending")
    .order("created_at", { ascending: false });

  const submissions = (pending as Submission[]) ?? [];

  return (
    <div className="px-8 py-12 md:px-16">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">
          Submission queue
        </h1>
        <Link
          href="/admin/programmes"
          className="text-sm font-medium text-terracotta"
        >
          Manage published programmes →
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p className="mt-8 text-muted">Nothing pending review.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">
            {submission.programme_name}
          </h2>
          <p className="text-sm text-muted">
            {submission.university}, {submission.country}
          </p>
        </div>
        <p className="text-xs text-faint">
          Submitted by {submission.submitter_name} ·{" "}
          {submission.submitter_hub} · {submission.submitter_email}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-muted md:grid-cols-2">
        <Detail label="Coverage" value={submission.coverage} />
        <Detail label="Eligibility" value={submission.main_eligibility} />
        <Detail label="Deadline" value={submission.estimated_deadline} />
        <Detail
          label="Website / contact"
          value={submission.website || submission.contact}
        />
        <Detail label="Notes" value={submission.notes} />
      </dl>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4">
        <form action={approveSubmission} className="flex flex-wrap gap-2">
          <input type="hidden" name="submission_id" value={submission.id} />
          <input
            type="hidden"
            name="university"
            value={submission.university}
          />
          <input type="hidden" name="country" value={submission.country} />
          <input
            type="hidden"
            name="programme_name"
            value={submission.programme_name}
          />
          <button
            type="submit"
            className="rounded-pill bg-terracotta px-5 py-2 text-sm font-medium text-cream hover:bg-terracotta-hover"
          >
            Approve and publish
          </button>
        </form>

        <form action={rejectSubmission} className="flex flex-1 gap-2">
          <input type="hidden" name="submission_id" value={submission.id} />
          <input
            type="text"
            name="reviewer_notes"
            placeholder="Reason (optional)"
            className="flex-1 rounded-pill border border-border px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-pill border border-ink px-5 py-2 text-sm font-medium hover:bg-ink hover:text-cream"
          >
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-faint">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
