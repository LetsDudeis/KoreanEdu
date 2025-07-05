// API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// API 응답 타입 정의
export interface ChatRequest {
  message: string;
  currentMission: number;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  missionCompleted?: boolean;
  nextMission?: number;
  suggestions?: string[];
}

export interface JinuVoiceRequest {
  text: string;
  voice?: string;
  [key: string]: any; // 유연한 데이터 구조 허용
}

export interface JinuVoiceResponse {
  audioUrl?: string;
  status?: string;
  message?: string;
  [key: string]: any; // API 응답 구조에 따라 조정 필요
}

// API 호출 함수들
export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // AI 진우와 채팅
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // 미션 정보 가져오기
  static async getMissions(): Promise<string[]> {
    return this.request<string[]>("/missions");
  }

  // 표현 모음집 가져오기
  static async getExpressions(): Promise<any[]> {
    return this.request<any[]>("/expressions");
  }

  // 건강 체크
  static async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health");
  }

  // 진우 음성 API 호출
  static async callJinuVoice(
    request: JinuVoiceRequest
  ): Promise<JinuVoiceResponse> {
    return this.request<JinuVoiceResponse>("/jinu-voice", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // 번역 API 호출
  static async translateText(
    text: string,
    isKorean: boolean
  ): Promise<{ translatedText: string; originalText: string }> {
    return this.request<{ translatedText: string; originalText: string }>(
      "/translate",
      {
        method: "POST",
        body: JSON.stringify({ text, isKorean }),
      }
    );
  }
}

// 폴백 응답 (API 실패 시 사용)
export const fallbackResponses = {
  0: [
    "네, 안녕하세요! 만나서 반가워요!",
    "안녕하세요! 오늘 팬미팅에 와주셔서 정말 고마워요!",
    "반가워요! 저는 진우예요. 이름이 어떻게 되세요?",
  ],
  1: [
    "와, 정말 멋진 이름이네요! 어디서 오셨어요?",
    "자기소개 잘 들었어요! 저도 더 알고 싶어요.",
    "흥미로운 이야기네요! 취미가 뭐예요?",
  ],
  2: [
    "좋은 질문이네요! 저는 음악하는 게 정말 좋아요.",
    "그런 것도 궁금하시는군요! 대답해드릴게요.",
    "저에 대해 관심 가져주셔서 감사해요!",
  ],
  3: [
    "와, 저도 그런 거 정말 좋아해요! 언제부터 시작하셨어요?",
    "정말 재밌겠네요! 저도 한번 해보고 싶어요.",
    "공통 관심사가 있어서 좋네요! 더 얘기해봐요.",
  ],
  4: [
    "오늘 정말 즐거웠어요! 또 만나요!",
    "좋은 시간이었어요. 건강하세요!",
    "팬이 되어주셔서 감사해요. 다음에 또 만나요!",
  ],
};
