import type { ReactNode } from "react";

import { AppShell } from "@/components/templates/layout/app-shell";
import { SideNav, type SideNavGroup } from "@/components/templates/layout/side-nav";
import { TopBar } from "@/components/templates/layout/top-bar";
import { Footer } from "@/components/templates/layout/footer";

const navGroups: SideNavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Users", href: "/dashboard/users", icon: "parents" },
      { label: "Analytics", href: "/dashboard/analytics", icon: "reports", badge: "New" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: "settings" },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      sidebar={
        <SideNav
          appName="MyApp"
          appHref="/dashboard"
          subtitle="Admin Workspace"
          groups={navGroups}
          footer={
            <p className="text-xs text-slate-400">
              Signed in as administrator
            </p>
          }
        />
      }
      mobileSidebar={
        <SideNav
          appName="MyApp"
          appHref="/dashboard"
          subtitle="Admin Workspace"
          groups={navGroups}
          embedded
          footer={
            <p className="text-xs text-slate-400">
              Signed in as administrator
            </p>
          }
        />
      }
      topbar={
        <TopBar
          user={{
            name: "John Doe",
            email: "john@example.com",
            initials: "JD",
          }}
        />
      }
      footer={
        <Footer
          brand="MyApp"
          links={[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Support", href: "/support" },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
}