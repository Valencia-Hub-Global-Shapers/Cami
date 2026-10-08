import Image from "next/image";

const LOGOS = [
  {
    src: "/logos/bridging-futures.png",
    alt: "Bridging Futures, Palestinian Youth Upskilling Initiative",
    width: 355,
    role: "The initiative"
  },
  {
    src: "/logos/global-shapers-ramallah.png",
    alt: "Global Shapers Community Ramallah",
    width: 229,
    role: "Leads Bridging Futures"
  },
  {
    src: "/logos/global-shapers-valencia.png",
    alt: "Global Shapers Community Valencia",
    width: 231,
    role: "Builds and runs Camí"
  }
];

export function Collaboration({
  className = "",
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={className}>
        <p className="label-caps">A collaboration between</p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-4">
          {LOGOS.map((logo) => (
            <li key={logo.src}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={200}
                className="h-10 w-auto max-w-[9rem] object-contain opacity-80"
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`rounded-card border border-border bg-white ${className}`}>
      <p className="label-caps border-b border-border px-6 py-4 text-center">
        A collaboration between
      </p>
      <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {LOGOS.map((logo) => (
          <li
            key={logo.src}
            className="flex flex-col items-center gap-3 px-6 py-6 sm:gap-4 sm:py-8"
          >
            <div className="flex h-24 w-full items-center justify-center sm:h-28">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={200}
                className="max-h-full w-auto max-w-[13rem] object-contain"
              />
            </div>
            <p className="text-center text-sm text-faint">{logo.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
