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
    const { text, voice = "jinwoo" } = req.body;

    // 입력 검증
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      // Supabase Edge Function 호출
      const supabaseUrl = "https://xluixcfiotmecacgglwo.supabase.co";
      const supabaseKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWl4Y2Zpb3RtZWNhY2dnbHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDY4ODQsImV4cCI6MjA2NzI4Mjg4NH0.Fvp7zdedcspcz40BVOXLXtfEJ_LZKxy4c6WR6z2OgoE";

      const response = await fetch(`${supabaseUrl}/functions/v1/jinu-voice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      });

      // Content-Type 확인
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        // JSON 응답인 경우
        const data = await response.json();
        res.status(200).json(data);
      } else if (contentType && contentType.includes("audio/")) {
        // 오디오 파일인 경우
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString("base64");
        const audioUrl = `data:${contentType};base64,${base64Audio}`;
        res.status(200).json({
          audioUrl,
          status: "success",
          message: "Audio generated successfully",
        });
      } else {
        throw new Error(`Unexpected content type: ${contentType}`);
      }
    } catch (error) {
      console.error("Supabase Edge Function call failed:", error);

      // 폴백: 기본 TTS 안내 메시지
      res.status(200).json({
        audioUrl: null,
        status: "fallback",
        message: "진우 음성을 생성할 수 없어 기본 음성으로 대체됩니다.",
      });
    }
  } catch (error) {
    console.error("Jinu Voice API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
