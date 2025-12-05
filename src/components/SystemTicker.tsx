"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface TickerStat {
  icon?: LucideIcon;
  label: string;
  value: string | number;
}

interface SystemTickerProps {
  stats: TickerStat[];
  className?: string;
}

export function SystemTicker({ stats, className = "" }: SystemTickerProps) {
  // Duplicate stats for seamless loop
  const marqueeItems = [...stats, ...stats];

  return (
    <div
      className={`hidden md:flex items-center w-full max-w-[500px] overflow-hidden relative ${className}`}
    >
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />

      {/* Scrolling Content */}
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 25,
        }}
      >
        {marqueeItems.map((stat, i) => (
          <div
            key={`${stat.label}-${i}`}
            className="flex items-center gap-2 text-[10px] font-mono tracking-wider opacity-70"
          >
            {stat.icon && (
              <stat.icon className="w-3 h-3 text-cyan-500 flex-shrink-0" />
            )}
            <span className="text-foreground/60 font-bold">{stat.label}:</span>
            <span className="text-foreground">{stat.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
