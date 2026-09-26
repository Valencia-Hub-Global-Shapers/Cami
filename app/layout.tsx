import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camí",
  description:
    "A directory of admission and scholarship routes for Palestinian students in Europe, maintained by Global Shapers hubs."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <header className="flex items-center justify-between px-8 py-6 border-b border-border md:px-16">
          <Link href="/" className="flex items-center gap-3">
            <svg
              width="26"
              height="26"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 24C10 24 10 16 15 16C20 16 20 8 26 8"
                stroke="#C1652F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="6 8"
              />
              <circle cx="4" cy="24" r="3" fill="#2F6F65" />
              <circle cx="26" cy="8" r="3" fill="#C1652F" />
            </svg>
            <span className="font-serif text-2xl font-semibold">Camí</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/#about" className="text-sm font-medium text-ink">
              About
            </Link>
            <Link href="/submit" className="text-sm font-medium text-ink">
              Submit a programme
            </Link>
            <Link
              href="/"
              className="rounded-pill bg-terracotta px-5 py-2 text-sm font-medium text-cream hover:bg-terracotta-hover"
            >
              Browse the directory
            </Link>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-border px-8 py-8 text-sm text-faint md:flex-row md:px-16">
          <span>Camí. Community-built, kept current together.</span>
          <span>
            Developed by{" "}
            <a
              href="https://valencia-hub-global-shapers.github.io/?lang=en"
              className="text-faint underline"
            >
              Global Shapers Valencia Hub
            </a>
            , Global Shapers Community
          </span>
        </footer>
      </body>
    </html>
  );
}
