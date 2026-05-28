"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

type Props = {
  children: React.ReactNode;

  allowedRoles?: string[];
};

export default function AuthGuard({
  children,
  allowedRoles,
}: Props) {
  const router = useRouter();

  const { user, checkAuth } =
    useAuthStore();

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    async function verify() {
      try {
        await checkAuth();

        const token =
          localStorage.getItem(
            "accessToken"
          );

        if (!token) {
          router.replace("/auth");
          return;
        }

        const currentUser =
          useAuthStore.getState().user;

        if (!currentUser) {
          router.replace("/auth");
          return;
        }

        if (
          allowedRoles &&
          !allowedRoles.includes(
            currentUser.role
          )
        ) {
          router.replace("/auth");
          return;
        }
      } finally {
        setChecking(false);
      }
    }

    verify();
  }, [router, checkAuth, allowedRoles]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-500">
          Verifying session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}