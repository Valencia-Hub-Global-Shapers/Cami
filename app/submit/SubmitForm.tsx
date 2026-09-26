"use client";

import { useRef, useState } from "react";
import { DEGREE_LEVELS } from "@/lib/types";
import { submitProgramme } from "./actions";

export function SubmitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const website = String(formData.get("website") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    if (!website && !contact) {
      setStatus("error");
      setErrorMessage(
        "Add a website link or a contact email so the review team can verify this programme."
      );
      e.currentTarget.querySelector<HTMLInputElement>("[name=website]")?.focus();
      return;
    }

    setStatus("sending");
    const result = await submitProgramme(formData);
    if (result.ok) {
      setStatus("done");
      window.scrollTo({ top: 0 });
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  }

  function submitAnother() {
    formRef.current?.reset();
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="mt-10 rounded-card border border-border bg-white p-6 sm:p-8"
      >
        <h2 className="font-serif text-2xl font-semibold">
          Thank you, it has been sent for review.
        </h2>
        <p className="mt-3 text-muted">
          It will appear in the directory once a reviewer has checked it.
          There is nothing else you need to do.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={submitAnother} className="btn-secondary">
            Submit another
          </button>
          <a href="/directory" className="btn-primary">
            Browse the directory
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-8"
    >
      <fieldset className="flex flex-col gap-4">
        <legend className="label-caps float-left mb-4 w-full">The programme</legend>

        <Field label="University or organisation" name="university" required />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Country" name="country" required />
          <Field label="City" name="city" />
        </div>
        <Field
          label="Programme or scholarship name"
          name="programme_name"
          required
        />

        <div className="rounded-card border border-border bg-sand p-4">
          <p className="text-sm font-medium">
            Where can we verify it? <span className="text-terracotta">*</span>
          </p>
          <p className="mt-1 text-xs text-faint">
            At least one of these is needed.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Official web page"
              name="website"
              type="url"
              placeholder="https://"
            />
            <Field label="Contact email" name="contact" type="email" />
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-border pt-6">
        <legend className="label-caps float-left mb-4 w-full">About you</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Your name" name="submitter_name" required autoComplete="name" />
          <Field
            label="Your hub"
            name="submitter_hub"
            required
            placeholder="e.g. Global Shapers Nairobi"
          />
        </div>
        <Field
          label="Your email"
          name="submitter_email"
          type="email"
          required
          autoComplete="email"
          hint="Only the review team sees this."
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-border pt-6">
        <legend className="label-caps float-left mb-4 w-full">
          Details (optional, fill in what you know)
        </legend>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium">Degree level</legend>
          <div className="flex flex-wrap gap-2">
            {DEGREE_LEVELS.map((level) => (
              <label
                key={level}
                className="flex cursor-pointer items-center gap-2 rounded-pill border border-border bg-white px-4 py-2 text-sm has-[:checked]:border-terracotta has-[:checked]:bg-[#F7E6DA]"
              >
                <input
                  type="checkbox"
                  name="degree_level"
                  value={level}
                  className="accent-terracotta"
                />
                {level}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Programme type"
            name="programme_type"
            placeholder="Scholarship, admission support..."
          />
          <Field
            label="Target group"
            name="target_group"
            placeholder="e.g. Students from Gaza"
          />
        </div>
        <TextArea
          label="Coverage"
          name="coverage"
          placeholder="What it pays for: tuition, housing, monthly stipend, travel..."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Estimated opening" name="estimated_opening" placeholder="e.g. July" />
          <Field label="Estimated deadline" name="estimated_deadline" placeholder="e.g. 15 May" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Academic year" name="academic_year" placeholder="2027-2028" />
          <Field label="Language" name="language" placeholder="e.g. Spanish B1" />
        </div>
        <TextArea label="Main eligibility" name="main_eligibility" />
        <TextArea label="Required documents" name="required_documents" />
        <TextArea label="Anything else the reviewers should know" name="notes" />
      </fieldset>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-card border border-danger/30 bg-[#EFE3DD] p-4 text-sm text-danger"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary self-stretch px-8 py-3 text-base sm:self-start"
      >
        {status === "sending" ? "Sending..." : "Send for review"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
  hint
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
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
        autoComplete={autoComplete}
        className="input"
      />
      {hint && <span className="text-xs text-faint">{hint}</span>}
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
        className="input"
      />
    </label>
  );
}
