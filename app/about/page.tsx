import type { Metadata } from "next";
import Link from "next/link";
import { Collaboration } from "@/components/Collaboration";

export const metadata: Metadata = {
  title: "About",
  description:
    "Camí is the programme directory of Bridging Futures, a Global Shapers Ramallah Hub initiative, built and maintained with the Valencia Hub."
};

const AREAS = [
  {
    title: "Skills training",
    body: "Workshops for final-year students and recent graduates on critical thinking, professional writing, leadership, digital and AI literacy, and career readiness: CVs, interviews and applications."
  },
  {
    title: "Mentorship",
    body: "One-to-one matches between Palestinian students and graduates and Global Shapers around the world, for career guidance, referrals and support with applications and interviews."
  },
  {
    title: "Training for Shapers",
    body: "A training of trainers programme so that Shapers in Ramallah and other hubs can run workshops and mentor well, including facilitation, safeguarding and adapting content to local context."
  },
  {
    title: "Access to opportunities",
    body: "Helping students and graduates find scholarships, fellowships and programmes they are actually eligible for, with a focus on Palestine and the wider region."
  }
];

const ROLES = [
  {
    who: "Global Shapers Ramallah Hub",
    what: "Designs and leads Bridging Futures, and works directly with the students and graduates it supports."
  },
  {
    who: "Global Shapers Valencia Hub",
    what: "Takes part in Bridging Futures, built Camí, and runs the review team that checks every submission before it is published."
  },
  {
    who: "Shapers from any hub",
    what: "Submit programmes they find, so the directory covers more countries and universities than one team could track alone."
  }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="gutter py-12 sm:py-16">
        <p className="label-caps text-route">About</p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          Camí is the programme directory of Bridging Futures.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">
          Bridging Futures is an initiative of the Global Shapers Ramallah Hub
          that supports Palestinian students and graduates with skills
          training, mentorship and access to opportunities. Camí is the
          initiative&apos;s shared platform for university admission and
          scholarship programmes, built and maintained with the Global Shapers
          Valencia Hub.
        </p>

        <Collaboration className="mt-10" />
      </section>

      <section
        aria-labelledby="bf-heading"
        className="gutter grid gap-8 border-t border-border py-12 sm:py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      >
        <div>
          <h2
            id="bf-heading"
            className="font-serif text-2xl font-semibold sm:text-3xl"
          >
            Bridging Futures
          </h2>
          <p className="mt-3 text-sm text-faint">
            Led by the Global Shapers Ramallah Hub, with Shapers from other
            hubs.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-muted">
          <p>
            Many Palestinian students and early-career graduates are highly
            motivated and well educated, but face barriers between education
            and work: limited access to training in the skills employers look
            for, to mentors and international networks, and to clear
            information about scholarships and programmes abroad. Mobility
            restrictions and uneven access to information make each of these
            harder.
          </p>
          <p>
            Bridging Futures is a youth-led initiative designed and run by the
            Ramallah Hub to address these gaps together. It works mainly with
            final-year university students, graduates with up to three years
            of experience, and early-career professionals with limited access
            to opportunities abroad. It also trains Shapers, in Ramallah and
            in other hubs, to deliver that support well.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="areas-heading"
        className="gutter border-t border-border bg-sand/50 py-12 sm:py-16"
      >
        <h2
          id="areas-heading"
          className="font-serif text-2xl font-semibold sm:text-3xl"
        >
          What the initiative does
        </h2>
        <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {AREAS.map((area, i) => (
            <li
              key={area.title}
              className="flex flex-col gap-2 rounded-card border border-border bg-white p-6"
            >
              <span className="font-serif text-2xl font-semibold text-terracotta">
                {i + 1}
              </span>
              <h3 className="font-serif text-lg font-semibold">
                {area.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{area.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="origin-heading"
        className="gutter grid gap-8 border-t border-border py-12 sm:py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      >
        <h2
          id="origin-heading"
          className="font-serif text-2xl font-semibold sm:text-3xl"
        >
          How Camí started
        </h2>
        <div className="flex flex-col gap-4 text-muted">
          <p>
            Shapers from the Valencia Hub take part in Bridging Futures.
            Talking through the initiative with the Ramallah Hub, the two hubs
            decided to build Camí so that Bridging Futures has one shared
            platform for the admission and scholarship programmes it collects,
            instead of lists spread across documents and messages.
          </p>
          <p>
            Information about which universities around the world admit and
            fund Palestinian students is spread across many university websites
            and changes each academic year. Camí keeps it in one place: what
            each programme covers, who can apply, the documents it asks for and
            its expected dates, with a link to the official source.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="roles-heading"
        className="gutter border-t border-border py-12 sm:py-16"
      >
        <h2
          id="roles-heading"
          className="font-serif text-2xl font-semibold sm:text-3xl"
        >
          Who does what
        </h2>
        <dl className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {ROLES.map((role) => (
            <div
              key={role.who}
              className="rounded-card border border-border bg-white p-6"
            >
              <dt className="font-serif text-lg font-semibold">{role.who}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {role.what}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="checks-heading"
        className="gutter grid gap-8 border-t border-border bg-sand py-12 sm:py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      >
        <h2
          id="checks-heading"
          className="font-serif text-2xl font-semibold sm:text-3xl"
        >
          How entries are checked
        </h2>
        <div className="flex flex-col gap-4 text-muted">
          <p>
            Every programme is checked against its official source before it
            is published, and each entry shows the date it was last checked.
            Dates marked &quot;estimated&quot; are based on previous calls, so
            always confirm them on the programme&apos;s official page before
            applying.
          </p>
          <p>
            Found something out of date, or a programme that is missing?{" "}
            <Link href="/submit">Send it for review</Link>.
          </p>
          <p className="flex flex-wrap gap-3 pt-2">
            <Link href="/directory" className="btn-primary">
              Browse the directory
            </Link>
            <Link href="/submit" className="btn-secondary">
              Submit a programme
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
