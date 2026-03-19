"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, Plus, Search } from "lucide-react";
import { AddClientModal } from "@/components/admin/AddClientModal";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export interface Client {
  id: string; // firestore id
  dietitianId: string;
  name: string;
  email: string;
  age: number;
  height: number;
  startingWeight: number;
  goalWeight: number;
  createdAt: string;
  missedUpdates: boolean;
  userId?: string; // matched auth uid
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "clients"),
      where("dietitianId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientData: Client[] = [];
      snapshot.forEach((doc) => {
        clientData.push({ id: doc.id, ...doc.data() } as Client);
      });
      clientData.sort((a, b) => a.name.localeCompare(b.name));
      setClients(clientData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  const missedUpdatesCount = clients.filter(c => c.missedUpdates).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Yönetim Paneli</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Danışan Ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Danışan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Danışan</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kaçırılan Bildirimler</CardTitle>
            <AlertCircle className={`h-4 w-4 ${missedUpdatesCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missedUpdatesCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danışanlarınız</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Danışan ara..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border dark:border-slate-800">
            <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">İsim</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">E-posta</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Hedef Kilo</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Durum</th>
                    <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="h-24 text-center">Danışanlar yükleniyor...</td>
                    </tr>
                  )}
                  {!loading && filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="h-24 text-center text-slate-500">Hiç danışan bulunamadı.</td>
                    </tr>
                  )}
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b dark:border-slate-800 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium">{client.name}</td>
                      <td className="px-4 py-3 text-slate-500">{client.email}</td>
                      <td className="px-4 py-3">{client.goalWeight} kg</td>
                      <td className="px-4 py-3">
                        {client.missedUpdates ? (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400">
                            Takip Kaçırıldı
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-950/50 dark:border-green-900 dark:text-green-400">
                            Takipte
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/client/${client.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium dark:text-blue-400 dark:hover:text-blue-300">
                          Detaylar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <AddClientModal onClose={() => setIsAddModalOpen(false)} dietitianId={user?.uid || ""} />
      )}
    </div>
  );
}
