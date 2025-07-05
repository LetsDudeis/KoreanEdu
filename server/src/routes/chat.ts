import express, { Request, Response } from "express";

export const chatRouter = express.Router();

interface ChatRequest {
  message: string;
  currentMission: number;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface ChatResponse {
  response: string;
  missionCompleted?: boolean;
  nextMission?: number;
  suggestions?: string[];
}

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

// AI 응답 생성
function generateAIResponse(request: ChatRequest): ChatResponse {
  const { message, currentMission, conversationHistory } = request;

  // 현재 미션에 맞는 응답 선택
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

  return {
    response: randomResponse,
    missionCompleted: missionCompleted,
    nextMission: nextMission,
    suggestions: [],
  };
}

// POST /api/chat - AI 진우와 대화
chatRouter.post("/", (req: any, res: any) => {
  try {
    const chatRequest: ChatRequest = req.body;

    // 입력 검증
    if (!chatRequest.message || typeof chatRequest.message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (typeof chatRequest.currentMission !== "number") {
      return res.status(400).json({ error: "Current mission is required" });
    }

    // AI 응답 생성
    const response = generateAIResponse(chatRequest);

    console.log(
      `🤖 AI Jinwoo: User said "${chatRequest.message}", Mission ${chatRequest.currentMission}`
    );
    console.log(`🤖 AI Jinwoo: Responding with "${response.response}"`);

    res.json(response);
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
