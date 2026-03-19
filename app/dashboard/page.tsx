"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (role === "dietitian") {
        router.push("/admin");
      } else if (role === "client") {
        router.push("/client");
      } else {
        // Fallback or waiting for role to be written to DB
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
