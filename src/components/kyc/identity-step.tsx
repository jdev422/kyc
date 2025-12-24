"use client";

import { IdentityForm } from "./types";

type Props = {
  value: IdentityForm;
  error: string | null;
  onChange: (value: IdentityForm) => void;
};

export function IdentityStep({ value, error, onChange }: Props) {
  const update = (field: keyof IdentityForm, input: string) =>
    onChange({ ...value, [field]: input });

  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
      <h2 className="text-xl font-semibold text-white">Identity basics</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Email, phone, and name are required. We will issue OTP challenges to the
        email and phone immediately.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field
          label="Email"
          type="email"
          placeholder="jane@example.com"
          value={value.email}
          onChange={(event) => update("email", event.target.value)}
        />
        <Field
          label="Phone"
          type="tel"
          placeholder="+1 555 123 4567"
          value={value.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
        <Field
          label="First name"
          type="text"
          placeholder="Jane"
          value={value.firstName}
          onChange={(event) => update("firstName", event.target.value)}
        />
        <Field
          label="Last name"
          type="text"
          placeholder="Doe"
          value={value.lastName}
          onChange={(event) => update("lastName", event.target.value)}
        />
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Gender
            </span>
            <select
              value={value.gender}
              onChange={(event) => update("gender", event.target.value)}
              className="rounded-2xl px-4 py-3 text-sm text-white"
              required
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type FieldProps = {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function Field({ label, type, placeholder, value, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-2xl px-4 py-3 text-sm placeholder:text-[var(--text-muted)]"
        required
      />
    </label>
  );
}
