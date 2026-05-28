// components/auth/RoleSelector.tsx
"use client";

import { Building2, Headphones } from "lucide-react";

import { UserRole } from "@/store/auth.store";

const roles: {
  label: string;
  value: UserRole;
  description: string;
}[] = [
  {
    label: "School Admin",
    value: "school_admin",
    description: "Manage school operations and administration",
  },

  {
    label: "Teacher",
    value: "teacher",
    description: "Classes, attendance, and grading",
  },

  {
    label: "Parent",
    value: "parent",
    description: "Monitor learner progress and communication",
  },

  {
    label: "Student",
    value: "student",
    description: "Learning materials and examination results",
  },

  {
    label: "Staff",
    value: "staff",
    description: "Access internal school resources",
  },
];

interface RoleSelectorProps {
  onRoleSelect: (
    role: UserRole
  ) => void;

  onRegister: () => void;

  onSupport: () => void;
}

export default function RoleSelector({
  onRoleSelect,
  onRegister,
  onSupport,
}: RoleSelectorProps) {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Select your role
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Choose how you want to access the system
        </p>
      </div>

      {/* ROLE GRID */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() =>
              onRoleSelect(role.value)
            }
            className="rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-red-700 hover:bg-red-50/20"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              {role.label}
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {role.description}
            </p>
          </button>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRegister}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-900"
          >
            <Building2 className="h-4 w-4" />

            Register School
          </button>

          <button
            onClick={onSupport}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-red-300 hover:bg-red-50"
          >
            <Headphones className="h-4 w-4" />

            Support
          </button>
        </div>
      </div>
    </div>
  );
}