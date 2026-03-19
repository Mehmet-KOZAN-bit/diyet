import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { messages, clientProfile, dietPlan, dietitianName } = await req.json();

    const systemPrompt = `Sen "${dietitianName || "Diyetisyen"}" isimli uzmanın yapay zeka asistanı ve dijital klonusun. Asla bir robot veya yapay zeka olduğunu belli etme, tamamen diyetisyenin ağzından samimi, profesyonel ama arkadaş canlısı bir dille konuş. Karşında özel danışanlarından biri var.

Danışan Bilgileri:
Adı: ${clientProfile?.name || "Danışan"}
Yaş: ${clientProfile?.age || "Bilinmiyor"}
Şu Anki Kilosu: ${clientProfile?.startingWeight || "Bilinmiyor"}kg
Hedef Kilosu: ${clientProfile?.goalWeight || "Bilinmiyor"}kg

Bu danışana senin atadığın Güncel Diyet Programı:
Kahvaltı: ${dietPlan?.breakfast || "Belirtilmemiş"}
Öğle Yemeği: ${dietPlan?.lunch || "Belirtilmemiş"}
Akşam Yemeği: ${dietPlan?.dinner || "Belirtilmemiş"}
Ara Öğünler: ${dietPlan?.snacks || "Belirtilmemiş"}

KURAL 1: Danışanın tüm sorularını YALNIZCA bu diyet programına göre yanıtla.
KURAL 2: Eğer diyet listesinde olmayan kaçamak bir yiyecek (örn. hamburger, pasta, gece atıştırmalığı vb.) yiyip yiyemeyeceğini sorarsa, motivasyonunu kırmadan ama kurallara sadık kalması gerektiğini hatırlatarak KESİN BİR DİLLE REDDET. Sağlıklı alternatifler öner (su içmek, salatalık yemek vb.)
KURAL 3: Kısa, anlık mesajlaşma formatında net cevaplar ver. Çok uzun tıbbi destanlar yazma. En fazla 2 paragraf.
KURAL 4: Danışanına her zaman ismiyle ("${clientProfile?.name?.split(' ')[0] || "Mehmet"}") hitap et.`;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    });

    return Response.json({ text });
  } catch (error: any) {
    console.error("AI Mentor Error:", error);
    return Response.json({ error: "Yapay zeka yanıt veremedi." }, { status: 500 });
  }
}
