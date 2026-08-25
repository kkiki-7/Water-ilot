let cachedData = null;
let lastDataTime = null;
let broker = null;
let dataListener = null;
let deviceOnline = false;

export function setDataListener(fn) { dataListener = fn; }

export function setOnline(v) { deviceOnline = v; }

// =========================================================
//  前端查询接口
// =========================================================
export function getCachedData() {
  return cachedData;
}

export function isConnected() {
  return deviceOnline;
}

// =========================================================
//  保存 broker 引用 + 处理单片机上报数据
// =========================================================
export function setBroker(b) {
  broker = b;
}

export function onDeviceData(msg) {
  console.log("📥 单片机上报:", JSON.stringify(msg));

  if (!cachedData) cachedData = { EC: 0, PH: 0, NTU: 0, IMM: 0 };

  if (msg.EC  !== undefined) cachedData.EC  = Number(msg.EC);
  if (msg.PH  !== undefined) cachedData.PH  = Number(msg.PH);
  if (msg.NTU !== undefined) cachedData.NTU = Number(msg.NTU);
  if (msg.IMM !== undefined) cachedData.IMM = Number(msg.IMM);
  cachedData.timestamp = Date.now();
  lastDataTime = Date.now();

  if (dataListener) dataListener({ ...cachedData });
}

// =========================================================
//  指令下发（MQTT publish → device/command）
// =========================================================
export function publishCommand(type, value) {
  return new Promise((resolve, reject) => {
    if (!broker) return reject(new Error("MQTT Broker 未启动"));

    const payload = JSON.stringify({ [type]: value });
    broker.publish(
      { topic: "device/command", payload, qos: 1, retain: true },
      (err) => {
        if (err) return reject(err);
        console.log(`📤 MQTT 下发: device/command → ${payload}`);
        resolve({ code: 0, msg: "指令已下发" });
      }
    );
  });
}
