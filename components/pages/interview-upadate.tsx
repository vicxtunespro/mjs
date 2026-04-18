'use client'
import React, { useState, useEffect, use } from 'react';
import { AlertCircle, CheckCircle2, Loader2, UserPlus, School, BookOpen, Lock, Unlock, Info } from 'lucide-react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';


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

interface Interview {
  id: string;
  firstName: string;
  lastName: string;
  otherNames?: string;
  previousSchool: string;
  section: Section;
  class: string;
  subject: string;
  score?: number;
  status: InterviewStatus;
  issuedBy: string;
  feedback?: string;
  createdAt: string;
}

interface UpdateInterviewDTO {
  firstName?: string;
  lastName?: string;
  otherNames?: string;
  previousSchool?: string;
  section?: Section;
  class?: string;
  subject?: string;
  score?: number;
  status?: InterviewStatus;
  issuedBy?: string;
  feedback?: string;
}

export default function InterviewUpdatePage() {
  const params = useParams();
  const router = useRouter();
  
  const interviewId = params.id; // Replace with actual ID from route
  console.log('Interview ID', interviewId);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingEnabled, setEditingEnabled] = useState(false);

  const [originalData, setOriginalData] = useState<Interview | null>(null);
  const [interviewData, setInterviewData] = useState<Interview>({
    id: '',
    firstName: '',
    lastName: '',
    otherNames: '',
    previousSchool: '',
    section: '' as Section,
    class: '',
    subject: '',
    score: undefined,
    status: 'Pending',
    issuedBy: '',
    feedback: '',
    createdAt: '',
  });

  const availableClasses = getClassesBySection(interviewData.section);
  const availableSubjects = getSubjectsBySection(interviewData.section);

  // Fetch interview data on mount
  useEffect(() => {
    fetchInterviewData();
  }, [interviewId]);

  // Reset class and subject when section changes
  useEffect(() => {
    if (editingEnabled && originalData && interviewData.section !== originalData.section) {
      setInterviewData(prev => ({
        ...prev,
        class: '',
        subject: ''
      }));
    }
  }, [interviewData.section, editingEnabled, originalData]);

  // Auto-calculate status based on score
  useEffect(() => {
    if (interviewData.score !== undefined && interviewData.score !== null) {
      const newStatus: InterviewStatus = interviewData.score >= 50 ? 'Passed' : 'Failed';
      if (interviewData.status !== newStatus) {
        setInterviewData(prev => ({
          ...prev,
          status: newStatus
        }));
      }
    }
  }, [interviewData.score]);

  const fetchInterviewData = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, using mock data
      // Replace with actual API call:
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}`);
      const interviewRecord = await response.json();
      console.log(interviewRecord.data);
      
      // Mock data for demonstration
      const mockData: Interview = interviewRecord.data;

      setOriginalData(mockData);
      setInterviewData(mockData);
    } catch (error) {
      console.error('❌ Error fetching interview:', error);
      setErrorMessage('Failed to load interview data');
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingEnabled) return;
    const { name, value } = e.target;
    setInterviewData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editingEnabled) return;
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

  const getChangedFields = (): UpdateInterviewDTO => {
    if (!originalData) return {};

    const changes: UpdateInterviewDTO = {};

    if (interviewData.firstName !== originalData.firstName) {
      changes.firstName = interviewData.firstName.trim();
    }
    if (interviewData.lastName !== originalData.lastName) {
      changes.lastName = interviewData.lastName.trim();
    }
    if (interviewData.otherNames !== originalData.otherNames) {
      changes.otherNames = interviewData.otherNames?.trim() || '';
    }
    if (interviewData.previousSchool !== originalData.previousSchool) {
      changes.previousSchool = interviewData.previousSchool.trim();
    }
    if (interviewData.section !== originalData.section) {
      changes.section = interviewData.section;
    }
    if (interviewData.class !== originalData.class) {
      changes.class = interviewData.class;
    }
    if (interviewData.subject !== originalData.subject) {
      changes.subject = interviewData.subject;
    }
    if (interviewData.score !== originalData.score) {
      changes.score = Number(interviewData.score);
    }
    if (interviewData.status !== originalData.status) {
      changes.status = interviewData.status;
    }
    if (interviewData.issuedBy !== originalData.issuedBy) {
      changes.issuedBy = interviewData.issuedBy.trim();
    }
    if (interviewData.feedback !== originalData.feedback) {
      changes.feedback = interviewData.feedback?.trim() || '';
    }

    return changes;
  };

  const handleInterviewUpdate = async () => {
    setErrorMessage('');
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    const changes = getChangedFields();
    
    if (Object.keys(changes).length === 0) {
      setErrorMessage('No changes detected');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('📤 Sending update payload:', changes);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      console.log("✅ Interview successfully updated:", responseData);
      
      setSubmitStatus('success');
      setOriginalData(interviewData); // Update original data to reflect changes
      setEditingEnabled(false); // Disable editing after successful update
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/students/admissions');
      }, 2000);

    } catch (error) {
      console.error("❌ Error updating interview:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while updating');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setInterviewData(originalData);
    }
    setEditingEnabled(false);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cta mx-auto mb-4" />
          <p className="text-secondary  dark:text-primary font-medium">Loading interview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Security Alert */}
        <div className="mb-6 bg-red-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-900 font-medium mb-1">Data Protection Enabled</p>
              <p className="text-gray-800 text-sm">
                To prevent accidental changes, editing is disabled by default. Please enable editing below to modify interview data. This security measure ensures data integrity and prevents unauthorized modifications.
              </p>
            </div>
          </div>
        </div>

        {/* Enable Editing Toggle */}
        <div className="mb-6 bg-primary dark:bg-secondary rounded-lg shadow-md border border-primary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {editingEnabled ? (
                <Unlock className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-secondary-minus" />
              )}
              <div>
                <p className="font-medium text-secondary dark:text-primary">
                  {editingEnabled ? 'Editing Enabled' : 'Editing Disabled'}
                </p>
                <p className="text-sm text-secondary dark:text-primary">
                  {editingEnabled 
                    ? 'You can now modify the interview data' 
                    : 'Enable editing to make changes to this interview'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingEnabled(!editingEnabled);
                if (editingEnabled && originalData) {
                  setInterviewData(originalData); // Reset to original on disable
                }
                setSubmitStatus('idle');
                setErrorMessage('');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                editingEnabled
                  ? 'bg-primary dark:bg-secondary text-secondary  dark:text-primary hover:bg-primary-hover'
                  : 'bg-cta text-primary dark:text-secondary hover:bg-cta'
              }`}
            >
              {editingEnabled ? 'Disable Editing' : 'Enable Editing'}
            </button>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {submitStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Interview updated successfully!</p>
              <p className="text-green-700 text-sm">Redirecting to admissions page...</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 bg-cta-low border border-cta-low rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-cta flex-shrink-0" />
            <div>
              <p className="text-cta font-medium">Failed to update interview</p>
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
                  disabled={!editingEnabled}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                  disabled={!editingEnabled}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                  value={interviewData.otherNames || ''}
                  onChange={handleTextChange}
                  disabled={!editingEnabled}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                disabled={!editingEnabled}
                className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                  disabled={!editingEnabled}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                  disabled={!editingEnabled || !interviewData.section}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                  disabled={!editingEnabled || !interviewData.section}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition bg-primary dark:bg-secondary disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                  Score (0-100) <span className="text-cta">*</span>
                </label>
                <input
                  type="number"
                  name="score"
                  min="0"
                  max="100"
                  value={interviewData.score ?? ''}
                  onChange={(e) => {
                    if (!editingEnabled) return;
                    const value = e.target.value;
                    setInterviewData(prev => ({
                      ...prev,
                      score: value === '' ? undefined : Number(value)
                    }));
                  }}
                  disabled={!editingEnabled}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
                  placeholder="Enter score"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary  dark:text-primary mb-1">
                  Status (Auto-calculated)
                </label>
                <div className={`w-full px-3 py-2 border rounded-lg font-medium ${
                  interviewData.status === 'Passed' 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : interviewData.status === 'Failed'
                    ? 'bg-cta-low border-cta-midtone text-cta'
                    : 'bg-primary dark:bg-secondary border-primary-plus text-secondary dark:text-primary'
                }`}>
                  {interviewData.status}
                  {interviewData.score !== undefined && (
                    <span className="text-xs ml-2">
                      ({interviewData.score >= 50 ? '≥50' : '<50'})
                    </span>
                  )}
                </div>
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
                  disabled={!editingEnabled}
                  className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
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
                value={interviewData.feedback || ''}
                onChange={handleTextChange}
                disabled={!editingEnabled}
                rows={3}
                className="w-full px-3 py-2 border border-primary-plus rounded-lg focus:ring-2 focus:ring-cta focus:border-transparent transition resize-none disabled:bg-primary dark:bg-secondary disabled:text-secondary dark:text-primary"
                placeholder="Enter any feedback or notes about the interview..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 bg-primary dark:bg-secondary rounded-b-xl flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-primary-plus text-secondary  dark:text-primary rounded-lg hover:bg-primary dark:bg-secondary transition font-medium disabled:opacity-50"
              disabled={isSubmitting || !editingEnabled}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInterviewUpdate}
              disabled={isSubmitting || !editingEnabled}
              className="px-6 py-2.5 bg-cta text-primary dark:text-secondary rounded-lg hover:bg-cta transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Update Interview
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-primary">
          <p>All fields marked with <span className="text-cta">*</span> are required</p>
          <p className="mt-1">Status is automatically calculated: Passed (≥50) or Failed (&lt;50)</p>
        </div>
      </div>
    </div>
  );
}