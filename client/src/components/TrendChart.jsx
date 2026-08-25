import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const RANGE_OPTIONS = { "1h": "1H", "6h": "6H", "24h": "24H" };
const COLORS = { EC: "#00d4ff", PH: "#10b981", NTU: "#a855f7" };

export default function TrendChart({ history, onRangeChange, range }) {
  const [chartData, setChartData] = useState([]);

  useState(() => {
    if (!history) return;
    const timeMap = {};
    ["EC", "PH", "NTU"].forEach(key => {
      (history[key] || []).forEach(pt => {
        const t = pt.time || pt.at || pt.timestamp;
        if (!t) return;
        const ts = typeof t === "number" ? t : new Date(t).getTime();
        if (!timeMap[ts]) timeMap[ts] = { time: ts };
        timeMap[ts][key] = pt.value ?? pt.val ?? pt.v;
      });
    });
    const merged = Object.values(timeMap).sort((a, b) => a.time - b.time);
    if (merged.length > 200) {
      const step = Math.floor(merged.length / 200);
      setChartData(merged.filter((_, i) => i % step === 0));
    } else {
      setChartData(merged);
    }
  }, [history]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="glass-card animate-in" style={{ padding: 24 }}>
      {/* 头部 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: 14, fontWeight: 600,
            fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
            color: "var(--text-primary)"
          }}>
            水质趋势
          </h3>
        </div>

        <div style={{ display: "flex", gap: 4, background: "var(--bg-elevated)", borderRadius: 20, padding: 3, border: "1px solid var(--border-card)" }}>
          {Object.entries(RANGE_OPTIONS).map(([k, v]) => (
            <button key={k} onClick={() => onRangeChange(k)}
              style={{
                padding: "5px 14px", fontSize: 11, fontWeight: 600,
                fontFamily: "var(--font-mono)",
                border: "none", borderRadius: 17,
                cursor: "pointer",
                background: range === k ? "rgba(0,212,255,0.15)" : "transparent",
                color: range === k ? "var(--accent)" : "var(--text-muted)",
                transition: "all 0.25s ease"
              }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{
          height: 260, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
            等待数据上报...
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="time" tickFormatter={formatTime}
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }}
              minTickGap={50} axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--text-muted)" }}
              width={55} axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <Tooltip
              labelFormatter={(ts) => new Date(ts).toLocaleString("zh-CN")}
              contentStyle={{
                background: "rgba(10,16,30,0.96)",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 10,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                backdropFilter: "blur(12px)"
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            />
            {["EC", "PH", "NTU"].map(key => (
              <Line key={key} type="monotone" dataKey={key}
                stroke={COLORS[key]} strokeWidth={2}
                dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--bg-primary)" }}
                name={key === "EC" ? "电导率" : key === "PH" ? "PH值" : "浊度"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
