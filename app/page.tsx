'use client';
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle } from "lucide-react";
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

export default function Home() {
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingStates, dispatch] = useReducer(loadingReducer, initialState);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate clearing loading state after navigation
  const handleLinkClick = (role: string) => {
    dispatch({ type: "SET_LOADING", role });
    setTimeout(() => {
      dispatch({ type: "CLEAR_LOADING", role });
    }, 2000); // Simulate 2-second navigation delay
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
            className="flex flex-col items-center justify-center min-h-[100dvh] bg-primary dark:bg-secondary"
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
            className="flex flex-col items-center justify-center min-h-[100dvh] bg-grey-200"
          >
            <div>
              {/* Role selection */}
              <div className="flex flex-col gap-4 mb-8 scale-90 sm:scale-100">
                <h1 className="text-2xl py-4 font-bold text-secondary dark:text-primary">Log in as</h1>
                <div className="flex flex-wrap justify-center gap-8">
                  <Account
                    role="Administrator"
                    href="/admin/dashboard"
                    isLoading={loadingStates.Administrator}
                    onClick={() => handleLinkClick("Administrator")}
                  />
                  <Account
                    role="Teacher"
                    href="/teacher"
                    isLoading={loadingStates.Teacher}
                    onClick={() => handleLinkClick("Teacher")}
                  />
                  <Account
                    role="Parent"
                    href="/parent"
                    isLoading={loadingStates.Parent}
                    onClick={() => handleLinkClick("Parent")}
                  />
                  <Account
                    role="Student"
                    href="/student"
                    isLoading={loadingStates.Student}
                    onClick={() => handleLinkClick("Student")}
                  />
                </div>
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
    <a
      href={href}
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div className="bg-cta opacity-90 px-4 py-2 rounded-lg shadow-md">
        {isLoading ? (
          <div
            className="w-8 h-8 border-4 border-t-transparent border-primary-plus rounded-full animate-spin"
            role="status"
            aria-label={`Loading ${role}`}
          ></div>
        ) : (
          <UserCircle
            className="w-8 h-8 text-primary dark:text-secondary hover:text-primary-plus transition-colors duration-200 sm:w-10 sm:h-10"
            aria-label={`${role} profile`}
          />
        )}
      </div>
      <p className="text-xs text-primary dark:text-secondary">{role}</p>
    </a>
  );
}