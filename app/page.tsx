'use client';
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Mail,
  Lock,
  Building2,
  Headphones,
  Key,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// Reducer for managing loading states
interface LoadingState {
  [key: string]: boolean;
}

type LoadingAction =
  | { type: "SET_LOADING"; role: string }
  | { type: "CLEAR_LOADING"; role: string };

const initialState: LoadingState = {
  Administrator: false,
  Teacher: false,
  Parent: false,
  Student: false,
};

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, [action.role]: true };
    case "CLEAR_LOADING":
      return { ...state, [action.role]: false };
    default:
      return state;
  }
}

// Auth Action Types
type AuthAction = 'login' | 'register' | 'forgot-password' | 'support' | null;

export default function Home() {
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingStates, dispatch] = useReducer(loadingReducer, initialState);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [authAction, setAuthAction] = useState<AuthAction>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    fullName: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setAuthAction('login');
    setErrors({});
    setSuccessMessage('');
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setAuthAction(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      schoolName: '',
      fullName: '',
      message: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate login
    dispatch({ type: "SET_LOADING", role: selectedRole! });
    setTimeout(() => {
      dispatch({ type: "CLEAR_LOADING", role: selectedRole! });
      // Redirect would happen here
      console.log('Login successful', { role: selectedRole, email: formData.email });
    }, 2000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.schoolName) {
      newErrors.schoolName = 'School name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate registration
    setSuccessMessage('Registration request submitted! Our team will review and contact you shortly.');
    setTimeout(() => {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        schoolName: '',
        fullName: '',
        message: ''
      });
    }, 3000);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSuccessMessage('Password reset link has been sent to your email!');
    setTimeout(() => {
      setAuthAction('login');
      setSuccessMessage('');
      setFormData(prev => ({ ...prev, email: '' }));
    }, 3000);
  };

  const handleSupport = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message) {
      newErrors.message = 'Message is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSuccessMessage('Support request sent! We\'ll get back to you within 24 hours.');
    setTimeout(() => {
      setAuthAction(null);
      setSelectedRole(null);
      setSuccessMessage('');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        schoolName: '',
        fullName: '',
        message: ''
      });
    }, 3000);
  };

  const renderAuthForms = () => {
    if (!selectedRole || !authAction) return null;

    const forms = {
      login: (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleLogin}
          className="space-y-6 w-full max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-secondary dark:text-primary">
            Login as {selectedRole}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="enterprise@school.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loadingStates[selectedRole]}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates[selectedRole] ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setAuthAction('forgot-password')}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setAuthAction('support')}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
              >
                Need Help?
              </button>
            </div>
          </div>
        </motion.form>
      ),

      register: (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleRegister}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-secondary dark:text-primary">
            Register Your School
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                School Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Springfield Elementary"
                />
              </div>
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="admin@school.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Register School
          </button>
        </motion.form>
      ),

      'forgot-password': (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleForgotPassword}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-secondary dark:text-primary">
              Reset Password
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAuthAction('login')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Send Reset Link
            </button>
          </div>
        </motion.form>
      ),

      support: (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleSupport}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-secondary dark:text-primary">
              Support Center
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary dark:text-primary mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 resize-none"
                placeholder="How can we help you?"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBackToRoles}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Send Message
            </button>
          </div>
        </motion.form>
      )
    };

    return forms[authAction];
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {pageLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[100dvh] bg-secondary"
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={150}
              height={150}
              className="mb-6 animate-pulse"
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center justify-center min-h-[100dvh]"
          >
            {/* Left Hero Section - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:flex relative flex-col w-full lg:w-1/2 h-[40vh] lg:h-[100dvh] overflow-hidden bg-black">
              {/* Background Image Placeholder - Add your background image URL */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070')",
                }}
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-red-950/60 backdrop-blur-[2px]" />

              {/* Optional Glow */}
              <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />

              {/* Content */}
              <div className="relative z-10 p-8 flex justify-between flex-col gap-4 w-full text-white h-full">
                <span className="text-xl font-semibold tracking-tight">
                  SchoolOS
                </span>

                <div>
                  <div className="py-4 font-black leading-tight text-5xl lg:text-7xl">
                    One Platform, <br />
                    <span className="text-red-500">Entire School.</span>
                  </div>

                  <p className="max-w-xl text-base font-light lg:text-lg text-white/80 leading-relaxed mt-4">
                    Experience the future of school management with SchoolOS —
                    your all-in-one solution for seamless administration,
                    communication, and collaboration.
                  </p>
                </div>

                <div className="footer flex justify-between text-sm text-white/70">
                  <span>© 2026 SchoolOS. All rights reserved.</span>
                  <span>From Dementa</span>
                </div>
              </div>
            </div>

            {/* Right Auth Section */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 min-h-[60vh] lg:h-[100dvh] p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
              <div className="w-full">
                {!selectedRole ? (
                  /* Role Selection */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 w-full h-full p-6 flex flex-col justify-between"
                  >
                    <div className="text-center flex flex-col justify-center items-center w-full">
                      <h1 className="text-2xl sm:text-2xl font-bold text-secondary dark:text-primary mb-2">
                        Please select your role
                      </h1>
                      <p className="text-gray-400 md:w-96 text-xs font-light dark:text-gray-400">
                        Selecting your role in the school helps the system to server you with the right resources and tools. Don't worry, you can always change this later in your profile settings.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Account
                        role="Administrator"
                        href="#"
                        isLoading={loadingStates.Administrator}
                        onClick={() => handleRoleSelect("Administrator")}
                      />
                      <Account
                        role="Teacher"
                        href="#"
                        isLoading={loadingStates.Teacher}
                        onClick={() => handleRoleSelect("Teacher")}
                      />
                      <Account
                        role="Parent"
                        href="#"
                        isLoading={loadingStates.Parent}
                        onClick={() => handleRoleSelect("Parent")}
                      />
                      <Account
                        role="Student"
                        href="#"
                        isLoading={loadingStates.Student}
                        onClick={() => handleRoleSelect("Student")}
                      />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setAuthAction('register')}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <Building2 className="w-5 h-5" />
                          Register School
                        </button>
                        <button
                          onClick={() => setAuthAction('support')}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <Headphones className="w-5 h-5" />
                          Support
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Auth Forms */
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={handleBackToRoles}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 mb-6"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to roles
                    </button>

                    {successMessage && (
                      <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{successMessage}</span>
                      </div>
                    )}

                    <AnimatePresence mode="wait">
                      {renderAuthForms()}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccountProps {
  role: string;
  href: string;
  isLoading: boolean;
  onClick: () => void;
}

function Account({ role, href, isLoading, onClick }: AccountProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group w-full"
    >
      <div className="flex flex-col gap-2 justify-center items-center w-32 border  hover:border-red-300 dark:border-gray-600 opacity-90 px-4 py-2 rounded-lg transition-transform duration-200 group-hover:scale-105">
        {isLoading ? (
          <div
            className="w-8 h-8 border-4 border-t-transparent border-primary-plus rounded-full animate-spin"
            role="status"
            aria-label={`Loading ${role}`}
          />
        ) : (
          <UserCircle
            className="w-8 h-8 text-secondary dark:text-primary hover:text-cta transition-colors duration-200 sm:w-10 sm:h-10"
            aria-label={`${role} profile`}
          />
        )}
        <p className="text-xs text-secondary dark:text-primary hover:text-cta font-medium">
          {role}
        </p>
      </div>

    </button>
  );
}