import type { VercelRequest, VercelResponse } from "@vercel/node";

// AI 진우의 미션별 응답 패턴
const missionResponses = {
  0: [
    "네, 안녕하세요! 만나서 반가워요!",
    "안녕하세요! 오늘 팬미팅에 와주셔서 정말 고마워요!",
    "반가워요! 저는 진우예요. 이름이 어떻게 되세요?",
    "와! 정말 반가워요! 어디서 오셨어요?",
    "안녕하세요! 오늘 날씨가 정말 좋네요!",
  ],
  1: [
    "와, 정말 멋진 이름이네요! 어디서 오셨어요?",
    "자기소개 잘 들었어요! 저도 더 알고 싶어요.",
    "흥미로운 이야기네요! 취미가 뭐예요?",
    "정말 멋지네요! 평소에 뭘 하시는 걸 좋아해요?",
    "저도 그런 곳 가본 적 있어요! 정말 좋은 곳이죠!",
  ],
  2: [
    "좋은 질문이네요! 저는 음악하는 게 정말 좋아요.",
    "그런 것도 궁금하시는군요! 대답해드릴게요.",
    "저에 대해 관심 가져주셔서 감사해요!",
    "저는 평소에 노래 연습을 많이 해요!",
    "팬분들과 이렇게 대화하는 게 제일 즐거워요!",
  ],
  3: [
    "와, 저도 그런 거 정말 좋아해요! 언제부터 시작하셨어요?",
    "정말 재밌겠네요! 저도 한번 해보고 싶어요.",
    "공통 관심사가 있어서 좋네요! 더 얘기해봐요.",
    "그거 정말 멋진 취미네요! 어떤 부분이 제일 재밌어요?",
    "저도 비슷한 경험이 있어요! 정말 신기하네요!",
  ],
  4: [
    "오늘 정말 즐거웠어요! 또 만나요!",
    "좋은 시간이었어요. 건강하세요!",
    "팬이 되어주셔서 감사해요. 다음에 또 만나요!",
    "오늘 대화가 정말 재밌었어요! 다음 기회에도 꼭 만나요!",
    "앞으로도 응원 많이 해주세요! 사랑해요!",
  ],
};

// 미션 완료 판단 키워드
const missionKeywords = {
  0: ["안녕", "하이", "헬로", "반가", "처음"], // 인사
  1: ["이름", "저는", "제가", "출신", "살아", "학교", "직업"], // 자기소개
  2: ["어떻게", "왜", "언제", "뭐", "무엇", "좋아하는", "취미"], // 질문
  3: ["좋아해", "관심", "취미", "음악", "영화", "운동", "여행"], // 관심사
  4: ["안녕", "잘가", "또 만나", "고마워", "감사", "바이"], // 작별
};

// 메시지에서 미션 완료 여부 판단
function checkMissionCompletion(
  message: string,
  currentMission: number
): boolean {
  const keywords =
    missionKeywords[currentMission as keyof typeof missionKeywords];
  if (!keywords) return false;
  return keywords.some((keyword) => message.includes(keyword));
}

// "진우:" 접두사 제거 함수
function cleanResponse(response: string): string {
  return response.replace(/^진우:\s*/g, "").trim();
}

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
    const { message, currentMission } = req.body;

    // 입력 검증
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (typeof currentMission !== "number") {
      return res.status(400).json({ error: "Current mission is required" });
    }

    // 진우 캐릭터 컨텍스트 생성
    const characterContext = `당신은 K-pop 아이돌 그룹 "사자 보이즈"의 멤버 진우입니다. 
팬미팅에서 팬과 대화하고 있습니다. 친근하고 다정하게 한국어로 대답해주세요.
현재 미션: ${currentMission + 1}번째 대화
항상 한국어로만 대답하고, 친근하고 따뜻한 톤으로 말해주세요.`;

    try {
      // Supabase Edge Function 호출 (진우 GPT)
      const supabaseUrl = "https://xluixcfiotmecacgglwo.supabase.co";
      const supabaseKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWl4Y2Zpb3RtZWNhY2dnbHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDY4ODQsImV4cCI6MjA2NzI4Mjg4NH0.Fvp7zdedcspcz40BVOXLXtfEJ_LZKxy4c6WR6z2OgoE";

      const response = await fetch(`${supabaseUrl}/functions/v1/quick-worker`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          characterContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase 진우 GPT API failed: ${response.status}`);
      }

      const gptResult = (await response.json()) as any;
      let aiResponse =
        gptResult.reply || "죄송해요, 잠시 후 다시 말씀해 주세요.";

      // "진우:" 접두사 제거
      aiResponse = cleanResponse(aiResponse);

      // 미션 완료 여부 확인
      const missionCompleted = checkMissionCompletion(message, currentMission);
      const nextMission =
        missionCompleted && currentMission < 4
          ? currentMission + 1
          : currentMission;

      res.status(200).json({
        response: aiResponse,
        missionCompleted: missionCompleted,
        nextMission: nextMission,
        suggestions: [],
      });
    } catch (error) {
      console.error("진우 GPT API call failed:", error);

      // 폴백: 기존 미션별 응답
      const responses =
        missionResponses[currentMission as keyof typeof missionResponses] ||
        missionResponses[0];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      // 미션 완료 여부 확인
      const missionCompleted = checkMissionCompletion(message, currentMission);
      const nextMission =
        missionCompleted && currentMission < 4
          ? currentMission + 1
          : currentMission;

      res.status(200).json({
        response: randomResponse,
        missionCompleted: missionCompleted,
        nextMission: nextMission,
        suggestions: [],
      });
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
