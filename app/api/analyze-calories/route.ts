const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// v1beta endpoint – required for gemini-1.5-flash (not available in stable v1)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SUPPORTED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const PROMPT = `Bu yemek fotoğrafını analiz et. Sadece aşağıdaki JSON formatında yanıt ver, başka metin veya açıklama ekleme:
{
  "yemekler": [{ "isim": "string", "miktar": "string", "kalori": 0 }],
  "toplamKalori": 0,
  "protein": 0,
  "karbonhidrat": 0,
  "yag": 0,
  "notlar": "string"
}`;

const TEXT_PROMPT = (food: string) => `Bu yiyecekler için kalori ve makro değerlerini hesapla. Sadece JSON:
Yiyecek: ${food}
{
  "yemekler": [{ "isim": "string", "miktar": "string", "kalori": 0 }],
  "toplamKalori": 0,
  "protein": 0,
  "karbonhidrat": 0,
  "yag": 0,
  "notlar": "string"
}`;

function parseGeminiJson(text: string) {
  // Find JSON by locating the first { and last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Yanıt tamamlanmadı (token limiti?): " + text.substring(0, 200));
  }
  try {
    return JSON.parse(text.substring(start, end + 1));
  } catch {
    throw new Error("JSON parse hatası: " + text.substring(start, start + 200));
  }
}

export async function POST(req: Request) {
  console.log("[Calorie API] Request received");

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const manualText = formData.get("text") as string | null;

    console.log("[Calorie API] imageFile:", imageFile?.name, imageFile?.size, imageFile?.type);
    console.log("[Calorie API] manualText:", manualText);

    let requestBody: any;

    if (imageFile && imageFile.size > 0) {
      let mimeType = imageFile.type;
      if (!SUPPORTED_MIMES.includes(mimeType)) {
        console.log("[Calorie API] Unsupported mime, falling back to image/jpeg");
        mimeType = "image/jpeg";
      }

      if (imageFile.size > 4 * 1024 * 1024) {
        return Response.json({ error: "Fotoğraf çok büyük (max 4MB)." }, { status: 400 });
      }

      const bytes = await imageFile.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");
      console.log("[Calorie API] base64 length:", base64Data.length, "mimeType:", mimeType);

      requestBody = {
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
      };
    } else if (manualText?.trim()) {
      requestBody = {
        contents: [{ parts: [{ text: TEXT_PROMPT(manualText.trim()) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
      };
    } else {
      return Response.json({ error: "Fotoğraf veya metin gerekli" }, { status: 400 });
    }

    console.log("[Calorie API] Calling Gemini v1 REST...");
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const rawJson = await response.json();
    console.log("[Calorie API] Gemini status:", response.status);

    if (!response.ok) {
      console.error("[Calorie API] Gemini error:", JSON.stringify(rawJson, null, 2));
      const msg = rawJson?.error?.message || "Gemini API hatası";
      return Response.json({ error: msg }, { status: 500 });
    }

    const text = rawJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("[Calorie API] Gemini raw text:", text.substring(0, 300));

    const data = parseGeminiJson(text);
    console.log("[Calorie API] Parsed data:", JSON.stringify(data));

    return Response.json({ success: true, data });

  } catch (error: any) {
    console.error("[Calorie API] Exception:", error?.message || error);
    return Response.json({ error: error?.message || "Bilinmeyen hata" }, { status: 500 });
  }
}
