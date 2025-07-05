import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const missions = [
    "진우에게 인사해보세요",
    "자기소개를 해보세요",
    "진우에게 질문해보세요",
    "관심사에 대해 이야기해보세요",
    "진우와 작별 인사를 해보세요",
  ];

  res.status(200).json(missions);
}
