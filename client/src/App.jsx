import { useState, useEffect } from "react";
import { fetchSensors } from "./api";
import StatusBar from "./components/StatusBar";
import GaugeCard from "./components/GaugeCard";
import ImmersionCard from "./components/ImmersionCard";
import ControlPanel from "./components/ControlPanel";
import AIAnalysis from "./components/AIAnalysis";
import TrendChart from "./components/TrendChart";

function DataTimestamp({ data }) {
  if (!data?.timestamp) return null;
  const ago = Math.floor((Date.now() - data.timestamp) / 1000);
  const text = ago < 60 ? `${ago}s 前` : ago < 3600 ? `${Math.floor(ago / 60)}m 前` : `${Math.floor(ago / 3600)}h 前`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 10, color: "var(--text-muted)",
      fontFamily: "var(--font-mono)", padding: "4px 12px",
      background: "var(--bg-elevated)", borderRadius: 12,
      border: "1px solid var(--border-subtle)"
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 6px var(--success-glow)" }} />
      数据更新: {text}
    </div>
  );
}

function QuickStat({ label, value, unit, color }) {
  return (
    <div style={{
      padding: "14px 18px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-card)",
      borderRadius: "var(--radius-sm)",
      display: "flex", flexDirection: "column", gap: 4,
      minWidth: 0
    }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-mono)", color: color || "var(--text-primary)", letterSpacing: "-1px" }}>
          {value ?? "--"}
        </span>
        {unit && <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [range, setRange] = useState("1h");
  const [history] = useState(null);

  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "data" && msg.data) {
          setData(msg.data);
          setConnected(true);
        }
      } catch {}
    };

    ws.onopen = () => {
      fetchSensors().then((res) => {
        if (res?.data) { setData(res.data); setConnected(true); }
      });
    };

    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, []);

  const displayEC  = data ? Number(data.EC) : 0;
  const displayPH  = data ? Math.round(Number(data.PH)) : 0;
  const displayNTU = data ? Math.round(Number(data.NTU)) : 0;
  const displayIMM = data ? Number(data.IMM) : 0;
  const hasData = data && connected;

  return (
    <div className="app-container">
      <StatusBar connected={connected} hasData={hasData} />

      {/* 快速数据概览行 */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12,
        marginBottom: 18
      }} className="dashboard-grid">
        <QuickStat label="电导率 EC" value={displayEC} unit="μS/cm" color="var(--accent)" />
        <QuickStat label="PH 值" value={displayPH.toFixed(1)} unit="pH" color="var(--success)" />
        <QuickStat label="浊度 NTU" value={displayNTU} unit="NTU" color="var(--accent3)" />
        <QuickStat label="水浸 IMM" value={displayIMM === 1 ? "⚠ 异常" : "✓ 正常"} color={displayIMM === 1 ? "var(--danger)" : "var(--success)"} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <DataTimestamp data={data} />
        </div>
      </div>

      {/* 主仪表盘 */}
      <div className="dashboard-grid">
        <GaugeCard type="ntu" label="浊度" value={displayNTU} animateDelay={0} />
        <GaugeCard type="ph"  label="PH值" value={displayPH} animateDelay={100} />
        <GaugeCard type="ec"  label="电导率" value={displayEC} animateDelay={200} />
        <ImmersionCard value={displayIMM} />
        <ControlPanel connected={connected} />
      </div>

      {/* 趋势图 + AI 分析 */}
      <div className="chart-section">
        <TrendChart history={history} onRangeChange={setRange} range={range} />
      </div>

      <div className="bottom-grid">
        <AIAnalysis data={hasData ? { PH: displayPH, NTU: displayNTU, EC: displayEC, IMM: displayIMM } : null} />
        {/* 系统信息卡 */}
        <div className="glass-card animate-in" style={{ padding: 24, animationDelay: "600ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(100,200,255,0.08)",
              border: "1px solid rgba(100,200,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: 14, fontWeight: 600,
              fontFamily: "var(--font-mono)", letterSpacing: "0.04em"
            }}>
              系统信息
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              ["设备 ID", "863434088192882"],
              ["接入方式", "OneNET 4G MQTT"],
              ["数据查询", "/thingmodel/query-device-property"],
              ["属性设置", "/thingmodel/set-device-property"],
              ["数据刷新", "10s / 次"],
              ["服务器", `localhost:${location.port || 3001}`],
            ].map(([k, v]) => (
              <div key={k} className="info-row" style={{ padding: "11px 0" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{k}</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
