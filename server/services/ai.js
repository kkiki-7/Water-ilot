import { ProxyAgent, fetch as undiciFetch } from "undici";

const { AI_API_KEY, AI_BASE_URL, AI_MODEL, HTTPS_PROXY } = process.env;

// 代理配置（国内访问 MiMo API）
const proxyAgent = HTTPS_PROXY ? new ProxyAgent(HTTPS_PROXY) : undefined;
const fetchWithProxy = proxyAgent
  ? (url, opts) => undiciFetch(url, { ...opts, dispatcher: proxyAgent })
  : fetch;

const THRESHOLDS = {
  ph:   { good: [6.5, 8.5], warn: [6.0, 9.0] },
  ntu:  { good: [0, 5],   warn: [0, 25] },
  ec:   { good: [0, 200], warn: [0, 800] },
  imm:  { dry: 0, wet: 1 }
};

// =========================================================
//  本地规则分析（备用 / 无 API Key 时使用）
// =========================================================
function gradeLevel(ph, ntu, ec, imm) {
  const issues = [];
  if (imm === 1) issues.push("检测到水浸");
  if (ph < 6.0 || ph > 9.0) issues.push("PH值异常");
  else if (ph < 6.5 || ph > 8.5) issues.push("PH值偏高/偏低");
  if (ntu > 25) issues.push("浊度过高");
  else if (ntu > 5) issues.push("浊度偏高");
  if (ec > 800) issues.push("EC值严重偏高");
  else if (ec > 200) issues.push("EC值偏高");

  const count = issues.length;
  if (count === 0) return { level: "优", label: "水质优良", color: "#10b981" };
  if (count === 1) return { level: "良", label: "轻微波动", color: "#22c55e" };
  if (count === 2) return { level: "轻度污染", label: "轻度污染", color: "#eab308" };
  if (count === 3) return { level: "中度污染", label: "中度污染", color: "#f97316" };
  return { level: "重度污染", label: "重度污染", color: "#ef4444" };
}

function localDiagnose(ph, ntu, ec, imm) {
  const items = [];
  if (imm === 1) items.push("水源泄漏或外部液体进入，请立即检查设备周围环境。");
  if (ph < 6.0) items.push("PH值过低(pH<6.0)，呈强酸性，可能受工业废水污染，建议暂停取水。");
  else if (ph < 6.5) items.push("PH值偏低(pH<6.5)，呈弱酸性，可能受酸雨或有机质分解影响，建议跟踪监测。");
  else if (ph > 9.0) items.push("PH值过高(pH>9.0)，呈强碱性，可能受碱性工业废料影响，建议暂停取水。");
  else if (ph > 8.5) items.push("PH值偏高(pH>8.5)，呈弱碱性，可能受藻类繁殖或矿物质溶解影响。");
  if (ntu > 25) items.push("浊度严重超标(>25 NTU)，水体悬浮物过多，透明度极低，建议立即处理。");
  else if (ntu > 5) items.push("浊度偏高(>5 NTU)，可能受泥沙、微生物或有机物影响，建议过滤处理。");
  if (ec > 800) items.push("EC值严重偏高(>800 μS/cm)，溶解盐含量过高，可能受海水入侵或工业盐污染。");
  else if (ec > 200) items.push("EC值偏高(>200 μS/cm)，溶解性固体含量上升，建议检查水源盐分来源。");
  if (items.length === 0) items.push("各项指标均在正常范围，水质状况良好，建议保持现有监测频率。");
  return items;
}

function localSuggest(ph, ntu, ec, imm) {
  const tips = [];
  if (imm === 1) tips.push("立即关闭进水阀门，排查泄漏点。");
  if (ph < 6.0 || ph > 9.0) tips.push("暂停使用该水源，取样送实验室确认。");
  else if (ph < 6.5 || ph > 8.5) tips.push("加密PH值监测频率，观察变化趋势。");
  if (ntu > 25) tips.push("启动絮凝沉淀或过滤工艺，降低浊度。");
  else if (ntu > 5) tips.push("检查过滤器运行状态，必要时更换滤芯。");
  if (ec > 800) tips.push("启动反渗透或离子交换装置，降低盐分浓度。");
  else if (ec > 200) tips.push("监控EC值变化趋势，准备启动脱盐设备。");
  if (tips.length === 0) tips.push("维持现有运行参数，定期巡检设备状态。");
  return tips;
}

function localAnalyze(ph, ntu, ec, imm) {
  return {
    grade: gradeLevel(ph, ntu, ec, imm),
    diagnosis: localDiagnose(ph, ntu, ec, imm),
    suggestions: localSuggest(ph, ntu, ec, imm),
    source: "local",
    timestamp: new Date().toISOString()
  };
}

// =========================================================
//  AI API 调用（OpenAI 兼容格式）
// =========================================================
async function aiAnalyze(ph, ntu, ec, imm) {
  const url = `${AI_BASE_URL}/chat/completions`;
  console.log("🔗 AI 请求地址:", url);
  console.log("📦 AI 模型:", AI_MODEL);

  const prompt = `你是一位水质检测专家。请根据以下实时传感器数据进行水质分析。

【传感器数据】
- pH值: ${ph}
- 浊度(NTU): ${ntu}
- 电导率EC(μS/cm): ${ec}
- 水浸状态: ${imm === 1 ? "检测到水浸" : "正常"}

请严格按以下JSON格式返回分析结果（不要返回其他内容）：
{
  "grade": { "level": "优/良/轻度污染/中度污染/重度污染", "label": "简短描述", "color": "#hex颜色" },
  "diagnosis": ["问题诊断1", "问题诊断2"],
  "suggestions": ["建议措施1", "建议措施2"]
}

等级颜色参考：优=#10b981, 良=#22c55e, 轻度污染=#eab308, 中度污染=#f97316, 重度污染=#ef4444
如果水质正常，diagnosis 和 suggestions 也要给出合理的建议。`;

  const resp = await fetchWithProxy(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    }),
    signal: AbortSignal.timeout(60000)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI API ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  const content = json.choices?.[0]?.message?.content || "";
  console.log("📝 AI 原始返回:", content.substring(0, 200));

  // 提取 JSON（兼容 markdown 代码块包裹）
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 返回内容无法解析为 JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  // 校验必要字段
  if (!parsed.grade || !parsed.diagnosis || !parsed.suggestions) {
    throw new Error("AI 返回 JSON 缺少必要字段");
  }

  return {
    grade: parsed.grade,
    diagnosis: parsed.diagnosis,
    suggestions: parsed.suggestions,
    source: "ai",
    timestamp: new Date().toISOString()
  };
}

// =========================================================
//  导出：优先 AI，失败回退本地规则
// =========================================================
export async function analyze(ph, ntu, ec, imm) {
  // 无 API Key 时直接用本地规则
  if (!AI_API_KEY || !AI_BASE_URL) {
    console.log("⚠️ 未配置 AI API，使用本地规则分析");
    return localAnalyze(ph, ntu, ec, imm);
  }

  try {
    console.log(`🤖 调用 AI 分析 (${AI_MODEL})...`);
    const result = await aiAnalyze(ph, ntu, ec, imm);
    console.log("✅ AI 分析完成");
    return result;
  } catch (e) {
    console.log(`⚠️ AI 分析失败 (${e.message})，回退到本地规则`);
    return localAnalyze(ph, ntu, ec, imm);
  }
}
