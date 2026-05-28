"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/auth.store";

export default function ProtectedLayout({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function verifyAccess() {
      await checkAuth();

      const token = localStorage.getItem("accessToken");
      const user = useAuthStore.getState().user;

      if (!token || !user) {
        router.replace("/auth");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/auth");
        return;
      }

      setAllowed(true);
    }

    verifyAccess();
  }, [checkAuth, router, allowedRoles]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}