"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, Clock } from "lucide-react";
import { SetupStep } from "./setup-wizard";

interface ProgressIndicatorProps {
  steps: SetupStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isCurrent = index === currentStep;
        const hasError = !!step.error;
        const isClickable =
          onStepClick && (index <= currentStep || isCompleted);

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-10 h-10 rounded-full border-2 p-0 transition-all",
                  isCompleted &&
                    !hasError &&
                    "bg-green-500 border-green-500 text-white",
                  isCurrent &&
                    !isCompleted &&
                    "border-blue-500 bg-blue-50 text-blue-500",
                  hasError && "bg-red-500 border-red-500 text-white",
                  !isCurrent &&
                    !isCompleted &&
                    !hasError &&
                    "border-gray-300 text-gray-400",
                  isClickable && "hover:bg-gray-50 cursor-pointer"
                )}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
              >
                {isCompleted && !hasError ? (
                  <Check className="h-4 w-4" />
                ) : hasError ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </Button>

              {/* Step Label */}
              <div className="mt-2 text-center max-w-[100px]">
                <p
                  className={cn(
                    "text-xs font-medium truncate",
                    isCurrent && "text-blue-600",
                    isCompleted && "text-green-600",
                    hasError && "text-red-600",
                    !isCurrent && !isCompleted && !hasError && "text-gray-500"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-all",
                  isCompleted && "bg-green-500",
                  !isCompleted && "bg-gray-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
