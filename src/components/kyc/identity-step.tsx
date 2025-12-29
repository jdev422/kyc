"use client";

import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { IdentityForm } from "./types";
import { type IdentityFieldErrors } from "./identity-validation";

type Props = {
  value: IdentityForm;
  error: string | null;
  fieldErrors?: IdentityFieldErrors;
  onChange: (value: IdentityForm) => void;
};

export function IdentityStep({ value, error, fieldErrors, onChange }: Props) {
  const update = (field: keyof IdentityForm, input: string) =>
    onChange({ ...value, [field]: input });

  const [touched, setTouched] = useState<
    Partial<Record<keyof IdentityForm, boolean>>
  >({});

  const touch = (field: keyof IdentityForm) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const getError = (field: keyof IdentityForm) =>
    touched[field] ? fieldErrors?.[field] : undefined;

  const inputId = (field: keyof IdentityForm) => `identity-${field}`;

  const now = new Date();
  const pad2 = (value: number) => String(value).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
    now.getDate()
  )}`;
  const genderError = getError("gender");

  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
      <h2 className="text-xl font-semibold text-white">Identity basics</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Email, phone, legal name, date of birth, and physical address are
        required. We will issue OTP challenges to the email and phone
        immediately.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
          <Field
            id={inputId("firstName")}
            label="First name"
            type="text"
            placeholder="Jane"
            value={value.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            onBlur={() => touch("firstName")}
            error={getError("firstName")}
          />
          <Field
            id={inputId("middleName")}
            label="Middle name"
            type="text"
            placeholder="Marie"
            value={value.middleName}
            onChange={(event) => update("middleName", event.target.value)}
            onBlur={() => touch("middleName")}
            error={getError("middleName")}
            required={false}
          />
          <Field
            id={inputId("lastName")}
            label="Last name"
            type="text"
            placeholder="Doe"
            value={value.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            onBlur={() => touch("lastName")}
            error={getError("lastName")}
          />
        </div>

        <Field
          id={inputId("email")}
          label="Email"
          type="email"
          placeholder="jane@example.com"
          value={value.email}
          onChange={(event) => update("email", event.target.value)}
          onBlur={() => touch("email")}
          error={getError("email")}
          inputMode="email"
          autoComplete="email"
        />
        <Field
          id={inputId("phone")}
          label="Phone"
          type="tel"
          placeholder="+1 555 123 4567"
          value={value.phone}
          onChange={(event) => update("phone", event.target.value)}
          onBlur={() => touch("phone")}
          error={getError("phone")}
          inputMode="tel"
          autoComplete="tel"
        />
        <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
          <Field
            id={inputId("dob")}
            label="Date of birth"
            type="date"
            placeholder=""
            value={value.dob}
            onChange={(event) => update("dob", event.target.value)}
            onBlur={() => touch("dob")}
            error={getError("dob")}
            max={today}
          />
          <div className="md:col-span-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Gender
              </span>
              <select
                id={inputId("gender")}
                value={value.gender}
                onChange={(event) => update("gender", event.target.value)}
                onBlur={() => touch("gender")}
                className={`rounded-2xl px-4 py-3 text-sm text-white ${
                  genderError ? "ring-2 ring-red-500/60" : ""
                }`}
                required
                aria-invalid={Boolean(genderError)}
                aria-describedby={
                  genderError ? `${inputId("gender")}-error` : undefined
                }
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {genderError && (
                <span
                  id={`${inputId("gender")}-error`}
                  className="text-xs text-red-400"
                  role="alert"
                >
                  {genderError}
                </span>
              )}
            </label>
          </div>
        </div>
        <div className="md:col-span-2 pt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Physical address
          </p>
        </div>
        <div className="md:col-span-2">
          <Field
            id={inputId("addressStreet")}
            label="Street"
            type="text"
            placeholder="123 Market Street"
            value={value.addressStreet}
            onChange={(event) => update("addressStreet", event.target.value)}
            onBlur={() => touch("addressStreet")}
            error={getError("addressStreet")}
            autoComplete="street-address"
          />
        </div>
        <Field
          id={inputId("addressCity")}
          label="City"
          type="text"
          placeholder="San Francisco"
          value={value.addressCity}
          onChange={(event) => update("addressCity", event.target.value)}
          onBlur={() => touch("addressCity")}
          error={getError("addressCity")}
          autoComplete="address-level2"
        />
        <Field
          id={inputId("addressRegion")}
          label="State / Province"
          type="text"
          placeholder="CA"
          value={value.addressRegion}
          onChange={(event) => update("addressRegion", event.target.value)}
          onBlur={() => touch("addressRegion")}
          error={getError("addressRegion")}
          autoComplete="address-level1"
        />
        <Field
          id={inputId("addressPostalCode")}
          label="Postal code"
          type="text"
          placeholder="94105"
          value={value.addressPostalCode}
          onChange={(event) => update("addressPostalCode", event.target.value)}
          onBlur={() => touch("addressPostalCode")}
          error={getError("addressPostalCode")}
          autoComplete="postal-code"
        />
        <Field
          id={inputId("addressCountry")}
          label="Country"
          type="text"
          placeholder="United States"
          value={value.addressCountry}
          onChange={(event) => update("addressCountry", event.target.value)}
          onBlur={() => touch("addressCountry")}
          error={getError("addressCountry")}
          autoComplete="country-name"
        />
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
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  max?: InputHTMLAttributes<HTMLInputElement>["max"];
};

function Field({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = true,
  autoComplete,
  inputMode,
  max,
}: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`rounded-2xl px-4 py-3 text-sm placeholder:text-[var(--text-muted)] ${
          error ? "ring-2 ring-red-500/60" : ""
        }`}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        autoComplete={autoComplete}
        inputMode={inputMode}
        max={max}
      />
      {error && (
        <span id={errorId} className="text-xs text-red-400" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
