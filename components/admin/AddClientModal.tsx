"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export function AddClientModal({ onClose, dietitianId }: { onClose: () => void, dietitianId: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    height: "",
    startingWeight: "",
    goalWeight: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "clients"), {
        dietitianId,
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
        height: Number(formData.height),
        startingWeight: Number(formData.startingWeight),
        goalWeight: Number(formData.goalWeight),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        missedUpdates: false
      });
      onClose();
    } catch (error) {
      console.error("Belge eklenirken hata: ", error);
      alert("Danışan eklenemedi. Konsolu inceleyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <h2 className="text-xl font-semibold">Yeni Danışan Ekle</h2>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ahmet Yılmaz" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ahmet@example.com" />
            <p className="text-xs text-slate-500">Danışan bu e-posta adresi ile kayıt olduğunda sistem tarafından otomatik olarak eşleşecektir.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Yaş</Label>
              <Input id="age" type="number" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Boy (cm)</Label>
              <Input id="height" type="number" required value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingWeight">Başlangıç Kilo (kg)</Label>
              <Input id="startingWeight" type="number" step="0.1" required value={formData.startingWeight} onChange={(e) => setFormData({...formData, startingWeight: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalWeight">Hedef Kilo (kg)</Label>
              <Input id="goalWeight" type="number" step="0.1" required value={formData.goalWeight} onChange={(e) => setFormData({...formData, goalWeight: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Danışan Ekle"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
