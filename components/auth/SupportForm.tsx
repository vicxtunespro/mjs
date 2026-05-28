// components/auth/SupportForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, MessageSquare, CheckCircle } from "lucide-react";

interface SupportFormProps {
  onBack: () => void;
}

export default function SupportForm({ onBack }: SupportFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

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
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Support center</h2>
        <p className="mt-1 text-sm text-gray-500">How can we help you?</p>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          Message sent! We'll respond within 24 hours.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                required
              />
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                placeholder="Describe your issue..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:border-red-300 hover:bg-red-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
            >
              Send message
            </button>
          </div>
        </>
      )}
    </motion.form>
  );
}