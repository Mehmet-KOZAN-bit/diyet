"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AIMentor({ clientProfile, dietPlan, dietitianName = "Diyetisyen" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message dynamically securely capturing profile state
  useEffect(() => {
    if (clientProfile && messages.length === 0) {
      setMessages([
        { role: "assistant", content: `Merhaba ${clientProfile?.name?.split(' ')[0] || ''}! Ben diyetisyenin ${dietitianName}in akıllı asistanıyım. Diyet listesi, beslenme veya anlık kaçamak krizleri hakkında bana 7/24 soru sorabilirsin. Bugün sana nasıl yardımcı olabilirim? 🍏` }
      ]);
    }
  }, [clientProfile, dietitianName, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          clientProfile,
          dietPlan,
          dietitianName
        })
      });
      
      if (!res.ok) throw new Error("API Hatası");
      const data = await res.json();
      
      setMessages([...newMessages, { role: "assistant", content: data.text }]);
    } catch(err) {
      setMessages([...newMessages, { role: "assistant", content: "Şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar dene." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!clientProfile || !dietPlan) return null; // AI needs context to boot

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
           <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2.5 rounded-full"><Bot className="w-5 h-5" /></div>
                 <div>
                   <h3 className="font-bold text-sm">AI Diyetisyen Klonu</h3>
                   <p className="text-xs text-emerald-100 font-medium tracking-wide">7/24 Akıllı Destek</p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
           </div>

           <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {messages.map((m, i) => (
                 <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm shadow-sm leading-relaxed ${
                     m.role === 'user' 
                     ? 'bg-emerald-600 text-white rounded-br-sm' 
                     : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                   }`}>
                     {m.content}
                   </div>
                 </div>
              ))}
              {loading && (
                 <div className="flex items-start">
                   <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
             <form onSubmit={handleSend} className="flex gap-2">
                <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Diyetinle ilgili bir soru sor..." className="rounded-full flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 px-4" />
                <Button disabled={loading || !input.trim()} type="submit" size="icon" className="rounded-full shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10 shadow-md transition-transform active:scale-95">
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
             </form>
           </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 focus:outline-none hover:bg-emerald-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        >
          <Bot className="w-8 h-8 group-hover:animate-bounce" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
        </button>
      )}
    </div>
  );
}
