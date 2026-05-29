export type StudentGender = "Male" | "Female";

export type AcademicSection =
  | "Daycare"
  | "Nursery"
  | "Lower Primary"
  | "Upper Primary";

export type SchoolSection = "Day" | "Boarding";

export type AdmissionType = "New" | "Transfer" | "Returning";

export type StudentCategory =
  | "Normal"
  | "Scholarship"
  | "Sponsored"
  | "Staff Child";

export type GuardianRelationship =
  | "Father"
  | "Mother"
  | "Guardian"
  | "Other";

export type PhotoState = {
  file: File | null;
  previewUrl: string;
};

export type AdmissionGuardian = {
  id: string;

  photo: PhotoState;

  relationship: GuardianRelationship;

  identity: {
    full_name: string;
    gender: StudentGender | "";
    occupation: string;
    national_id: string;
  };

  contact: {
    phone: string;
    alternative_phone: string;
    email: string;
  };

  address: {
    country: string;
    district: string;
    village: string;
    address_line: string;
  };

  permissions: {
    is_primary: boolean;
    can_pickup: boolean;
    receives_sms: boolean;
  };

  portal_account: {
    has_login: boolean;
  };
};

export type AdmissionFormData = {
  student: {
    photo: PhotoState;

    bio_data: {
      first_name: string;
      last_name: string;
      other_names: string;
      gender: StudentGender | "";
      date_of_birth: string;
      nationality: string;
      religion: string;
    };

    academic: {
      admission_date: string;
      academic_year: string;
      section: AcademicSection | "";
      class_name: string;
      stream: string;
      school_section: SchoolSection;
      admission_type: AdmissionType;
      student_category: StudentCategory;
      status: "Active";
    };

    residence: {
      country: string;
      district: string;
      sub_county: string;
      parish: string;
      village: string;
      address_line: string;
    };

    transport: {
      uses_transport: boolean;
    };
  };

  guardians: AdmissionGuardian[];
};