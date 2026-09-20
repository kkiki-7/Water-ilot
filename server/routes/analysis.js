import { Router } from "express";
import { analyze } from "../services/ai.js";

const router = Router();

router.post("/check", async (req, res) => {
  const { ph, ntu, ec, imm } = req.body;

  if (ph == null || ntu == null || ec == null || imm == null) {
    return res.status(400).json({ code: -1, msg: "缺少水质参数 (ph, ntu, ec, imm)" });
  }

  try {
    const result = await analyze(Number(ph), Number(ntu), Number(ec), Number(imm));
    console.log("📊 分析结果:", JSON.stringify(result).substring(0, 200));
    res.json({ code: 0, data: result });
  } catch (e) {
    console.log("❌ 分析路由错误:", e.message);
    res.json({ code: -1, msg: e.message });
  }
});

export default router;
