"use client";

import { useEffect, useState } from "react";

import {
  AdmissionFormData,
  AdmissionGuardian,
} from "./admission.types";

import StudentBioStep from "./steps/StudentBioStep";
import AcademicStep from "./steps/AcademicStep";
import GuardianStep from "./steps/GuardianStep";
import ResidenceTransportStep from "./steps/ResidenceTransportStep";
import ReviewStep from "./steps/ReviewStep";
import StepIndicator from "./components/StepIndicator";

const DRAFT_KEY = "student-admission-draft";

function createDefaultGuardian(
  relationship: AdmissionGuardian["relationship"],
  isPrimary = false
): AdmissionGuardian {
  return {
    id: crypto.randomUUID(),
    photo: {
      file: null,
      previewUrl: "",
    },
    relationship,
    identity: {
      full_name: "",
      gender:
        relationship === "Father"
          ? "Male"
          : relationship === "Mother"
            ? "Female"
            : "",
      occupation: "",
      national_id: "",
    },
    contact: {
      phone: "",
      alternative_phone: "",
      email: "",
    },
    address: {
      country: "Uganda",
      district: "",
      village: "",
      address_line: "",
    },
    permissions: {
      is_primary: isPrimary,
      can_pickup: true,
      receives_sms: true,
    },
    portal_account: {
      has_login: true,
    },
  };
}

const defaultData: AdmissionFormData = {
  student: {
    photo: {
      file: null,
      previewUrl: "",
    },
    bio_data: {
      first_name: "",
      last_name: "",
      other_names: "",
      gender: "",
      date_of_birth: "",
      nationality: "Ugandan",
      religion: "",
    },
    academic: {
      admission_date: new Date().toISOString().split("T")[0],
      academic_year: new Date().getFullYear().toString(),
      section: "",
      class_name: "",
      stream: "",
      school_section: "Day",
      admission_type: "New",
      student_category: "Normal",
      status: "Active",
    },
    residence: {
      country: "Uganda",
      district: "",
      sub_county: "",
      parish: "",
      village: "",
      address_line: "",
    },
    transport: {
      uses_transport: false,
    },
  },
  guardians: [
    createDefaultGuardian("Father", true),
    createDefaultGuardian("Mother", false),
  ],
};

const steps = ["Student", "Academic", "Guardian", "Residence", "Review"];

export default function StudentAdmissionForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<AdmissionFormData>(defaultData);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);

    if (!saved) {
      setDraftLoaded(true);
      return;
    }

    const shouldRestore = window.confirm(
      "A saved student admission draft was found. Do you want to continue it?"
    );

    if (!shouldRestore) {
      localStorage.removeItem(DRAFT_KEY);
      setDraftLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as AdmissionFormData;
      setFormData(parsed);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;

    const dataToSave = {
      ...formData,
      student: {
        ...formData.student,
        photo: {
          file: null,
          previewUrl: formData.student.photo.previewUrl,
        },
      },
      guardians: formData.guardians.map((guardian) => ({
        ...guardian,
        photo: {
          file: null,
          previewUrl: guardian.photo.previewUrl,
        },
      })),
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
  }, [formData, draftLoaded]);

  const updateForm = (data: Partial<AdmissionFormData>) => {
    setStepError("");
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const validateCurrentStep = () => {
    const student = formData.student;

    if (step === 0) {
      if (!student.bio_data.first_name.trim()) {
        return "Student first name is required.";
      }

      if (!student.bio_data.last_name.trim()) {
        return "Student last name is required.";
      }

      if (!student.bio_data.gender) {
        return "Student gender is required.";
      }
    }

    if (step === 1) {
      if (!student.academic.admission_date) {
        return "Admission date is required.";
      }

      if (!student.academic.academic_year.trim()) {
        return "Academic year is required.";
      }

      if (!student.academic.section) {
        return "Academic section is required.";
      }

      if (!student.academic.class_name) {
        return "Class is required.";
      }
    }

    if (step === 2) {
      if (formData.guardians.length === 0) {
        return "At least one guardian is required.";
      }

      const hasPrimary = formData.guardians.some(
        (guardian) => guardian.permissions.is_primary
      );

      if (!hasPrimary) {
        return "Please mark one guardian as the primary contact.";
      }

      for (const guardian of formData.guardians) {
        if (!guardian.relationship) {
          return "Guardian relationship is required.";
        }

        if (!guardian.identity.full_name.trim()) {
          return `${guardian.relationship} full name is required.`;
        }

        if (!guardian.contact.phone.trim()) {
          return `${guardian.relationship} phone number is required.`;
        }

        if (!guardian.identity.gender) {
          return `${guardian.relationship} gender is required.`;
        }
      }
    }

    if (step === 3) {
      if (!student.residence.district.trim()) {
        return "Student district is required.";
      }
    }

    return "";
  };

  const nextStep = () => {
    const error = validateCurrentStep();

    if (error) {
      setStepError(error);
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    handleSubmitAdmission();
  };

  const previousStep = () => {
    setStepError("");
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(defaultData);
    setStep(0);
    setStepError("");
  };

  const handleSubmitAdmission = async () => {
    try {
      setSubmitting(true);

      const admissionPayload = {
        student: {
          bio_data: formData.student.bio_data,
          academic: formData.student.academic,
          residence: formData.student.residence,
          transport: formData.student.transport,
          portal_account: {
            username: "AUTO",
            default_password_changed: false,
          },
          photo_file: formData.student.photo.file,
        },
        guardians: formData.guardians.map((guardian) => ({
          relationship: guardian.relationship,
          identity: guardian.identity,
          contact: guardian.contact,
          address: guardian.address,
          permissions: guardian.permissions,
          portal_account: guardian.portal_account,
          photo_file: guardian.photo.file,
        })),
      };

      console.log("FINAL ADMISSION PAYLOAD", admissionPayload);

      alert("Admission payload prepared successfully.");
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.log(error);
      setStepError("Something went wrong while preparing admission data.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!draftLoaded) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Loading admission form...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Student Admission
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Register learner and parent information.
          </p>
        </div>

        <button
          type="button"
          onClick={clearDraft}
          className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear Draft
        </button>
      </div>

      <StepIndicator steps={steps} currentStep={step} />

      {stepError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {stepError}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 0 && <StudentBioStep data={formData} update={updateForm} />}

        {step === 1 && <AcademicStep data={formData} update={updateForm} />}

        {step === 2 && <GuardianStep data={formData} update={updateForm} />}

        {step === 3 && (
          <ResidenceTransportStep data={formData} update={updateForm} />
        )}

        {step === 4 && <ReviewStep data={formData} />}

        <div className="mt-8 flex justify-between border-t border-gray-200 pt-5">
          <button
            type="button"
            disabled={step === 0 || submitting}
            onClick={previousStep}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={nextStep}
            className="rounded-lg bg-red-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : step === steps.length - 1
                ? "Complete Admission"
                : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}