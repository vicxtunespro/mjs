// stores/usePageHeaderStore.ts
import { create } from "zustand";

type PageHeaderState = {
  title: string;
  subtitle?: string;
  setHeader: (header: { title: string; subtitle?: string }) => void;
  resetHeader: () => void;
};

export const usePageHeaderStore = create<PageHeaderState>((set) => ({
  title: "Dashboard",
  subtitle: "Manage your school operations",
  setHeader: ({ title, subtitle }) => set({ title, subtitle }),
  resetHeader: () =>
    set({
      title: "Dashboard",
      subtitle: "Manage your school operations",
    }),
}));