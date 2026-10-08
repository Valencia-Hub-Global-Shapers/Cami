import {
  daysUntilDeadline,
  deadlineSoonLabel,
  isDeadlineSoon
} from "@/lib/programme-status";
import { Programme, ProgrammeStatus, STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<ProgrammeStatus, string> = {
  open: "bg-[#DCEDE9] text-route",
  expected: "bg-sand text-[#8A6A3F]",
  renewal_only: "bg-[#EAE6DC] text-faint",
  closed: "bg-[#EFE3DD] text-danger",
  monitor: "bg-[#EAE6DC] text-faint"
};

export function StatusBadge({ status }: { status: ProgrammeStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status === "open" && (
        <span className="h-1.5 w-1.5 rounded-full bg-route" aria-hidden="true" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}

// "Closes in 5 days" cue for open programmes with an exact deadline close by.
export function DeadlineSoon({
  programme
}: {
  programme: Pick<Programme, "status" | "opening_date" | "deadline_date">;
}) {
  if (!isDeadlineSoon(programme)) return null;
  const days = daysUntilDeadline(programme) ?? 0;
  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-pill bg-[#F6E3D3] px-3 py-1 text-xs font-semibold text-terracotta">
      {deadlineSoonLabel(days)}
    </span>
  );
}
