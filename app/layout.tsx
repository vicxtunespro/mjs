import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";
import { ToastProvider, Toaster } from "@/components/custom_ui/toast";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SchoolOS",
  description: "Modern school management for Ugandan primary education.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`}>
      <body className="font-sans antialiased bg-background-light dark:bg-background-dark text-primary dark:text-secondary">
        <ToastProvider position="top-right" maxToasts={5}>
        {children}

        <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}