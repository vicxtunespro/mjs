"use client";

import { AdmissionFormData } from "../admission.types";

type Props = {
  data: AdmissionFormData;
  update: (data: Partial<AdmissionFormData>) => void;
};

const classes: Record<string, string[]> = {
  Daycare: ["Day Care"],
  Nursery: ["Baby", "Middle", "Top"],
  "Lower Primary": ["P1", "P2", "P3"],
  "Upper Primary": ["P4", "P5", "P6", "P7"],
};

const selectStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

const inputStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

export default function AcademicStep({ data, update }: Props) {
  const academic = data.student.academic;

  const updateAcademic = (
    updates: Partial<typeof academic>
  ) => {
    update({
      student: {
        ...data.student,
        academic: {
          ...academic,
          ...updates,
        },
      },
    });
  };

  const selectedClasses = academic.section
    ? classes[academic.section] || []
    : [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Academic Information
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Assign learner class, stream and school category.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Admission Date">
          <Input
            type="date"
            value={academic.admission_date}
            onChange={(value) =>
              updateAcademic({ admission_date: value })
            }
          />
        </Field>

        <Field label="Academic Year">
          <Input
            value={academic.academic_year}
            onChange={(value) =>
              updateAcademic({ academic_year: value })
            }
          />
        </Field>

        <Field label="Section">
          <select
            value={academic.section}
            onChange={(e) =>
              updateAcademic({
                section: e.target.value as typeof academic.section,
                class_name: "",
              })
            }
            className={selectStyle}
          >
            <option value="">Select Section</option>

            {Object.keys(classes).map((sectionItem) => (
              <option key={sectionItem} value={sectionItem}>
                {sectionItem}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Class">
          <select
            value={academic.class_name}
            onChange={(e) =>
              updateAcademic({ class_name: e.target.value })
            }
            disabled={!academic.section}
            className={`${selectStyle} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
          >
            <option value="">
              {academic.section ? "Select Class" : "Select section first"}
            </option>

            {selectedClasses.map((classItem) => (
              <option key={classItem} value={classItem}>
                {classItem}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Stream">
          <Input
            placeholder="Blue"
            value={academic.stream}
            onChange={(value) =>
              updateAcademic({ stream: value })
            }
          />
        </Field>

        <Field label="Day / Boarding">
          <select
            value={academic.school_section}
            onChange={(e) =>
              updateAcademic({
                school_section: e.target.value as typeof academic.school_section,
              })
            }
            className={selectStyle}
          >
            <option value="Day">Day</option>
            <option value="Boarding">Boarding</option>
          </select>
        </Field>

        <Field label="Admission Type">
          <select
            value={academic.admission_type}
            onChange={(e) =>
              updateAcademic({
                admission_type: e.target.value as typeof academic.admission_type,
              })
            }
            className={selectStyle}
          >
            <option value="New">New Student</option>
            <option value="Transfer">Transfer</option>
            <option value="Returning">Returning</option>
          </select>
        </Field>

        <Field label="Student Category">
          <select
            value={academic.student_category}
            onChange={(e) =>
              updateAcademic({
                student_category: e.target.value as typeof academic.student_category,
              })
            }
            className={selectStyle}
          >
            <option value="Normal">Normal</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Sponsored">Sponsored</option>
            <option value="Staff Child">Staff Child</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="mt-1">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
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