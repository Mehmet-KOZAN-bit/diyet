"use client";

import { useState } from "react";
import { useClientData } from "@/hooks/useClientData";
import { db } from "@/lib/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle2, Utensils, Star } from "lucide-react";
import AIMentor from "@/components/shared/AIMentor";

export default function ClientShoppingPage() {
  const { clientProfile, dietPlan, loading } = useClientData();
  const [loadingList, setLoadingList] = useState(false);

  const handleGenerateShoppingList = async () => {
    if (!dietPlan || !dietPlan.id) return;
    setLoadingList(true);
    
    try {
      const dietPlanText = `Kahvaltı: ${dietPlan.breakfast} | Öğle: ${dietPlan.lunch} | Akşam: ${dietPlan.dinner} | Ara: ${dietPlan.snacks}`;
      const res = await fetch("/api/generate-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietPlanText })
      });
      if (!res.ok) throw new Error("API Hatası");
      const data = await res.json();
      
      await updateDoc(doc(db, "diet_plans", dietPlan.id), {
        shoppingList: data.shoppingList || [],
        checkedItems: []
      });
    } catch (e) {
      console.error(e);
      alert("Alışveriş listesi oluşturulamadı.");
    } finally {
      setLoadingList(false);
    }
  };

  const handleToggleCheck = async (index: number) => {
    if (!dietPlan || !dietPlan.id) return;
    
    const checkedItems = dietPlan.checkedItems || [];
    const newChecked = checkedItems.includes(index)
      ? checkedItems.filter((i: number) => i !== index)
      : [...checkedItems, index];
      
    await updateDoc(doc(db, "diet_plans", dietPlan.id), {
      checkedItems: newChecked
    });
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (!clientProfile) return <div className="p-8 text-center">Profil Bulunamadı.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Akıllı Alışveriş Listem</h1>
        <p className="text-slate-500 mt-1">Diyet planında olan ürünlerin otomatik listelenmiş ve işaretlenebilir hali.</p>
      </div>

      {dietPlan ? (
        <Card className="shadow-md border-0 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 min-h-[500px]">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-emerald-800 dark:text-emerald-400">
                  <ShoppingCart className="w-6 h-6" /> Alışveriş Çantası
                </CardTitle>
                <CardDescription className="mt-1">Diyetinize uyumlu ev ihtiyaçlarınız YZ yardımıyla elinizde.</CardDescription>
              </div>
              {(!dietPlan.shoppingList || dietPlan.shoppingList.length === 0) && (
                <Button onClick={handleGenerateShoppingList} disabled={loadingList} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 sm:ml-4 py-5 shadow-sm">
                  <Star className={`w-4 h-4 mr-2 ${loadingList ? "animate-spin" : ""}`} /> 
                  {loadingList ? "Liste Hazırlanıyor..." : "YZ İle Şimdi Oluştur"}
                </Button>
              )}
            </div>
          </CardHeader>
          
          {dietPlan.shoppingList && dietPlan.shoppingList.length > 0 ? (
            <CardContent className="pt-2 px-6 pb-6">
              <div className="grid gap-3">
                {dietPlan.shoppingList.map((item: string, idx: number) => {
                  const isChecked = (dietPlan.checkedItems || []).includes(idx);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleToggleCheck(idx)}
                      className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${isChecked ? 'bg-slate-100/50 border-slate-200/50 text-slate-400 dark:bg-slate-900/50 dark:border-slate-800/50 dark:text-slate-600' : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md dark:bg-slate-950 dark:border-slate-800 dark:hover:border-emerald-900/40'}`}
                    >
                      {isChecked ? (
                        <div className="bg-emerald-500 rounded-full p-1 w-7 h-7 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-emerald-200 dark:border-slate-600 shrink-0 transition-colors" />
                      )}
                      <span className={`text-base font-medium ${isChecked ? 'line-through decoration-slate-300 decoration-2' : 'text-slate-800 dark:text-slate-200'}`}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          ) : (
            <CardContent>
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <ShoppingCart className="w-20 h-20 opacity-10 mb-6 text-emerald-900" />
                  <p className="text-emerald-800/60 dark:text-emerald-300/40 text-lg font-medium">Buzdolabı listeniz henüz oluşmadı.<br />Sağ üstteki "YZ İle Oluştur" butonuna tıklayarak ilk listenizi yaratabilirsiniz.</p>
                </div>
            </CardContent>
          )}
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500 text-center gap-2">
            <Utensils className="w-12 h-12 opacity-20 mb-2" />
            <p className="text-lg">Alışveriş listesi oluşturmak için öncelikle bir Diyet Planına sahip olmalısınız.</p>
          </CardContent>
        </Card>
      )}

      <AIMentor clientProfile={clientProfile} dietPlan={dietPlan} dietitianName="Diyetisyeniniz" />
    </div>
  );
}
