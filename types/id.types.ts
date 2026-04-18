// types/student.ts
export interface StudentName {
  first_name: string;
  last_name: string;
  other_names: string;
}

export interface StudentClass {
  name: string;
  stream: string;
}

export interface StudentResidence {
  region: string;
  district: string;
  village: string;
}

export interface Guardian {
  guardian_id: string;
  relationship: string;
}

export interface QRCode {
  token: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  issued_date: string;
  is_active: boolean;
  last_used: string | null;
  scan_url: string;
  permanent_url: string;
  qr_version: string;
  _id: string;
}

export interface Student {
  _id: string;
  registration_id: string;
  LIN: string;
  name: StudentName;
  gender: string;
  date_of_birth: string;
  class: StudentClass;
  residence: StudentResidence;
  guardian1: Guardian;
  guardian2: Guardian;
  religion: string;
  academic_section: string;
  school_section: string;
  house: string;
  club: string;
  photo: string;
  data_status: string;
  missing_fields: string[];
  qr_code: QRCode;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse {
  success: boolean;
  count: number;
  data: Student[];
}

export interface IDCardDocumentProps {
  students: Student[];
}

export interface IDCardProps {
  student: Student;
}