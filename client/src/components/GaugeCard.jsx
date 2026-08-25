import { useMemo } from "react";
import { getStatus, THRESHOLDS } from "../data/thresholds";

function describeArc(cx, cy, r, startAngle, endAngle) {
  const rad = (a) => (a * Math.PI) / 180;
  return `M ${cx + r * Math.cos(rad(startAngle))} ${cy + r * Math.sin(rad(startAngle))} ` +
    `A ${r} ${r} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ` +
    `${cx + r * Math.cos(rad(endAngle))} ${cy + r * Math.sin(rad(endAngle))}`;
}

function ArcGauge({ value, min, max, color, unit }) {
  const r = 56, cx = 66, cy = 64;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));

  return (
    <svg viewBox="0 0 132 115" style={{ width: "100%", maxWidth: 210 }}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="50%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 背景弧 */}
      <path
        d={describeArc(cx, cy, r, 215, 325)}
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" strokeLinecap="round"
      />

      {/* 刻度线 */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const angle = 215 + tick * 110;
        const rad = (angle * Math.PI) / 180;
        const inner = r - 18, outer = r + 2;
        return (
          <line key={tick}
            x1={cx + inner * Math.cos(rad)} y1={cy + inner * Math.sin(rad)}
            x2={cx + outer * Math.cos(rad)} y2={cy + outer * Math.sin(rad)}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round"
          />
        );
      })}

      {/* 数据弧 */}
      <path
        d={describeArc(cx, cy, r, 215, 215 + pct * 110)}
        fill="none" stroke={`url(#g-${color})`} strokeWidth="12"
        strokeLinecap="round" filter={`url(#glow-${color})`}
        style={{ transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />

      {/* 中心数值 */}
      <text x={cx} y={cy - 2} textAnchor="middle"
        fill="var(--text-primary)" fontSize="30" fontWeight="700"
        fontFamily="var(--font-mono)" letterSpacing="-1"
        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}>
        {value}
      </text>

      {/* 单位 */}
      <text x={cx} y={cy + 22} textAnchor="middle"
        fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)"
        letterSpacing="0.05em">
        {unit}
      </text>
    </svg>
  );
}

export default function GaugeCard({ type, label, value, animateDelay }) {
  const t = THRESHOLDS[type];
  const status = useMemo(() => getStatus(type, value), [type, value]);
  const statusLabel = status.status === "good" ? (t.goodLabel || "正常") :
                      status.status === "warn" ? "偏高" : "异常";

  return (
    <div className="glass-card animate-in" style={{
      padding: "22px 18px 18px",
      textAlign: "center",
      animationDelay: `${animateDelay || 0}ms`,
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      {/* 标签 */}
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.12em",
        marginBottom: 8,
        fontFamily: "var(--font-mono)"
      }}>
        {label || t?.label}
      </div>

      <ArcGauge value={value} min={t?.min || 0} max={t?.max || 100}
                color={status.color} unit={t?.unit} />

      {/* 状态徽章 */}
      <div style={{
        marginTop: 10, fontSize: 11, fontWeight: 600,
        fontFamily: "var(--font-mono)",
        color: status.color,
        padding: "4px 14px", borderRadius: 20,
        background: `${status.color}12`,
        border: `1px solid ${status.color}30`,
        letterSpacing: "0.03em"
      }}>
        {statusLabel}
      </div>

      {/* 阈值范围 */}
      {t?.good && (
        <div style={{
          marginTop: 8, fontSize: 10, color: "var(--text-muted)",
          fontFamily: "var(--font-mono)"
        }}>
          正常: {t.good[0]}–{t.good[1]}{t.unit}
        </div>
      )}
    </div>
  );
}
