import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001", // Vite가 포트를 자동 변경할 때 대비
      /\.vercel\.app$/, // Vercel 도메인 허용
      /\.railway\.app$/, // Railway 도메인 허용
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  5: [
    "오늘 하루 정말 최고였어요! 당신 덕분이에요.",
    "저는 오늘 팬분들 만날 생각에 정말 설렜어요!",
    "오늘 정말 바빴지만, 팬분들 덕분에 힘이 나요!",
    "오늘 컨디션 최상이에요! 뭐든 물어보세요!",
    "사실 조금 피곤했는데, 당신을 보니 에너지가 생겨요!",
  ],
};

// 미션 완료 판단 키워드
const missionKeywords = {
  0: ["안녕", "하이", "헬로", "반가", "처음"], // 인사
  1: ["이름", "저는", "제가", "출신", "살아", "학교", "직업"], // 자기소개
  2: ["어떻게", "왜", "언제", "뭐", "무엇", "좋아하는", "취미"], // 질문
  3: ["좋아해", "관심", "취미", "음악", "영화", "운동", "여행"], // 관심사
  4: ["안녕", "잘가", "또 만나", "고마워", "감사", "바이"], // 작별
  5: ["오늘", "하루", "어땠", "어떠셨", "보냈"], // 하루 안부
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "AI Jinwoo Server is running!" });
});

// 진우 음성 API - Supabase Edge Function 호출
app.post("/api/jinu-voice", async (req: Request, res: Response) => {
  try {
    const { text, voice = "jinwoo" } = req.body;

    // 입력 검증
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      // Supabase Edge Function 호출
      const supabaseUrl =
        process.env.SUPABASE_URL || "https://xluixcfiotmecacgglwo.supabase.co";
      const supabaseKey =
        process.env.SUPABASE_ANON_KEY ||
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
        res.json(data);
      } else if (contentType && contentType.includes("audio/")) {
        // 오디오 파일인 경우
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString("base64");
        const audioUrl = `data:${contentType};base64,${base64Audio}`;
        res.json({
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
      res.json({
        audioUrl: null,
        status: "fallback",
        message: "진우 음성을 생성할 수 없어 기본 음성으로 대체됩니다.",
      });
    }
  } catch (error) {
    console.error("Jinu Voice API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 번역 API - MyMemory Translation API 사용
app.post("/api/translate", async (req: Request, res: Response) => {
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

      res.json({
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

      res.json({
        translatedText: fallbackTranslation,
        originalText: text,
        error: "Translation service failed",
      });
    }
  } catch (error) {
    console.error("Translation API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// "진우:" 접두사 제거 함수
function cleanResponse(response: string): string {
  return response.replace(/^진우:\s*/g, "").trim();
}

// 이모지 제거 함수
function removeEmojis(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    ""
  );
}

// Chat API - 진우 GPT API 사용
app.post("/api/chat", async (req: Request, res: Response) => {
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
      const supabaseUrl =
        process.env.SUPABASE_URL || "https://xluixcfiotmecacgglwo.supabase.co";
      const supabaseKey =
        process.env.SUPABASE_ANON_KEY ||
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
        missionCompleted && currentMission < 5
          ? currentMission + 1
          : currentMission;

      res.json({
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
        missionCompleted && currentMission < 5
          ? currentMission + 1
          : currentMission;

      res.json({
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
});

// Missions API
app.get("/api/missions", (req, res) => {
  const missions = [
    "진우에게 인사해보세요",
    "자기소개를 해보세요",
    "진우에게 질문해보세요",
    "관심사에 대해 이야기해보세요",
    "진우와 작별 인사를 해보세요",
    "오늘 하루 어땠는지 물어보세요",
  ];
  res.json(missions);
});

// Expressions API
app.get("/api/expressions", (req, res) => {
  const coreExpressions = [
    {
      id: "1",
      korean: "안녕하세요. 만나서 반가워요!",
      english: "Hi. Nice to meet you!",
      category: "core",
    },
    {
      id: "2",
      korean: "잘 지내고 계세요?",
      english: "How's it going?",
      category: "core",
    },
    {
      id: "3",
      korean: "이름이 어떻게 되세요?",
      english: "What's your name?",
      category: "core",
    },
    {
      id: "4",
      korean: "어디서 오셨어요?",
      english: "Where are you from?",
      category: "core",
    },
    {
      id: "5",
      korean: "저는 서울에서 왔어요.",
      english: "I'm from Seoul.",
      category: "core",
    },
  ];

  res.json({
    core: coreExpressions,
    saved: [],
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 AI Jinwoo Server is running on port ${PORT}`);
  console.log(
    `📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});
