import { Router } from "express";
import { getCachedData, isConnected } from "../services/device.js";

const router = Router();

router.get("/latest", async (_req, res) => {
  const data = getCachedData();
  if (data) {
    return res.json({ code: 0, data });
  }
  return res.json({
    code: 0,
    data: { EC: 0, PH: 0, NTU: 0, IMM: 0, timestamp: Date.now() },
    waiting: true,
    msg: "等待设备上报数据..."
  });
});

router.get("/status", async (_req, res) => {
  res.json({ connected: isConnected(), device: process.env.ONENET_DEVICE_ID });
});

export default router;
