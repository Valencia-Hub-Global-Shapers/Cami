"use client";

import { useState } from "react";
import { submitProgramme } from "./actions";

const DEGREE_LEVELS = ["Bachelor", "Master's", "PhD"];

export default function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("sending");
    const result = await submitProgramme(formData);
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-8 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Thank you.</h1>
        <p className="mt-4 text-muted">
          Your submission has been sent to the review team. It will appear in
          the directory once it&apos;s checked.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-16">
      <h1 className="font-serif text-3xl font-semibold">
        Submit a programme
      </h1>
      <p className="mt-3 text-muted">
        Found an admission or scholarship route for Palestinian students?
        Add it below. A reviewer checks every submission before it goes live.
      </p>

      <form action={handleSubmit} className="mt-10 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-faint">
            Required
          </legend>

          <Field label="University" name="university" required />
          <Field label="Country" name="country" required />
          <Field label="Programme or scholarship name" name="programme_name" required />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Website (link to the programme)" name="website" type="url" />
            <Field label="Contact email (if no website)" name="contact" type="email" />
          </div>

          <Field label="Your name" name="submitter_name" required />
          <Field label="Your hub" name="submitter_hub" required placeholder="e.g. Global Shapers Nairobi" />
          <Field label="Your email" name="submitter_email" type="email" required />
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-t border-border pt-6">
          <legend className="text-sm font-semibold uppercase tracking-wide text-faint">
            Optional, fill in what you know
          </legend>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="City" name="city" />
            <Field label="Programme type" name="programme_type" placeholder="Scholarship, admission support..." />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium">Degree level</span>
            <div className="flex flex-wrap gap-4">
              {DEGREE_LEVELS.map((level) => (
                <label key={level} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="degree_level" value={level} />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <Field label="Target group" name="target_group" placeholder="e.g. Palestinian students affected by conflict" />
          <TextArea label="Coverage" name="coverage" placeholder="What does it pay for: tuition, housing, stipend..." />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Estimated opening" name="estimated_opening" />
            <Field label="Estimated deadline" name="estimated_deadline" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Academic year" name="academic_year" placeholder="2027-2028" />
            <Field label="Language" name="language" />
          </div>

          <TextArea label="Main eligibility" name="main_eligibility" />
          <TextArea label="Required documents" name="required_documents" />
          <TextArea label="Notes" name="notes" />
        </fieldset>

        {status === "error" && (
          <p className="text-sm text-[#9C4A3A]">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="self-start rounded-pill bg-terracotta px-8 py-3 font-medium text-cream hover:bg-terracotta-hover disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-white px-4 py-2.5"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        className="rounded-lg border border-border bg-white px-4 py-2.5"
      />
    </label>
  );
}
