'use client'

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  School,
  BookOpen,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Section = 'Pre-Primary' | 'Primary';
type InterviewStatus = 'Pending' | 'Passed' | 'Failed';
type ToastType = 'success' | 'error' | 'info';

const CLASS_BY_SECTION: Record<Section, readonly string[]> = {
  'Pre-Primary': ['Pre A', 'Pre B', 'Pre C'],
  Primary: [
    'Level 1',
    'Level 2',
    'Level 3',
    'Level 4',
    'Level 5',
    'Level 6',
    'Level 7',
  ],
} as const;

const SUBJECTS_BY_SECTION: Record<Section, readonly string[]> = {
  'Pre-Primary': ['Number', 'Social Development', 'Oral', 'Health Habits', 'Writing'],
  Primary: ['Mathematics', 'English', 'Science', 'Social Studies'],
} as const;

const getClassesBySection = (section: Section | '') =>
  section ? CLASS_BY_SECTION[section as Section] : [];

const getSubjectsBySection = (section: Section | '') =>
  section ? SUBJECTS_BY_SECTION[section as Section] : [];

interface CreateInterviewDTO {
  firstName: string;
  lastName: string;
  otherNames?: string;
  previousSchool: string;
  section: Section | '';
  class: string;
  subject: string;
  score?: number;
  status?: InterviewStatus;
  issuedBy: string;
  feedback?: string;
}

type ToastState = {
  type: ToastType;
  title: string;
  message: string;
} | null;

export default function InterviewRegistrationPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [interviewData, setInterviewData] = useState<CreateInterviewDTO>({
    firstName: '',
    lastName: '',
    otherNames: '',
    previousSchool: '',
    section: '',
    class: '',
    subject: '',
    score: undefined,
    status: 'Pending',
    issuedBy: '',
    feedback: '',
  });

  const availableClasses = getClassesBySection(interviewData.section);
  const availableSubjects = getSubjectsBySection(interviewData.section);

  useEffect(() => {
    setInterviewData((prev) => ({
      ...prev,
      class: '',
      subject: '',
    }));
  }, [interviewData.section]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setInterviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setInterviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!interviewData.firstName.trim()) {
      showToast('error', 'Missing first name', 'First name is required.');
      return false;
    }

    if (!interviewData.lastName.trim()) {
      showToast('error', 'Missing last name', 'Last name is required.');
      return false;
    }

    if (!interviewData.previousSchool.trim()) {
      showToast('error', 'Missing previous school', 'Previous school is required.');
      return false;
    }

    if (!interviewData.section) {
      showToast('error', 'Missing education level', 'Education level is required.');
      return false;
    }

    if (!interviewData.class) {
      showToast('error', 'Missing class', 'Class is required.');
      return false;
    }

    if (!interviewData.subject) {
      showToast('error', 'Missing subject', 'Subject is required.');
      return false;
    }

    if (!interviewData.issuedBy.trim()) {
      showToast('error', 'Missing issued by', 'Issued by is required.');
      return false;
    }

    return true;
  };

  const handleInterviewSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload: any = {
        firstName: interviewData.firstName.trim(),
        lastName: interviewData.lastName.trim(),
        previousSchool: interviewData.previousSchool.trim(),
        section: interviewData.section,
        class: interviewData.class,
        subject: interviewData.subject,
        issuedBy: interviewData.issuedBy.trim(),
        status: interviewData.status || 'Pending',
      };

      if (interviewData.otherNames?.trim()) {
        payload.otherNames = interviewData.otherNames.trim();
      }

      if (
        interviewData.score !== undefined &&
        interviewData.score !== null &&
        interviewData.score >= 0
      ) {
        payload.score = Number(interviewData.score);
      }

      if (interviewData.feedback?.trim()) {
        payload.feedback = interviewData.feedback.trim();
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      showToast(
        'success',
        'Interview registered successfully',
        'The interview record has been saved.'
      );

      setTimeout(() => {
        handleReset();
        router.push('/admin/students/admissions');
      }, 1200);
    } catch (error) {
      showToast(
        'error',
        'Failed to register interview',
        error instanceof Error
          ? error.message
          : 'An error occurred while submitting the interview.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInterviewData({
      firstName: '',
      lastName: '',
      otherNames: '',
      previousSchool: '',
      section: '',
      class: '',
      subject: '',
      score: undefined,
      status: 'Pending',
      issuedBy: '',
      feedback: '',
    });
  };

  return (
    <div className="min-h-screen bg-background px-3 py-8 text-foreground sm:px-4">
      {toast && (
        <div className="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-md">
          <div
            className={[
              'flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md',
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-border bg-card text-card-foreground',
            ].join(' ')}
          >
            <div className="pt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-lg p-1 transition hover:bg-black/5"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="border-b border-border p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  First Name <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={interviewData.firstName}
                  onChange={handleTextChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Last Name <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={interviewData.lastName}
                  onChange={handleTextChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Other Names</label>
                <input
                  type="text"
                  name="otherNames"
                  value={interviewData.otherNames}
                  onChange={handleTextChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-border p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <School className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">School Background</h2>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Previous School <span className="text-brand">*</span>
              </label>
              <input
                type="text"
                name="previousSchool"
                value={interviewData.previousSchool}
                onChange={handleTextChange}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Enter previous school name"
              />
            </div>
          </div>

          <div className="border-b border-border p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">Academic Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Education Level <span className="text-brand">*</span>
                </label>
                <select
                  name="section"
                  value={interviewData.section}
                  onChange={handleSelectChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">-- Select Level --</option>
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Primary">Primary</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Class <span className="text-brand">*</span>
                </label>
                <select
                  name="class"
                  value={interviewData.class}
                  onChange={handleSelectChange}
                  disabled={!interviewData.section}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">-- Select Class --</option>
                  {availableClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Subject <span className="text-brand">*</span>
                </label>
                <select
                  name="subject"
                  value={interviewData.subject}
                  onChange={handleSelectChange}
                  disabled={!interviewData.section}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">-- Select Subject --</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">Interview Details</h2>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Score (Optional)</label>
                <input
                  type="number"
                  disabled
                  name="score"
                  min="0"
                  max="100"
                  value={interviewData.score ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInterviewData((prev) => ({
                      ...prev,
                      score: value === '' ? undefined : Number(value),
                    }));
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  name="status"
                  disabled
                  value={interviewData.status}
                  onChange={handleSelectChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Issued By <span className="text-brand">*</span>
                </label>
                <select
                  name="issuedBy"
                  value={interviewData.issuedBy}
                  onChange={handleSelectChange}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="">-- Select Issuer --</option>
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Deputy Head Teacher">Deputy Head Teacher</option>
                  <option value="Admissions Officer">Admissions Officer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Feedback (Optional)</label>
              <textarea
                name="feedback"
                value={interviewData.feedback}
                onChange={handleTextChange}
                rows={3}
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Enter any feedback or notes about the interview..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-5 md:px-8">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-border bg-card px-6 py-2.5 font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
              disabled={isLoading}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handleInterviewSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 font-medium text-brand-foreground transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Register Interview
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            All fields marked with <span className="text-brand">*</span> are required
          </p>
        </div>
      </div>
    </div>
  );
}