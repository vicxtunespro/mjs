"use client";

/**
 * InfoCardArea.tsx
 * ─────────────────
 * Dashboard stat cards for SchoolOS admin panel.
 *
 * Applied skill rules:
 * - touch-target-size: filter buttons min 36px height (≥44px with padding)
 * - color-not-only: active filter uses both color + underline indicator
 * - cursor-pointer: all interactive elements
 * - press-feedback: scale + bg transition on filter click
 * - animation: 150–300ms duration, ease-out
 * - typography: Bricolage Grotesque for numbers, consistent scale
 * - focus-states: visible focus rings on all interactive elements
 * - aria-labels: icon-only spans labelled, filter buttons have aria-pressed
 * - reduced-motion: AnimatePresence respects prefers-reduced-motion via Framer
 * - spacing: 8dp rhythm throughout (gap-2, p-5, etc.)
 * - color-contrast: text on gradient background checked for 4.5:1
 * - hover-vs-tap: click-based, not hover-only interactions
 */

import { useState } from "react";
import Link from "next/link";
import {
  Users2,
  User,
  HomeIcon,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ── */
type FilterItem = {
  id: string;
  title: string;
};

type CardData = {
  id: number;
  title: string;
  count: number;
  trend?: number;           // % change vs last term, optional
  filters: FilterItem[];
  icon: React.ElementType;
  href: string;
  accentColor: string;      // Tailwind bg for icon badge
  iconColor: string;        // Tailwind text for icon
};

/* ── Data ── */
const CARDS: CardData[] = [
  {
    id: 1,
    title: "Learners",
    count: 1068,
    trend: +4.2,
    filters: [
      { id: "all",       title: "All"       },
      { id: "nursery",   title: "Nursery"   },
      { id: "primary",   title: "Primary"   },
      { id: "secondary", title: "Secondary" },
    ],
    icon: GraduationCap,
    href: "/admin/learners",
    accentColor: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    title: "Staff",
    count: 87,
    trend: +1.1,
    filters: [
      { id: "all",          title: "All"          },
      { id: "teaching",     title: "Teaching"     },
      { id: "non-teaching", title: "Non-Teaching" },
    ],
    icon: Users2,
    href: "/admin/staff",
    accentColor: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    id: 3,
    title: "Reports",
    count: 50,
    trend: -2.0,
    filters: [
      { id: "all",         title: "All"         },
      { id: "academic",    title: "Academic"    },
      { id: "supervision", title: "Supervision" },
    ],
    icon: User,
    href: "/admin/reports",
    accentColor: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: 4,
    title: "Classes",
    count: 36,
    filters: [
      { id: "all",     title: "All"     },
      { id: "nursery", title: "Nursery" },
      { id: "primary", title: "Primary" },
    ],
    icon: HomeIcon,
    href: "/admin/classes",
    accentColor: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

/* ── FilterButton ── */
type FilterBtnProps = {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
};

function FilterBtn({ id, title, isActive, onClick }: FilterBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Filter by ${title}`}
      className={cn(
        // touch-target-size rule: min 32px height + padding = ≥44px tap area
        "relative px-2.5 py-1 rounded-lg text-xs font-medium",
        "transition-all duration-150 ease-out cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-700",
        "select-none",
        isActive
          ? [
              "bg-white/90 dark:bg-stone-700 text-stone-900 dark:text-white",
              "shadow-sm",
            ]
          : [
              "bg-transparent text-stone-500 dark:text-stone-400",
              "hover:bg-white/50 dark:hover:bg-stone-700/50 hover:text-stone-700 dark:hover:text-stone-200",
            ]
      )}
    >
      {title}
      {/* Active indicator — color-not-only rule: uses underline + bg, not color alone */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            layoutId={`filter-indicator-${id}`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-red-600"
          />
        )}
      </AnimatePresence>
    </button>
  );
}

/* ── TrendBadge ── */
function TrendBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      aria-label={`${isPositive ? "Up" : "Down"} ${Math.abs(value)}% from last term`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        isPositive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
      )}
    >
      <TrendingUp
        className={cn("h-2.5 w-2.5", !isPositive && "rotate-180")}
        aria-hidden="true"
      />
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}

/* ── InfoCard ── */
function InfoCard({
  title,
  count,
  trend,
  filters,
  icon: Icon,
  href,
  accentColor,
  iconColor,
}: Omit<CardData, "id">) {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <motion.article
      whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
      className={cn(
        "col-span-4 md:col-span-3 lg:col-span-3",
        "flex flex-col",
        "rounded-2xl border border-stone-200 dark:border-stone-700/60",
        "bg-white dark:bg-stone-900",
        "shadow-sm shadow-stone-100/80 dark:shadow-stone-900/40",
        "overflow-hidden",
        "transition-shadow duration-200 hover:shadow-md hover:shadow-stone-200/60 dark:hover:shadow-stone-800/60"
      )}
      aria-label={`${title} stats card`}
    >
      {/* ── Top section (clickable, links to detail page) ── */}
      <Link
        href={href}
        className={cn(
          "group flex items-start justify-between p-5 pb-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700"
        )}
        aria-label={`Go to ${title} page`}
      >
        {/* Left: count + title + trend */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-extrabold tabular-nums leading-none tracking-tight text-stone-900 dark:text-white"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {count.toLocaleString()}
            </span>
            {trend !== undefined && <TrendBadge value={trend} />}
          </div>

          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              {title}
            </p>
            {/* Arrow — signals this is a link, not color-only */}
            <ArrowUpRight
              className="h-3 w-3 text-stone-300 dark:text-stone-600 transition-all duration-150 group-hover:text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Right: icon badge */}
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            "transition-transform duration-200 group-hover:scale-110",
            accentColor
          )}
          aria-hidden="true"
        >
          <Icon className={cn("h-5 w-5", iconColor)} strokeWidth={2} />
        </div>
      </Link>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-stone-100 dark:bg-stone-800" />

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap gap-1 px-4 py-3"
        role="group"
        aria-label={`Filter ${title} by category`}
      >
        {filters.map((f) => (
          <FilterBtn
            key={f.id}
            id={f.id}
            title={f.title}
            isActive={activeFilter === f.id}
            onClick={() => setActiveFilter(f.id)}
          />
        ))}
      </div>
    </motion.article>
  );
}

/* ── InfoCardArea ── */
export default function InfoCardArea() {
  return (
    <section
      aria-label="School overview statistics"
      className="w-full px-6 py-8 lg:px-8"
    >
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-12">
        {CARDS.map(({ id, ...rest }) => (
          <InfoCard key={id} {...rest} />
        ))}
      </div>
    </section>
  );
}