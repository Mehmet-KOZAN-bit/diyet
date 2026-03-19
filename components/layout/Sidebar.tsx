"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, User, ArrowLeft, Settings, LogOut, Leaf, BookTemplate, Activity, Camera, Utensils, ShoppingCart, MessageCircle, CalendarDays, Flame } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export function Sidebar({ role }: { role: "dietitian" | "client" | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const dietitianLinks = [
    { href: "/admin", label: "Yönetim Paneli", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Randevular", icon: User },
    { href: "/admin/templates", label: "Diyet Şablonları", icon: BookTemplate },
  ];

  const clientLinks = [
    { href: "/client", label: "Genel Bakış", icon: Activity },
    { href: "/client/logs", label: "Günlük Bildirim", icon: Camera },
    { href: "/client/calories", label: "Kalori Takibi", icon: Flame },
    { href: "/client/diet", label: "Diyet Planım", icon: Utensils },
    { href: "/client/shopping", label: "Alışveriş Listem", icon: ShoppingCart },
    { href: "/client/chat", label: "Diyetisyene Mesaj", icon: MessageCircle },
    { href: "/client/appointments", label: "Randevularım", icon: CalendarDays },
  ];

  const links = role === "dietitian" ? dietitianLinks : clientLinks;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="flex h-16 items-center border-b px-6 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Leaf className="h-5 w-5 text-blue-600" />
          <span className="text-slate-900 dark:text-slate-50">Diyetisyen Pro</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            // Exact match for dashboard, or starts with for nested routes (but not just matching the prefix for home if we had one)
            const isActive = pathname === link.href || (link.href !== "/admin" && link.href !== "/client" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600 dark:hover:text-blue-400",
                  isActive
                    ? "bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
