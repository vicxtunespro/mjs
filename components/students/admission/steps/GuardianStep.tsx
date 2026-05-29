"use client";

import { AdmissionFormData, AdmissionGuardian } from "../admission.types";
import PhotoUpload from "../components/PhotoUpload";

type Props = {
  data: AdmissionFormData;
  update: (data: Partial<AdmissionFormData>) => void;
};

const inputStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

const selectStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

function createGuardian(
  relationship: AdmissionGuardian["relationship"]
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
      is_primary: false,
      can_pickup: true,
      receives_sms: true,
    },

    portal_account: {
      has_login: true,
    },
  };
}

export default function GuardianStep({ data, update }: Props) {
  const guardians = data.guardians;

  const updateGuardian = (
    guardianId: string,
    updater: (guardian: AdmissionGuardian) => AdmissionGuardian
  ) => {
    update({
      guardians: guardians.map((guardian) =>
        guardian.id === guardianId ? updater(guardian) : guardian
      ),
    });
  };

  const addGuardian = () => {
    update({
      guardians: [...guardians, createGuardian("Guardian")],
    });
  };

  const removeGuardian = (guardianId: string) => {
    if (guardians.length <= 1) return;

    const remaining = guardians.filter((guardian) => guardian.id !== guardianId);

    if (!remaining.some((guardian) => guardian.permissions.is_primary)) {
      remaining[0].permissions.is_primary = true;
    }

    update({
      guardians: remaining,
    });
  };

  const setPrimaryGuardian = (guardianId: string) => {
    update({
      guardians: guardians.map((guardian) => ({
        ...guardian,
        permissions: {
          ...guardian.permissions,
          is_primary: guardian.id === guardianId,
        },
      })),
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Parents / Guardians
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add parent or guardian details for the learner.
          </p>
        </div>

        <button
          type="button"
          onClick={addGuardian}
          className="rounded-lg border border-red-800 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
        >
          Add Guardian
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {guardians.map((guardian, index) => {
          const genderLocked =
            guardian.relationship === "Father" ||
            guardian.relationship === "Mother";

          return (
            <div
              key={guardian.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Guardian {index + 1}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {guardian.permissions.is_primary
                      ? "Primary contact"
                      : "Additional guardian"}
                  </p>
                </div>

                {guardians.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGuardian(guardian.id)}
                    className="text-sm font-medium text-red-700 hover:text-red-900"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Relationship" required>
                    <select
                      value={guardian.relationship}
                      onChange={(e) => {
                        const relationship =
                          e.target.value as AdmissionGuardian["relationship"];

                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          relationship,
                          identity: {
                            ...current.identity,
                            gender:
                              relationship === "Father"
                                ? "Male"
                                : relationship === "Mother"
                                  ? "Female"
                                  : current.identity.gender,
                          },
                        }));
                      }}
                      className={selectStyle}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>

                  <Field label="Full Name" required>
                    <Input
                      value={guardian.identity.full_name}
                      placeholder="John Kato"
                      onChange={(value) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          identity: {
                            ...current.identity,
                            full_name: value,
                          },
                        }))
                      }
                    />
                  </Field>

                  <Field label="Gender">
                    <select
                      disabled={genderLocked}
                      value={guardian.identity.gender}
                      onChange={(e) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          identity: {
                            ...current.identity,
                            gender: e.target.value as AdmissionGuardian["identity"]["gender"],
                          },
                        }))
                      }
                      className={`${selectStyle} disabled:bg-gray-100 disabled:text-gray-400`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </Field>

                  <Field label="Phone Number" required>
                    <Input
                      value={guardian.contact.phone}
                      placeholder="+256700000000"
                      onChange={(value) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          contact: {
                            ...current.contact,
                            phone: value,
                          },
                        }))
                      }
                    />
                  </Field>

                  <Field label="Alternative Phone">
                    <Input
                      value={guardian.contact.alternative_phone}
                      onChange={(value) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          contact: {
                            ...current.contact,
                            alternative_phone: value,
                          },
                        }))
                      }
                    />
                  </Field>

                  <Field label="Email">
                    <Input
                      type="email"
                      value={guardian.contact.email}
                      onChange={(value) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          contact: {
                            ...current.contact,
                            email: value,
                          },
                        }))
                      }
                    />
                  </Field>

                  <Field label="Occupation">
                    <Input
                      value={guardian.identity.occupation}
                      onChange={(value) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          identity: {
                            ...current.identity,
                            occupation: value,
                          },
                        }))
                      }
                    />
                  </Field>

                  <Field label="National ID">
                    <Input
                      value={guardian.identity.national_id}
                      onChange={(value) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          identity: {
                            ...current.identity,
                            national_id: value,
                          },
                        }))
                      }
                    />
                  </Field>

                  <div className="md:col-span-2 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                    <Checkbox
                      label="Primary contact"
                      checked={guardian.permissions.is_primary}
                      onChange={() => setPrimaryGuardian(guardian.id)}
                    />

                    <Checkbox
                      label="Can pick up child"
                      checked={guardian.permissions.can_pickup}
                      onChange={(checked) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          permissions: {
                            ...current.permissions,
                            can_pickup: checked,
                          },
                        }))
                      }
                    />

                    <Checkbox
                      label="Receives SMS notifications"
                      checked={guardian.permissions.receives_sms}
                      onChange={(checked) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          permissions: {
                            ...current.permissions,
                            receives_sms: checked,
                          },
                        }))
                      }
                    />

                    <Checkbox
                      label="Create parent portal account"
                      checked={guardian.portal_account.has_login}
                      onChange={(checked) =>
                        updateGuardian(guardian.id, (current) => ({
                          ...current,
                          portal_account: {
                            has_login: checked,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                <PhotoUpload
                  label={`${guardian.relationship} Photo`}
                  previewUrl={guardian.photo.previewUrl}
                  onFileChange={(file, previewUrl) =>
                    updateGuardian(guardian.id, (current) => ({
                      ...current,
                      photo: {
                        file,
                        previewUrl,
                      },
                    }))
                  }
                />
              </div>
            </div>
          );
        })}
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-800"
      />
      {label}
    </label>
  );
}