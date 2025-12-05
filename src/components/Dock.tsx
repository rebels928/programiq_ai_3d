"use client";

import { LucideIcon, Palette, Box, FileText, Calendar, GitBranch, ShoppingBag, Activity, BarChart3, Sun, Moon, MessageSquare, Camera, Download, Share2, Save, Settings } from "lucide-react";
import { DockIcon } from "./DockIcon";
import { motion } from "framer-motion";
import AICore from "./AICore";
import { LayoutState, WindowId, PanelId } from "@/hooks/usePanelLayout";

export interface DockIconConfig {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

interface DockProps {
  icons?: DockIconConfig[];
  className?: string;
  onAICoreClick?: () => void;
  isAICoreActive?: boolean;
  // New props for project workspace
  layout?: LayoutState;
  onOpenWindow?: (windowId: WindowId, position?: "center" | "floating") => void;
  onTogglePanel?: (panelId: PanelId) => void;
  theme?: string;
  onThemeToggle?: () => void;
  // 3D workspace mode
  mode?: "legacy" | "project" | "3d-workspace";
  onChatToggle?: () => void;
  onScreenshot?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
}

export function Dock({
  icons,
  className = "",
  onAICoreClick,
  isAICoreActive = false,
  layout,
  onOpenWindow,
  onTogglePanel,
  theme,
  onThemeToggle,
  mode = "legacy",
  onChatToggle,
  onScreenshot,
  onExport,
  onShare,
  onSave,
  onSettings
}: DockProps) {
  // 3D workspace mode (Phase 2)
  if (mode === "3d-workspace") {
    return <WorkspaceDock
      className={className}
      onAICoreClick={onAICoreClick}
      isAICoreActive={isAICoreActive}
      onChatToggle={onChatToggle}
      onScreenshot={onScreenshot}
      onExport={onExport}
      onShare={onShare}
      onSave={onSave}
      onSettings={onSettings}
    />;
  }

  // If using new project workspace mode with layout
  if (layout && onOpenWindow && onTogglePanel) {
    return <ProjectDock
      layout={layout}
      onOpenWindow={onOpenWindow}
      onTogglePanel={onTogglePanel}
      className={className}
      onAICoreClick={onAICoreClick}
      isAICoreActive={isAICoreActive}
      theme={theme}
      onThemeToggle={onThemeToggle}
    />;
  }

  // Legacy mode with icons array
  if (!icons) return null;

  // Split icons into left and right groups
  const midpoint = Math.ceil(icons.length / 2);
  const leftIcons = icons.slice(0, midpoint);
  const rightIcons = icons.slice(midpoint);

  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl">
        {/* Left Icon Group */}
        <div className="flex items-center gap-2">
          {leftIcons.map((iconConfig, index) => (
            <DockIcon
              key={`${iconConfig.label}-${index}`}
              icon={iconConfig.icon}
              label={iconConfig.label}
              isActive={iconConfig.active}
              onClick={iconConfig.onClick}
            />
          ))}
        </div>

        {/* AI Core (Center) */}
        <motion.div
          className="relative -mt-8"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <button
            onClick={onAICoreClick}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-transform duration-300 cursor-pointer group"
            aria-label="AI Crystal"
            title="AI Crystal"
          >
            {/* Animated Glow */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                isAICoreActive
                  ? "bg-cyan-500/60"
                  : "bg-white/20 group-hover:bg-purple-500/40"
              }`}
            />
            {/* Crystal Container */}
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-black/20 backdrop-blur-sm relative z-10">
              <AICore />
            </div>
          </button>
        </motion.div>

        {/* Right Icon Group */}
        <div className="flex items-center gap-2">
          {rightIcons.map((iconConfig, index) => (
            <DockIcon
              key={`${iconConfig.label}-${index}`}
              icon={iconConfig.icon}
              label={iconConfig.label}
              isActive={iconConfig.active}
              onClick={iconConfig.onClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// 3D Workspace dock (Phase 2 - like HeroForge)
function WorkspaceDock({
  className = "",
  onAICoreClick,
  isAICoreActive = false,
  onChatToggle,
  onScreenshot,
  onExport,
  onShare,
  onSave,
  onSettings,
}: {
  className?: string;
  onAICoreClick?: () => void;
  isAICoreActive?: boolean;
  onChatToggle?: () => void;
  onScreenshot?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
}) {
  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center gap-4 px-8 py-4 glass-dock">
        {/* Left Icon Group */}
        <div className="flex items-center gap-2">
          <DockIcon
            icon={MessageSquare}
            label="AI Chat"
            onClick={onChatToggle}
          />
          <DockIcon
            icon={Camera}
            label="Screenshot"
            onClick={onScreenshot}
          />
          <DockIcon
            icon={Download}
            label="Export"
            onClick={onExport}
          />
        </div>

        {/* AI Core (Center) */}
        <motion.div
          className="relative -mt-8 mx-6"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <button
            onClick={onAICoreClick}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-transform duration-300 cursor-pointer group"
            aria-label="AI Crystal"
            title="AI Crystal"
          >
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                isAICoreActive
                  ? "bg-cyan-500/60"
                  : "bg-white/20 group-hover:bg-purple-500/40"
              }`}
            />
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-black/20 backdrop-blur-sm relative z-10">
              <AICore />
            </div>
          </button>
        </motion.div>

