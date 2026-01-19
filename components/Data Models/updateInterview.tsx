'use client'
import React, { useState, useEffect} from 'react';
import { AlertCircle, CheckCircle2, Loader2, UserPlus, School, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Type definitions
type Section = 'Pre-Primary' | 'Primary';
type InterviewStatus = 'Pending' | 'Passed' | 'Failed';

const CLASS_BY_SECTION: Record<Section, readonly string[]> = {
  'Pre-Primary': ['Pre A', 'Pre B', 'Pre C'],
  'Primary': [
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
  'Primary': ['Mathematics', 'English', 'Science', 'Social Studies'],
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

export default function InterviewRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  // Reset class and subject when section changes
  useEffect(() => {
    setInterviewData(prev => ({
      ...prev,
      class: '',
      subject: ''
    }));
  }, [interviewData.section]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInterviewData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInterviewData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const validateForm = (): boolean => {
    if (!interviewData.firstName.trim()) {
      setErrorMessage('First name is required');
      return false;
    }
    if (!interviewData.lastName.trim()) {
      setErrorMessage('Last name is required');
      return false;
    }
    if (!interviewData.previousSchool.trim()) {
      setErrorMessage('Previous school is required');
      return false;
    }
    if (!interviewData.section) {
      setErrorMessage('Education level is required');
      return false;
    }
    if (!interviewData.class) {
      setErrorMessage('Class is required');
      return false;
    }
    if (!interviewData.subject) {
      setErrorMessage('Subject is required');
      return false;
    }
    if (!interviewData.issuedBy.trim()) {
      setErrorMessage('Issued by is required');
      return false;
    }
    return true;
  };

  const handleInterviewSubmit = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsLoading(true);
    setSubmitStatus('idle');

    try {
      // Prepare payload - remove empty optional fields
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

      // Only add optional fields if they have values
      if (interviewData.otherNames?.trim()) {
        payload.otherNames = interviewData.otherNames.trim();
      }
      if (interviewData.score !== undefined && interviewData.score !== null && interviewData.score >= 0) {
        payload.score = Number(interviewData.score);
      }
      if (interviewData.feedback?.trim()) {
        payload.feedback = interviewData.feedback.trim();
      }

      console.log('📤 Sending payload:', payload);

      const response = await fetch("https://mjs-backend-server.onrender.com/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      console.log("✅ Interview successfully saved:", responseData);
      
      setSubmitStatus('success');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        handleReset();
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error("❌ Error submitting interview:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while submitting');
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
      router.push('/admin/students/admissions');
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
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary">
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success/Error Alerts */}
        {submitStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Interview registered successfully!</p>
              <p className="text-green-700 text-sm">Form will reset automatically.</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 bg-cta-low border border-cta-low rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-cta flex-shrink-0" />
            <div>
              <p className="text-cta font-medium">Failed to register interview</p>
              <p className="text-cta text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-primary dark:bg-secondary rounded-xl shadow-lg border border-primary">
          {/* Personal Information Section */}
          <div className="p-8 border-b border-primary">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  First Name <span className="text-cta">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={interviewData.firstName}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Last Name <span className="text-cta">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={interviewData.lastName}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Other Names
                </label>
                <input
                  type="text"
                  name="otherNames"
                  value={interviewData.otherNames}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* School Information Section */}
          <div className="p-8 border-b border-primary">
            <div className="flex items-center gap-2 mb-6">
              <School className="w-5 h-5 text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">School Background</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                Previous School <span className="text-cta">*</span>
              </label>
              <input
                type="text"
                name="previousSchool"
                value={interviewData.previousSchool}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition"
                placeholder="Enter previous school name"
              />
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="p-8 border-b border-primary">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Academic Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Education Level <span className="text-cta">*</span>
                </label>
                <select
                  name="section"
                  value={interviewData.section}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary"
                >
                  <option value="">-- Select Level --</option>
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Primary">Primary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Class <span className="text-cta">*</span>
                </label>
                <select
                  name="class"
                  value={interviewData.class}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary disabled:bg-primary dark:bg-secondary disabled:text-primary"
                  disabled={!interviewData.section}
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
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Subject <span className="text-cta">*</span>
                </label>
                <select
                  name="subject"
                  value={interviewData.subject}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary disabled:bg-primary dark:bg-secondary disabled:text-primary"
                  disabled={!interviewData.section}
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

          {/* Interview Details Section */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-cta" />
              <h2 className="text-lg font-semibold text-secondary dark:text-primary">Interview Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Score (Optional)
                </label>
                <input
                  type="number"
                  name="score"
                  min="0"
                  max="100"
                  value={interviewData.score ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInterviewData(prev => ({
                      ...prev,
                      score: value === '' ? undefined : Number(value)
                    }));
                  }}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={interviewData.status}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Issued By <span className="text-cta">*</span>
                </label>
                <input
                  type="text"
                  name="issuedBy"
                  value={interviewData.issuedBy}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition"
                  placeholder="Head Teacher"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                Feedback (Optional)
              </label>
              <textarea
                name="feedback"
                value={interviewData.feedback}
                onChange={handleTextChange}
                rows={3}
                className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition resize-none"
                placeholder="Enter any feedback or notes about the interview..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 bg-primary dark:bg-secondary rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 border border-primary-plus text-secondary  dark:text-primary rounded-lg hover:bg-primary dark:bg-secondary transition font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleInterviewSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-cta text-primary dark:text-secondary rounded-lg hover:bg-cta transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Register Interview
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-primary">
          <p>All fields marked with <span className="text-cta">*</span> are required</p>
        </div>
      </div>
    </div>
  );
}