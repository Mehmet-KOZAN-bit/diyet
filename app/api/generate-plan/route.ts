import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { clientDesc } = await req.json();

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        breakfast: z.string().describe("Detaylı ve sağlıklı kahvaltı planı (tahmini kalori ile)"),
        lunch: z.string().describe("Detaylı öğle yemeği planı (tahmini kalori ile)"),
        dinner: z.string().describe("Detaylı akşam yemeği planı (tahmini kalori ile)"),
        snacks: z.string().describe("Meyve, badem vs ara öğün planı (tahmini kalori ile)"),
      }),
      prompt: `Sen uzman bir diyetisyensin. Aşağıdaki hasta bilgileri için özel, bol çeşitli, gramajlı ve açıklayıcı temiz beslenme temelli bir diyet menüsü hazırla. Öğünleri Türkçe yaz ve yanlarına tahmini kalorilerini (Örn: "2 tam yumurta... (300 kcal)") ekle.\n\nHasta Bilgileri: ${clientDesc}`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Gemini AI API Hatası:", error);
    return Response.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
