import type { Metadata } from "next";
import { SubmitForm } from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit a programme"
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold">Submit a programme</h1>
      <p className="mt-3 text-muted">
        Found an admission or scholarship programme open to Palestinian
        students? Add it below. A reviewer checks every submission against
        the official source before it is published.
      </p>
      <p className="mt-2 text-sm text-faint">
        Only the fields marked * are required. The review team can fill in
        the rest, and may email you with questions.
      </p>
      <SubmitForm />
    </div>
  );
}
