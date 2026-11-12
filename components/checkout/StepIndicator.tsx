import { Check } from "lucide-react";
import { CheckoutStage } from "./types";

interface StepIndicatorProps {
  currentStage: CheckoutStage;
  onSelectStage?: (stage: CheckoutStage) => void;
}

const STAGES: { stage: CheckoutStage; label: string }[] = [
  { stage: 1, label: "Fulfillment" },
  { stage: 2, label: "Contact" },
  { stage: 3, label: "Gift Note" },
  { stage: 4, label: "Review" },
];

export default function StepIndicator({
  currentStage,
  onSelectStage,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Checkout stages" className="flex items-center justify-between gap-2 pt-3">
      {STAGES.map(({ stage, label }, idx) => {
        const isCompleted = stage < currentStage;
        const isCurrent = stage === currentStage;
        const canJump = Boolean(onSelectStage && stage < currentStage);

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && onSelectStage?.(stage)}
              className={`flex items-center gap-1.5 text-left transition-colors ${
                canJump ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`size-6 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-neutral-900 text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : stage}
              </span>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isCurrent
                    ? "text-neutral-900 font-semibold"
                    : isCompleted
                    ? "text-stone-700"
                    : "text-stone-400"
                }`}
              >
                {label}
              </span>
            </button>

            {idx < STAGES.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 transition-colors ${
                  stage < currentStage ? "bg-emerald-500" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

