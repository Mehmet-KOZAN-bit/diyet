"use client";

import { useState } from "react";
import { useClientData } from "@/hooks/useClientData";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import AIMentor from "@/components/shared/AIMentor";

export default function ClientLogsPage() {
  const { clientProfile, dietPlan, loading } = useClientData();
  
  const [newWeight, setNewWeight] = useState("");
  const [newWater, setNewWater] = useState("");
  const [newSteps, setNewSteps] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [savingLog, setSavingLog] = useState(false);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !clientProfile?.id) return;
    setSavingLog(true);

    try {
      let photoUrl = "";
      if (file) {
        const ext = file.name.split('.').pop();
        const fileName = `${clientProfile.id}_${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage.from("progress_photos").upload(fileName, file);

        if (error) {
          console.error("Supabase error", error);
          alert("Fotoğraf yükleme başarısız.");
        } else {
          const { data: publicUrl } = supabase.storage.from("progress_photos").getPublicUrl(fileName);
          photoUrl = publicUrl.publicUrl;
        }
      }

      await addDoc(collection(db, `clients/${clientProfile.id}/weight_logs`), {
        weight: Number(newWeight),
        water: Number(newWater) || 0,
        steps: Number(newSteps) || 0,
        date: new Date().toISOString().split('T')[0],
        photos: photoUrl ? [photoUrl] : [],
        createdAt: new Date().toISOString()
      });

      setNewWeight("");
      setNewWater("");
      setNewSteps("");
      setFile(null);
      alert("Bugünün kaydı başarıyla alındı!");
    } catch (err) {
      console.error(err);
      alert("Günlük eklenirken bir hata oluştu.");
    } finally {
      setSavingLog(false);
    }
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (!clientProfile) return <div className="p-8 text-center">Profil Bulunamadı.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Günlük Bildirim</h1>
        <p className="text-slate-500 mt-1">Gelişimini takip etmemiz için günlük değerlerini gir.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-slate-400" /> Yeni Değer Kaydı</CardTitle>
          <CardDescription>Beslenme programınıza ne kadar uyduğunuzu ve bugünkü değişimlerinizi kaydedin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogWeight} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bugünkü Kilonuz (kg)</Label>
                <Input type="number" step="0.1" required value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="Ör: 75.5" className="text-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label>İçilen Su (Litre)</Label>
                <Input type="number" step="0.5" value={newWater} onChange={e => setNewWater(e.target.value)} placeholder="Ör: 2.5" className="text-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Adım Sayısı (İsteğe Bağlı)</Label>
              <Input type="number" value={newSteps} onChange={e => setNewSteps(e.target.value)} placeholder="Ör: 8500" className="text-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
            </div>

            <div className="space-y-2">
              <Label>Gelişim Fotoğrafı (İsteğe Bağlı)</Label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 text-center px-4">
                  <Camera className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">{file ? file.name : "Fotoğraf yüklemek veya kamera ile çekmek için tıklayın"}</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
              </label>
            </div>
            <Button type="submit" disabled={savingLog} className="w-full text-base py-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              {savingLog ? "Sisteme Yükleniyor..." : "Günlüğümü Şimdi Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <AIMentor clientProfile={clientProfile} dietPlan={dietPlan} dietitianName="Diyetisyeniniz" />
    </div>
  );
}
