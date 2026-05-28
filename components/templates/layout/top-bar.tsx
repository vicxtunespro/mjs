"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePageHeaderStore } from "@/store/usePageHeaderStore";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  UserCircle2,
  Shield,
  CheckCheck,
  Search,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export type TopBarNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  href?: string;
  category?: "system" | "student" | "finance" | "general";
};

export type TopBarUser = {
  name: string;
  email?: string;
  initials: string;
  role?: string;
  avatar?: string;
};

export type TopBarProps = {
  user?: TopBarUser;
  notifications?: TopBarNotification[];
  searchPlaceholder?: string;
  showNotifications?: boolean;
  showMobileMenu?: boolean;
  onMobileMenuClick?: () => void;
  className?: string;
  onSearch?: (query: string) => void;
};

function getNotificationAccent(category?: TopBarNotification["category"]) {
  switch (category) {
    case "student":
      return "bg-red-600";
    case "finance":
      return "bg-gray-700";
    case "system":
      return "bg-red-800";
    default:
      return "bg-gray-500";
  }
}

function formatTimeAgo(time: string): string {
  const now = new Date();
  const then = new Date(time);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

function getInitials(name?: string, email?: string) {
  if (name && name.trim()) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return email?.slice(0, 2).toUpperCase() || "U";
}

function formatRole(role?: string) {
  if (!role) return "";
  return role.replace(/_/g, " ");
}

export function TopBar({
  user,
  notifications = [],
  searchPlaceholder = "Search...",
  showNotifications = true,
  showMobileMenu = false,
  onMobileMenuClick,
  className,
  onSearch,
}: TopBarProps) {
  const router = useRouter();
  const { title, subtitle } = usePageHeaderStore();

  const { user: authUser, logout } = useAuthStore();

  const authenticatedUser: TopBarUser | undefined = authUser
    ? {
        name: authUser.full_name || authUser.email,
        email: authUser.email,
        initials: getInitials(authUser.full_name, authUser.email),
        role: formatRole(authUser.role),
      }
    : undefined;

  const displayUser: TopBarUser | undefined = authenticatedUser || user;

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => item.unread).length;
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSearchExpand = () => {
    setIsSearchExpanded(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchCollapse = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
    onSearch?.("");
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <>
      {isSearchExpanded && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex items-center gap-3 border-b border-gray-200 p-4">
            <div className="relative flex-1" ref={searchContainerRef}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-800 focus:ring-1 focus:ring-red-800"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handleSearchCollapse}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {searchQuery && (
            <div className="p-4">
              <p className="text-sm text-gray-500">
                Search results for &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "sticky top-0 z-40 border-b border-gray-200 bg-white",
          className
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-4 md:h-16 md:px-6 lg:h-[72px]">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none md:gap-3">
            {showMobileMenu && (
              <button
                type="button"
                onClick={onMobileMenuClick}
                className="-ml-2 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg md:text-xl">
                {title}
              </h1>

              {subtitle && (
                <p className="hidden truncate text-xs text-gray-500 sm:block md:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="mx-4 hidden max-w-md flex-1 lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "h-10 w-full rounded-lg border bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition",
                  isSearchFocused
                    ? "border-red-800 ring-1 ring-red-800"
                    : "border-gray-300 hover:border-gray-400"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleSearchExpand}
              className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {showNotifications && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />

                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-bold leading-4 text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[90vw] max-w-[calc(100vw-24px)] rounded-lg border border-gray-200 bg-white p-0 shadow-md outline-none sm:w-[380px]"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Notifications
                        </p>

                        <p className="text-xs text-gray-500">
                          {unreadCount} unread{" "}
                          {unreadCount === 1 ? "message" : "messages"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />

                          <span className="hidden sm:inline">
                            Mark all read
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto sm:max-h-[380px]">
                      {hasNotifications ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => {
                            const content = (
                              <div
                                className={cn(
                                  "flex cursor-pointer gap-3 px-4 py-3 transition",
                                  notification.unread
                                    ? "bg-red-50 hover:bg-red-50"
                                    : "hover:bg-gray-50"
                                )}
                              >
                                <div className="pt-1">
                                  <span
                                    className={cn(
                                      "block h-2 w-2 rounded-full",
                                      getNotificationAccent(
                                        notification.category
                                      )
                                    )}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={cn(
                                        "line-clamp-1 text-sm font-medium",
                                        notification.unread
                                          ? "text-gray-900"
                                          : "text-gray-700"
                                      )}
                                    >
                                      {notification.title}
                                    </p>

                                    <span className="shrink-0 whitespace-nowrap text-[11px] text-gray-400">
                                      {formatTimeAgo(notification.time)}
                                    </span>
                                  </div>

                                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            );

                            return notification.href ? (
                              <DropdownMenu.Item
                                key={notification.id}
                                asChild
                                className="outline-none"
                              >
                                <Link href={notification.href}>{content}</Link>
                              </DropdownMenu.Item>
                            ) : (
                              <DropdownMenu.Item
                                key={notification.id}
                                className="outline-none"
                              >
                                {content}
                              </DropdownMenu.Item>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <Bell className="h-5 w-5 text-gray-400" />
                          </div>

                          <p className="text-sm font-medium text-gray-900">
                            No notifications yet
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            You are all caught up for now.
                          </p>
                        </div>
                      )}
                    </div>

                    {hasNotifications && (
                      <div className="border-t border-gray-100 p-2">
                        <DropdownMenu.Item className="cursor-pointer rounded-md px-3 py-2 text-center text-sm font-medium text-red-700 outline-none transition hover:bg-red-50 focus:bg-red-50">
                          View all notifications
                        </DropdownMenu.Item>
                      </div>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}

            {displayUser ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-1 rounded-md p-1 text-gray-700 transition hover:bg-gray-100 sm:gap-2 sm:p-1.5"
                    aria-label="Open profile menu"
                  >
                    {displayUser.avatar ? (
                      <img
                        src={displayUser.avatar}
                        alt={displayUser.name}
                        className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-900 text-xs font-semibold text-white sm:h-8 sm:w-8">
                        {displayUser.initials}
                      </span>
                    )}

                    <div className="hidden text-left md:block">
                      <p className="text-sm font-medium leading-tight text-gray-900">
                        {displayUser.name.split(" ")[0]}
                      </p>

                      {displayUser.role && (
                        <p className="text-xs capitalize leading-tight text-gray-500">
                          {displayUser.role}
                        </p>
                      )}
                    </div>

                    <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    sideOffset={8}
                    align="end"
                    className="z-50 w-[260px] rounded-lg border border-gray-200 bg-white p-1 shadow-md outline-none"
                  >
                    <div className="border-b border-gray-100 px-3 py-3">
                      <div className="flex items-center gap-3">
                        {displayUser.avatar ? (
                          <img
                            src={displayUser.avatar}
                            alt={displayUser.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900 text-sm font-semibold text-white">
                            {displayUser.initials}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {displayUser.name}
                          </p>

                          {displayUser.email && (
                            <p className="truncate text-xs text-gray-500">
                              {displayUser.email}
                            </p>
                          )}

                          {displayUser.role && (
                            <p className="mt-1 text-xs capitalize text-gray-500">
                              {displayUser.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-1">
                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-gray-50 focus:bg-gray-50">
                        <UserCircle2 className="h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-gray-50 focus:bg-gray-50">
                        <Shield className="h-4 w-4" />
                        <span>Security</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-gray-50 focus:bg-gray-50">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                      <DropdownMenu.Item
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-700 outline-none transition hover:bg-red-50 focus:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="hidden h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:inline-flex"
              >
                <User className="h-4 w-4" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}