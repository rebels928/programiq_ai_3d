"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DockIconProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

export function DockIcon({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  onContextMenu,
  className = "",
}: DockIconProps) {
  return (
    <motion.button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
        isActive ? "bg-white/10" : "hover:bg-white/5"
      } ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={label}
      title={label}
    >
      {/* Icon */}
      <Icon
        className={`w-6 h-6 transition-colors ${
          isActive ? "text-cyan-500" : "text-foreground/70"
        }`}
      />

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-500"
          layoutId="activeIndicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Tooltip on Hover */}
      <span className="sr-only">{label}</span>
    </motion.button>
  );
}
