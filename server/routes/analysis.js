import { Router } from "express";
import { analyze } from "../services/ai.js";

const router = Router();

router.post("/check", (req, res) => {
  const { ph, ntu, ec, imm } = req.body;

  if (ph == null || ntu == null || ec == null || imm == null) {
    return res.status(400).json({ code: -1, msg: "缺少水质参数 (ph, ntu, ec, imm)" });
  }

  const result = analyze(Number(ph), Number(ntu), Number(ec), Number(imm));
  res.json({ code: 0, data: result });
});

export default router;
