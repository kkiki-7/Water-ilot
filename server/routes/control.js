import { Router } from "express";
import { setProperty } from "../services/onenet.js";

const router = Router();

// Motor_Control: f=正转 s=停止 b=反转 (匹配STM32代码)
router.post("/motor", async (req, res) => {
  const { cmd } = req.body;
  const map = { forward: "f", stop: "s", back: "b" };
  const value = map[cmd];
  if (value === undefined) return res.status(400).json({ code: -1, msg: `无效电机指令: ${cmd}` });

  try {
    await setProperty({ Motor_Control: value });
    res.json({ code: 0, cmd });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
});

// Rod_Control: e=伸出 s=停止 r=缩回 (匹配STM32代码)
router.post("/rod", async (req, res) => {
  const { cmd } = req.body;
  const map = { extend: "e", stop: "s", retract: "r" };
  const value = map[cmd];
  if (value === undefined) return res.status(400).json({ code: -1, msg: `无效推杆指令: ${cmd}` });

  try {
    await setProperty({ Rod_Control: value });
    res.json({ code: 0, cmd });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
});

// Servo_Control: l=左转 r=右转 s=停止 (匹配STM32代码)
router.post("/servo", async (req, res) => {
  const { cmd } = req.body;
  const map = { left: "l", right: "r", stop: "s" };
  const value = map[cmd];
  if (value === undefined) return res.status(400).json({ code: -1, msg: `无效舵机指令: ${cmd}` });

  try {
    await setProperty({ Servo_Control: value });
    res.json({ code: 0, cmd });
  } catch (e) {
    res.json({ code: -1, msg: e.message });
  }
});

export default router;
