"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
  title: string;
  subtitle?: string;
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
      return "bg-red-500";
    case "finance":
      return "bg-emerald-500";
    case "system":
      return "bg-amber-500";
    default:
      return "bg-red-500";
  }
}

function formatTimeAgo(time: string): string {
  // Simple time formatting - can be enhanced
  const now = new Date();
  const then = new Date(time);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

export function TopBar({
  title,
  subtitle,
  user,
  notifications = [],
  searchPlaceholder = "Search...",
  showNotifications = true,
  showMobileMenu = false,
  onMobileMenuClick,
  className,
  onSearch,
}: TopBarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter((item) => item.unread).length;
  const hasNotifications = notifications.length > 0;

  // Handle click outside to collapse search on mobile
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

  return (
    <>
      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearchCollapse}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {searchQuery && (
            <div className="p-4">
              <p className="text-sm text-gray-500">Search results for "{searchQuery}"</p>
              {/* Add search results component here */}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "sticky top-0 z-40 bg-white border-b border-gray-200",
          className
        )}
      >
        <div className="flex h-14 md:h-16 lg:h-[72px] items-center justify-between gap-2 px-3 sm:px-4 md:px-6">
          {/* Left Section - Mobile Menu + Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 md:flex-none">
            {showMobileMenu && (
              <button
                onClick={onMobileMenuClick}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs md:text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Center Section - Search (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
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
                  "h-10 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400",
                  isSearchFocused
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-gray-200 hover:border-gray-300"
                )}
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={handleSearchExpand}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            {showNotifications && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[90vw] sm:w-[380px] max-w-[calc(100vw-24px)] rounded-xl border border-gray-200 bg-white p-0 shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Notifications
                        </p>
                        <p className="text-xs text-gray-500">
                          {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto">
                      {hasNotifications ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => {
                            const content = (
                              <div
                                className={cn(
                                  "flex gap-3 px-4 py-3 transition cursor-pointer",
                                  notification.unread
                                    ? "bg-red-50/30 hover:bg-red-50/50"
                                    : "hover:bg-gray-50"
                                )}
                              >
                                <div className="pt-1">
                                  <span
                                    className={cn(
                                      "block h-2 w-2 rounded-full",
                                      getNotificationAccent(notification.category)
                                    )}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={cn(
                                        "text-sm font-medium line-clamp-1",
                                        notification.unread
                                          ? "text-gray-900"
                                          : "text-gray-700"
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    <span className="shrink-0 text-[11px] text-gray-400 whitespace-nowrap">
                                      {formatTimeAgo(notification.time)}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
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
                                <a href={notification.href}>{content}</a>
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
                        <DropdownMenu.Item className="cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-medium text-red-600 outline-none transition hover:bg-red-50">
                          View all notifications
                        </DropdownMenu.Item>
                      </div>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition group"
                    aria-label="Open profile menu"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xs font-semibold text-white">
                        {user.initials}
                      </span>
                    )}
                    
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {user.name.split(' ')[0]}
                      </p>
                      {user.role && (
                        <p className="text-xs text-gray-500 leading-tight">
                          {user.role}
                        </p>
                      )}
                    </div>
                    
                    <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-gray-400 transition group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    sideOffset={8}
                    align="end"
                    className="z-50 w-[260px] rounded-xl border border-gray-200 bg-white p-1 shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
                  >
                    <div className="rounded-lg bg-gradient-to-r from-gray-50 to-white px-3 py-3 mb-1">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                            {user.initials}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>
                          {user.email && (
                            <p className="truncate text-xs text-gray-500">
                              {user.email}
                            </p>
                          )}
                          {user.role && (
                            <p className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              {user.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-1">
                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-gray-100 focus:bg-gray-100">
                        <UserCircle2 className="h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-gray-100 focus:bg-gray-100">
                        <Shield className="h-4 w-4" />
                        <span>Security</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none transition hover:bg-gray-100 focus:bg-gray-100">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                      <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none transition hover:bg-red-50 focus:bg-red-50">
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
                className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        
        .fade-in-0 {
          animation-name: fade-in;
        }
        
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </>
  );
}