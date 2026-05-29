"use client";

import { AdmissionFormData } from "../admission.types";

type Props = {
  data: AdmissionFormData;
};

export default function ReviewStep({ data }: Props) {
  const { student, guardians } = data;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Review Admission Details
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Confirm the learner and guardian information before submission.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <ReviewCard title="Student Bio Data">
          {student.photo.previewUrl && (
            <div className="mb-4">
              <img
                src={student.photo.previewUrl}
                alt="Student"
                className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
              />
            </div>
          )}

          <ReviewItem
            label="Name"
            value={`${student.bio_data.first_name} ${student.bio_data.last_name} ${student.bio_data.other_names}`.trim()}
          />
          <ReviewItem label="Gender" value={student.bio_data.gender} />
          <ReviewItem
            label="Date of Birth"
            value={student.bio_data.date_of_birth}
          />
          <ReviewItem
            label="Nationality"
            value={student.bio_data.nationality}
          />
          <ReviewItem label="Religion" value={student.bio_data.religion} />
        </ReviewCard>

        <ReviewCard title="Academic Placement">
          <ReviewItem
            label="Academic Year"
            value={student.academic.academic_year}
          />
          <ReviewItem label="Section" value={student.academic.section} />
          <ReviewItem label="Class" value={student.academic.class_name} />
          <ReviewItem label="Stream" value={student.academic.stream} />
          <ReviewItem
            label="School Section"
            value={student.academic.school_section}
          />
          <ReviewItem
            label="Admission Type"
            value={student.academic.admission_type}
          />
          <ReviewItem
            label="Category"
            value={student.academic.student_category}
          />
        </ReviewCard>

        <ReviewCard title="Residence & Transport">
          <ReviewItem label="Country" value={student.residence.country} />
          <ReviewItem label="District" value={student.residence.district} />
          <ReviewItem label="Sub County" value={student.residence.sub_county} />
          <ReviewItem label="Parish" value={student.residence.parish} />
          <ReviewItem label="Village" value={student.residence.village} />
          <ReviewItem label="Address" value={student.residence.address_line} />
          <ReviewItem
            label="Uses Transport"
            value={student.transport.uses_transport ? "Yes" : "No"}
          />
        </ReviewCard>

        <ReviewCard title="Guardians">
          <div className="space-y-4">
            {guardians.map((guardian, index) => (
              <div
                key={guardian.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  {guardian.photo.previewUrl && (
                    <img
                      src={guardian.photo.previewUrl}
                      alt={guardian.relationship}
                      className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                    />
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Guardian {index + 1}: {guardian.relationship}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {guardian.permissions.is_primary
                        ? "Primary contact"
                        : "Additional contact"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <ReviewItem
                    label="Full Name"
                    value={guardian.identity.full_name}
                  />
                  <ReviewItem
                    label="Gender"
                    value={guardian.identity.gender}
                  />
                  <ReviewItem
                    label="Phone"
                    value={guardian.contact.phone}
                  />
                  <ReviewItem
                    label="Alternative Phone"
                    value={guardian.contact.alternative_phone}
                  />
                  <ReviewItem
                    label="Email"
                    value={guardian.contact.email}
                  />
                  <ReviewItem
                    label="Occupation"
                    value={guardian.identity.occupation}
                  />
                  <ReviewItem
                    label="Can Pickup"
                    value={guardian.permissions.can_pickup ? "Yes" : "No"}
                  />
                  <ReviewItem
                    label="Receives SMS"
                    value={guardian.permissions.receives_sms ? "Yes" : "No"}
                  />
                  <ReviewItem
                    label="Portal Account"
                    value={guardian.portal_account.has_login ? "Yes" : "No"}
                  />
                </div>
              </div>
            ))}
          </div>
        </ReviewCard>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Please review carefully. When the backend admission route is ready, this
        form will submit one complete admission payload so that guardians and
        student are created safely together.
      </div>
    </div>
  );
}

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {title}
      </h3>

      <div>{children}</div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm last:border-b-0">
      <span className="text-gray-500">{label}</span>

      <span className="text-right font-medium text-gray-900">
        {value || "—"}
      </span>
    </div>
  );
}