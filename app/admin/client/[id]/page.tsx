"use client";

import { use, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, onSnapshot, addDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Save, Target, Activity, Camera, Leaf, Droplet, Footprints, MessageCircle } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import LiveChat from "@/components/shared/LiveChat";

export default function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const clientId = params.id;
  const router = useRouter();
  const { user } = useAuth();
  
  const [client, setClient] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [todayWater, setTodayWater] = useState(0);
  const [dietPlan, setDietPlan] = useState({ breakfast: "", lunch: "", dinner: "", snacks: "" });
  const [dietPlanId, setDietPlanId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState("genel-bakis"); // overview, plan, photos, settings
  const [photos, setPhotos] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [editForm, setEditForm] = useState({ name: "", goalWeight: "", age: "", height: "" });
  const [savingPlan, setSavingPlan] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    
    const fetchClient = async () => {
      const docRef = doc(db, "clients", clientId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setClient({ id: docSnap.id, ...data });
        setEditForm({ name: data.name, goalWeight: data.goalWeight, age: data.age, height: data.height });
      }
    };
    fetchClient();

    const unsubLogs = onSnapshot(collection(db, `clients/${clientId}/weight_logs`), (snap) => {
      const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.date.localeCompare(b.date));
      setWeightLogs(logs);
      
      const allPhotos: string[] = [];
      logs.forEach((log: any) => {
        if (log.photos && Array.isArray(log.photos)) {
          allPhotos.push(...log.photos);
        }
      });
      setPhotos(allPhotos);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const unsubWater = onSnapshot(doc(db, `clients/${clientId}/water_logs`, todayStr), (docSnap) => {
      if (docSnap.exists()) {
        setTodayWater(docSnap.data().ml || 0);
      } else {
        setTodayWater(0);
      }
    });

    const unsubPlan = onSnapshot(query(collection(db, "diet_plans")), (snap) => {
       const plan = snap.docs.find(d => d.data().clientId === clientId);
       if (plan) {
         setDietPlan(plan.data() as any);
         setDietPlanId(plan.id);
       }
    });

    const unsubTemplates = onSnapshot(query(collection(db, "diet_templates"), where("dietitianId", "==", user?.uid || "")), (snap) => {
      setTemplates(snap.docs.map(t => ({ id: t.id, ...t.data() })));
    });

    return () => {
      unsubLogs();
      unsubWater();
      unsubPlan();
      unsubTemplates();
    };
  }, [clientId]);

  const handleUpdateClient = async () => {
    await updateDoc(doc(db, "clients", clientId), {
      name: editForm.name,
      goalWeight: Number(editForm.goalWeight),
      age: Number(editForm.age),
      height: Number(editForm.height)
    });
    alert("Danışan başarıyla güncellendi.");
  };

  const handleDeleteClient = async () => {
    if (confirm("Bu danışanı silmek istediğinize emin misiniz? (Bu işlem geri alınamaz) !")) {
      await deleteDoc(doc(db, "clients", clientId));
      router.push("/admin");
    }
  };

  const handleSaveDietPlan = async () => {
    setSavingPlan(true);
    if (dietPlanId) {
      await updateDoc(doc(db, "diet_plans", dietPlanId), { ...dietPlan, updatedAt: new Date().toISOString() });
    } else {
      await addDoc(collection(db, "diet_plans"), {
        clientId,
        dietitianId: client.dietitianId,
        ...dietPlan,
        createdAt: new Date().toISOString()
      });
    }
    setSavingPlan(false);
    alert("Diyet planı başarıyla kaydedildi!");
  };

  const generateAIPlan = async () => {
    setAiLoading(true);
    try {
      const clientDesc = `Yaş: ${client.age}, Boy: ${client.height} cm, Güncel Kilo: ${client.startingWeight} kg, Hedef Kilo: ${client.goalWeight} kg. Vücut kitle indeksi ${((client.startingWeight / ((client.height / 100) * (client.height / 100)))).toFixed(1)}.`;
      
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientDesc })
      });
      
      if (!res.ok) throw new Error("API hatası");
      const data = await res.json();
      
      setDietPlan({
        breakfast: data.breakfast || "",
        lunch: data.lunch || "",
        dinner: data.dinner || "",
        snacks: data.snacks || ""
      });
    } catch (error) {
       console.error(error);
       alert("Yapay zeka planı üretilirken hata oluştu. Lütfen GEMINI_API_KEY'in .env.local dosyasında geçerli olduğundan emin olun.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!client) return <div className="p-8">Danışan bilgileri yükleniyor...</div>;

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : client.startingWeight;
  const currentSteps = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].steps || 0 : 0;
  const bmi = (currentWeight / ((client.height / 100) * (client.height / 100))).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-slate-500">Hedef: {client.goalWeight} kg | Güncel: {currentWeight} kg</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "genel-bakis", label: "Genel Bakış" },
          { id: "mesajlar", label: "Mesajlaşma" },
          { id: "plan", label: "Diyet Planı" },
          { id: "fotograflar", label: "Fotoğraflar" },
          { id: "ayarlar", label: "Ayarlar" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
              activeTab === tab.id 
              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50" 
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "genel-bakis" && (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500">Güncel VKİ (BMI)</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{bmi}</p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500">Toplam Değişim</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.abs(client.startingWeight - currentWeight).toFixed(1)} kg</p>
                <p className="text-xs font-semibold mt-1 text-slate-500">{currentWeight <= client.startingWeight ? "verildi" : "alındı"}</p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1"><Droplet className="w-4 h-4 text-cyan-500" /> Bugünkü Su</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {todayWater >= 1000 ? (todayWater / 1000).toFixed(1) + " L" : todayWater + " ml"}
                </p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1"><Footprints className="w-4 h-4 text-orange-500" /> Son Adım</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currentSteps.toLocaleString()}</p>
             </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Kilo İlerlemesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-4">
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
                    <div className="flex h-full items-center justify-center text-slate-500">Henüz kayıt yok.</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Adım & Hareket Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-4">
                  {weightLogs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weightLogs}>
                        <defs>
                          <linearGradient id="colorStepsAdmin" x1="0" y1="0" x2="0" y2="1">
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
                        <Bar dataKey="steps" fill="url(#colorStepsAdmin)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">Henüz kayıt yok.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "mesajlar" && (
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3 border-b dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg">
               <MessageCircle className="w-5 h-5" /> Danışan ile İletişim
            </CardTitle>
            <CardDescription>Danışanınızla gerçek zamanlı mesajlaşabilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <LiveChat clientId={clientId} dietitianId={client.dietitianId} currentUserId={user?.uid || ""} />
          </CardContent>
        </Card>
      )}

      {activeTab === "plan" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Diyet Planı</CardTitle>
              <CardDescription>Danışanın makro ve öğün planını atayın veya güncelleyin.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {templates.length > 0 && (
                <select
                  className="px-3 py-2 border rounded-md text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                  onChange={(e) => {
                    const tId = e.target.value;
                    if (!tId) return;
                    const t = templates.find(x => x.id === tId);
                    if (t) {
                      setDietPlan({ breakfast: t.breakfast, lunch: t.lunch, dinner: t.dinner, snacks: t.snacks });
                    }
                    e.target.value = "";
                  }}
                >
                  <option value="">Şablondan Yükle 📋</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
              <Button variant="outline" onClick={generateAIPlan} disabled={aiLoading} className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-900/40">
                <Leaf className="w-4 h-4 mr-2" />
                {aiLoading ? "Gemini Planlıyor..." : "Yapay Zeka Ortak Plan"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Kahvaltı</Label>
              <Input value={dietPlan.breakfast} onChange={(e) => setDietPlan({...dietPlan, breakfast: e.target.value})} placeholder="Ör: 2 yumurta, 1 dilim tam buğday..." />
            </div>
            <div className="space-y-2">
              <Label>Öğle Yemeği</Label>
              <Input value={dietPlan.lunch} onChange={(e) => setDietPlan({...dietPlan, lunch: e.target.value})} placeholder="Ör: Tavuklu kinoalı salata..." />
            </div>
            <div className="space-y-2">
              <Label>Akşam Yemeği</Label>
              <Input value={dietPlan.dinner} onChange={(e) => setDietPlan({...dietPlan, dinner: e.target.value})} placeholder="Ör: Izgara balık ve roka salatası..." />
            </div>
            <div className="space-y-2">
              <Label>Ara Öğünler</Label>
              <Input value={dietPlan.snacks} onChange={(e) => setDietPlan({...dietPlan, snacks: e.target.value})} placeholder="Ör: Kuruyemiş, meyve, süzme yoğurt..." />
            </div>
            <div className="pt-4">
              <Button onClick={handleSaveDietPlan} disabled={savingPlan}>
                <Save className="w-4 h-4 mr-2" />
                {savingPlan ? "Kaydediliyor..." : "Diyet Planını Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "fotograflar" && (
        <Card>
          <CardHeader>
            <CardTitle>Gelişim Fotoğrafları</CardTitle>
            <CardDescription>Müşteri bildirimleri sırasında yüklenen fotoğraflar.</CardDescription>
          </CardHeader>
          <CardContent>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((url, idx) => (
                  <div key={idx} className="aspect-square relative rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={url} alt={`Progress ${idx}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed rounded-lg dark:border-slate-800">
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <p>Henüz herhangi bir fotoğraf yüklenmedi.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "ayarlar" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Danışan Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hedef Kilo (kg)</Label>
                <Input value={editForm.goalWeight} onChange={e => setEditForm({...editForm, goalWeight: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Boy (cm)</Label>
                <Input value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} />
              </div>
            </div>
            <div className="pt-4 flex gap-2">
              <Button onClick={handleUpdateClient}>Bilgileri Güncelle</Button>
              <Button onClick={handleDeleteClient} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Danışanı Sil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
