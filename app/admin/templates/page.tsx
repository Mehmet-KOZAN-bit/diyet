"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookTemplate, Leaf, Trash2, Edit2, Plus, Save } from "lucide-react";

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ id: "", name: "", breakfast: "", lunch: "", dinner: "", snacks: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, "diet_templates"),
      where("dietitianId", "==", user.uid)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (form.id) {
      // Düzenleme
      const safeData = { ...form };
      delete (safeData as any).id;
      await updateDoc(doc(db, "diet_templates", form.id), safeData);
      alert("Şablon güncellendi.");
    } else {
      // Ekleme
      await addDoc(collection(db, "diet_templates"), {
        dietitianId: user.uid,
        name: form.name,
        breakfast: form.breakfast,
        lunch: form.lunch,
        dinner: form.dinner,
        snacks: form.snacks,
        createdAt: new Date().toISOString()
      });
      alert("Yeni şablon eklendi.");
    }

    setForm({ id: "", name: "", breakfast: "", lunch: "", dinner: "", snacks: "" });
    setIsEditing(false);
  };

  const handleEdit = (t: any) => {
    setForm(t);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu şablonu silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "diet_templates", id));
    }
  };

  const cancelEdit = () => {
    setForm({ id: "", name: "", breakfast: "", lunch: "", dinner: "", snacks: "" });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Şablon Kütüphanesi</h1>
         <p className="text-slate-500">Sık kullandığınız diyet planlarını kaydedin, danışanlarınıza saniyeler içinde atayın.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         {/* Form Tarafı */}
         <div>
           <Card className="border-blue-100 dark:border-blue-900 border-2">
             <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-50 dark:border-blue-900/40">
               <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
                 {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                 {isEditing ? "Şablonu Düzenle" : "Yeni Şablon Ekle"}
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
               <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Şablon Adı 🌟</Label>
                    <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Örn: 1500 Kalori Aralıklı Oruç" className="font-semibold text-lg" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label>Kahvaltı</Label>
                    <Input required value={form.breakfast} onChange={e => setForm({...form, breakfast: e.target.value})} placeholder="2 Haşlanmış yumurta, peynir..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Öğle Yemeği</Label>
                    <Input required value={form.lunch} onChange={e => setForm({...form, lunch: e.target.value})} placeholder="Tavuklu salata..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Akşam Yemeği</Label>
                    <Input required value={form.dinner} onChange={e => setForm({...form, dinner: e.target.value})} placeholder="Izgara Balık..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Ara Öğünler</Label>
                    <Input required value={form.snacks} onChange={e => setForm({...form, snacks: e.target.value})} placeholder="Ceviz, badem, yeşil çay..." />
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Değişiklikleri Kaydet" : "Şablonu Oluştur"}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        İptal
                      </Button>
                    )}
                  </div>
               </form>
             </CardContent>
           </Card>
         </div>

         {/* Liste Tarafı */}
         <div className="space-y-4">
           {loading ? (
             <div className="text-slate-500">Şablonlar yükleniyor...</div>
           ) : templates.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-center border-2 border-dashed rounded-lg dark:border-slate-800">
                <BookTemplate className="w-8 h-8 opacity-20 mb-2" />
                <p>Henüz kayıtlı bir şablonunuz bulunmuyor.</p>
             </div>
           ) : (
             templates.map((t) => (
               <Card key={t.id} className="transition-all hover:shadow-md">
                 <CardHeader className="py-4">
                   <div className="flex items-center justify-between">
                     <CardTitle className="text-lg flex items-center gap-2">
                       <Leaf className="w-4 h-4 text-emerald-500" /> {t.name}
                     </CardTitle>
                     <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-900" onClick={() => handleEdit(t)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 border-red-200 dark:border-red-900" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400 pb-5">
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                     <div><span className="font-semibold text-slate-800 dark:text-slate-200">Kahvaltı:</span> {t.breakfast}</div>
                     <div><span className="font-semibold text-slate-800 dark:text-slate-200">Öğle:</span> {t.lunch}</div>
                     <div><span className="font-semibold text-slate-800 dark:text-slate-200">Akşam:</span> {t.dinner}</div>
                     <div><span className="font-semibold text-slate-800 dark:text-slate-200">Ara:</span> {t.snacks}</div>
                   </div>
                 </CardContent>
               </Card>
             ))
           )}
         </div>
      </div>
    </div>
  );
}
