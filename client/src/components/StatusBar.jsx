export default function StatusBar({ connected, hasData }) {
  const now = new Date();
  const time = now.toLocaleTimeString("zh-CN", { hour12: false });
  const date = now.toLocaleDateString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit", weekday: "short"
  });

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0 22px", flexWrap: "wrap", gap: 12
    }}>
      {/* 左侧：Logo + 标题 */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* 六边形图标 */}
        <div style={{
          width: 46, height: 46,
          background: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(139,92,246,0.15) 100%)",
          border: "1px solid rgba(0,212,255,0.3)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 20px rgba(0,212,255,0.1)",
          position: "relative"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          {/* 旋转环 */}
          <div style={{
            position: "absolute", inset: -4, borderRadius: 14,
            border: "1px solid transparent",
            borderTopColor: "rgba(0,212,255,0.4)",
            animation: "rotate 4s linear infinite"
          }} />
        </div>

        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", margin: 0, lineHeight: 1.2,
            background: "linear-gradient(135deg, #e8edf5 0%, #88c8f0 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            水质数据监测系统
          </h1>
          <div style={{
            fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em", marginTop: 2
          }}>
            WATER QUALITY MONITORING DASHBOARD
          </div>
        </div>
      </div>

      {/* 右侧：状态信息 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        padding: "8px 18px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-card)",
        borderRadius: 30,
      }}>
        {/* 连接状态 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 12, fontWeight: 600
        }}>
          <span className={`status-dot ${connected && hasData ? "online" : "offline"}`} />
          <span style={{
            color: connected && hasData ? "var(--success)" : "var(--danger)",
            fontFamily: "var(--font-mono)", letterSpacing: "0.02em"
          }}>
            {connected && hasData ? "4G ONLINE" : "4G OFFLINE"}
          </span>
        </div>

        {/* 分割线 */}
        <div style={{ width: 1, height: 18, background: "var(--border-card)" }} />

        {/* 时间 */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 15, fontWeight: 700,
            fontFamily: "var(--font-mono)", color: "var(--text-primary)",
            letterSpacing: "0.03em"
          }}>
            {time}
          </div>
          <div style={{
            fontSize: 10, color: "var(--text-muted)",
            letterSpacing: "0.03em"
          }}>
            {date}
          </div>
        </div>
      </div>
    </header>
  );
}
