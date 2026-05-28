import Modal from '@/components/Data Models/modal'
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/templates/layout/dashboard-shell";
import type { SideNavGroup } from "@/components/templates/layout/side-nav";
import ProtectedLayout from "@/components/auth/ProtectedLayout";

const schoolNavGroups: SideNavGroup[] = [
  {
    title: "General",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
      { label: "Reports", href: "/admin/reports", icon: "reports" },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        label: "Students",
        icon: "students",
        children: [
          { label: "Admissions", href: "/admin/admissions" },
          { label: "View Learners", href: "/admin/students" },
          { label: "Bulk Data Upload", href: "/admin/students/bulk-upload" },
          { label: "Data Cleaning", href: "/admin/students/data-cleaning" },
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
    <ProtectedLayout allowedRoles={["school_admin"]}>
      <DashboardShell groups={schoolNavGroups}>
        <Modal />
        {children}
      </DashboardShell>
    </ProtectedLayout>
  );
}