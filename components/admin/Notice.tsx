const MESSAGES: Record<string, string> = {
  approved: "Approved and published.",
  rejected: "Submission rejected.",
  saved: "Changes saved.",
  created: "Programme created.",
  deleted: "Programme deleted.",
  published: "Programme published.",
  unpublished: "Programme unpublished."
};

export function Notice({
  notice,
  error
}: {
  notice?: string;
  error?: string;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="mt-6 rounded-card border border-danger/30 bg-[#EFE3DD] p-4 text-sm text-danger"
      >
        {error}
      </p>
    );
  }
  if (notice && MESSAGES[notice]) {
    return (
      <p
        role="status"
        className="mt-6 rounded-card border border-route/30 bg-[#DCEDE9] p-4 text-sm text-route"
      >
        {MESSAGES[notice]}
      </p>
    );
  }
  return null;
}
