"use client";

import { AddressMeta } from "./types";
import { Upload } from "lucide-react";

type Props = {
  file: File | null;
  metadata: AddressMeta;
  error: string | null;
  onFileChange: (file: File | null) => void;
  onMetaChange: (metadata: AddressMeta) => void;
};

export function AddressStep({
  file,
  metadata,
  error,
  onFileChange,
  onMetaChange,
}: Props) {
  const update = (field: keyof AddressMeta, value: string) =>
    onMetaChange({ ...metadata, [field]: value });

  return (
    <div className="space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Proof of address</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Upload a recent utility bill, bank statement, or government-issued
          document. We will parse the address and issuer details.
        </p>
      </header>

      <label className="flex w-full cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-6 text-center text-sm text-[var(--text-muted)] hover:border-white/40">
        <input
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <Upload className="mx-auto h-6 w-6 text-white" />
        <span className="font-medium text-white">Drop or browse document</span>
        <span>
          {file
            ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB`
            : "Accepted formats: PDF, JPG, PNG"}
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Document type
          </span>
          <select
            value={metadata.docType}
            onChange={(event) => update("docType", event.target.value)}
            className="rounded-2xl px-4 py-3 text-sm text-white"
            required
          >
            <option value="">Select</option>
            <option value="utility-bill">Utility bill</option>
            <option value="bank-statement">Bank statement</option>
            <option value="government-letter">Government letter</option>
            <option value="lease">Lease agreement</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Issuer
          </span>
          <input
            type="text"
            value={metadata.issuer}
            onChange={(event) => update("issuer", event.target.value)}
            className="rounded-2xl px-4 py-3 text-sm placeholder:text-[var(--text-muted)]"
            placeholder="Pacific Gas & Electric"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Country
          </span>
          <input
            type="text"
            value={metadata.country}
            onChange={(event) => update("country", event.target.value)}
            className="rounded-2xl px-4 py-3 text-sm placeholder:text-[var(--text-muted)]"
            placeholder="US"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Issue date
          </span>
          <input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={metadata.issueDate}
            onChange={(event) => update("issueDate", event.target.value)}
            className="rounded-2xl px-4 py-3 text-sm text-white"
            required
          />
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
