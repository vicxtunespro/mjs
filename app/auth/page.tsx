// app/auth/page.tsx
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import RoleSelector from "@/components/auth/RoleSelector";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterSchoolForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import SupportForm from "@/components/auth/SupportForm";

import { UserRole } from "@/store/auth.store";

type AuthAction = "login" | "register" | "forgot-password" | "support" | null;

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authAction, setAuthAction] = useState<AuthAction>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAuthAction("login");
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setAuthAction(null);
  };

  const handleAuthAction = (action: AuthAction) => {
    setAuthAction(action);
  };

  if (!selectedRole && authAction === "register") {
    return <RegisterForm />;
  }

  if (!selectedRole && authAction === "support") {
    return <SupportForm onBack={handleBackToRoles} />;
  }

  if (!selectedRole) {
    return (
      <RoleSelector
        onRoleSelect={handleRoleSelect}
        onRegister={() => handleAuthAction("register")}
        onSupport={() => handleAuthAction("support")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleBackToRoles}
        className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-red-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roles
      </button>

      <AnimatePresence mode="wait">
        {authAction === "login" && (
          <LoginForm
            key="login"
            role={selectedRole}
            onForgotPassword={() => handleAuthAction("forgot-password")}
            onSupport={() => handleAuthAction("support")}
          />
        )}

        {authAction === "register" && <RegisterForm key="register" />}

        {authAction === "forgot-password" && (
          <ForgotPasswordForm
            key="forgot"
            onBack={() => handleAuthAction("login")}
          />
        )}

        {authAction === "support" && (
          <SupportForm key="support" onBack={handleBackToRoles} />
        )}
      </AnimatePresence>
    </div>
  );
}