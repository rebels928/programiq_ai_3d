"use client";

import { ReactNode } from "react";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OSWindowProps {
  title: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function OSWindow({
  title,
  isCollapsed = false,
  onToggleCollapse,
  onClose,
  children,
  className = "",
}: OSWindowProps) {
  return (
    <motion.div
      className={`flex flex-col h-full bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 flex-shrink-0">
        {/* Title (Left) */}
        <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/80">
          {title}
        </h3>

        {/* Controls (Right) */}
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 text-foreground/60" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 hover:text-red-500 transition-colors"
              title="Hide Panel"
            >
              <X className="w-3.5 h-3.5 text-foreground/60" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
