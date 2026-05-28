"use client";

/**
 * Toaster.tsx
 * ───────────
 * Drop this once in your root layout, right before </body>.
 *
 *   import { Toaster } from "@/components/ui/toast/Toaster";
 *   ...
 *   <Toaster />
 *
 * It reads position + toasts from ToastContext automatically.
 * No props needed unless you want to override the position set on the provider.
 */

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";
import { type ToastItem, type ToastPosition, type ToastVariant, useToast } from "./toast.context";

/* ── Design tokens per variant ── */
const VARIANT: Record<
  ToastVariant,
  {
    Icon: React.ElementType;
    bar: string;          // progress bar colour
    iconWrap: string;     // icon background
    iconColor: string;
    border: string;
    title: string;
    desc: string;
    close: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    bar: "bg-emerald-500",
    iconWrap: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
    title: "text-stone-900",
    desc: "text-stone-500",
    close: "hover:bg-emerald-100 text-stone-400 hover:text-emerald-700",
  },
  error: {
    Icon: AlertCircle,
    bar: "bg-red-500",
    iconWrap: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-red-200",
    title: "text-stone-900",
    desc: "text-stone-500",
    close: "hover:bg-red-100 text-stone-400 hover:text-red-700",
  },
  warning: {
    Icon: TriangleAlert,
    bar: "bg-amber-500",
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-600",
    border: "border-amber-200",
    title: "text-stone-900",
    desc: "text-stone-500",
    close: "hover:bg-amber-100 text-stone-400 hover:text-amber-700",
  },
  info: {
    Icon: Info,
    bar: "bg-blue-500",
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-200",
    title: "text-stone-900",
    desc: "text-stone-500",
    close: "hover:bg-blue-100 text-stone-400 hover:text-blue-700",
  },
};

/* ── Position classes ── */
const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-right":     "top-4 right-4 items-end",
  "top-left":      "top-4 left-4 items-start",
  "top-center":    "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right":  "bottom-4 right-4 items-end",
  "bottom-left":   "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

const isBottom = (p: ToastPosition) => p.startsWith("bottom");

/* ── Progress bar ── */
function ProgressBar({ duration, variant }: { duration: number; variant: ToastVariant }) {
  if (duration === 0) return null;
  const cfg = VARIANT[variant];
  return (
    <motion.div
      className={`absolute bottom-0 left-0 h-[3px] rounded-b-2xl ${cfg.bar} opacity-50`}
      initial={{ width: "100%" }}
      animate={{ width: "0%" }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  );
}

/* ── Single toast card ── */
function ToastCard({
  toast,
  position,
}: {
  toast: ToastItem;
  position: ToastPosition;
}) {
  const { dismiss } = useToast();
  const cfg = VARIANT[toast.variant];
  const Icon = cfg.Icon;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration === 0) return;
    timerRef.current = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, dismiss]);

  // Pause timer on hover
  function pauseTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }
  function resumeTimer() {
    if (toast.duration === 0) return;
    const elapsed = Date.now() - toast.createdAt;
    const remaining = Math.max(toast.duration - elapsed, 300);
    timerRef.current = setTimeout(() => dismiss(toast.id), remaining);
  }

  const slideY = isBottom(position) ? 16 : -16;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: slideY, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: slideY * 0.6, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      className={`
        relative w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden
        rounded-2xl border bg-white shadow-lg shadow-black/[0.08]
        ${cfg.border}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.iconWrap}`}>
          <Icon className={`h-4 w-4 ${cfg.iconColor}`} strokeWidth={2.5} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`text-sm font-semibold leading-snug ${cfg.title}`}
             style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {toast.title}
          </p>
          {toast.description && (
            <p className={`mt-0.5 text-xs leading-relaxed ${cfg.desc}`}>
              {toast.description}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => dismiss(toast.id)}
          aria-label="Dismiss notification"
          className={`
            mt-0.5 shrink-0 rounded-lg p-1.5 transition-colors duration-150 cursor-pointer
            ${cfg.close}
          `}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <ProgressBar duration={toast.duration} variant={toast.variant} />
    </motion.div>
  );
}

/* ── Toaster (portal container) ── */
export function Toaster({ position: positionProp }: { position?: ToastPosition }) {
  const { toasts, position: ctxPosition } = useToast();
  const position = positionProp ?? ctxPosition;
  const posClass = POSITION_CLASSES[position];

  return (
    <div
      aria-label="Notifications"
      className={`fixed z-[9999] flex flex-col gap-2.5 pointer-events-none ${posClass}`}
      style={{ maxHeight: "100dvh", overflow: "hidden" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} position={position} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}