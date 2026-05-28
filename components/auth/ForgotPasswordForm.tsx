// components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onBack();
    }, 3000);
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reset password</h2>
        <p className="mt-1 text-sm text-gray-500">We'll send you a link to reset your password</p>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          Reset link sent to your email
        </div>
      ) : (
        <>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:border-red-300 hover:bg-red-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
            >
              Send link
            </button>
          </div>
        </>
      )}
    </motion.form>
  );
}