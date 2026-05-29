"use client";

import { Check } from "lucide-react";

type StepIndicatorProps = {
  steps: string[];
  currentStep: number;
};

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Desktop */}
      <div className="hidden items-center md:flex">
        {steps.map((item, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={item}
              className="flex flex-1 items-center"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-sm
                    font-semibold

                    ${
                      isCompleted
                        ? "border-red-900 bg-red-900 text-white"
                        : isActive
                          ? "border-red-900 bg-white text-red-900"
                          : "border-gray-300 bg-white text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                <span
                  className={`
                  text-sm
                  font-medium

                  ${
                    isActive
                      ? "text-red-900"
                      : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                  }
                  `}
                >
                  {item}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`
                  mx-4
                  h-px
                  flex-1

                  ${
                    isCompleted
                      ? "bg-red-900"
                      : "bg-gray-200"
                  }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>


      {/* Mobile */}
      <div className="md:hidden">

        <div className="mb-2 flex justify-between text-sm">

          <span className="font-medium text-red-900">

            Step {currentStep + 1} of {steps.length}

          </span>


          <span className="text-gray-500">

            {steps[currentStep]}

          </span>

        </div>



        <div className="h-2 rounded-full bg-gray-200">

          <div
            className="
            h-2
            rounded-full
            bg-red-900
            transition-all
            "

            style={{
              width:
                `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />

        </div>


      </div>
    </div>
  );
}