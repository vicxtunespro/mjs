// src/store/auth.store.ts
"use client";

import { create } from "zustand";
import { apiRequest } from "@/lib/api";

export type UserRole =
  | "super_admin"
  | "school_admin"
  | "teacher"
  | "student"
  | "parent"
  | "staff";

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  school_id: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  selectedRole: UserRole | null;
  loading: boolean;

  setSelectedRole: (role: UserRole) => void;

  login: (
    identifier: string,
    password: string,
    role: UserRole
  ) => Promise<AuthUser>;

  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  selectedRole: null,
  loading: false,

  setSelectedRole: (role) => {
    set({ selectedRole: role });
  },

  login: async (identifier, password, role) => {
    set({ loading: true });

    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          accessToken: string;
          user: AuthUser;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password,
          role,
        }),
      });

      if (res.data.user.role !== role) {
        throw new Error(
          `This account is registered as ${res.data.user.role}, not ${role}.`
        );
      }

      localStorage.setItem("accessToken", res.data.accessToken);

      set({
        user: res.data.user,
        token: res.data.accessToken,
        selectedRole: role,
        loading: false,
      });

      return res.data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");

    set({
      user: null,
      token: null,
      selectedRole: null,
      loading: false,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      set({
        user: null,
        token: null,
      });
      return;
    }

    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          userId: string;
          school_id: string;
          role: UserRole;
          email: string;
          full_name?: string;
        };
      }>("/auth/me");

      set({
        token,
        user: {
          id: res.data.userId,
          full_name: res.data.full_name || res.data.email,
          email: res.data.email,
          role: res.data.role,
          school_id: res.data.school_id,
        },
      });
    } catch {
      localStorage.removeItem("accessToken");

      set({
        user: null,
        token: null,
      });
    }
  },
}));