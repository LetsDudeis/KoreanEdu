import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text, isKorean } = req.body;

    // 입력 검증
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      // MyMemory Translation API 호출
      const sourceLang = isKorean ? "ko" : "en";
      const targetLang = isKorean ? "en" : "ko";

      const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = (await response.json()) as any;
      const translatedText =
        data.responseData?.translatedText || "Translation failed";

      res.status(200).json({
        translatedText,
        originalText: text,
        sourceLang,
        targetLang,
      });
    } catch (error) {
      console.error("Translation API call failed:", error);

      // 폴백 번역
      const fallbackTranslation = isKorean
        ? "[Translation service unavailable]"
        : "[번역 서비스를 사용할 수 없습니다]";

      res.status(200).json({
        translatedText: fallbackTranslation,
        originalText: text,
        error: "Translation service failed",
      });
    }
  } catch (error) {
    console.error("Translation API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
