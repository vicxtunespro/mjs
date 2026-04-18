// types.ts
export type Gender = 'Male' | 'Female' | 'Other';
export type Section = 'Day Care' | 'Pre-Primary' | 'Primary';
export type Relationship = 'Mother' | 'Father' | 'Guardian' | 'Sibling' | 'Relative' | 'Other';
export type VerifyState = 'idle' | 'loading' | 'success' | 'error';
export type Region = 'Central' | 'Eastern' | 'Western' | 'Northern' | '';

export interface GuardianData {
  full_name: string;
  contact: string;
  nin: string;
  email?: string;
  relationship: Relationship | '';
  guardian_id?: string;
  photo?: string;
}

export interface StudentData {
  registration_id?: string;
  LIN?: string;
  payment_code?: string;
  name: {
    first_name: string;
    last_name: string;
    other_names?: string;
  };
  class: {
    name: string;
    stream?: string;
  };
  gender: Gender | '';
  date_of_birth: string;
  religion?: string;
  section: Section | '';
  house?: string;
  club?: string;
  residence: {
    region?: string;
    district?: string;
    village?: string;
  };
  guardian1?: GuardianData;
  guardian2?: GuardianData;
  photo?: string;
}

export interface PhotoItem {
  file: File | null;
  preview: string;
  existingUrl?: string; // Add this for continuing guardians
}

export interface PhotoState {
  student: PhotoItem;
  guardian1: PhotoItem;
  guardian2: PhotoItem;
  continuingGuardian1: PhotoItem;
  continuingGuardian2: PhotoItem;
}

export interface StepProps {
  data: StudentData;
  photos: PhotoState;
  errors: Record<string, string>;
  onUpdate: (data: Partial<StudentData>) => void;
  onPhotoUpdate: (type: string, file: File | null, preview: string, existingUrl?: string) => void;
  onFieldError?: (field: string, error: string) => void;
}

export interface GuardianStepProps extends StepProps {
  isContinuing: boolean;
  continuingId: string;
  verifyState: VerifyState;
  onContinuingToggle: (value: boolean) => void;
  onContinuingIdChange: (id: string) => void;
  onVerify: () => void;
}