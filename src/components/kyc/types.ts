"use client";

export type StepId = "identity" | "selfie" | "id-docs" | "address" | "success";

export type StepDefinition = {
  id: StepId;
  title: string;
  description: string;
};

export type IdentityForm = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  gender: string;
};

export type AddressMeta = {
  issuer: string;
  docType: string;
  country: string;
  issueDate: string;
};

export const IDENTITY_TEMPLATE: IdentityForm = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  gender: "",
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
