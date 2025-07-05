import { useState, useEffect } from "react";

export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = (text: string, lang: string = "ko-KR") => {
    if (!isSupported) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // 조금 더 천천히
    utterance.pitch = 1.1; // 조금 더 높은 톤으로
    utterance.volume = 1.0; // 최대 볼륨 고정

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event: any) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
  };
}
