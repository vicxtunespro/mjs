"use client";

import { AdmissionFormData } from "../admission.types";
import PhotoUpload from "../components/PhotoUpload";

type Props = {
  data: AdmissionFormData;
  update: (data: Partial<AdmissionFormData>) => void;
};

const inputStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

const selectStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

export default function StudentBioStep({ data, update }: Props) {
  const student = data.student;
  const bio = student.bio_data;

  const updateBio = (field: keyof typeof bio, value: string) => {
    update({
      student: {
        ...student,
        bio_data: {
          ...bio,
          [field]: value,
        },
      },
    });
  };

  const updateStudentPhoto = (file: File | null, previewUrl: string) => {
    update({
      student: {
        ...student,
        photo: {
          file,
          previewUrl,
        },
      },
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Student Bio Data
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Enter the learner’s personal information and photo.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First Name" required>
            <Input
              value={bio.first_name}
              onChange={(value) => updateBio("first_name", value)}
              placeholder="Brian"
            />
          </Field>

          <Field label="Last Name" required>
            <Input
              value={bio.last_name}
              onChange={(value) => updateBio("last_name", value)}
              placeholder="Kato"
            />
          </Field>

          <Field label="Other Names">
            <Input
              value={bio.other_names}
              onChange={(value) => updateBio("other_names", value)}
              placeholder="Optional"
            />
          </Field>

          <Field label="Gender" required>
            <select
              value={bio.gender}
              onChange={(e) => updateBio("gender", e.target.value)}
              className={selectStyle}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>

          <Field label="Date of Birth">
            <Input
              type="date"
              value={bio.date_of_birth}
              onChange={(value) => updateBio("date_of_birth", value)}
            />
          </Field>

          <Field label="Nationality">
            <Input
              value={bio.nationality}
              onChange={(value) => updateBio("nationality", value)}
              placeholder="Ugandan"
            />
          </Field>

          <Field label="Religion">
            <Input
              value={bio.religion}
              onChange={(value) => updateBio("religion", value)}
              placeholder="Christian / Muslim / Other"
            />
          </Field>
        </div>

        <PhotoUpload
          label="Student Photo"
          previewUrl={student.photo.previewUrl}
          onFileChange={updateStudentPhoto}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-700">*</span>}
      </label>

      <div className="mt-1">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputStyle}
    />
  );
}