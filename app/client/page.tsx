"use client";

import { useClientData } from "@/hooks/useClientData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Footprints, Droplet, Star } from "lucide-react";
import AIMentor from "@/components/shared/AIMentor";

import InstagramShareButton from "@/components/shared/InstagramShareButton";
import WaterTracker from "@/components/shared/WaterTracker";

export default function ClientDashboardOverview() {
  const { clientProfile, dietPlan, weightLogs, loading, user } = useClientData();

  const calculateTrendFeedback = () => {
    if (weightLogs.length < 2) return "Veriler toplandıkça geri bildirim alacaksınız.";
    
    const latest = weightLogs[weightLogs.length - 1].weight;
    const previous = weightLogs[weightLogs.length - 2].weight;
    
    if (latest < previous) {
       return "Harika gidiyorsunuz! Hedefine bir adım daha yaklaştın.";
    } else if (latest > previous) {
       return "Motivasyonunu kaybetme, iniş ve çıkışlar olabilir.";
    } else {
       return "Dengedesiniz. İstikrar devam ediyor!";
    }
  };

  if (loading) return <div className="p-8">Panel yükleniyor...</div>;
  if (!clientProfile) {
    return (
      <div className="flex items-center justify-center p-8 h-[50vh]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Bağlı Profil Bulunamadı</h2>
          <p className="text-slate-500 dark:text-slate-400">
            {user?.email} adresiyle eşleşen profil bulunamadı. Lütfen diyetisyeninizden sizi eklemesini isteyin.
          </p>
        </div>
      </div>
    );
  }

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : clientProfile.startingWeight;
  const currentWater = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].water || 0 : 0;
  const currentSteps = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].steps || 0 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Genel Bakış</h1>
          <p className="text-slate-500 mt-1">Tekrar merhaba, {clientProfile.name}. İşte mevcut vücut grafiğiniz.</p>
        </div>
        
        {weightLogs.length >= 1 && (
          <InstagramShareButton 
            clientName={clientProfile.name}
            startingWeight={clientProfile.startingWeight}
            currentWeight={currentWeight}
          />
        )}
      </div>

      {weightLogs.length >= 1 && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-md flex items-center gap-3">
          <Star className="w-6 h-6 shrink-0 fill-yellow-400 text-yellow-400" />
          <p className="font-medium text-sm sm:text-base">
            {calculateTrendFeedback()}
          </p>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
         <div className="bg-blue-50 dark:bg-blue-900/40 p-5 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">
              <Activity className="w-4 h-4" /> Kilo Gelişimi
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{currentWeight} kg</p>
         </div>
         <div className="bg-orange-50 dark:bg-orange-900/40 p-5 rounded-xl border border-orange-100 dark:border-orange-800 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-300 mb-1">
              <Footprints className="w-4 h-4" /> Son Adım
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{currentSteps.toLocaleString()}</p>
         </div>
      </div>

      <WaterTracker clientId={clientProfile.id} />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Kilo Gidişatı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {weightLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightLogs}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm border rounded-lg dark:border-slate-800">Veri yok.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Adım Sayısı Analizi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {weightLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightLogs}>
                    <defs>
                      <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      cursor={{fill: '#f1f5f9', opacity: 0.4}} 
                    />
                    <Bar dataKey="steps" fill="url(#colorSteps)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm border rounded-lg dark:border-slate-800">Veri yok.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AIMentor clientProfile={clientProfile} dietPlan={dietPlan} dietitianName="Diyetisyeniniz" />
    </div>
  );
}
