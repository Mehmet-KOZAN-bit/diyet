"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Plus, CheckCircle, Clock3, XCircle } from "lucide-react";

export default function ClientAppointmentsPage() {
  const { user } = useAuth();
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const unsub = onSnapshot(query(collection(db, "clients"), where("email", "==", user.email)), (snap) => {
      if (!snap.empty) {
        setClientProfile({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!clientProfile?.id) return;
    const q = query(
      collection(db, "appointments"), 
      where("clientId", "==", clientProfile.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const apts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      apts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAppointments(apts);
    });
    return () => unsub();
  }, [clientProfile]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime || !clientProfile) return;
    setIsBooking(true);

    try {
      await addDoc(collection(db, "appointments"), {
        clientId: clientProfile.id,
        dietitianId: clientProfile.dietitianId,
        clientName: clientProfile.name,
        date: newDate,
        time: newTime,
        notes: notes,
        status: "pending", // pending, approved, cancelled
        createdAt: new Date().toISOString()
      });
      setNewDate("");
      setNewTime("");
      setNotes("");
      alert("Randevu talebiniz başarıyla oluşturuldu. Diyetisyeninizin onayını bekleyiniz.");
    } catch (err) {
      console.error(err);
      alert("Randevu alınırken hata oluştu.");
    } finally {
      setIsBooking(false);
    }
  };

  const statusIcons = {
    pending: <Clock3 className="w-5 h-5 text-orange-500" />,
    approved: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    cancelled: <XCircle className="w-5 h-5 text-red-500" />
  };

  const statusText = {
    pending: "Onay Bekliyor",
    approved: "Onaylandı",
    cancelled: "İptal Edildi"
  };

  if (!clientProfile) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Randevularım</h1>
        <p className="text-slate-500">Diyetisyeninizden randevu talep edin ve geçmiş randevularınızı görüntüleyin.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Yeni Randevu Talebi</CardTitle>
              <CardDescription>Uygun olduğunuz tarihi ve saati seçin.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBook} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tarih</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Saat</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input type="time" required value={newTime} onChange={e => setNewTime(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notunuz (İsteğe Bağlı)</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Örn: Yüz yüze görüşmek istiyorum." />
                </div>
                <Button type="submit" disabled={isBooking} className="w-full">
                  {isBooking ? "Talebiniz Alınıyor..." : "Randevu Talep Et"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Geçmiş ve Aktif Randevular</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-start gap-4 mb-4 sm:mb-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{new Date(apt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> Saat: {apt.time}</p>
                          {apt.notes && <p className="text-xs text-slate-400 mt-1 italic">"{apt.notes}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 px-3 rounded-lg border dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                        {statusIcons[apt.status as keyof typeof statusIcons]}
                        <span className="text-sm font-medium">{statusText[apt.status as keyof typeof statusText]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-center border-2 border-dashed rounded-lg dark:border-slate-800">
                  <Calendar className="w-8 h-8 opacity-20 mb-2" />
                  <p>Henüz alınmış bir randevunuz bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
