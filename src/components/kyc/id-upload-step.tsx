"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { ID_DOC_TYPES, isPrimaryIdentityDocType } from "@/lib/kyc/id-doc-types";

export type IdDocumentDraft = {
  docType: string;
  frontFile: File | null;
  backFile: File | null;
};

type Props = {
  documents: [IdDocumentDraft, IdDocumentDraft];
  error: string | null;
  onChange: (documents: [IdDocumentDraft, IdDocumentDraft]) => void;
};

export function IdUploadStep({ documents, error, onChange }: Props) {
  const [touched, setTouched] = useState({
    doc0Type: false,
    doc0Front: false,
    doc0Back: false,
    doc1Type: false,
    doc1Front: false,
    doc1Back: false,
  });

  const [fileTypeErrors, setFileTypeErrors] = useState({
    doc0Front: null as string | null,
    doc0Back: null as string | null,
    doc1Front: null as string | null,
    doc1Back: null as string | null,
  });

  const acceptedIdImages = "image/jpeg,image/png,.jpg,.jpeg,.png" as const;

  const validateIdImage = (file: File) => {
    const type = (file.type ?? "").toLowerCase();
    if (type === "image/jpeg" || type === "image/png") return null;

    const name = (file.name ?? "").toLowerCase();
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) {
      return null;
    }

    if (type === "image/heic" || name.endsWith(".heic")) {
      return "HEIC is not supported. Please upload JPG or PNG.";
    }

    return "Accepted formats only: JPG, PNG.";
  };

  const touch = (index: 0 | 1, field: "Type" | "Front" | "Back") => {
    setTouched((prev) => {
      if (index === 0 && field === "Type") return { ...prev, doc0Type: true };
      if (index === 0 && field === "Front")
        return { ...prev, doc0Front: true };
      if (index === 0 && field === "Back") return { ...prev, doc0Back: true };
      if (index === 1 && field === "Type") return { ...prev, doc1Type: true };
      if (index === 1 && field === "Front")
        return { ...prev, doc1Front: true };
      if (index === 1 && field === "Back") return { ...prev, doc1Back: true };
      return prev;
    });
  };

  const updateDoc = (index: 0 | 1, patch: Partial<IdDocumentDraft>) => {
    const next: [IdDocumentDraft, IdDocumentDraft] = [
      index === 0 ? { ...documents[0], ...patch } : documents[0],
      index === 1 ? { ...documents[1], ...patch } : documents[1],
    ];
    onChange(next);
  };

  const completedDocs = useMemo(
    () =>
      documents.filter((doc) => doc.docType && doc.frontFile && doc.backFile),
    [documents]
  );

  const hasPrimary = useMemo(
    () => completedDocs.some((doc) => isPrimaryIdentityDocType(doc.docType)),
    [completedDocs]
  );

  return (
    <div className="space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Upload your ID</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Upload two identity document types. Each must include front and back
          images (e.g., passport + ID card).
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Please take a clear photo of your image with all four corners visible.
          Make sure the details are readable, with no glare, blur, or cropping.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <DocumentField
          label="Document 1"
          value={documents[0]}
          accepted={acceptedIdImages}
          touched={{
            docType: touched.doc0Type,
            front: touched.doc0Front,
            back: touched.doc0Back,
          }}
          fileTypeErrors={{
            front: fileTypeErrors.doc0Front,
            back: fileTypeErrors.doc0Back,
          }}
          onTouch={(field) => touch(0, field)}
          onDocTypeChange={(value) => updateDoc(0, { docType: value })}
          onFrontChange={(file) => {
            if (!file) {
              setFileTypeErrors((prev) => ({ ...prev, doc0Front: null }));
              updateDoc(0, { frontFile: null });
              return;
            }
            const nextError = validateIdImage(file);
            setFileTypeErrors((prev) => ({ ...prev, doc0Front: nextError }));
            updateDoc(0, { frontFile: nextError ? null : file });
          }}
          onBackChange={(file) => {
            if (!file) {
              setFileTypeErrors((prev) => ({ ...prev, doc0Back: null }));
              updateDoc(0, { backFile: null });
              return;
            }
            const nextError = validateIdImage(file);
            setFileTypeErrors((prev) => ({ ...prev, doc0Back: nextError }));
            updateDoc(0, { backFile: nextError ? null : file });
          }}
        />
        <DocumentField
          label="Document 2"
          value={documents[1]}
          accepted={acceptedIdImages}
          touched={{
            docType: touched.doc1Type,
            front: touched.doc1Front,
            back: touched.doc1Back,
          }}
          fileTypeErrors={{
            front: fileTypeErrors.doc1Front,
            back: fileTypeErrors.doc1Back,
          }}
          onTouch={(field) => touch(1, field)}
          onDocTypeChange={(value) => updateDoc(1, { docType: value })}
          onFrontChange={(file) => {
            if (!file) {
              setFileTypeErrors((prev) => ({ ...prev, doc1Front: null }));
              updateDoc(1, { frontFile: null });
              return;
            }
            const nextError = validateIdImage(file);
            setFileTypeErrors((prev) => ({ ...prev, doc1Front: nextError }));
            updateDoc(1, { frontFile: nextError ? null : file });
          }}
          onBackChange={(file) => {
            if (!file) {
              setFileTypeErrors((prev) => ({ ...prev, doc1Back: null }));
              updateDoc(1, { backFile: null });
              return;
            }
            const nextError = validateIdImage(file);
            setFileTypeErrors((prev) => ({ ...prev, doc1Back: nextError }));
            updateDoc(1, { backFile: nextError ? null : file });
          }}
        />
      </div>

      {!hasPrimary &&
        (touched.doc0Type || touched.doc1Type) &&
        completedDocs.length >= 1 && (
          <p className="text-sm text-red-400" role="alert">
            At least one uploaded document must be a passport, driver’s license,
            or identification card.
          </p>
        )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function DocumentField({
  label,
  value,
  accepted,
  touched,
  fileTypeErrors,
  onTouch,
  onDocTypeChange,
  onFrontChange,
  onBackChange,
}: {
  label: string;
  value: IdDocumentDraft;
  accepted: string;
  touched: { docType: boolean; front: boolean; back: boolean };
  fileTypeErrors: { front: string | null; back: string | null };
  onTouch: (field: "Type" | "Front" | "Back") => void;
  onDocTypeChange: (value: string) => void;
  onFrontChange: (file: File | null) => void;
  onBackChange: (file: File | null) => void;
}) {
  const frontPreviewUrl = useObjectUrl(value.frontFile);
  const backPreviewUrl = useObjectUrl(value.backFile);

  const typeError =
    touched.docType && !value.docType ? "Select a document type." : null;
  const frontError =
    touched.front && !value.frontFile ? "Upload the front image." : null;
  const backError =
    touched.back && !value.backFile ? "Upload the back image." : null;

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/40 p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-white" aria-hidden />
          {label}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        <label className="flex flex-col gap-2" onBlur={() => onTouch("Type")}>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Document type
          </span>
          <select
            value={value.docType}
            onChange={(event) => onDocTypeChange(event.target.value)}
            className={`rounded-2xl px-4 py-3 text-sm text-white ${typeError ? "ring-2 ring-red-500/60" : ""}`}
            required
            aria-invalid={Boolean(typeError)}
          >
            <option value="">Select</option>
            {ID_DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {typeError && (
            <span className="text-xs text-red-400" role="alert">
              {typeError}
            </span>
          )}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <UploadCard
            label="Front"
            file={value.frontFile}
            previewUrl={frontPreviewUrl}
            error={fileTypeErrors.front ?? frontError}
            accept={accepted}
            onChange={(file) => {
              onTouch("Front");
              onFrontChange(file);
            }}
          />
          <UploadCard
            label="Back"
            file={value.backFile}
            previewUrl={backPreviewUrl}
            error={fileTypeErrors.back ?? backError}
            accept={accepted}
            onChange={(file) => {
              onTouch("Back");
              onBackChange(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function UploadCard({
  label,
  file,
  previewUrl,
  error,
  accept,
  onChange,
}: {
  label: string;
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  accept: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="group relative flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-black/10 p-4 transition hover:border-white/40 hover:bg-black/20">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-2">
            <Upload className="h-3.5 w-3.5 text-white" aria-hidden />
            {label}
          </span>
        </div>
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <div
          className={`rounded-xl border border-[var(--border-subtle)] bg-black/20 px-3 py-2 text-xs text-[var(--text-muted)] ${error ? "ring-2 ring-red-500/60" : ""}`}
        >
          {file
            ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)`
            : "Drop or browse"}
        </div>
        {error && (
          <span className="text-xs text-red-400" role="alert">
            {error}
          </span>
        )}
      </label>

      {previewUrl && file?.type.startsWith("image/") && (
        <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] bg-black/20 p-3 text-center text-sm">
          <p className="mb-2 text-[var(--text-muted)]">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className="mx-auto h-40 w-auto rounded-2xl object-cover"
          />
        </div>
      )}
    </div>
  );
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return url;
}
