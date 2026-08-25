import { Router } from "express";
import { handlePush } from "../services/onenet.js";

const router = Router();

// OneNET 数据推送 URL 校验（GET 请求，原样返回 msg 参数）
router.get("/push", (req, res) => {
  const msg = req.query.msg || "";
  console.log("🔑 OneNET 校验请求, msg:", msg);
  res.type("text/plain").send(msg);
});

// OneNET 数据推送接收端点（POST 请求）
router.post("/push", (req, res) => {
  const ok = handlePush(req.body);
  res.json({ code: ok ? 0 : -1, msg: ok ? "ok" : "格式无法识别" });
});

export default router;
