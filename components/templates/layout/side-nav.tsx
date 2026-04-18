"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  GraduationCap,
  Users,
  UserSquare2,
  CalendarCheck2,
  ClipboardList,
  Wallet,
  Settings,
  Bell,
  FileBarChart2,
  BookOpen,
  BusFront,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  dashboard: LayoutDashboard,
  students: GraduationCap,
  parents: Users,
  teachers: UserSquare2,
  attendance: CalendarCheck2,
  exams: ClipboardList,
  finance: Wallet,
  settings: Settings,
  announcements: Bell,
  reports: FileBarChart2,
  classes: BookOpen,
  transport: BusFront,
  roles: ShieldCheck,
} satisfies Record<string, LucideIcon>;

export type SidebarMode = "expanded" | "collapsed";

export type SideNavChildItem = {
  label: string;
  href: string;
  badge?: string | number;
};

export type SideNavItem = {
  label: string;
  href?: string;
  icon: keyof typeof iconMap;
  badge?: string | number;
  children?: SideNavChildItem[];
};

export type SideNavGroup = {
  title?: string;
  items?: SideNavItem[];
};

export type SideNavProps = {
  appName: string;
  appHref?: string;
  subtitle?: string;
  groups?: SideNavGroup[];
  mode?: SidebarMode;
  onToggleMode?: () => void;
  footer?: React.ReactNode;
  className?: string;
  embedded?: boolean;
};

export function SideNav({
  appName,
  appHref = "/",
  subtitle,
  groups = [],
  mode = "expanded",
  onToggleMode,
  footer,
  className,
  embedded = false,
}: SideNavProps) {
  const pathname = usePathname();
  const isCollapsed = mode === "collapsed";

  const autoOpenMap = useMemo(() => {
    const nextMap: Record<string, boolean> = {};

    groups.forEach((group, groupIndex) => {
      (group.items ?? []).forEach((item, itemIndex) => {
        const key = `${groupIndex}-${itemIndex}`;
        const hasActiveChild =
          item.children?.some(
            (child) =>
              pathname === child.href || pathname.startsWith(`${child.href}/`)
          ) ?? false;

        nextMap[key] = hasActiveChild;
      });
    });

    return nextMap;
  }, [groups, pathname]);

  const [openItems, setOpenItems] = useState<Record<string, boolean>>(autoOpenMap);

  useEffect(() => {
    setOpenItems((prev) => ({ ...autoOpenMap, ...prev }));
  }, [autoOpenMap]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <aside
      className={cn(
        embedded
          ? "flex h-full flex-col overflow-y-auto scrollbar-hide border-r border-zinc-800 bg-zinc-900 text-zinc-100"
          : "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-auto scrollbar-hide border-r border-zinc-800 bg-zinc-900 text-zinc-100",
        "transition-all duration-300",
        isCollapsed ? "w-[88px]" : "w-[300px]",
        className
      )}
    >
      <div
        className={cn(
          "border-b border-zinc-800",
          isCollapsed ? "px-3 py-4" : "px-5 py-5"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            href={appHref}
            className={cn(
              "flex min-w-0 items-center",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-sm font-bold text-white shadow-sm">
              {appName.slice(0, 1).toUpperCase()}
            </div>

            {!isCollapsed ? (
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white">
                  {appName}
                </h2>
                {subtitle ? (
                  <p className="truncate text-sm text-zinc-400">{subtitle}</p>
                ) : null}
              </div>
            ) : null}
          </Link>

          {!isCollapsed && onToggleMode ? (
            <button
              type="button"
              onClick={onToggleMode}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {isCollapsed && onToggleMode ? (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4">
        <nav aria-label="Sidebar Navigation" className="space-y-6">
          {groups.map((group, groupIndex) => {
            const items = group.items ?? [];
            if (items.length === 0) return null;

            return (
              <div
                key={group.title ?? `group-${groupIndex}`}
                className="space-y-2"
              >
                {!isCollapsed && group.title ? (
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    {group.title}
                  </p>
                ) : null}

                <ul className="space-y-1">
                  {items.map((item, itemIndex) => {
                    const key = `${groupIndex}-${itemIndex}`;
                    const Icon = iconMap[item.icon];
                    const hasChildren = (item.children?.length ?? 0) > 0;

                    const isDirectActive = item.href
                      ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                      : false;

                    const hasActiveChild =
                      item.children?.some(
                        (child) =>
                          pathname === child.href ||
                          pathname.startsWith(`${child.href}/`)
                      ) ?? false;

                    const isOpen = openItems[key];
                    const isActive = isDirectActive || hasActiveChild;

                    if (hasChildren) {
                      return (
                        <li key={`${item.label}-${key}`}>
                          <button
                            type="button"
                            onClick={() => {
                              if (isCollapsed) {
                                onToggleMode?.();
                                return;
                              }
                              toggleItem(key);
                            }}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                              "group flex w-full min-h-11 items-center rounded-xl transition-colors",
                              isCollapsed
                                ? "justify-center px-2 py-2"
                                : "gap-3 px-3 py-2",
                              isActive
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                isActive
                                  ? "text-red-500"
                                  : "text-zinc-400 group-hover:text-zinc-200"
                              )}
                            />

                            {!isCollapsed ? (
                              <>
                                <span className="truncate text-sm font-medium">
                                  {item.label}
                                </span>

                                {item.badge ? (
                                  <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                                    {item.badge}
                                  </span>
                                ) : null}

                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
                                    isOpen ? "rotate-180" : ""
                                  )}
                                />
                              </>
                            ) : null}
                          </button>

                          {!isCollapsed && isOpen ? (
                            <ul className="mt-1 space-y-1 pl-11">
                              {item.children?.map((child) => {
                                const isChildActive =
                                  pathname === child.href ||
                                  pathname.startsWith(`${child.href}/`);

                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      className={cn(
                                        "flex min-h-10 items-center rounded-lg px-3 py-2 text-sm transition-colors",
                                        isChildActive
                                          ? "bg-red-600/10 text-red-400"
                                          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                      )}
                                    >
                                      <span className="truncate">
                                        {child.label}
                                      </span>

                                      {child.badge ? (
                                        <span
                                          className={cn(
                                            "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                                            isChildActive
                                              ? "bg-red-600 text-white"
                                              : "bg-zinc-700 text-zinc-200"
                                          )}
                                        >
                                          {child.badge}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </li>
                      );
                    }

                    return (
                      <li key={item.href ?? `${item.label}-${key}`}>
                        <Link
                          href={item.href ?? "#"}
                          aria-current={isActive ? "page" : undefined}
                          title={isCollapsed ? item.label : undefined}
                          className={cn(
                            "group flex min-h-11 items-center rounded-xl transition-colors",
                            isCollapsed
                              ? "justify-center px-2 py-2"
                              : "gap-3 px-3 py-2",
                            isActive
                              ? "bg-red-600 text-white"
                              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive
                                ? "text-white"
                                : "text-zinc-400 group-hover:text-zinc-200"
                            )}
                          />

                          {!isCollapsed ? (
                            <>
                              <span className="truncate text-sm font-medium">
                                {item.label}
                              </span>

                              {item.badge ? (
                                <span
                                  className={cn(
                                    "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                                    isActive
                                      ? "bg-white/15 text-white"
                                      : "bg-red-600 text-white"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              ) : null}
                            </>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      {footer ? (
        <div
          className={cn(
            "border-t border-zinc-800",
            isCollapsed ? "p-3" : "p-4"
          )}
        >
          {footer}
        </div>
      ) : null}
    </aside>
  );
}