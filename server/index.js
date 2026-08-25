import "./init.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import sensorsRouter from "./routes/sensors.js";
import controlRouter from "./routes/control.js";
import analysisRouter from "./routes/analysis.js";
import onenetRouter from "./routes/onenet.js";
import { queryDeviceData } from "./services/onenet.js";
import { setDataListener } from "./services/device.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/sensors", sensorsRouter);
app.use("/api/control", controlRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/onenet", onenetRouter);

const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket 连接管理
wss.on("connection", (ws) => {
  console.log("🔗 前端 WebSocket 已连接");
  ws.on("close", () => console.log("🔌 前端 WebSocket 断开"));
});

// 收到新数据时推送
setDataListener((data) => {
  const payload = JSON.stringify({ type: "data", data });
  wss.clients.forEach((ws) => {
    if (ws.readyState === 1) ws.send(payload);
  });
});

server.listen(PORT, () => {
  console.log(`✅ HTTP+WS 运行在 http://localhost:${PORT}`);

  // 立即拉一次，之后每 10 秒轮询 OneNET
  queryDeviceData().catch(() => {});
  setInterval(async () => {
    try {
      await queryDeviceData();
    } catch (e) {
      console.log("⚠️ 数据轮询失败:", e.message);
    }
  }, 10000);
});
