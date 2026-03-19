"use client";

import { useClientData } from "@/hooks/useClientData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import AIMentor from "@/components/shared/AIMentor";
import dynamic from "next/dynamic";

const DownloadPdfButton = dynamic(() => import("@/components/shared/DownloadPdfButton"), { ssr: false });

export default function ClientDietPage() {
  const { clientProfile, dietPlan, loading } = useClientData();

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (!clientProfile) return <div className="p-8 text-center">Profil Bulunamadı.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diyet Planım</h1>
        <p className="text-slate-500 mt-1">Diyetisyeninin senin için özel hazırladığı günlük beslenme rutini.</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl"><Utensils className="h-5 w-5 text-emerald-500" /> Atanan Diyet Planı</CardTitle>
            <CardDescription className="mt-1">Hedeflerinize ulaşmak için bu planı düzenli takip edin.</CardDescription>
          </div>
          {dietPlan && (
            <DownloadPdfButton elementId="diet-plan-content" clientName={clientProfile?.name || "Danışan"} />
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {dietPlan ? (
            <div id="diet-plan-content" className="space-y-4">
              <div className="p-5 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-800/50 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-200/50 dark:bg-emerald-800/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <h3 className="font-semibold mb-2 uppercase text-xs tracking-wider opacity-80">🍳 Kahvaltı</h3>
                <p className="text-base leading-relaxed opacity-95">{dietPlan.breakfast || "Belirtilmedi"}</p>
              </div>
              <div className="p-5 rounded-xl bg-orange-50 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-100/50 dark:border-orange-800/50 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-200/50 dark:bg-orange-800/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <h3 className="font-semibold mb-2 uppercase text-xs tracking-wider opacity-80">🥗 Öğle Yemeği</h3>
                <p className="text-base leading-relaxed opacity-95">{dietPlan.lunch || "Belirtilmedi"}</p>
              </div>
              <div className="p-5 rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100/50 dark:border-blue-800/50 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-200/50 dark:bg-blue-800/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <h3 className="font-semibold mb-2 uppercase text-xs tracking-wider opacity-80">🍲 Akşam Yemeği</h3>
                <p className="text-base leading-relaxed opacity-95">{dietPlan.dinner || "Belirtilmedi"}</p>
              </div>
              <div className="p-5 rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100/50 dark:border-purple-800/50 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-200/50 dark:bg-purple-800/50 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <h3 className="font-semibold mb-2 uppercase text-xs tracking-wider opacity-80">🥜 Ara Öğünler</h3>
                <p className="text-base leading-relaxed opacity-95">{dietPlan.snacks || "Belirtilmedi"}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-slate-500 text-center gap-3">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                 <Utensils className="w-8 h-8 opacity-40 text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-400">Diyetisyeniniz henüz bir plan atamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AIMentor clientProfile={clientProfile} dietPlan={dietPlan} dietitianName="Diyetisyeniniz" />
    </div>
  );
}
