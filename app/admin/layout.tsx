"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (role !== "dietitian") {
        router.push("/dashboard");
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "dietitian") {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar role="dietitian" />
      <div className="flex flex-1 flex-col overflow-hidden text-slate-900 dark:text-slate-50">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
