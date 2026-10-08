import { DEGREE_LEVELS, STATUS_LABELS, ProgrammeStatus } from "@/lib/types";
import { ProgrammeFields, formatLocation } from "@/lib/programme-form";

// Editable fields shared by the review form, the programme editor and the
// "new programme" form. Uncontrolled inputs, so it renders on the server.
export function ProgrammeFieldset({
  values,
  status,
  idPrefix,
  latitude,
  longitude,
  dates
}: {
  values?: Partial<ProgrammeFields>;
  status?: ProgrammeStatus;
  idPrefix: string;
  latitude?: number | null;
  longitude?: number | null;
  dates?: { opening_date: string | null; deadline_date: string | null };
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
      <fieldset className="flex flex-col gap-3 rounded-card border border-border bg-cream p-4 text-sm md:col-span-2">
        <legend className="px-1 font-medium">Exact dates (optional)</legend>
        <p className="text-faint">
          When set, the public status updates by itself: Closed the day after
          the deadline, Expected before the opening date, Open in between.
          Leave empty to keep the public status chosen above.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Opening date" name="opening_date" type="date" value={dates?.opening_date} />
          <Input label="Deadline date" name="deadline_date" type="date" value={dates?.deadline_date} />
        </div>
      </fieldset>
      <Input label="Academic year" name="academic_year" value={v.academic_year} />
      <Input label="Language" name="language" value={v.language} />
      <Input label="Website" name="website" value={v.website} type="url" />
      <Input label="Contact" name="contact" value={v.contact} />
      <fieldset className="flex flex-col gap-3 rounded-card border border-border bg-cream p-4 text-sm md:col-span-2">
        <legend className="px-1 font-medium">Map location</legend>
        {latitude != null && longitude != null ? (
          <p className="text-muted">
            Pin at {formatLocation(latitude, longitude)}.{" "}
            <a
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check it on OpenStreetMap ↗
            </a>
          </p>
        ) : (
          <p className="text-muted">No map pin yet.</p>
        )}
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="auto_locate"
            defaultChecked={latitude == null}
            className="mt-0.5 accent-terracotta"
          />
          <span>
            Find the location automatically from the university name, city
            and country (OpenStreetMap). Only places marked as a university
            or college are used, so anything else gets no pin.
          </span>
        </label>
        <details>
          <summary className="cursor-pointer text-faint">
            Set or correct the pin by hand
          </summary>
          <label className="mt-2 flex flex-col gap-1.5">
            <span className="text-faint">
              Latitude, longitude. Typed coordinates always win. Clear this
              and untick the box above to remove the pin. In Google Maps,
              right-click the campus and click the numbers to copy them.
            </span>
            <input
              type="text"
              name="coordinates"
              inputMode="decimal"
              placeholder="41.5021, 2.1045"
              defaultValue={formatLocation(latitude, longitude)}
              className="input"
              id={`${idPrefix}-coordinates`}
            />
          </label>
        </details>
      </fieldset>
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
