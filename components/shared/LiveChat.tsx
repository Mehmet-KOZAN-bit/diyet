"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck } from "lucide-react";

export default function LiveChat({ clientId, dietitianId, currentUserId }: { clientId: string, dietitianId: string, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId || !dietitianId) return;
    
    // We combine IDs to bypass Firestore composite index requirements for simple queries
    const chatRoomId = `${clientId}_${dietitianId}`;
    
    const q = query(
      collection(db, "messages"),
      where("chatRoomId", "==", chatRoomId)
    );

    const unsub = onSnapshot(q, (snap) => {
      // Sort client-side to avoid Firestore orderBy index errors
      const msgs = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
      setMessages(msgs);
      
      // Blue tick logic: mark unread messages sent by the OTHER person as read
      msgs.forEach((msg: any) => {
        if (!msg.read && msg.senderId !== currentUserId) {
          updateDoc(doc(db, "messages", msg.id), { read: true }).catch(console.error);
        }
      });
    });

    return () => unsub();
  }, [clientId, dietitianId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !clientId || !dietitianId) return;

    const chatRoomId = `${clientId}_${dietitianId}`;

    await addDoc(collection(db, "messages"), {
      chatRoomId,
      clientId,
      dietitianId,
      senderId: currentUserId,
      content: newMessage.trim(),
      read: false,
      createdAt: new Date().toISOString()
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Messages Window */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[350px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
             <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
               <Send className="w-6 h-6 text-slate-300 dark:text-slate-600" />
             </div>
             <p>Mesaj geçmişi bulunmuyor. İlk mesajı gönderin!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-slate-400">
                  <span>{new Date(msg.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                  {isMe && (
                    <span className="ml-0.5">
                      {msg.read ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5 opacity-60" />}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Bir mesaj yazın..." 
            className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full px-4" 
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shrink-0 w-10 h-10 shadow-sm transition-all active:scale-95">
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
