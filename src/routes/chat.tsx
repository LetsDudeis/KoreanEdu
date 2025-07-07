import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  XMarkIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  EyeSlashIcon,
  EyeIcon,
  ArrowUpIcon,
  MicrophoneIcon,
  StopIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import {
  ApiService,
  fallbackResponses,
  type ChatRequest,
  type JinuVoiceRequest,
} from "../services/api";

export const Route = createFileRoute("/chat")({
  component: ChatScreen,
});

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 저는 진우예요. 오늘 팬미팅에 와주셔서 정말 감사해요! 어떻게 지내셨어요?",
      isUser: false,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [currentMission, setCurrentMission] = useState(0);
  const [completedMissions, setCompletedMissions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
    }>
  >([
    {
      role: "assistant",
      content:
        "안녕하세요! 저는 진우예요. 오늘 팬미팅에 와주셔서 정말 감사해요! 어떻게 지내셨어요?",
    },
  ]);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set());
  const [translatedTexts, setTranslatedTexts] = useState<
    Record<string, string>
  >({});
  const [isCancelled, setIsCancelled] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<Set<string>>(new Set());

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  const { speak } = useTextToSpeech();

  const missions = [
    "1. 진우에게 인사하고 자기소개해보세요",
    "2. 일상이나 취미에 대해 이야기해보세요",
    "3. 진우에게 궁금한 것을 질문해보세요",
  ];

  const handleSendMessage = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage = inputText.trim();
      const newMessage: Message = {
        id: Date.now().toString(),
        text: userMessage,
        isUser: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setIsLoading(true);

      // 대화 히스토리에 사용자 메시지 추가
      const updatedHistory = [
        ...conversationHistory,
        { role: "user" as const, content: userMessage },
      ];
      setConversationHistory(updatedHistory);

      try {
        // API 호출
        const chatRequest: ChatRequest = {
          message: userMessage,
          currentMission,
          conversationHistory: updatedHistory,
        };

        const response = await ApiService.sendMessage(chatRequest);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // 대화 히스토리에 AI 응답 추가
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant" as const, content: response.response },
        ]);

        // Auto-play AI response with Jinu voice
        await handlePlayAudio(response.response, aiMessage.id);

        // 미션 진행 상황 업데이트
        if (response.missionCompleted && response.nextMission !== undefined) {
          setCurrentMission(response.nextMission);
          setCompletedMissions((prev) => prev + 1);
        }
      } catch (error) {
        console.error("API 호출 실패:", error);

        // 폴백 응답 사용
        const fallbackOptions =
          fallbackResponses[currentMission as keyof typeof fallbackResponses] ||
          fallbackResponses[0];
        const randomResponse =
          fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          isUser: false,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant" as const, content: randomResponse },
        ]);
        await handlePlayAudio(randomResponse, aiMessage.id);

        // 간단한 미션 진행 로직 (폴백용)
        if (Math.random() > 0.5 && currentMission < missions.length - 1) {
          setCurrentMission((prev) => prev + 1);
          setCompletedMissions((prev) => prev + 1);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-play initial message from Jinwoo
  useEffect(() => {
    // 컴포넌트가 마운트되면 첫 번째 메시지(진우 인사말) 자동 재생
    const firstMessage = messages[0];
    if (firstMessage && !firstMessage.isUser) {
      handlePlayAudio(firstMessage.text, firstMessage.id);
    }
  }, []); // 빈 dependency array로 마운트 시에만 실행

  // Use transcript from speech recognition
  useEffect(() => {
    if (isCancelled) {
      // 취소된 경우 transcript 무시하고 상태 리셋
      if (!isListening) {
        setIsCancelled(false);
        resetTranscript();
      }
      return;
    }

    if (transcript && !isListening) {
      setInputText(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, isCancelled, resetTranscript]);

  // transcript 실시간 업데이트 처리 (취소되지 않은 경우에만)
  useEffect(() => {
    if (isListening && !isCancelled && transcript) {
      setInputText(transcript);
    }
    // 취소된 경우 입력창을 계속 비워둠
    if (isCancelled) {
      setInputText("");
    }
  }, [transcript, isListening, isCancelled]);

  const handleVoiceRecord = () => {
    if (isKeyboardMode) {
      // 키보드 모드에서는 음성 녹음 비활성화
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 이모티콘 제거 함수
  const removeEmojis = (text: string): string => {
    return text
      .replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        ""
      )
      .trim();
  };

  const handlePlayAudio = async (text: string, messageId: string) => {
    // 이미 재생 중인 경우 중단
    if (playingAudio.has(messageId)) {
      return;
    }

    // 텍스트에서 이모티콘 제거
    const cleanText = removeEmojis(text);

    try {
      // 재생 상태 설정
      setPlayingAudio((prev) => new Set(prev).add(messageId));

      // 진우 음성 API 호출
      const voiceRequest: JinuVoiceRequest = {
        text: cleanText,
        voice: "jinwoo", // 진우 음성으로 설정
      };

      const voiceResponse = await ApiService.callJinuVoice(voiceRequest);

      // API 응답에 따라 음성 재생 처리
      if (voiceResponse.audioUrl) {
        // 음성 URL이 있는 경우 볼륨 증폭해서 재생
        try {
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const response = await fetch(voiceResponse.audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const source = audioContext.createBufferSource();
          const gainNode = audioContext.createGain();

          source.buffer = audioBuffer;
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // 볼륨을 6배로 증폭 (기본 1.0에서 6.0으로)
          gainNode.gain.value = 6.0;

          source.onended = () => {
            setPlayingAudio((prev) => {
              const newSet = new Set(prev);
              newSet.delete(messageId);
              return newSet;
            });
            audioContext.close();
          };

          source.start(0);
        } catch (error) {
          console.error("Web Audio API 재생 실패, 기본 Audio 사용:", error);
          // 폴백: 기본 Audio 사용
          const audio = new Audio(voiceResponse.audioUrl);
          audio.volume = 1.0;
          audio.onended = () => {
            setPlayingAudio((prev) => {
              const newSet = new Set(prev);
              newSet.delete(messageId);
              return newSet;
            });
          };
          audio.onerror = () => {
            console.error("진우 음성 재생 실패, 기본 TTS 사용");
            speak(cleanText);
            setPlayingAudio((prev) => {
              const newSet = new Set(prev);
              newSet.delete(messageId);
              return newSet;
            });
          };
          await audio.play();
        }
      } else {
        // 음성 URL이 없는 경우 기본 TTS 사용
        speak(cleanText);
        setPlayingAudio((prev) => {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("진우 음성 API 호출 실패:", error);
      // 실패 시 기본 TTS 사용
      speak(cleanText);
      setPlayingAudio((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleTranslate = async (
    messageId: string,
    text: string,
    isKorean: boolean
  ) => {
    if (translatedTexts[messageId]) {
      // 이미 번역된 경우 토글
      setTranslatedTexts((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
      return;
    }

    try {
      // ApiService를 통한 번역 API 호출
      const response = await ApiService.translateText(text, isKorean);

      setTranslatedTexts((prev) => ({
        ...prev,
        [messageId]: response.translatedText,
      }));
    } catch (error) {
      console.error("번역 실패:", error);
      // 폴백 번역
      const fallbackTranslation = isKorean
        ? "[번역 서비스 연결 실패]"
        : "[Translation service failed]";

      setTranslatedTexts((prev) => ({
        ...prev,
        [messageId]: fallbackTranslation,
      }));
    }
  };

  const handleToggleVisibility = (messageId: string) => {
    setHiddenMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleCancelRecording = () => {
    setIsCancelled(true); // 취소 플래그 설정
    setInputText(""); // 즉시 입력창 비우기
    stopListening();
    resetTranscript();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center p-4 border-b border-gray-800">
        <h1 className="text-lg font-medium">AI 진우 만나기</h1>
      </header>

      {/* Mission Progress */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">
            미션 진행 상황 ({completedMissions}/{missions.length})
          </span>
          <span className="text-xs text-blue-400 font-medium">
            {Math.round((completedMissions / missions.length) * 100)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedMissions / missions.length) * 100}%` }}
          />
        </div>

        {/* Current Mission */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              completedMissions === missions.length
                ? "bg-green-600"
                : "bg-blue-600"
            }`}
          >
            {completedMissions === missions.length ? (
              <span className="text-white">✓</span>
            ) : (
              <span className="text-white font-semibold text-sm">
                {currentMission + 1}
              </span>
            )}
          </div>
          <span className="text-gray-300 text-sm">
            {completedMissions === missions.length
              ? "🎉 모든 미션 완료! 진우와의 대화가 끝났어요!"
              : missions[currentMission]}
          </span>
        </div>

        {/* Mission Steps Indicator */}
        <div className="flex justify-center space-x-2 mt-3">
          {missions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index < completedMissions
                  ? "bg-green-500"
                  : index === currentMission
                    ? "bg-blue-500"
                    : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isHidden = hiddenMessages.has(message.id);
          const translatedText = translatedTexts[message.id];

          return (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${message.isUser ? "bg-blue-600" : "bg-gray-800"} rounded-lg p-3`}
              >
                {!isHidden && (
                  <>
                    <p className="text-white">{message.text}</p>
                    {translatedText && (
                      <p className="text-gray-300 text-sm mt-1 italic">
                        {translatedText}
                      </p>
                    )}
                  </>
                )}
                {isHidden && (
                  <p className="text-gray-500 italic">메시지가 숨겨졌습니다</p>
                )}

                <div className="flex items-center space-x-3 mt-3">
                  {/* 소리 재생 버튼 */}
                  <button
                    onClick={() => handlePlayAudio(message.text, message.id)}
                    className="hover:bg-gray-700 p-2 rounded-lg"
                    disabled={playingAudio.has(message.id)}
                  >
                    <SpeakerWaveIcon
                      className={`h-5 w-5 ${
                        playingAudio.has(message.id)
                          ? "text-blue-400 animate-pulse"
                          : "text-gray-400 hover:text-blue-400"
                      }`}
                    />
                  </button>

                  {/* 번역 버튼 */}
                  <button
                    onClick={() => {
                      // 한국어 판단 (한글 문자가 포함되어 있으면 한국어로 간주)
                      const isKorean = /[가-힣]/.test(message.text);
                      handleTranslate(message.id, message.text, isKorean);
                    }}
                    className="hover:bg-gray-700 p-2 rounded-lg"
                  >
                    <LanguageIcon
                      className={`h-5 w-5 ${translatedText ? "text-blue-400" : "text-gray-400"} hover:text-blue-400`}
                    />
                  </button>

                  {/* 숨기기/보이기 버튼 */}
                  <button
                    onClick={() => handleToggleVisibility(message.id)}
                    className="hover:bg-gray-700 p-2 rounded-lg"
                  >
                    {isHidden ? (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                    )}
                  </button>

                  {!message.isUser && (
                    <div className="ml-auto">
                      <button className="p-1 rounded bg-gray-700">
                        <ArrowUpIcon className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && handleSendMessage()
              }
              placeholder={
                isLoading
                  ? "진우가 답변 중..."
                  : isKeyboardMode
                    ? "키보드로 입력하세요..."
                    : "음성으로 말해보세요..."
              }
              disabled={isLoading || !isKeyboardMode}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="ml-2 p-1 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              ) : (
                <ArrowUpIcon className="h-5 w-5 text-blue-400" />
              )}
            </button>
          </div>
        </div>

        {/* Voice Input */}
        <div className="mt-4 flex justify-center items-center">
          {/* 고정된 그리드 레이아웃으로 버튼 위치 안정화 */}
          <div className="relative flex items-center justify-center space-x-4">
            {/* 왼쪽 슬롯 - 녹음 취소 버튼 */}
            <div className="w-12 h-12 flex items-center justify-center">
              {isListening ? (
                <button
                  onClick={handleCancelRecording}
                  className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              ) : (
                <div className="w-12 h-12"></div> /* 빈 공간 유지 */
              )}
            </div>

            {/* 중앙 슬롯 - 녹음 버튼 */}
            <div className="w-16 h-16 flex items-center justify-center">
              <button
                onClick={handleVoiceRecord}
                disabled={isKeyboardMode}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isKeyboardMode
                    ? "bg-gray-600 opacity-50 cursor-not-allowed"
                    : isListening
                      ? "bg-red-600 hover:bg-red-700 shadow-lg"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg"
                }`}
              >
                {isListening ? (
                  <StopIcon className="h-8 w-8 text-white" />
                ) : (
                  <MicrophoneIcon className="h-8 w-8 text-white" />
                )}
              </button>
            </div>

            {/* 오른쪽 슬롯 - 키보드 버튼 */}
            <div className="w-12 h-12 flex items-center justify-center">
              <button
                onClick={() => setIsKeyboardMode(!isKeyboardMode)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isKeyboardMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <ComputerDesktopIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 키보드 모드 설명 */}
        {isKeyboardMode && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-400">
              키보드 입력 모드가 활성화되었습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
