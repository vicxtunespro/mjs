import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface Step {
  id: number;
  label: string;
}

interface FormProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  completedSteps
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div className={clsx(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && !isCompleted && "bg-red-500 text-white",
                  !isCurrent && !isCompleted && "bg-gray-200 text-gray-600"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className={clsx(
                  "ml-2 text-sm font-medium",
                  isCurrent ? "text-gray-600" : "text-gray-500"
                )}>
                  {step.label}
                </div>
              </div>
              {step.id < steps.length && (
                <div className={clsx(
                  "h-0.5 mt-4 ml-4",
                  completedSteps.includes(step.id) ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};