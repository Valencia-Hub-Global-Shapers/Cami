import { ProgrammeStatus, STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<ProgrammeStatus, string> = {
  open: "bg-[#DCEDE9] text-route",
  expected: "bg-[#F1E9D8] text-[#8A6A3F]",
  renewal_only: "bg-[#EAE6DC] text-faint",
  closed: "bg-[#EFE3DD] text-[#9C4A3A]",
  monitor: "bg-[#EAE6DC] text-faint"
};

export function StatusBadge({ status }: { status: ProgrammeStatus }) {
  return (
    <span
      className={`inline-block rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
