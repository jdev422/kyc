"use client";

export type StepId = "identity" | "selfie" | "id-docs" | "address" | "success";

export type StepDefinition = {
  id: StepId;
  title: string;
  description: string;
};

export type IdentityForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  addressStreet: string;
  addressCity: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
};

export type AddressMeta = {
  issuer: string;
  docType: string;
  country: string;
  issueDate: string;
};

export const IDENTITY_TEMPLATE: IdentityForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  addressStreet: "",
  addressCity: "",
  addressRegion: "",
  addressPostalCode: "",
  addressCountry: "",
};

export const ADDRESS_TEMPLATE: AddressMeta = {
  issuer: "",
  docType: "",
  country: "",
  issueDate: "",
};

export const steps: StepDefinition[] = [
  {
    id: "identity",
    title: "Identity Basics",
    description: "Required email, phone, and legal name.",
  },
  {
    id: "selfie",
    title: "Selfie Capture",
    description: "Capture a live selfie with face detection.",
  },
  {
    id: "id-docs",
    title: "ID Upload",
    description: "Upload front/back of ID or a passport.",
  },
  {
    id: "address",
    title: "Proof of Address",
    description: "Attach a recent bill, bank statement, or government letter.",
  },
  {
    id: "success",
    title: "Complete",
    description: "Submission confirmation.",
  },
];
