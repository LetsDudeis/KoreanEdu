import express from "express";

export const missionRouter = express.Router();

const missions = [
  "진우에게 인사해보세요",
  "자기소개를 해보세요",
  "진우에게 질문해보세요",
  "관심사에 대해 이야기해보세요",
  "진우와 작별 인사를 해보세요",
  "오늘 하루 어땠는지 물어보세요",
];

// GET /api/missions - 미션 목록 가져오기
missionRouter.get("/", (req: any, res: any) => {
  try {
    res.json(missions);
  } catch (error) {
    console.error("Missions API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
