"use client";

import { IdentityForm } from "./types";

export type IdentityFieldErrors = Partial<Record<keyof IdentityForm, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function hasValue(value: string) {
  return value.trim().length > 0;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function validateIdentity(identity: IdentityForm): IdentityFieldErrors {
  const errors: IdentityFieldErrors = {};

  if (!hasValue(identity.firstName)) {
    errors.firstName = "First name is required.";
  } else if (identity.firstName.trim().length > 80) {
    errors.firstName = "First name is too long.";
  }

  if (hasValue(identity.middleName) && identity.middleName.trim().length > 80) {
    errors.middleName = "Middle name is too long.";
  }

  if (!hasValue(identity.lastName)) {
    errors.lastName = "Last name is required.";
  } else if (identity.lastName.trim().length > 80) {
    errors.lastName = "Last name is too long.";
  }

  if (!hasValue(identity.email)) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(identity.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!hasValue(identity.phone)) {
    errors.phone = "Phone is required.";
  } else {
    const digits = digitsOnly(identity.phone);
    if (digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  if (!hasValue(identity.dob)) {
    errors.dob = "Date of birth is required.";
  } else if (!ISO_DATE_RE.test(identity.dob.trim())) {
    errors.dob = "Enter a valid date of birth.";
  } else {
    const [year, month, day] = identity.dob.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime()) || date.getMonth() !== month - 1) {
      errors.dob = "Enter a valid date of birth.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) errors.dob = "Date of birth cannot be in the future.";

      const oldest = new Date();
      oldest.setFullYear(oldest.getFullYear() - 130);
      if (date < oldest) errors.dob = "Enter a valid date of birth.";
    }
  }

  if (!hasValue(identity.gender)) errors.gender = "Gender is required.";

  if (!hasValue(identity.addressStreet)) {
    errors.addressStreet = "Street address is required.";
  } else if (identity.addressStreet.trim().length > 120) {
    errors.addressStreet = "Street address is too long.";
  }
  if (!hasValue(identity.addressCity)) errors.addressCity = "City is required.";
  if (!hasValue(identity.addressRegion)) {
    errors.addressRegion = "State/Province is required.";
  }
  if (!hasValue(identity.addressPostalCode)) {
    errors.addressPostalCode = "Postal code is required.";
  } else if (identity.addressPostalCode.trim().length < 3) {
    errors.addressPostalCode = "Enter a valid postal code.";
  } else if (identity.addressPostalCode.trim().length > 20) {
    errors.addressPostalCode = "Enter a valid postal code.";
  }
  if (!hasValue(identity.addressCountry)) {
    errors.addressCountry = "Country is required.";
  }

  return errors;
}

export function formatFullName(identity: IdentityForm) {
  return [identity.firstName, identity.middleName, identity.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function formatPhysicalAddress(identity: IdentityForm) {
  const line = identity.addressStreet.trim();
  const city = identity.addressCity.trim();
  const region = identity.addressRegion.trim();
  const postal = identity.addressPostalCode.trim();
  const country = identity.addressCountry.trim();
  return [line, [city, region, postal].filter(Boolean).join(", "), country]
    .filter(Boolean)
    .join(", ");
}
