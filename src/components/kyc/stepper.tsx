"use client";

import { Check } from "lucide-react";
import { StepId, steps } from "./types";

type Props = {
  currentStep: StepId;
};

export function Stepper({ currentStep }: Props) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-sm">
      {steps.slice(0, steps.length - 1).map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <li
            key={step.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                isCompleted
                  ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                  : isActive
                    ? "border-white text-white"
                    : "border-[var(--border-subtle)] text-[var(--text-muted)]"
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4 text-emerald-300" /> : index + 1}
            </span>
            <div>
              <p
                className={`font-medium ${
                  isActive || isCompleted ? "text-white" : "text-[var(--text-muted)]"
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
