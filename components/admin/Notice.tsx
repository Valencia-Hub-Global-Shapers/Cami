const MESSAGES: Record<string, string> = {
  approved: "Approved and published.",
  rejected: "Submission rejected.",
  saved: "Changes saved.",
  created: "Programme created.",
  deleted: "Programme deleted.",
  published: "Programme published.",
  unpublished: "Programme unpublished.",
  approved_no_pin:
    "Approved and published, but no university or college was found on OpenStreetMap for this name, so it has no map pin. Add coordinates by hand in Programmes if it should have one.",
  created_no_pin:
    "Programme created, but no map location was found for this university name. Add coordinates by hand if it should have a pin.",
  saved_no_pin:
    "Changes saved, but no map location was found for this university name. Add coordinates by hand if it should have a pin."
};

export function Notice({
  notice,
  error,
  detail
}: {
  notice?: string;
  error?: string;
  detail?: string;
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
  const message = detail ?? (notice ? MESSAGES[notice] : undefined);
  if (message) {
    return (
      <p
        role="status"
        className="mt-6 rounded-card border border-route/30 bg-[#DCEDE9] p-4 text-sm text-route"
      >
        {message}
      </p>
    );
  }
  return null;
}
