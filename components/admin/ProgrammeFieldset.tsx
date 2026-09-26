import { DEGREE_LEVELS, STATUS_LABELS, ProgrammeStatus } from "@/lib/types";
import { ProgrammeFields } from "@/lib/programme-form";

// Editable fields shared by the review form, the programme editor and the
// "new programme" form. Uncontrolled inputs, so it renders on the server.
export function ProgrammeFieldset({
  values,
  status,
  idPrefix
}: {
  values?: Partial<ProgrammeFields>;
  status?: ProgrammeStatus;
  idPrefix: string;
}) {
  const v = values ?? {};
  const degrees = v.degree_level ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="University" name="university" value={v.university} required />
      <Input label="Programme name" name="programme_name" value={v.programme_name} required />
      <Input label="Country" name="country" value={v.country} required />
      <Input label="City" name="city" value={v.city} />
      <Input label="Programme type" name="programme_type" value={v.programme_type} />
      <Input label="Target group" name="target_group" value={v.target_group} />

      <fieldset className="flex flex-col gap-1.5 text-sm">
        <legend className="mb-1.5 font-medium">Degree level</legend>
        <div className="flex flex-wrap gap-3">
          {Array.from(new Set([...DEGREE_LEVELS, ...degrees])).map((level) => (
            <label key={level} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="degree_level"
                value={level}
                defaultChecked={degrees.includes(level)}
                className="accent-terracotta"
                id={`${idPrefix}-degree-${level}`}
              />
              {level}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Public status</span>
        <select name="status" defaultValue={status ?? "monitor"} className="input">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <Input label="Estimated opening" name="estimated_opening" value={v.estimated_opening} />
      <Input label="Estimated deadline" name="estimated_deadline" value={v.estimated_deadline} />
      <Input label="Academic year" name="academic_year" value={v.academic_year} />
      <Input label="Language" name="language" value={v.language} />
      <Input label="Website" name="website" value={v.website} type="url" />
      <Input label="Contact" name="contact" value={v.contact} />
      <Area label="Coverage" name="coverage" value={v.coverage} />
      <Area label="Main eligibility" name="main_eligibility" value={v.main_eligibility} />
      <Area label="Required documents" name="required_documents" value={v.required_documents} />
      <Area label="Public notes" name="notes" value={v.notes} />
    </div>
  );
}

function Input({
  label,
  name,
  value,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  value?: string | null;
  type?: string;
  required?: boolean;
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
        defaultValue={value ?? ""}
        required={required}
        className="input"
      />
    </label>
  );
}

function Area({
  label,
  name,
  value
}: {
  label: string;
  name: string;
  value?: string | null;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
      <span className="font-medium">{label}</span>
      <textarea name={name} defaultValue={value ?? ""} rows={2} className="input" />
    </label>
  );
}
