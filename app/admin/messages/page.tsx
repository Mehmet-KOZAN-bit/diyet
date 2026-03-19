"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { MessageCircle, Search, User } from "lucide-react";
import LiveChat from "@/components/shared/LiveChat";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Client {
  id: string; // firestore id
  dietitianId: string;
  name: string;
  email: string;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
         const data = doc.data();
         clientData.push({ id: doc.id, dietitianId: data.dietitianId, name: data.name, email: data.email });
      });
      clientData.sort((a, b) => a.name.localeCompare(b.name));
      setClients(clientData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8">Danışanlar yükleniyor...</div>;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-blue-600" /> Danışan Mesajları
        </h1>
        <p className="text-slate-500 mt-1">Danışanlarınızla canlı olarak mesajlaşın ve sorularını yanıtlayın.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        {/* Sidebar / Client List  */}
        <Card className="md:w-1/3 flex flex-col overflow-hidden border-0 shadow-md">
           <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
             <CardTitle className="text-lg">Danışanlarınız</CardTitle>
             <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Danışan ara..."
                  className="pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
           </CardHeader>
           <CardContent className="flex-1 overflow-y-auto p-0 border-x border-b border-slate-100 dark:border-slate-800 rounded-b-xl">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Danışan bulunamadı.</div>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedClient?.id === client.id;
                    return (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full text-left p-4 transition-all flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600" : "border-l-4 border-transparent"}`}
                      >
                         <div className={`p-2 rounded-full shrink-0 ${isSelected ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                           <User className="w-5 h-5" />
                         </div>
                         <div className="flex-1 truncate">
                           <p className={`font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>{client.name}</p>
                           <p className="text-xs text-slate-500 truncate">{client.email}</p>
                         </div>
                      </button>
                    )
                  })
                )}
              </div>
           </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-md">
          {selectedClient ? (
            <>
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> {selectedClient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 rounded-b-xl relative">
                {user?.uid ? (
                   <LiveChat clientId={selectedClient.id} dietitianId={user.uid} currentUserId={user.uid} />
                ) : null}
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl">
               <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                 <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
               </div>
               <div>
                 <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Mesajlaşmaya Başlayın</p>
                 <p className="text-sm mt-1">Konuşmak istediğiniz danışanı sol taraftaki listeden seçin.</p>
               </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
