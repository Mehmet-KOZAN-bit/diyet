"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, Clock3, XCircle } from "lucide-react";

export default function AdminAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Yalnızca bu diyetisyene ait olan randevuları getirir (index hatasını önlemek için orderBy'ı JS'de yapıyoruz)
    const q = query(
      collection(db, "appointments"), 
      where("dietitianId", "==", user.uid)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const apts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      apts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setAppointments(apts);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const updateStatus = async (id: string, status: "approved" | "cancelled") => {
    try {
      await updateDoc(doc(db, "appointments", id), { status });
    } catch (e) {
      console.error(e);
      alert("Durum güncellenirken hata oluştu.");
    }
  };

  const statusIcons = {
    pending: <Clock3 className="w-5 h-5 text-orange-500" />,
    approved: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    cancelled: <XCircle className="w-5 h-5 text-red-500" />
  };

  const statusText = {
    pending: "Yanıt Bekliyor",
    approved: "Onaylandı",
    cancelled: "İptal Edildi"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Randevu Yönetimi</h1>
        <p className="text-slate-500">Danışanlarınızın oluşturduğu randevu taleplerini inceleyin ve yönetin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Randevular</CardTitle>
          <CardDescription>Yaklaşan ve geçmiş randevu taleplerinin tam listesi.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <p className="text-sm text-slate-500">Randevular yükleniyor...</p>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md">
                  
                  <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{apt.clientName}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {new Date(apt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {apt.time}</p>
                      {apt.notes && <p className="text-xs text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">Not: {apt.notes}</p>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3">
                    <div className="flex items-center gap-2">
                       {statusIcons[apt.status as keyof typeof statusIcons]}
                       <span className="text-sm font-medium">{statusText[apt.status as keyof typeof statusText]}</span>
                    </div>
                    
                    {apt.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                          onClick={() => updateStatus(apt.id, "cancelled")}
                        >
                          İptal Et
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateStatus(apt.id, "approved")}
                        >
                          Onayla
                        </Button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-center border-2 border-dashed rounded-lg dark:border-slate-800">
              <Calendar className="w-8 h-8 opacity-20 mb-2" />
              <p>Hiç randevu talebi bulunmuyor.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
