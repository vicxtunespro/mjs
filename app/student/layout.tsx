import type { ReactNode } from "react";
import { DashboardShell } from "@/components/templates/layout/dashboard-shell";
import type { SideNavGroup } from "@/components/templates/layout/side-nav";

const schoolNavGroups: SideNavGroup[] = [
  {
    title: "General",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Announcements", href: "/dashboard/announcements", icon: "announcements", badge: 3 },
      { label: "Reports", href: "/dashboard/reports", icon: "reports" },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        label: "Students",
        icon: "students",
        children: [
          { label: "Admissions", href: "/dashboard/students/admissions" },
          { label: "View Learners", href: "/dashboard/students/list" },
          { label: "Promotions", href: "/dashboard/students/promotions" },
          { label: "Graduation List", href: "/dashboard/students/graduation" },
        ],
      },
      {
        label: "Parents",
        icon: "parents",
        children: [
          { label: "Parent Directory", href: "/dashboard/parents/directory" },
          { label: "Meetings", href: "/dashboard/parents/meetings" },
          { label: "Communication", href: "/dashboard/parents/communication" },
        ],
      },
      {
        label: "Teachers",
        icon: "teachers",
        children: [
          { label: "Staff List", href: "/dashboard/teachers/list" },
          { label: "Departments", href: "/dashboard/teachers/departments" },
          { label: "Timetable", href: "/dashboard/teachers/timetable" },
        ],
      },
      {
        label: "Classes",
        href: "/dashboard/classes",
        icon: "classes",
      },
      {
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: "attendance",
      },
      {
        label: "Examinations",
        href: "/dashboard/exams",
        icon: "exams",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Finance",
        icon: "finance",
        children: [
          { label: "Fee Structure", href: "/dashboard/finance/fees" },
          { label: "Payments", href: "/dashboard/finance/payments" },
          { label: "Debtors", href: "/dashboard/finance/debtors", badge: 12 },
        ],
      },
      {
        label: "Transport",
        href: "/dashboard/transport",
        icon: "transport",
      },
      {
        label: "Roles & Permissions",
        href: "/dashboard/roles",
        icon: "roles",
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "settings",
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell groups={schoolNavGroups}>
      {children}
    </DashboardShell>
  );
}