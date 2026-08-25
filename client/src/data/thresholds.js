export const THRESHOLDS = {
  ph:   { good: [6.5, 8.5], warn: [6.0, 9.0], unit: "",    label: "PH值",   min: 0,  max: 14 },
  ntu:  { good: [0, 5],     warn: [0, 25],   unit: "NTU",  label: "浊度",    min: 0,  max: 50 },
  ec:   { good: [0, 200],   warn: [0, 800],  unit: "μS/cm", label: "电导率", min: 0,  max: 300 },
  imm:  { unit: "", label: "水浸状态", dryLabel: "无水浸", wetLabel: "有水浸" }
};

export function getStatus(type, value) {
  const t = THRESHOLDS[type];
  if (!t || !t.good) return { status: "normal", color: "#64748b" };

  if (value >= t.good[0] && value <= t.good[1]) return { status: "good",   color: "#10b981" };
  if (value >= t.warn[0] && value <= t.warn[1]) return { status: "warn",   color: "#eab308" };
  return { status: "bad", color: "#ef4444" };
}
