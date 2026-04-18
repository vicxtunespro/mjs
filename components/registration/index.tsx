'use client';

import React, { useState, useEffect } from 'react';
import { useRegistration } from './hooks/useRegistration';
import { FormProgress } from './components/FormProgress';
import { PersonalInfo } from './steps/PersonalInfo';
import { AcademicInfo } from './steps/AcademicInfo';
import { ResidenceInfo } from './steps/ResidenceInfo';
import { GuardianInfo } from './steps/GuardianInfo';
import { SecondaryGuardian } from './steps/SecondaryGuardian';
import { SuccessReport } from './components/SuccessReport';
import { Loader2, ChevronLeft, ChevronRight, Menu, Check } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  { id: 1, label: 'Personal', mobileLabel: '1' },
  { id: 2, label: 'Academic', mobileLabel: '2' },
  { id: 3, label: 'Residence', mobileLabel: '3' },
  { id: 4, label: 'Guardian', mobileLabel: '4' },
  { id: 5, label: 'Review', mobileLabel: '5' },
];

export default function StudentRegistrationPage() {
  const {
    currentStep,
    setCurrentStep,
    studentData,
    photos,
    errors,
    isLoading,
    showSuccess,
    setShowSuccess,
    submittedData,
    isContinuingGuardian1,
    setIsContinuingGuardian1,
    isContinuingGuardian2,
    setIsContinuingGuardian2,
    continuingGuardian1ID,
    setContinuingGuardian1ID,
    continuingGuardian2ID,
    setContinuingGuardian2ID,
    verifyState1,
    verifyState2,
    showGuardian2,
    setShowGuardian2,
    updateStudentData,
    updatePhoto,
    validateStep,
    getContinuingGuardian1Info,
    getContinuingGuardian2Info,
    handleSubmit,
    handleReset,
  } = useRegistration();

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setShowMobileMenu(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setShowMobileMenu(false);
  };

  const handleStepClick = (stepId: number) => {
    // Only allow navigation to completed steps or next available
    if (completedSteps.includes(stepId) || stepId === currentStep || stepId === currentStep + 1) {
      setCurrentStep(stepId);
      setShowMobileMenu(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfo
            data={studentData}
            photos={photos}
            errors={errors}
            onUpdate={updateStudentData}
            onPhotoUpdate={updatePhoto}
          />
        );
      case 2:
        return (
          <AcademicInfo
            data={studentData}
            photos={photos}
            errors={errors}
            onUpdate={updateStudentData}
            onPhotoUpdate={updatePhoto}
          />
        );
      case 3:
        return (
          <ResidenceInfo
            data={studentData}
            photos={photos}
            errors={errors}
            onUpdate={updateStudentData}
            onPhotoUpdate={updatePhoto}
          />
        );
      case 4:
        return (
          <GuardianInfo
            data={studentData}
            photos={photos}
            errors={errors}
            isContinuing={isContinuingGuardian1}
            continuingId={continuingGuardian1ID}
            verifyState={verifyState1}
            onUpdate={updateStudentData}
            onPhotoUpdate={updatePhoto}
            onContinuingToggle={setIsContinuingGuardian1}
            onContinuingIdChange={setContinuingGuardian1ID}
            onVerify={getContinuingGuardian1Info}
          />
        );
      case 5:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-base sm:text-lg font-medium">Review & Submit</h2>
            
            {/* Mobile-friendly review card */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-4">
              <h3 className="font-medium text-sm sm:text-base">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-sm break-words">
                    {studentData.name.first_name} {studentData.name.last_name}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-medium text-sm">{studentData.class.name}</p>
                </div>
                <div className="bg-white p-3 rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500">Primary Guardian</p>
                  <p className="font-medium text-sm break-words">
                    {studentData.guardian1?.full_name || 'Not provided'}
                  </p>
                </div>
              </div>

              {!showGuardian2 && (
                <button
                  type="button"
                  onClick={() => setShowGuardian2(true)}
                  className="w-full sm:w-auto text-sm text-gray-600 hover:text-gray-700 py-2 px-4 border border-blue-200 rounded-lg hover:bg-red-50 transition"
                >
                  + Add Secondary Guardian
                </button>
              )}
            </div>

            {showGuardian2 && (
              <div className="mt-4">
                <SecondaryGuardian
                  data={studentData}
                  photos={photos}
                  errors={errors}
                  isContinuing={isContinuingGuardian2}
                  continuingId={continuingGuardian2ID}
                  verifyState={verifyState2}
                  onUpdate={updateStudentData}
                  onPhotoUpdate={updatePhoto}
                  onContinuingToggle={setIsContinuingGuardian2}
                  onContinuingIdChange={setContinuingGuardian2ID}
                  onVerify={getContinuingGuardian2Info}
                  onRemove={() => {
                    setShowGuardian2(false);
                    setIsContinuingGuardian2(false);
                    setContinuingGuardian2ID('');
                    updateStudentData({
                      guardian2: {
                        full_name: '',
                        contact: '',
                        nin: '',
                        email: '',
                        relationship: '',
                      }
                    });
                  }}
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Mobile step indicator
  const MobileStepIndicator = () => (
    <div className="md:hidden mb-4 text-secondary">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
        </span>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Mobile step progress dots */}
      <div className="flex gap-1">
        {steps.map((step) => (
          <div
            key={step.id}
            className={clsx(
              "flex-1 h-1 rounded-full transition",
              step.id === currentStep && "bg-red-600",
              step.id < currentStep && "bg-green-500",
              step.id > currentStep && "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Mobile step menu dropdown */}
      {showMobileMenu && (
        <div className="absolute mt-2 right-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {steps.map((step) => {
            const isAccessible = completedSteps.includes(step.id) || step.id === currentStep || step.id === currentStep + 1;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <button
                key={step.id}
                onClick={() => isAccessible && handleStepClick(step.id)}
                className={clsx(
                  "w-full px-4 py-3 text-left border-b last:border-b-0 flex items-center justify-between",
                  isAccessible ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed",
                  step.id === currentStep && "bg-red-50"
                )}
                disabled={!isAccessible}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                  )}>
                    {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {step.id === currentStep && (
                  <span className="text-xs text-gray-600">Current</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 text-secondary">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {/* Progress Bar - Hidden on mobile, we use MobileStepIndicator instead */}
          <div className="hidden md:block">
            <FormProgress
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Mobile Step Indicator */}
          <MobileStepIndicator />

          {/* Step Content */}
          <div className="mt-4 sm:mt-8 min-h-[300px] sm:min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={clsx(
                "px-4 py-2.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition order-2 sm:order-1",
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Reset
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={clsx(
                    "flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm",
                    isLoading
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          <p>Fields marked with <span className="text-red-500">*</span> are required</p>
          <p className="mt-1">Registration ID will be auto-generated</p>
        </div>
      </div>

      {/* Success Modal - Make it mobile-friendly */}
      {showSuccess && submittedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SuccessReport
              data={submittedData}
              guardian1Data={studentData.guardian1}
              guardian2Data={studentData.guardian2}
              onClose={() => {
                setShowSuccess(false);
                handleReset();
              }}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}
    </div>
  );
}