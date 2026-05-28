"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/custom_ui/toast"; // ← global toaster
import { useAuthStore, UserRole } from "@/store/auth.store";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function getRedirectPath(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    super_admin:  "/admin/super-admin",
    school_admin: "/admin/dashboard",
    teacher:      "/teacher",
    student:      "/student",
    parent:       "/parent",
    staff:        "/staff",
  };
  return routes[role] ?? "/admin/dashboard";
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ");
}

function mapServerError(msg: string, label: string): { title: string; description: string } {
  const m = msg.toLowerCase();
  if (m.includes("invalid") || m.includes("incorrect") || m.includes("wrong"))
    return {
      title: "Incorrect credentials",
      description: `Double-check your ${label.toLowerCase()} and password, then try again.`,
    };
  if (m.includes("not found"))
    return {
      title: "Account not found",
      description: `No account matches that ${label.toLowerCase()}.`,
    };
  if (m.includes("locked") || m.includes("suspended") || m.includes("disabled"))
    return {
      title: "Account suspended",
      description: "Your account has been locked. Contact your school administrator.",
    };
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch"))
    return {
      title: "Connection problem",
      description: "Check your internet connection and try again.",
    };
  if (m.includes("timeout"))
    return {
      title: "Request timed out",
      description: "The server took too long to respond. Please try again.",
    };
  return {
    title: "Sign-in failed",
    description: msg || "Something went wrong. Please try again.",
  };
}

/* ─────────────────────────────────────────────────────────
   FieldError — animated inline error beneath an input
   Rule: error-placement, aria-live-errors, inline-validation
───────────────────────────────────────────────────────── */
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   InputField — labelled, accessible, themed input wrapper
   Rules: input-labels, focus-states, touch-friendly-input,
          autofill-support, password-toggle
