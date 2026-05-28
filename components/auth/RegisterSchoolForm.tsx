// components/auth/RegisterSchoolForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

type FormState = {
  school_name: string;
  school_email: string;
  school_phone: string;
  country: string;
  district: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  password: string;
  confirm_password: string;
};

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-800 focus:ring-1 focus:ring-red-800";

const selectClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-800 focus:ring-1 focus:ring-red-800";

export default function RegisterSchoolForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>({
    school_name: "",
    school_email: "",
    school_phone: "",
    country: "Uganda",
    district: "",
    admin_name: "",
    admin_email: "",
    admin_phone: "",
    password: "",
    confirm_password: "",
  });

  const updateField = (name: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: "",
      }));
    }
  };

  const handleBackToRoles = () => {
    router.push("/auth");
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9+\-\s()]{8,20}$/.test(phone);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.school_name.trim()) {
      newErrors.school_name = "School name is required.";
    }

    if (!form.school_email.trim()) {
      newErrors.school_email = "School email is required.";
    } else if (!validateEmail(form.school_email)) {
      newErrors.school_email = "Enter a valid school email.";
    }

    if (!form.school_phone.trim()) {
      newErrors.school_phone = "School phone is required.";
    } else if (!validatePhone(form.school_phone)) {
      newErrors.school_phone = "Enter a valid school phone number.";
    }

    if (!form.district.trim()) {
      newErrors.district = "District is required.";
    }

    if (!form.admin_name.trim()) {
      newErrors.admin_name = "Admin full name is required.";
    }

    if (!form.admin_email.trim()) {
      newErrors.admin_email = "Admin email is required.";
    } else if (!validateEmail(form.admin_email)) {
      newErrors.admin_email = "Enter a valid admin email.";
    }

    if (!form.admin_phone.trim()) {
      newErrors.admin_phone = "Admin phone is required.";
    } else if (!validatePhone(form.admin_phone)) {
      newErrors.admin_phone = "Enter a valid admin phone number.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = "Please confirm your password.";
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          accessToken: string;
        };
      }>("/onboarding/register-school", {
        method: "POST",
        body: JSON.stringify({
          school: {
            school_name: form.school_name.trim(),
            school_type: "Primary",
            ownership_type: "Private",
            contact: {
              email: form.school_email.trim().toLowerCase(),
              phone: form.school_phone.trim(),
            },
            address: {
              country: form.country,
              district: form.district.trim(),
            },
          },
          admin: {
            full_name: form.admin_name.trim(),
            email: form.admin_email.trim().toLowerCase(),
            phone: form.admin_phone.trim(),
            password: form.password,
          },
        }),
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setErrors({
        general: err.message || "School registration failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Register your school
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a school profile and the first school admin account.
        </p>
      </div>

      <button
        onClick={handleBackToRoles}
        className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-red-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roles
      </button>

      {errors.general && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <section className="mt-7 space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            School Information
          </h3>
        </div>

        <FieldError error={errors.school_name}>
          <IconInput
            icon={<Building2 className="h-4 w-4" />}
            placeholder="School name"
            value={form.school_name}
            onChange={(value) => updateField("school_name", value)}
          />
        </FieldError>

        <FieldError error={errors.school_email}>
          <IconInput
            icon={<Mail className="h-4 w-4" />}
            type="email"
            placeholder="School email"
            value={form.school_email}
            onChange={(value) => updateField("school_email", value)}
          />
        </FieldError>

        <FieldError error={errors.school_phone}>
          <IconInput
            icon={<Phone className="h-4 w-4" />}
            type="tel"
            placeholder="School phone"
            value={form.school_phone}
            onChange={(value) => updateField("school_phone", value)}
          />
        </FieldError>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Globe className="h-4 w-4" />
            </span>

            <select
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              className={selectClass}
            >
              <option value="Uganda">Uganda</option>
              <option value="Kenya">Kenya</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
            </select>
          </div>

          <FieldError error={errors.district}>
            <IconInput
              icon={<MapPin className="h-4 w-4" />}
              placeholder="District"
              value={form.district}
              onChange={(value) => updateField("district", value)}
            />
          </FieldError>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            School Admin Account
          </h3>
        </div>

        <FieldError error={errors.admin_name}>
          <IconInput
            icon={<User className="h-4 w-4" />}
            placeholder="Admin full name"
            value={form.admin_name}
            onChange={(value) => updateField("admin_name", value)}
          />
        </FieldError>

        <FieldError error={errors.admin_email}>
          <IconInput
            icon={<Mail className="h-4 w-4" />}
            type="email"
            placeholder="Admin email"
            value={form.admin_email}
            onChange={(value) => updateField("admin_email", value)}
          />
        </FieldError>

        <FieldError error={errors.admin_phone}>
          <IconInput
            icon={<Phone className="h-4 w-4" />}
            type="tel"
            placeholder="Admin phone"
            value={form.admin_phone}
            onChange={(value) => updateField("admin_phone", value)}
          />
        </FieldError>

        <FieldError error={errors.password}>
          <PasswordInput
            placeholder="Password"
            value={form.password}
            show={showPassword}
            onToggleShow={() => setShowPassword((prev) => !prev)}
            onChange={(value) => updateField("password", value)}
          />
        </FieldError>

        <FieldError error={errors.confirm_password}>
          <PasswordInput
            placeholder="Confirm password"
            value={form.confirm_password}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
            onChange={(value) => updateField("confirm_password", value)}
          />
        </FieldError>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 h-11 w-full rounded-lg bg-red-900 text-sm font-semibold text-white transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Registering school..." : "Register School"}
      </button>
    </form>
  );
}

function IconInput({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Lock className="h-4 w-4" />
      </span>

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-800 focus:ring-1 focus:ring-red-800"
      />

      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function FieldError({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      {children}

      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}