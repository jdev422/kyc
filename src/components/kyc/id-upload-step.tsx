"use client";

import { Upload, Image as ImageIcon } from "lucide-react";

type Props = {
  idFrontFile: File | null;
  idBackFile: File | null;
  passportFile: File | null;
  error: string | null;
  onFrontChange: (file: File | null) => void;
  onBackChange: (file: File | null) => void;
  onPassportChange: (file: File | null) => void;
};

export function IdUploadStep({
  idFrontFile,
  idBackFile,
  passportFile,
  error,
  onFrontChange,
  onBackChange,
  onPassportChange,
}: Props) {
  return (
    <div className="space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Upload your ID</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Provide both the front and back of your government-issued ID, or a passport scan/photo.
          Both sides are required for ID cards.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <UploadField
          label="ID front"
          value={idFrontFile}
          accept="image/*,.pdf"
          onChange={onFrontChange}
        />
        <UploadField
          label="ID back"
          value={idBackFile}
          accept="image/*,.pdf"
          onChange={onBackChange}
        />
      </div>

      <UploadField
        label="Passport (optional)"
        value={passportFile}
        accept="image/*,.pdf"
        onChange={onPassportChange}
      />

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type UploadFieldProps = {
  label: string;
  accept: string;
  value: File | null;
  onChange: (file: File | null) => void;
};

function UploadField({ label, accept, value, onChange }: UploadFieldProps) {
  return (
    <label className="group relative flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/40 p-4 transition hover:border-white/40 hover:bg-[var(--surface-card)]/60">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-white" aria-hidden />
          {label}
        </span>
        <Upload className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-white" aria-hidden />
      </div>
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <div className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-3 py-2 text-xs text-[var(--text-muted)]">
        {value ? `${value.name} (${(value.size / 1024).toFixed(0)} KB)` : "Drop or browse"}
      </div>
    </label>
  );
}