        {/* Right Icon Group */}
        <div className="flex items-center gap-2">
          <DockIcon
            icon={Share2}
            label="Share"
            onClick={onShare}
          />
          <DockIcon
            icon={Save}
            label="Save"
            onClick={onSave}
          />
          <DockIcon
            icon={Settings}
            label="Settings"
            onClick={onSettings}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Project workspace-specific dock with window and panel controls
function ProjectDock({
  layout,
  onOpenWindow,
  onTogglePanel,
  className = "",
  onAICoreClick,
  isAICoreActive = false,
  theme,
  onThemeToggle,
}: {
  layout: LayoutState;
  onOpenWindow: (windowId: WindowId, position?: "center" | "floating") => void;
  onTogglePanel: (panelId: PanelId) => void;
  className?: string;
  onAICoreClick?: () => void;
  isAICoreActive?: boolean;
  theme?: string;
  onThemeToggle?: () => void;
}) {
  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl">
        {/* Left Icon Group - Window Launchers */}
        <div className="flex items-center gap-2">
          <DockIcon
            icon={Palette}
            label="Design"
            isActive={layout.panels.chat.isVisible}
            onClick={() => onTogglePanel("chat")}
          />
          <DockIcon
            icon={Box}
            label="3D Viewer"
            isActive={layout.windows["3d"].isOpen}
            onClick={() => onOpenWindow("3d", "center")}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenWindow("3d", "floating");
            }}
          />
          <DockIcon
            icon={FileText}
            label="Documents"
            isActive={layout.windows.documents.isOpen}
            onClick={() => onOpenWindow("documents", "center")}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenWindow("documents", "floating");
            }}
          />
          <DockIcon
            icon={Calendar}
            label="Timeline"
            isActive={layout.windows.timeline.isOpen}
            onClick={() => onOpenWindow("timeline", "center")}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenWindow("timeline", "floating");
            }}
          />
        </div>

        {/* AI Core (Center) */}
        <motion.div
          className="relative -mt-8"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <button
            onClick={onAICoreClick}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-transform duration-300 cursor-pointer group"
            aria-label="AI Crystal"
            title="AI Crystal"
          >
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                isAICoreActive
                  ? "bg-cyan-500/60"
                  : "bg-white/20 group-hover:bg-purple-500/40"
              }`}
            />
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-black/20 backdrop-blur-sm relative z-10">
              <AICore />
            </div>
          </button>
        </motion.div>

        {/* Right Icon Group - More Windows & Panel Toggles */}
        <div className="flex items-center gap-2">
          <DockIcon
            icon={GitBranch}
            label="What-If"
            isActive={layout.windows.whatif.isOpen}
            onClick={() => onOpenWindow("whatif", "center")}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenWindow("whatif", "floating");
            }}
          />
          <DockIcon
            icon={ShoppingBag}
            label="IKEA"
            isActive={layout.windows.ikea.isOpen}
            onClick={() => onOpenWindow("ikea", "center")}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenWindow("ikea", "floating");
            }}
          />
          <DockIcon
            icon={Activity}
            label="Health"
            isActive={layout.windows.health.isOpen}
            onClick={() => onOpenWindow("health", "center")}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenWindow("health", "floating");
            }}
          />
          <DockIcon
            icon={BarChart3}
            label="Stats"
            isActive={layout.panels.stats.isVisible}
            onClick={() => onTogglePanel("stats")}
          />
          {onThemeToggle && (
            <DockIcon
              icon={theme === "dark" ? Sun : Moon}
              label={theme === "dark" ? "Light Mode" : "Dark Mode"}
              onClick={onThemeToggle}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
