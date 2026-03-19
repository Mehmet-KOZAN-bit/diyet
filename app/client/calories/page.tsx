"use client";

import { useState, useRef } from "react";
import { useClientData } from "@/hooks/useClientData";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Flame, Beef, Wheat, Droplets, Upload, Keyboard, CheckCircle, History, Activity } from "lucide-react";
import AIMentor from "@/components/shared/AIMentor";

export default function CaloriesPage() {
  const { clientProfile, dietPlan, loading } = useClientData();
  
  const [type, setType] = useState<"food" | "exercise">("food");
  const [mode, setMode] = useState<"photo" | "text">("photo");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [exerciseText, setExerciseText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setResult(null);
    setSaved(false);
  };

  const handleAnalyze = async () => {
    if (type === "food") {
      if (mode === "photo" && !imageFile) return;
      if (mode === "text" && !manualText.trim()) return;
    } else if (type === "exercise") {
      if (!exerciseText.trim()) return;
    }
    
    setAnalyzing(true);
    setResult(null);
    setSaved(false);

    try {
      if (type === "exercise") {
        const res = await fetch("/api/analyze-exercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: exerciseText, 
            weight: clientProfile?.startingWeight || 70 
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "API Hatası");
        setResult(json.data);
      } else {
        const fd = new FormData();
      if (mode === "photo" && imageFile) {
        fd.append("image", imageFile);
      } else {
        fd.append("text", manualText);
      }

      const res = await fetch("/api/analyze-calories", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "API Hatası");
      setResult(json.data);
      }
    } catch (e) {
      console.error(e);
      alert("Analiz yapılamadı, lütfen tekrar dene.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !clientProfile?.id) return;
    try {
      if (type === "food") {
        await addDoc(collection(db, `clients/${clientProfile.id}/calorie_logs`), {
          ...result,
          mode,
          imageUrl: imagePreview || null,
          manualText: manualText || null,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, `clients/${clientProfile.id}/exercise_logs`), {
          ...result,
          exerciseText,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        });
      }
      setSaved(true);
    } catch (e) {
      alert("Kaydedilemedi.");
    }
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (!clientProfile) return <div className="p-8 text-center">Profil bulunamadı.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" /> Kalori Takibi
        </h1>
        <p className="text-slate-500 mt-1">Yemek fotoğrafı yükle veya ne yediğini yaz, yapay zeka anında kalori hesaplasın.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full max-w-sm mb-6">
        <button
          onClick={() => { setType("food"); setResult(null); setSaved(false); }}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${type === "food" ? "bg-white dark:bg-slate-900 shadow-sm text-orange-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Alınan (Yemek)
        </button>
        <button
          onClick={() => { setType("exercise"); setResult(null); setSaved(false); }}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${type === "exercise" ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Harcanan (Egzersiz)
        </button>
      </div>

      {type === "food" && (
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            onClick={() => { setMode("photo"); setResult(null); setSaved(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "photo" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
          >
            <Camera className="w-4 h-4" /> Fotoğraf Yükle
          </button>
          <button
            onClick={() => { setMode("text"); setResult(null); setSaved(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "text" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}
          >
            <Keyboard className="w-4 h-4" /> Elle Gir
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>{type === "exercise" ? "Egzersiz Detayı" : (mode === "photo" ? "Yemek Fotoğrafı" : "Yemek Açıklaması")}</CardTitle>
            <CardDescription>
              {type === "exercise" 
                ? "Bugün neler yaptığınızı anlatın. Örn: '45 dk tempolu bisiklet sürdüm.'"
                : (mode === "photo"
                  ? "Tabağınızın net bir fotoğrafını yükleyin, yapay zeka içerikleri tahmin etsin."
                  : "Ne yediğinizi ve miktarını yazın. Örn: '2 yumurta, 1 dilim ekmek'")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === "exercise" ? (
              <div className="space-y-2">
                <Label>Yaptığınız Aktiviteyi Yazın</Label>
                <textarea
                  value={exerciseText}
                  onChange={(e) => { setExerciseText(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="Yarım saat yürüdüm, ardından 15 dakika koşu bandında koştum."
                  className="w-full h-40 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all"
                />
              </div>
            ) : mode === "photo" ? (
              <>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
                    ${imagePreview ? "border-emerald-300 dark:border-emerald-700" : "border-slate-300 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 bg-slate-50 dark:bg-slate-900 hover:bg-orange-50/30 dark:hover:bg-orange-950/10"}`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Yüklenen yemek" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">Fotoğraf seçmek için tıklayın</p>
                      <p className="text-xs opacity-60">JPG, PNG, HEIC desteklenir</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                {imagePreview && (
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="w-full">
                    Farklı Fotoğraf Seç
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Label>Yediklerinizi Yazın</Label>
                <textarea
                  value={manualText}
                  onChange={(e) => { setManualText(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="Örn: Sabah kahvaltısında 2 yumurta, 1 dilim tam buğday ekmeği, 30 gram beyaz peynir ve 1 domates yedim."
                  className="w-full h-40 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all"
                />
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || (type === "exercise" ? !exerciseText.trim() : (mode === "photo" ? !imageFile : !manualText.trim()))}
              className={`w-full py-6 transition-all active:scale-95 text-white shadow-md ${type === "exercise" ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" : "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"}`}
            >
              <Flame className={`w-5 h-5 mr-2 ${analyzing ? "animate-pulse" : ""}`} />
              {analyzing ? "Yapay Zeka Analiz Ediyor..." : (type === "exercise" ? "Yakılan Kaloriyi Hesapla" : "Kaloriyi Hesapla")}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card className={`border-0 shadow-md transition-all ${result ? "" : "opacity-50"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Analiz Sonucu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Total calorie highlight */}
                <div className={`text-center p-6 rounded-xl border ${type === "exercise" ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/30" : "bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/30 border-orange-100 dark:border-orange-900/30"}`}>
                  <p className={`text-sm font-medium mb-1 ${type === "exercise" ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                    {type === "exercise" ? "Harcanan Kalori" : "Toplam Kalori"}
                  </p>
                  <p className={`text-5xl font-extrabold ${type === "exercise" ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                    {type === "exercise" ? result.yakilanKalori : result.toplamKalori}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">kcal</p>
                </div>

                {/* Macros mapping for FOOD mode only */}
                {type === "food" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                      <Beef className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Protein</p>
                      <p className="font-bold text-rose-600 dark:text-rose-400">{result.protein}g</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Karbonhidrat</p>
                      <p className="font-bold text-amber-600 dark:text-amber-400">{result.karbonhidrat}g</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Yağ</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">{result.yag}g</p>
                    </div>
                  </div>
                )}

                {/* Food breakdown or Exercise Activity Details */}
                {type === "food" && result.yemekler?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Besin Ayrıntıları</p>
                    {result.yemekler.map((y: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div>
                          <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{y.isim}</p>
                          <p className="text-xs text-slate-400">{y.miktar}</p>
                        </div>
                        <p className="font-bold text-orange-500">{y.kalori} kcal</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Activity stats for EXERCISE mode only */}
                {type === "exercise" && result.aktiviteIsmi && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{result.aktiviteIsmi}</p>
                      <p className="text-sm text-slate-500">Tahmini Süre: {result.sure || "Belirtilmemiş"}</p>
                    </div>
                    <Activity className="w-6 h-6 text-blue-500 stroke-[1.5]" />
                  </div>
                )}

                {/* Notes */}
                {result.notlar && (
                  <div className={`p-3 rounded-lg border text-sm ${type === "exercise" ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-300" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300"}`}>
                    <p className="font-semibold mb-1">🤖 Yapay Zeka Değerlendirmesi</p>
                    <p className="opacity-80">{result.notlar}</p>
                  </div>
                )}

                {/* Save button */}
                <Button
                  onClick={handleSave}
                  disabled={saved}
                  className={`w-full py-5 transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"}`}
                >
                  {saved ? (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Günlüğüme Kaydedildi!</>
                  ) : (
                    <><History className="w-4 h-4 mr-2" /> Günlüğüme Kaydet</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 text-slate-400 text-center gap-3">
                <Flame className="w-16 h-16 opacity-10 text-orange-500" />
                <p className="font-medium">Analiz sonuçları burada görünecek</p>
                <p className="text-xs opacity-70">Fotoğraf yükleyin veya yediğinizi yazıp "Hesapla" butonuna tıklayın</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AIMentor clientProfile={clientProfile} dietPlan={dietPlan} dietitianName="Diyetisyeniniz" />
    </div>
  );
}
