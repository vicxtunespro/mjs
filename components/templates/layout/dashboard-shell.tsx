"use client";

import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/templates/layout/app-shell";
import {
    SideNav,
    type SideNavGroup,
    type SidebarMode,
} from "@/components/templates/layout/side-nav";
import { TopBar } from "@/components/templates/layout/top-bar";
import { Footer } from "@/components/templates/layout/footer";

type DashboardShellProps = {
    children: ReactNode;
    groups: SideNavGroup[];
};

export function DashboardShell({
    children,
    groups,
}: DashboardShellProps) {
    const [mode, setMode] = useState<SidebarMode>("expanded");

    return (
        <AppShell
            sidebarMode={mode}
            sidebar={
                <SideNav
                    appName="Metro Junior School"
                    appHref="/dashboard"
                    subtitle="School Portal"
                    groups={groups}
                    mode={mode}
                    onToggleMode={() =>
                        setMode((prev) =>
                            prev === "expanded" ? "collapsed" : "expanded"
                        )
                    }
                    footer={
                        mode === "expanded" ? (
                            <div className="text-xs text-zinc-400">
                                Logged in as Administrator
                            </div>
                        ) : null
                    }
                />
            }
            mobileSidebar={
                <SideNav
                    appName="Metro Junior School"
                    appHref="/dashboard"
                    subtitle="School Portal"
                    groups={groups}
                    mode="expanded"
                    embedded
                    footer={
                        <div className="text-xs text-zinc-400">
                            Logged in as Administrator
                        </div>
                    }
                />
            }
            topbar={
                <TopBar
                    user={{
                        name: "Sarah Nankya",
                        email: "sarah@redstonehigh.edu",
                        initials: "SN",
                        role: "Administrator",
                    }}
                    notifications={[
                        {
                            id: "1",
                            title: "New student admission",
                            message: "A new learner application was submitted for Senior One.",
                            time: "2m ago",
                            unread: true,
                            href: "/dashboard/students/admissions",
                            category: "student",
                        },
                        {
                            id: "2",
                            title: "Fee payment received",
                            message: "Tuition payment was recorded for 14 students this morning.",
                            time: "15m ago",
                            unread: true,
                            href: "/dashboard/finance/payments",
                            category: "finance",
                        },
                        {
                            id: "3",
                            title: "System update",
                            message: "Term II grading module was updated successfully.",
                            time: "1h ago",
                            unread: false,
                            href: "/dashboard/settings",
                            category: "system",
                        },
                    ]}
                />
            }
            footer={
                <Footer
                    brand="Metro Junior School"
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