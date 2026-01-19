"use client";
import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { X, Square, Minus } from "lucide-react";

interface WindowProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Window({ title, children, onClose }: WindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      className={`fixed bg-primary dark:bg-secondary shadow-2xl rounded-lg border border-primary-plus overflow-hidden flex flex-col
        ${isMaximized ? "top-0 left-0 w-screen h-screen z-[99999]" : "top-20 left-20 w-[800px] h-[600px] z-[9999]"}`}
    >
      {/* Window Header */}
      <div className={`flex justify-between items-center bg-grey-200 px-3 py-2 ${!isMaximized ? "cursor-move" : ""}`}>
        <h2 className="text-sm font-semibold text-secondary dark:text-primary">{title}</h2>
        <div className="flex gap-2 items-center">
          <Minus
            size={16}
            className="text-secondary  dark:text-primary hover:text-secondary  dark:text-primary cursor-pointer"
            // Add minimize handling if needed
          />
          <Square
            size={16}
            className="text-secondary  dark:text-primary hover:text-secondary  dark:text-primary cursor-pointer"
            onClick={() => setIsMaximized(!isMaximized)}
          />
          <X
            size={16}
            className="text-secondary  dark:text-primary hover:text-cta cursor-pointer"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 p-4 bg-primary dark:bg-secondary overflow-auto">{children}</div>
    </motion.div>
  );
}
