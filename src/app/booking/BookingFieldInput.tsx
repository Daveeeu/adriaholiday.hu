import { CHECKBOX_CHECKED_VALUE, type BookingFormField } from "./booking-form-fields";

type BookingFieldInputProps = {
  field: BookingFormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/**
 * Renders one booking form field according to its type: text-like inputs,
 * textarea, dropdown, radio option cards or a yes/no checkbox card.
 */
export default function BookingFieldInput({ field, value, onChange, error }: BookingFieldInputProps) {
  const label = `${field.label}${field.visibility === "required" ? "*" : ""}`;

  if (field.fieldType === "checkbox") {
    return (
      <div>
        <label
          className={`flex items-start justify-between gap-4 rounded-2xl border p-5 cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5 transition-all ${
            error ? "border-red-300" : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={value === CHECKBOX_CHECKED_VALUE}
              onChange={(event) => onChange(event.target.checked ? CHECKBOX_CHECKED_VALUE : "")}
              className="mt-1 accent-[#00c389]"
            />

            <div>
              <div className="font-bold text-[#0f172a] mb-1">{label}</div>
              {field.description ? <div className="text-gray-500 text-sm">{field.description}</div> : null}
            </div>
          </div>

          {field.priceLabel ? (
            <div className="font-bold text-[#00a878] whitespace-nowrap">{field.priceLabel}</div>
          ) : null}
        </label>

        <FieldError error={error} />
      </div>
    );
  }

  if (field.fieldType === "radio") {
    return (
      <fieldset>
        <legend className="block text-sm font-bold text-[#0f172a] mb-2">{label}</legend>
        <FieldDescription field={field} className="-mt-1 mb-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(field.options ?? []).map((option) => (
            <label
              key={option}
              className={`flex items-center gap-3 rounded-2xl border p-5 cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5 transition-all ${
                error ? "border-red-300" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name={field.key}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="accent-[#00c389]"
              />
              <span className="font-bold text-[#0f172a]">{option}</span>
            </label>
          ))}
        </div>

        <FieldError error={error} />
      </fieldset>
    );
  }

  const fieldClassName = `w-full rounded-2xl border px-5 outline-none focus:ring-4 transition-all ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#00c389] focus:ring-[#00c389]/10"
  }`;

  return (
    <label className="block">
      <span className="block text-sm font-bold text-[#0f172a] mb-2">{label}</span>

      {field.fieldType === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={`${fieldClassName} py-3`}
        />
      ) : field.fieldType === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClassName} h-14 bg-white`}
        >
          <option value="">Válassz...</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.fieldType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClassName} h-14`}
        />
      )}

      <FieldDescription field={field} />
      <FieldError error={error} />
    </label>
  );
}

function FieldDescription({ field, className = "mt-1.5" }: { field: BookingFormField; className?: string }) {
  const text = [field.description, field.priceLabel].filter(Boolean).join(" · ");

  return text ? <span className={`${className} block text-sm text-gray-500`}>{text}</span> : null;
}

function FieldError({ error }: { error?: string }) {
  return error ? <span className="mt-1.5 block text-sm font-medium text-red-500">{error}</span> : null;
}
