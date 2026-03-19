"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-6 dark:bg-slate-900 dark:border-slate-800">
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
