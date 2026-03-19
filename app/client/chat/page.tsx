"use client";

import { useClientData } from "@/hooks/useClientData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import LiveChat from "@/components/shared/LiveChat";
import AIMentor from "@/components/shared/AIMentor";

export default function ClientChatPage() {
  const { clientProfile, dietPlan, loading, user } = useClientData();

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (!clientProfile) return <div className="p-8 text-center">Profil Bulunamadı.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diyetisyene Mesaj</h1>
        <p className="text-slate-500 mt-1">Diyetisyeniniz ile her an dilediğiniz an canlı olarak mesajlaşabilirsiniz.</p>
      </div>

      <Card className="flex flex-col flex-1 border-0 shadow-md">
         <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
           <CardTitle className="flex items-center gap-2 text-xl"><MessageCircle className="w-5 h-5 text-blue-500" /> Aktif Diyetisyen Bağlantısı</CardTitle>
         </CardHeader>
         <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 rounded-b-xl">
           <LiveChat clientId={clientProfile.id} dietitianId={clientProfile.dietitianId} currentUserId={user?.uid || ""} />
         </CardContent>
      </Card>

      <AIMentor clientProfile={clientProfile} dietPlan={dietPlan} dietitianName="Diyetisyeniniz" />
    </div>
  );
}
