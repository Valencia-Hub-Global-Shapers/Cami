// Two points joined by a short dashed line. Deliberately abstract: it
// should never read as a map, a border or a specific journey.
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="8"
        y1="15"
        x2="22"
        y2="15"
        stroke="#C1652F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      <circle cx="5" cy="15" r="3.5" fill="#2F6F65" />
      <circle cx="25" cy="15" r="3.5" fill="#C1652F" />
    </svg>
  );
}
