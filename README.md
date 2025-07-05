# 🎤 AI 진우 - 사자 보이즈와 한국어 대화

> **K-pop 아이돌 진우와 실제 목소리로 한국어 대화하는 AI 채팅 앱**

진우의 실제 목소리를 듣고, 한국어로 대화하며 자연스럽게 언어를 학습할 수 있는 멀티모달 AI 채팅 시스템입니다.

## ✨ 주요 기능

- **🎯 AI 진우 대화**: GPT 기반 자연스러운 한국어 대화
- **🎤 음성 인식**: Web Speech API 기반 한국어 STT
- **🔊 진우 목소리**: Supabase TTS로 실제 진우 목소리 재생
- **🌐 실시간 번역**: 한국어 ↔ 영어 즉시 번역
- **🎮 미션 시스템**: 5단계 학습 미션 (인사 → 자기소개 → 질문 → 관심사 → 작별)
- **📱 모바일 최적화**: 반응형 디자인, 터치 친화적 UI

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript + TanStack Router + Tailwind CSS
- **Backend**: Vercel API Routes
- **AI**: Supabase Edge Functions (GPT + TTS)
- **음성**: Web Speech API + Web Audio API

## 🚀 설치 및 실행

```bash
# 프로젝트 클론
git clone <repository-url>
cd korea

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 접속: http://localhost:3000
```

## 📁 프로젝트 구조

```
├── api/                      # Vercel API Routes
│   ├── health.ts            # 서버 상태 확인
│   ├── chat.ts              # AI 진우 채팅 API
│   ├── jinu-voice.ts        # 진우 음성 생성 API
│   ├── translate.ts         # 번역 API
│   └── missions.ts          # 미션 관리 API
│
├── src/                     # React 프론트엔드
│   ├── routes/              # 페이지 라우트
│   │   ├── __root.tsx       # 루트 레이아웃
│   │   ├── index.tsx        # 홈 화면
│   │   └── chat.tsx         # 채팅 화면
│   ├── hooks/               # 커스텀 훅
│   │   ├── useSpeechRecognition.ts
│   │   └── useTextToSpeech.ts
│   ├── services/            # API 서비스
│   │   └── api.ts
│   └── main.tsx             # 앱 진입점
```

## 🔌 API 엔드포인트

| 메서드 | 엔드포인트        | 설명                  |
| ------ | ----------------- | --------------------- |
| `GET`  | `/api/health`     | 서버 상태 확인        |
| `POST` | `/api/chat`       | AI 진우와 채팅        |
| `POST` | `/api/jinu-voice` | 진우 목소리 음성 생성 |
| `POST` | `/api/translate`  | 한국어↔영어 번역     |
| `GET`  | `/api/missions`   | 미션 목록 조회        |

## 🎮 사용법

1. **채팅하기**
   - 마이크 버튼으로 한국어 음성 입력
   - 키보드 모드로 텍스트 입력
   - 진우가 실제 목소리로 답변

2. **추가 기능**
   - 🔊 각 메시지 스피커 버튼으로 음성 재생
   - 🌐 번역 버튼으로 한↔영 번역
   - 👁 메시지 숨기기/보이기

3. **미션 진행**
   - 5단계 미션을 순서대로 완료
   - 실시간 진행률 확인

## 🌟 브라우저 지원

| 브라우저 | 채팅 | 음성인식 | 음성재생 | 번역 |
| -------- | ---- | -------- | -------- | ---- |
| Chrome   | ✅   | ✅       | ✅       | ✅   |
| Edge     | ✅   | ✅       | ✅       | ✅   |
| Safari   | ✅   | ⚠️       | ✅       | ✅   |
| Firefox  | ✅   | ❌       | ✅       | ✅   |

**참고**: 음성 인식은 HTTPS 환경에서만 작동합니다.
