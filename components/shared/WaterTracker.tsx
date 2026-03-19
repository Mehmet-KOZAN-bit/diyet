"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus } from "lucide-react";
import confetti from "canvas-confetti";

export default function WaterTracker({ clientId }: { clientId: string }) {
  const [currentMl, setCurrentMl] = useState(0);
  const targetMl = 2500; // 2.5 Liters (10 glasses)
  const glassMl = 250;

  useEffect(() => {
    if (!clientId) return;

    // We use the local date string as the document ID for daily tracking
    const todayStr = new Date().toISOString().split('T')[0];
    const docRef = doc(db, `clients/${clientId}/water_logs`, todayStr);

    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentMl(docSnap.data().ml || 0);
      } else {
        setCurrentMl(0);
      }
    });

    return () => unsub();
  }, [clientId]);

  const addGlass = async () => {
    if (!clientId) return;
    const newAmount = currentMl + glassMl;
    
    // Trigger confetti if they just hit or passed the target for the first time today
    if (newAmount >= targetMl && currentMl < targetMl) {
      fireConfetti();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const docRef = doc(db, `clients/${clientId}/water_logs`, todayStr);
    
    await setDoc(docRef, {
      ml: newAmount,
      date: todayStr,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#0ea5e9', '#38bdf8']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#0ea5e9', '#38bdf8']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const percentage = Math.min((currentMl / targetMl) * 100, 100);
  const glassesDrank = Math.floor(currentMl / glassMl);
  const totalGlasses = Math.floor(targetMl / glassMl);

  return (
    <Card className="border-0 shadow-md ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden relative group">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          Günlük Su Takibi
        </CardTitle>
        <CardDescription>
          Hedef: {targetMl / 1000}L ({totalGlasses} Bardak)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 flex flex-col md:flex-row items-center gap-8 pt-4">
        {/* Animated Bottle Visualization */}
        <div className="relative w-32 h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 border-[4px] border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner flex shrink-0">
          {/* Glass glare effect */}
          <div className="absolute top-2 right-3 w-4 h-32 bg-white/20 rounded-full mix-blend-overlay z-20 pointer-events-none" />
          
          {/* The Water Fill */}
          <div 
            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-300 dark:from-blue-700 dark:via-blue-500 dark:to-cyan-400 z-10"
            style={{ height: `${percentage}%` }}
          >
            {/* Liquid surface wave simulation (CSS only using rounded pseudo-elements) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[200%] h-6 bg-cyan-300/40 dark:bg-cyan-400/40 rounded-[50%] animate-pulse" />
          </div>

          {/* Liquid markers (25%, 50%, 75%) */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between py-6 pointer-events-none opacity-20 hidden">
            <div className="w-full border-b-2 border-slate-900 border-dashed" />
            <div className="w-full border-b-2 border-slate-900 border-dashed" />
            <div className="w-full border-b-2 border-slate-900 border-dashed" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {currentMl >= 1000 ? (currentMl / 1000).toFixed(1) + " L" : currentMl + " ml"}
              <span className="text-lg text-slate-400 font-medium ml-2">/ {targetMl / 1000} L</span>
            </div>
            <p className="text-slate-500 font-medium mt-1">
              {glassesDrank} / {totalGlasses} Bardak içildi
            </p>
          </div>

          <div className="flex flex-col gap-3 items-center md:items-start">
            {currentMl >= targetMl && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full font-bold text-sm">
                <span className="text-lg">🎉</span> Günlük hedefe başarıyla ulaştın!
              </div>
            )}
            
            <Button 
              onClick={addGlass} 
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-white rounded-full px-6 shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" /> 1 Bardak Su Ekle (+250ml)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
