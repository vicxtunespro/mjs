"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SidebarMode } from "@/components/templates/layout/side-nav";

export type AppShellProps = {
  sidebar: ReactNode;
  mobileSidebar: ReactNode;
  topbar: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  sidebarMode?: SidebarMode;
};

export function AppShell({
  sidebar,
  mobileSidebar,
  topbar,
  footer,
  children,
  className,
  sidebarMode = "expanded",
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopOffset =
    sidebarMode === "collapsed" ? "lg:pl-[88px]" : "lg:pl-[300px]";

  return (
    <div className={cn("min-h-screen bg-zinc-50 text-zinc-900", className)}>
      <div className="hidden lg:block">{sidebar}</div>

      <div className={cn("min-h-screen", desktopOffset)}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </Dialog.Trigger>

                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
                  <Dialog.Content className="fixed left-0 top-0 z-50 h-screen w-[300px] overflow-hidden bg-zinc-900 outline-none lg:hidden">
                    <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                      <Dialog.Title className="text-base font-semibold text-white">
                        Menu
                      </Dialog.Title>

                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800"
                          aria-label="Close sidebar"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </Dialog.Close>
                    </div>

                    <div className="h-[calc(100%-65px)] overflow-y-auto scrollbar-hide">
                      {mobileSidebar}
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              <div className="min-w-0 flex-1">{topbar}</div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>

          {footer ? (
            <footer className="border-t border-zinc-200 bg-white px-4 py-4 lg:px-6">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </div>
  );
}