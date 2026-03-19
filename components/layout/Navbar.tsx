"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { Menu } from "lucide-react";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between md:justify-end border-b bg-white px-4 md:px-6 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center md:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {user?.email}
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          {getInitials(user?.email || "User")}
        </div>
      </div>
    </header>
  );
}
