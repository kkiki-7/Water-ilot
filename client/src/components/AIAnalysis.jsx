import { useState } from "react";
import { runAnalysis } from "../api";

export default function AIAnalysis({ data }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!data) return;
    setLoading(true);
    try {
      const res = await runAnalysis(data.PH, data.NTU, data.EC, data.IMM);
      if (res && res.code === 0) setAnalysis(res.data);
    } catch {
      // 网络错误时静默处理
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel = analysis?.source === "ai" ? "MiMo AI" : "本地规则";
  const sourceColor = analysis?.source === "ai" ? "var(--accent3)" : "var(--text-muted)";

  return (
    <div className="glass-card animate-in" style={{
      padding: 24, animationDelay: "500ms", height: "100%"
    }}>
      {/* 头部 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))",
            border: "1px solid rgba(139,92,246,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent3)" strokeWidth="2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h3 style={{
            fontSize: 14, fontWeight: 600,
            fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
            color: "var(--text-primary)"
          }}>
            AI 智能分析
          </h3>
        </div>
        <button className="btn btn-accent" style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600 }}
                disabled={loading || !data}
                onClick={handleAnalyze}>
          {loading ? (
            <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,212,255,0.3)", borderTopColor: "var(--accent)", animation: "rotate 0.8s linear infinite" }} /> 分析中...</>
          ) : "▶ 运行分析"}
        </button>
      </div>

      {!analysis ? (
        <div style={{
          minHeight: 180, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
            基于实时数据进行智能诊断
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 分析来源标签 */}
          <div style={{
            display: "flex", justifyContent: "flex-end", marginBottom: -6
          }}>
            <span style={{
              fontSize: 10, fontFamily: "var(--font-mono)",
              color: sourceColor, opacity: 0.8,
              padding: "2px 8px", borderRadius: 8,
              background: analysis.source === "ai" ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${analysis.source === "ai" ? "rgba(139,92,246,0.2)" : "var(--border-subtle)"}`
            }}>
              {sourceLabel}
            </span>
          </div>

          {/* 水质等级 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 18px", borderRadius: "var(--radius-sm)",
            background: `${analysis.grade.color}0D`,
            border: `1px solid ${analysis.grade.color}25`
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `${analysis.grade.color}1A`,
              border: `2px solid ${analysis.grade.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800,
              fontFamily: "var(--font-mono)",
              color: analysis.grade.color,
              boxShadow: `0 0 20px ${analysis.grade.color}25`
            }}>
              {analysis.grade.level}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: analysis.grade.color }}>
                {analysis.grade.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                水质综合评估
              </div>
            </div>
          </div>

          {/* 问题诊断 */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              fontFamily: "var(--font-mono)", marginBottom: 10
            }}>
              问题诊断
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {analysis.diagnosis.map((d, i) => (
                <div key={i} style={{
                  fontSize: 12, color: "var(--text-secondary)",
                  padding: "10px 14px", borderRadius: "var(--radius-xs)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-subtle)",
                  lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start"
                }}>
                  <span style={{ color: "var(--warning)", flexShrink: 0 }}>◆</span>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* 建议措施 */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              fontFamily: "var(--font-mono)", marginBottom: 10
            }}>
              建议措施
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {analysis.suggestions.map((s, i) => (
                <div key={i} style={{
                  fontSize: 12, color: "var(--accent)",
                  padding: "10px 14px", borderRadius: "var(--radius-xs)",
                  background: "rgba(0,212,255,0.04)",
                  border: "1px solid rgba(0,212,255,0.1)",
                  lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start"
                }}>
                  <span>{i + 1}.</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
