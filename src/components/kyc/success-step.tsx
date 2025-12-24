"use client";

import { CheckCircle2 } from "lucide-react";

type ParsedAddress = {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  issuer: string;
} | null;

type Props = {
  applicantId: string | null;
  parsedAddress: ParsedAddress;
  onRestart: () => void;
};

export function SuccessStep({ applicantId, parsedAddress, onRestart }: Props) {
  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--success)]" />
      <h2 className="mt-4 text-2xl font-semibold text-white">
        Verification submitted
      </h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Our compliance team is reviewing your documents. You will receive an
        email as soon as the review is complete.
      </p>
      {applicantId && (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Applicant ID: <span className="text-white">{applicantId}</span>
        </p>
      )}
      {parsedAddress && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-left text-sm">
          <p className="font-medium text-white">Parsed address</p>
          <p className="text-[var(--text-muted)]">
            {parsedAddress.line1}
            <br />
            {parsedAddress.city}, {parsedAddress.region} {parsedAddress.postalCode}
            <br />
            {parsedAddress.country}
          </p>
          <p className="mt-2 text-[var(--text-muted)]">
            Issuer: {parsedAddress.issuer}
          </p>
        </div>
      )}
      <button
        onClick={onRestart}
        className="mt-6 rounded-full border border-[var(--border-subtle)] px-6 py-2 text-sm font-semibold text-white hover:border-white/50"
      >
        Start another verification
      </button>
    </div>
  );
}
