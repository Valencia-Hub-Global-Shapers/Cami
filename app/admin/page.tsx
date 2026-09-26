import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { Submission } from "@/lib/types";
import { AdminNav } from "@/components/admin/AdminNav";
import { Notice } from "@/components/admin/Notice";
import { ProgrammeFieldset } from "@/components/admin/ProgrammeFieldset";
import { approveSubmission, rejectSubmission } from "./actions";

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false }
};
export const dynamic = "force-dynamic";

export default async function AdminQueuePage({
  searchParams
}: {
  searchParams: { tab?: string; notice?: string; error?: string };
}) {
  const isHistory = searchParams.tab === "history";
  const supabase = createClient();

  const query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  const { data } = isHistory
    ? await query.neq("review_status", "pending").limit(200)
    : await query.eq("review_status", "pending");

  const submissions = (data as Submission[] | null) ?? [];

  return (
    <div className="gutter py-10">
      <AdminNav active={isHistory ? "history" : "pending"} />
      <h1 className="mt-8 font-serif text-3xl font-semibold">
        {isHistory ? "Review history" : "Pending submissions"}
      </h1>
      <p className="mt-2 text-muted">
        {isHistory
          ? "Approved and rejected submissions, newest first."
          : "Check each entry against its official source, correct anything that needs it, then approve or reject."}
      </p>
      <Notice notice={searchParams.notice} error={searchParams.error} />

      {submissions.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed border-border p-8 text-center text-muted">
          {isHistory ? "No reviewed submissions yet." : "Nothing pending review."}
        </p>
      ) : isHistory ? (
        <HistoryTable submissions={submissions} />
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {submissions.map((s) => (
            <SubmissionReview key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmittedBy({ submission }: { submission: Submission }) {
  return (
    <p className="text-xs text-faint">
      {submission.submitter_name} · {submission.submitter_hub} ·{" "}
      <a href={`mailto:${submission.submitter_email}`}>
        {submission.submitter_email}
      </a>{" "}
      · {formatDate(submission.created_at)}
    </p>
  );
}

function SubmissionReview({ submission }: { submission: Submission }) {
  return (
    <article className="rounded-card border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold">
          {submission.programme_name}
        </h2>
        <p className="text-sm text-muted">
          {submission.university}, {submission.country}
        </p>
        <SubmittedBy submission={submission} />
        {submission.website && (
          <a
            href={submission.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 break-all text-sm font-medium"
          >
            Open source page ↗
          </a>
        )}
      </div>

      <form action={approveSubmission} className="mt-6">
        <input type="hidden" name="submission_id" value={submission.id} />
        <details open className="group">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Review and edit details
          </summary>
          <div className="mt-4">
            <ProgrammeFieldset
              values={submission}
              status="expected"
              idPrefix={submission.id}
            />
          </div>
        </details>
        <div className="mt-6 border-t border-border pt-4">
          <button type="submit" className="btn-primary">
            Approve and publish
          </button>
        </div>
      </form>

      <form
        action={rejectSubmission}
        className="mt-4 flex flex-col gap-2 sm:flex-row"
      >
        <input type="hidden" name="submission_id" value={submission.id} />
        <input
          type="text"
          name="reviewer_notes"
          aria-label="Reason for rejecting (optional)"
          placeholder="Reason for rejecting (optional, internal)"
          className="input sm:flex-1"
        />
        <button type="submit" className="btn-secondary">
          Reject
        </button>
      </form>
    </article>
  );
}

function HistoryTable({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-card border border-border bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-sand">
          <tr>
            <th className="label-caps px-4 py-3">Programme</th>
            <th className="label-caps px-4 py-3">Submitted by</th>
            <th className="label-caps px-4 py-3">Decision</th>
            <th className="label-caps px-4 py-3">Reviewer notes</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b border-border last:border-0 align-top">
              <td className="px-4 py-3">
                <p className="font-medium">{s.programme_name}</p>
                <p className="text-faint">
                  {s.university}, {s.country}
                </p>
              </td>
              <td className="px-4 py-3 text-muted">
                <p>{s.submitter_name}</p>
                <p className="text-faint">
                  {s.submitter_hub} · {formatDate(s.created_at)}
                </p>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                    s.review_status === "approved"
                      ? "bg-[#DCEDE9] text-route"
                      : "bg-[#EFE3DD] text-danger"
                  }`}
                >
                  {s.review_status === "approved" ? "Approved" : "Rejected"}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{s.reviewer_notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
