"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Instagram, Award } from "lucide-react";

interface Props {
  clientName: string;
  startingWeight: number;
  currentWeight: number;
  dietitianName?: string;
}

export default function InstagramShareButton({ clientName, startingWeight, currentWeight, dietitianName = "Diyetisyenim" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      // Create a temporary container to render the story
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "1080px";
      container.style.height = "1920px";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.justifyContent = "center";
      container.style.alignItems = "center";
      container.style.background = "linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)";
      container.style.color = "white";
      container.style.fontFamily = "system-ui, -apple-system, sans-serif";
      container.style.overflow = "hidden";
      
      const diff = (startingWeight - currentWeight).toFixed(1);
      const isLost = currentWeight < startingWeight;

      container.innerHTML = `
        <div style="position: absolute; top: 80px; left: 0; width: 100%; text-align: center; opacity: 0.8; font-size: 40px; font-weight: bold; letter-spacing: 4px;">
          DİYETİSYEN PRO
        </div>

        <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 60px; padding: 120px 80px; width: 850px; text-align: center; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 30px 60px rgba(0,0,0,0.2);">
          
          <div style="background: white; width: 160px; height: 160px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 60px auto; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          </div>

          <h1 style="font-size: 80px; font-weight: 800; margin: 0 0 20px 0; line-height: 1.1;">BAŞARIM!</h1>
          <p style="font-size: 50px; opacity: 0.9; margin: 0 0 80px 0;">${clientName}</p>
          
          <div style="display: flex; justify-content: space-around; background: rgba(0,0,0,0.2); border-radius: 40px; padding: 60px 20px; margin-bottom: 80px;">
            <div>
              <div style="font-size: 36px; opacity: 0.8; margin-bottom: 15px;">Başlangıç</div>
              <div style="font-size: 70px; font-weight: bold;">${startingWeight} <span style="font-size: 40px;">kg</span></div>
            </div>
            <div style="width: 4px; background: rgba(255,255,255,0.2); border-radius: 4px;"></div>
            <div>
              <div style="font-size: 36px; opacity: 0.8; margin-bottom: 15px;">Şu An</div>
              <div style="font-size: 70px; font-weight: bold;">${currentWeight} <span style="font-size: 40px;">kg</span></div>
            </div>
          </div>

          <div style="font-size: 110px; font-weight: 900; background: linear-gradient(to right, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 40px; text-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);">
            ${isLost ? '-' : '+'}${Math.abs(Number(diff))} KG
          </div>
          
          <p style="font-size: 45px; font-weight: 500; opacity: 0.9;">
            ${dietitianName} ile <br/> ${isLost ? 'harika bir ilerleme kaydettim!' : 'yolculuğum devam ediyor!'}
          </p>

        </div>

        <div style="position: absolute; bottom: 100px; left: 0; width: 100%; text-align: center; opacity: 0.6; font-size: 36px;">
          Sen de aramıza katıl ✨
        </div>
      `;

      document.body.appendChild(container);

      // We wait for fonts and layout
      await new Promise(r => setTimeout(r, 100));

      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(container, {
        scale: 1, // 1080x1920 is already high res
        backgroundColor: null,
        logging: false
      });

      document.body.removeChild(container);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Görsel oluşturulamadı.");
          setLoading(false);
          return;
        }

        const file = new File([blob], "diyet-basari.png", { type: "image/png" });

        // Try native share API first (Instagram Stories support this on mobile)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Diyet Başarım",
              text: "Instagram hikayemde paylaşıyorum! ✨"
            });
          } catch (e) {
            console.log("Paylaşım iptal edildi veya desteklenmiyor.", e);
          }
        } else {
          // Fallback: Download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "diyet-basari.png";
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          alert("Görsel cihazınıza indirildi! Şimdi Instagram Hikayeler'e ekleyebilirsiniz.");
        }
        setLoading(false);
      }, "image/png", 1.0);

    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      disabled={loading}
      className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all border-0 flex items-center gap-2"
    >
      {loading ? (
        <span className="animate-pulse">Hazırlanıyor...</span>
      ) : (
        <>
          <Instagram className="w-5 h-5" />
          <span className="hidden sm:inline">Hikayede Paylaş</span>
          <span className="sm:hidden">Paylaş</span>
        </>
      )}
    </Button>
  );
}
