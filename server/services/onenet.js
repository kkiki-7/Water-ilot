import { onDeviceData, setOnline } from "./device.js";

const { ONENET_PRODUCT_ID, ONENET_DEVICE_ID, ONENET_TOKEN } = process.env;

const BASE = "https://iot-api.heclouds.com";

// =========================================================
//  接收 OneNET 数据推送（OneNET → HTTP POST → 服务端）
// =========================================================
export function handlePush(body) {
  try {
    const msg = typeof body === "string" ? JSON.parse(body) : body;
    console.log("📥 OneNET 推送:", JSON.stringify(msg));

    let payload = {};

    if (msg.dp) {
      for (const key of ["EC", "PH", "NTU", "IMM"]) {
        if (msg.dp[key] && msg.dp[key].length > 0) {
          payload[key] = msg.dp[key][0].v;
        }
      }
    } else if (msg.params) {
      for (const key of ["EC", "PH", "NTU", "IMM"]) {
        if (msg.params[key]) {
          payload[key] = msg.params[key].value ?? msg.params[key];
        }
      }
    } else {
      payload = msg;
    }

    if (Object.keys(payload).length > 0) {
      onDeviceData(payload);
      return true;
    }
    return false;
  } catch (e) {
    console.log("⚠️ 推送解析错误:", e.message);
    return false;
  }
}

// =========================================================
//  HTTP API 请求封装
// =========================================================
async function apiGet(path) {
  const url = `${BASE}${path}`;
  const resp = await fetch(url, { headers: { Authorization: ONENET_TOKEN } });
  const json = await resp.json();
  if (json.code !== 0) throw new Error(json.msg || "API error");
  return json.data;
}

async function apiPost(path, body) {
  const url = `${BASE}${path}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: ONENET_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await resp.json();
  if (json.code !== 0) throw new Error(json.msg || "API error");
  return json;
}

// =========================================================
//  查询设备数据 + 判断在线状态
// =========================================================
// 连续未更新计数（超过阈值 → 离线）
let staleCount = 0;
let lastSeenTime = 0;

export async function queryDeviceData() {
  const data = await apiGet(
    `/thingmodel/query-device-property?product_id=${ONENET_PRODUCT_ID}&device_name=${ONENET_DEVICE_ID}`
  );
  const payload = {};
  let maxTime = 0;
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.value !== undefined) {
        payload[item.identifier] = Number(item.value);
      }
      if (item.time && item.time > maxTime) maxTime = item.time;
    }
  }
  if (Object.keys(payload).length > 0) {
    onDeviceData(payload);
  }

  // 数据时间戳有更新 → 在线；连续 3 次轮询无新数据 → 离线
  if (maxTime > lastSeenTime) {
    lastSeenTime = maxTime;
    staleCount = 0;
  } else {
    staleCount++;
  }
  setOnline(staleCount < 3);
  return payload;
}

// =========================================================
//  设置设备属性（电机/推杆）—— 异步下发，不等设备回复
// =========================================================
export async function setProperty(params) {
  console.log("📤 属性设置:", JSON.stringify(params));
  const url = `${BASE}/thingmodel/set-device-property`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: ONENET_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: ONENET_PRODUCT_ID,
      device_name: ONENET_DEVICE_ID,
      params
    }),
    signal: AbortSignal.timeout(8000)
  });
  const json = await resp.json();
  // code=10411 表示设备响应超时，但指令已通过MQTT下发，视为成功
  if (json.code !== 0 && json.code !== 10411) {
    throw new Error(json.msg || "API error");
  }
  console.log("📤 指令已下发", json.code === 10411 ? "(设备异步处理,不回复)" : "(设备已确认)");
  return json;
}
