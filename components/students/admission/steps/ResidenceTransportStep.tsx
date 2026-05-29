"use client";

import { AdmissionFormData, AdmissionGuardian } from "../admission.types";

type Props = {
  data: AdmissionFormData;
  update: (data: Partial<AdmissionFormData>) => void;
};

const inputStyle =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800";

export default function ResidenceTransportStep({ data, update }: Props) {
  const residence = data.student.residence;
  const transport = data.student.transport;
  const guardians = data.guardians;

  const updateResidence = (
    field: keyof typeof residence,
    value: string
  ) => {
    update({
      student: {
        ...data.student,
        residence: {
          ...residence,
          [field]: value,
        },
      },
    });
  };

  const updateTransport = (usesTransport: boolean) => {
    update({
      student: {
        ...data.student,
        transport: {
          uses_transport: usesTransport,
        },
      },
    });
  };

  const updateGuardianAddress = (
    guardianId: string,
    field: keyof AdmissionGuardian["address"],
    value: string
  ) => {
    update({
      guardians: guardians.map((guardian) =>
        guardian.id === guardianId
          ? {
              ...guardian,
              address: {
                ...guardian.address,
                [field]: value,
              },
            }
          : guardian
      ),
    });
  };

  const useStudentAddressForGuardian = (guardianId: string) => {
    update({
      guardians: guardians.map((guardian) =>
        guardian.id === guardianId
          ? {
              ...guardian,
              address: {
                country: residence.country,
                district: residence.district,
                village: residence.village,
                address_line: residence.address_line,
              },
            }
          : guardian
      ),
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Residence & Transport
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Capture where the learner stays and whether school transport is needed.
      </p>

      <div className="mt-6 space-y-8">
        <section>
          <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
            Student Residence
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Country">
              <Input
                value={residence.country}
                onChange={(value) => updateResidence("country", value)}
              />
            </Field>

            <Field label="District" required>
              <Input
                value={residence.district}
                onChange={(value) => updateResidence("district", value)}
                placeholder="Wakiso"
              />
            </Field>

            <Field label="Sub County">
              <Input
                value={residence.sub_county}
                onChange={(value) => updateResidence("sub_county", value)}
                placeholder="Optional"
              />
            </Field>

            <Field label="Parish">
              <Input
                value={residence.parish}
                onChange={(value) => updateResidence("parish", value)}
                placeholder="Optional"
              />
            </Field>

            <Field label="Village">
              <Input
                value={residence.village}
                onChange={(value) => updateResidence("village", value)}
                placeholder="Kitemu"
              />
            </Field>

            <Field label="Address Line">
              <Input
                value={residence.address_line}
                onChange={(value) => updateResidence("address_line", value)}
                placeholder="Optional"
              />
            </Field>
          </div>
        </section>

        <section>
          <h3 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
            Guardian Addresses
          </h3>

          <div className="mt-4 space-y-5">
            {guardians.map((guardian, index) => (
              <div
                key={guardian.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Guardian {index + 1}: {guardian.relationship}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {guardian.identity.full_name || "Name not provided yet"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => useStudentAddressForGuardian(guardian.id)}
                    className="text-sm font-medium text-red-800 hover:text-red-950"
                  >
                    Same as student
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Country">
                    <Input
                      value={guardian.address.country}
                      onChange={(value) =>
                        updateGuardianAddress(guardian.id, "country", value)
                      }
                    />
                  </Field>

                  <Field label="District">
                    <Input
                      value={guardian.address.district}
                      onChange={(value) =>
                        updateGuardianAddress(guardian.id, "district", value)
                      }
                      placeholder="Wakiso"
                    />
                  </Field>

                  <Field label="Village">
                    <Input
                      value={guardian.address.village}
                      onChange={(value) =>
                        updateGuardianAddress(guardian.id, "village", value)
                      }
                      placeholder="Kitemu"
                    />
                  </Field>

                  <Field label="Address Line">
                    <Input
                      value={guardian.address.address_line}
                      onChange={(value) =>
                        updateGuardianAddress(
                          guardian.id,
                          "address_line",
                          value
                        )
                      }
                      placeholder="Optional"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={transport.uses_transport}
              onChange={(e) => updateTransport(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-800"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Learner uses school van / transport
              </span>

              <span className="mt-1 block text-sm text-gray-500">
                Route, pickup point, dropoff point, vehicle, and driver
                assignment will be completed later in the Transport module.
              </span>
            </span>
          </label>

          {transport.uses_transport && (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <DisabledInput label="Route" value="To be assigned later" />
              <DisabledInput label="Pickup Point" value="To be assigned later" />
              <DisabledInput label="Dropoff Point" value="To be assigned later" />
            </div>
          )}
        </section>
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
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputStyle}
    />
  );
}

function DisabledInput({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        value={value}
        disabled
        className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500"
      />
    </div>
  );
}