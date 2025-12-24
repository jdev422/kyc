"use client";

import { IdentityForm, AddressMeta } from "./types";

type Props = {
  identity: IdentityForm;
  addressMeta: AddressMeta;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  identity,
  addressMeta,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
        <h3 className="text-xl font-semibold text-white">Confirm submission</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Double-check the captured details before submitting. You can still go
          back to edit any step.
        </p>
        <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--text-muted)]">
          <Row label="Email" value={identity.email} />
          <Row label="Phone" value={identity.phone} />
          <Row
            label="Name"
            value={`${identity.firstName} ${identity.lastName}`.trim()}
          />
          <Row label="Document type" value={addressMeta.docType || "—"} />
          <Row label="Issuer" value={addressMeta.issuer || "—"} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-[var(--border-subtle)] px-5 py-2 text-sm text-white"
          >
            Review again
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Submit now
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-white">{value || "—"}</span>
    </div>
  );
}
