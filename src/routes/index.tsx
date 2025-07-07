import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: ScenarioSelection,
});

function ScenarioSelection() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-center p-4 border-b border-gray-800">
        <h1 className="text-lg font-medium">AI 진우 만나기</h1>
      </header>

      {/* Scenario Description */}
      <section className="p-6">
        <h2 className="text-xl font-semibold mb-4">시나리오</h2>
        <p className="text-gray-300 leading-relaxed">
          사자 보이즈의 진우와 팬미팅에서 만나게 되었어요. 진우가 한국어로 먼저
          인사를 건네며 친근하게 대화를 시작합니다. 진우와 한국어로 자연스럽게
          대화를 나누며 한국어 실력을 늘려보세요.
        </p>
      </section>

      {/* Goal */}
      <section className="px-6 pb-6">
        <h2 className="text-xl font-semibold mb-4">목표</h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-blue-400 font-medium">
            진우와 캐주얼하게 대화 나누기
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Have a casual conversation with Jinwoo
          </p>
        </div>
      </section>

      {/* Missions */}
      <section className="px-6 pb-6">
        <h2 className="text-xl font-semibold mb-4">미션</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1">
              <span className="text-white font-semibold text-sm">1</span>
            </div>
            <div className="flex-1">
              <span className="text-gray-300 text-base block">
                진우에게 인사하고 자기소개해보세요
              </span>
              <span className="text-gray-500 text-sm">
                Greet Jinwoo and introduce yourself
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1">
              <span className="text-white font-semibold text-sm">2</span>
            </div>
            <div className="flex-1">
              <span className="text-gray-300 text-base block">
                일상이나 취미에 대해 이야기해보세요
              </span>
              <span className="text-gray-500 text-sm">
                Talk about your daily life or hobbies
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1">
              <span className="text-white font-semibold text-sm">3</span>
            </div>
            <div className="flex-1">
              <span className="text-gray-300 text-base block">
                진우에게 궁금한 것을 질문해보세요
              </span>
              <span className="text-gray-500 text-sm">
                Ask Jinwoo questions about anything you're curious about
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-800">
        <Link to="/chat">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium">
            시작하기
          </button>
        </Link>
      </div>
    </div>
  );
}
