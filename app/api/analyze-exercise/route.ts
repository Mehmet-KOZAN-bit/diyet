import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API anahtarı bulunamadı" }, { status: 500 });
    }

    const { text, weight } = await req.json();

    if (!text || !weight) {
      return NextResponse.json({ error: "Egzersiz metni ve kilo bilgisi gereklidir." }, { status: 400 });
    }

    const promptText = `
Sen profesyonel bir diyetisyen ve spor eğitmenisin.
Kullanıcı şu an ${weight} kilogram ağırlığında. 
Şu egzersizi yaptığını söylüyor: "${text}"

Lütfen kullanıcının kilosunu baz alarak bu egzersiz için yaktığı yaklaşık kaloriyi hesapla.
Sadece JSON dön. Asla Markdown veya fazladan metin kullanma.

JSON formatı şu şekilde olmalı:
{
  "aktiviteIsmi": "Tahmin edilen aktivite adı",
  "sure": "Tahmin edilen süre (dk)",
  "yakilanKalori": 0, // Sadece sayı
  "notlar": "Egzersizle ilgili motive edici kısa geri bildirim veya su içme hatırlatması"
}
`;

    const requestBody = {
      contents: [{
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        temperature: 0.2, // Low temperature for more deterministic calculations
        maxOutputTokens: 1024,
      }
    };

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API Error details:", JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || "Gemini API Hatası");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!aiText) throw new Error("Boş yanıt alındı");

    const jsonStartIndex = aiText.indexOf('{');
    const jsonEndIndex = aiText.lastIndexOf('}');
    
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      throw new Error(`Geçersiz JSON formatı. AI Yanıtı: ${aiText}`);
    }

    const jsonStr = aiText.substring(jsonStartIndex, jsonEndIndex + 1);
    const resultObj = JSON.parse(jsonStr);

    return NextResponse.json({ data: resultObj });

  } catch (error: any) {
    console.error("Analyze Exercise Error:", error);
    return NextResponse.json({ error: error.message || "Bilinmeyen bir hata oluştu" }, { status: 500 });
  }
}
