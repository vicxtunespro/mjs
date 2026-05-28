"use client";

/**
 * toast.context.tsx
 * ─────────────────
 * Global toast system — wrap your root layout with <ToastProvider>
 * then call useToast() anywhere in the app.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success("Saved!", "Your changes have been saved.");
 *   toast.error("Failed", "Something went wrong.");
 *   toast.warning("Warning", "You are about to delete this.");
 *   toast.info("Info", "A new version is available.");
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

/* ── Types ── */
export type ToastVariant = "error" | "success" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;        // ms before auto-dismiss; 0 = sticky
  createdAt: number;
}

export interface ToastOptions {
  description?: string;
  duration?: number;       // default 5000ms
}

interface ToastContextValue {
  toasts: ToastItem[];
  position: ToastPosition;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  toast: {
    success: (title: string, options?: ToastOptions | string) => string;
    error:   (title: string, options?: ToastOptions | string) => string;
    warning: (title: string, options?: ToastOptions | string) => string;
    info:    (title: string, options?: ToastOptions | string) => string;
    custom:  (item: Omit<ToastItem, "id" | "createdAt">) => string;
  };
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Provider ── */
export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5,
}: {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const push = useCallback(
    (item: Omit<ToastItem, "id" | "createdAt">): string => {
      const id = `toast-${++counterRef.current}-${Date.now()}`;
      const newToast: ToastItem = { ...item, id, createdAt: Date.now() };

      setToasts((prev) => {
        const next = [newToast, ...prev];
        return next.slice(0, maxToasts); // cap queue
      });

      return id;
    },
    [maxToasts]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  // Normalise options: can be a plain string (description shorthand)
  function normalise(options?: ToastOptions | string): ToastOptions {
    if (!options) return {};
    if (typeof options === "string") return { description: options };
    return options;
  }

  const toast: ToastContextValue["toast"] = {
    success: (title, options) =>
      push({ variant: "success", title, duration: 5000, ...normalise(options) }),
    error: (title, options) =>
      push({ variant: "error", title, duration: 6000, ...normalise(options) }),
    warning: (title, options) =>
      push({ variant: "warning", title, duration: 6000, ...normalise(options) }),
    info: (title, options) =>
      push({ variant: "info", title, duration: 5000, ...normalise(options) }),
    custom: (item) => push(item),
  };

  return (
    <ToastContext.Provider value={{ toasts, position, dismiss, dismissAll, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

/* ── Hook ── */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}