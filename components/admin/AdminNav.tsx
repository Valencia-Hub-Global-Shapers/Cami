import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Pending", key: "pending" },
  { href: "/admin?tab=history", label: "History", key: "history" },
  { href: "/admin/programmes", label: "Programmes", key: "programmes" }
] as const;

export function AdminNav({
  active
}: {
  active: (typeof LINKS)[number]["key"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <nav aria-label="Admin" className="flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            aria-current={active === link.key ? "page" : undefined}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium ${
              active === link.key
                ? "bg-ink text-cream hover:text-cream"
                : "text-ink hover:bg-sand hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action="/admin/signout" method="post">
        <button type="submit" className="text-sm font-medium text-faint hover:text-ink">
          Sign out
        </button>
      </form>
    </div>
  );
}