───────────────────────────────────────────────────────── */
type InputFieldProps = {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  autoCapitalize?: string;
  error?: string;
  icon: React.ElementType;
  suffix?: React.ReactNode;
  required?: boolean;
};

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  autoCapitalize = "off",
  error,
  icon: Icon,
  suffix,
  required,
}: InputFieldProps) {
  const errorId = `${id}-error`;
  const hasError = !!error;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1 text-sm font-medium text-stone-700"
      >
        {label}
        {required && (
          <span className="text-red-500" aria-hidden="true">*</span>
        )}
      </label>

      <div className="relative">
        {/* Leading icon */}
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`
            h-11 w-full rounded-xl border bg-white pl-10 text-sm text-stone-900
            placeholder:text-stone-400 outline-none
            transition-all duration-150
            ${suffix ? "pr-10" : "pr-3"}
            ${hasError
              ? "border-red-400 ring-1 ring-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-stone-200 hover:border-stone-300 focus:border-red-700 focus:ring-1 focus:ring-red-700"
            }
          `}
        />

        {/* Trailing slot (e.g. show/hide password) */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>

      <FieldError id={errorId} message={error} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LoginForm
───────────────────────────────────────────────────────── */
type LoginFormProps = {
  role: UserRole;
  onForgotPassword?: () => void;
  onSupport?: () => void;
};

type SubmitState = "idle" | "loading" | "success";

export default function LoginForm({ role, onForgotPassword, onSupport }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast(); // ← global, no local queue needed

  const isAdmin = role === "super_admin" || role === "school_admin";
  const label    = isAdmin ? "Email address" : "Account ID";

  const placeholder = isAdmin
    ? "admin@school.com"
    : role === "student" ? "STU-2026-001"
    : role === "parent"  ? "PAR-2026-001"
    : role === "teacher" ? "TCH-2026-001"
    : "STF-2026-001";

  const autoComplete = isAdmin ? "email" : "username";

  /* State */
  const [identifier,   setIdentifier]   = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitState,  setSubmitState]  = useState<SubmitState>("idle");
  const [fieldErrors,  setFieldErrors]  = useState<{ identifier?: string; password?: string }>({});

  /* Focus first invalid field after failed validation — rule: focus-management */
  const identifierRef = useRef<HTMLInputElement | null>(null);
  const passwordRef   = useRef<HTMLInputElement | null>(null);

  /* Validate a single field on blur — rule: inline-validation */
  function validateField(field: "identifier" | "password", value: string) {
    if (field === "identifier" && !value.trim()) {
      setFieldErrors((p) => ({ ...p, identifier: `${label} is required.` }));
    }
    if (field === "password" && !value.trim()) {
      setFieldErrors((p) => ({ ...p, password: "Password is required." }));
    }
  }

  function clearFieldError(field: "identifier" | "password") {
    setFieldErrors((p) => ({ ...p, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState !== "idle") return;

    /* Client-side validation */
    const errors: typeof fieldErrors = {};
    if (!identifier.trim()) errors.identifier = `${label} is required.`;
    if (!password.trim())   errors.password   = "Password is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Focus first invalid field — rule: focus-management
      if (errors.identifier) {
        document.getElementById("identifier")?.focus();
      } else if (errors.password) {
        document.getElementById("password")?.focus();
      }
      return;
    }

    setFieldErrors({});
    setSubmitState("loading");

    try {
      const user = await login(identifier.trim(), password, role);

      setSubmitState("success");
      toast.success(
        "Welcome back!",
        { description: `Signing you in as ${formatRole(user.role)}…`, duration: 3000 }
      );

      setTimeout(() => router.push(getRedirectPath(user.role)), 900);
    } catch (err: any) {
      setSubmitState("idle");
      const { title, description } = mapServerError(err.message ?? "", label);
      toast.error(title, { description });
    }
  }

  const isLoading = submitState === "loading";
  const isSuccess = submitState === "success";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={`${formatRole(role)} sign-in form`}
      className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm shadow-stone-100"
    >
      {/* ── Header ── */}
      <div className="mb-7">
        <h1
          className="text-xl font-bold capitalize text-stone-900"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          {formatRole(role)} Login
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {isAdmin
            ? "Use your registered school admin email."
            : "Use the ID issued by your school."}
        </p>
      </div>

      {/* ── Fields ── */}
      <div className="space-y-4">
        <InputField
          id="identifier"
          label={label}
          type={isAdmin ? "email" : "text"}
          value={identifier}
          onChange={(v) => { setIdentifier(v); clearFieldError("identifier"); }}
          onBlur={() => validateField("identifier", identifier)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={isAdmin ? "off" : "characters"}
          error={fieldErrors.identifier}
          icon={isAdmin ? Mail : IdCard}
          required
        />

        <InputField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(v) => { setPassword(v); clearFieldError("password"); }}
          onBlur={() => validateField("password", password)}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
          icon={Lock}
          required
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-stone-400 hover:text-stone-600 transition-colors duration-150 cursor-pointer"
            >
              {showPassword
                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                : <Eye    className="h-4 w-4" aria-hidden="true" />
              }
            </button>
          }
        />
      </div>

      {/* ── Forgot password ── */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs font-medium text-red-700 hover:text-red-900 transition-colors cursor-pointer"
        >
          Forgot password?
        </button>
      </div>

      {/* ── Submit ── */}
      <motion.button
        type="submit"
        disabled={isLoading || isSuccess}
        whileTap={!isLoading && !isSuccess ? { scale: 0.98 } : undefined}
        className={`
          mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl
          text-sm font-bold text-white
          shadow-md transition-all duration-200 cursor-pointer
          disabled:cursor-not-allowed
          ${isSuccess
            ? "bg-emerald-600 shadow-emerald-200"
            : "bg-red-700 shadow-red-200 hover:bg-red-800 hover:shadow-red-300 hover:-translate-y-px disabled:opacity-70"
          }
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLoading && (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </motion.span>
          )}
          {isSuccess && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Signed in!
            </motion.span>
          )}
          {!isLoading && !isSuccess && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
            >
              Sign in
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Footer ── */}
      <p className="mt-5 text-center text-xs text-stone-400">
        Having trouble?{" "}
        <button
          type="button"
          onClick={onSupport}
          className="font-medium text-stone-600 underline-offset-2 hover:underline hover:text-stone-800 transition-colors cursor-pointer"
        >
          Contact support
        </button>
      </p>
    </form>
  );
}