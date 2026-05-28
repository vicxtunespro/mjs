// app/auth/layout.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex relative w-1/2 bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-red-950/70" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <span className="text-2xl font-light tracking-wide">SchoolOS</span>
          
          <div>
            <h1 className="text-6xl font-bold leading-tight">
              One Platform,<br />
              <span className="text-red-500">Entire School.</span>
            </h1>
            <p className="mt-6 max-w-md text-white/70 leading-relaxed">
              Experience the future of school management — your all-in-one solution 
              for seamless administration, communication, and collaboration.
            </p>
          </div>
          
          <p className="text-sm text-white/40">
            © 2026 SchoolOS. From Dementa.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Section */}
      <div className="flex w-full items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}