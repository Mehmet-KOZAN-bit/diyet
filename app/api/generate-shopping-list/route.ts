import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { dietPlanText } = await req.json();

    if (!dietPlanText) {
       return Response.json({ error: "Diyet planı boş olamaz." }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        shoppingList: z.array(z.string()).describe("A concise array of distinct grocery items needed for the diet. E.g. '3 Adet Domates', '500g Yulaf Ezmesi'. Output must be in Turkish."),
      }),
      prompt: `Sen uzman bir diyetisyensin. Aşağıda verilen günlük diyet planı listesini incele ve buzdolabında eksik olabilecek malzemeler için danışana haftalık detaylı ve gramajlı bir market/alışveriş listesi çıkar. Mümkün olduğunca porsiyon veya adet belirt.\n\nDiyet Planı:\n${dietPlanText}`
    });

    return Response.json(object);
  } catch (error: any) {
    console.error("Gemini AI API Hatası:", error);
    return Response.json({ error: "Alışveriş listesi oluşturulamadı." }, { status: 500 });
  }
}
