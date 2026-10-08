import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
  display: "swap"
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Camí",
    template: "%s · Camí"
  },
  description:
    "A directory of university admission and scholarship programmes worldwide open to Palestinian students, maintained by Global Shapers hubs."
};

export const viewport: Viewport = {
  themeColor: "#FBF6EE"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plex.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <header className="gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border py-5">
          <Link href="/" className="flex items-center gap-2.5 text-ink hover:text-ink">
            <LogoMark />
            <span className="font-serif text-2xl font-semibold">Camí</span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/about"
              className="text-sm font-medium text-ink hover:text-terracotta"
            >
              About
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-ink hover:text-terracotta"
            >
              Submit<span className="hidden sm:inline"> a programme</span>
            </Link>
            <Link href="/directory" className="btn-primary px-5 py-2">
              Directory
            </Link>
          </nav>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="gutter flex flex-col gap-2 border-t border-border py-8 text-sm text-faint md:flex-row md:justify-between">
          <span>
            Information changes often. Always confirm details on the
            programme&apos;s own website before applying.
          </span>
          <span>
            Part of{" "}
            <Link href="/about" className="text-faint underline hover:text-muted">
              Bridging Futures
            </Link>
            ,{" "}
            <a
              href="https://linktr.ee/globalshapersramallah"
              className="text-faint underline hover:text-muted"
            >
              Ramallah Hub
            </a>
            . Developed by the{" "}
            <a
              href="https://valencia-hub-global-shapers.github.io/?lang=en"
              className="text-faint underline hover:text-muted"
            >
              Valencia Hub
            </a>
            , Global Shapers Community.
          </span>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
