export default function ImmersionCard({ value }) {
  const isWet = value === 1;

  return (
    <div className="glass-card animate-in" style={{
      padding: "22px 18px 18px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center",
      animationDelay: "300ms"
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.12em",
        fontFamily: "var(--font-mono)", marginBottom: 14
      }}>
        水浸状态
      </div>

      {/* 动画指示器 */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        {/* 外环脉冲 */}
        <div style={{
          position: "absolute", inset: -8, borderRadius: "50%",
          border: `2px solid ${isWet ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.15)"}`,
          animation: isWet ? "glow-pulse 2s infinite" : undefined,
        }} />

        {/* 中心圆 */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: isWet
            ? "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)"
            : "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.03) 100%)",
          border: `3px solid ${isWet ? "rgba(239,68,68,0.5)" : "rgba(16,185,129,0.35)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isWet
            ? "0 0 35px rgba(239,68,68,0.25), inset 0 0 15px rgba(239,68,68,0.08)"
            : "0 0 20px rgba(16,185,129,0.12)",
          transition: "all 0.5s ease"
        }}>
          {/* 水滴或盾牌图标 */}
          {isWet ? (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(239,68,68,0.15)" />
            </svg>
          ) : (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          )}
        </div>

        {/* 波纹动画（有水浸时） */}
        {isWet && (
          <>
            <div style={{
              position: "absolute", inset: -16, borderRadius: "50%",
              border: "1px solid rgba(239,68,68,0.15)",
              animation: "pulse 2s infinite"
            }} />
            <div style={{
              position: "absolute", inset: -24, borderRadius: "50%",
              border: "1px solid rgba(239,68,68,0.08)",
              animation: "pulse 2s infinite 0.5s"
            }} />
          </>
        )}
      </div>

      {/* 状态文字 */}
      <div style={{
        marginTop: 14, fontSize: 18, fontWeight: 700,
        fontFamily: "var(--font-mono)",
        letterSpacing: "-0.3px",
        color: isWet ? "var(--danger)" : "var(--success)",
        textShadow: isWet ? "0 0 15px rgba(239,68,68,0.4)" : "0 0 10px rgba(16,185,129,0.3)"
      }}>
        {isWet ? "⚠ 有水浸" : "✓ 安全"}
      </div>

      <div style={{
        marginTop: 4, fontSize: 11, color: "var(--text-muted)"
      }}>
        {isWet ? "检测到液体渗入" : "设备运行环境干燥"}
      </div>
    </div>
  );
}
