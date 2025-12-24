"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-[32px] bg-[var(--surface-overlay)]">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-6 py-5 text-sm text-[var(--text-muted)]">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <p>{message}</p>
      </div>
    </div>
  );
}
