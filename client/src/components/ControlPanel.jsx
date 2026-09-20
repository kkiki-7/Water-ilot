import { useState } from "react";
import { controlMotor, controlRod, controlServo } from "../api";

export default function ControlPanel({ connected = true }) {
  const [motorState, setMotorState] = useState("stop");
  const [rodState, setRodState] = useState("stop");
  const [servoState, setServoState] = useState("stop");
  const [loading, setLoading] = useState({});
  const [feedback, setFeedback] = useState(null);

  async function doControl(type, cmd, setState) {
    const key = `${type}-${cmd}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const fnMap = { motor: controlMotor, rod: controlRod, servo: controlServo };
      const nameMap = { motor: "电机", rod: "推杆", servo: "舵机" };
      const fn = fnMap[type];
      const res = await fn(cmd);
      if (res && res.code === 0) {
        setState(cmd);
        showFeedback("success", `${nameMap[type]} 指令已下发`);
      } else {
        showFeedback("error", res?.msg || "指令下发失败");
      }
    } catch {
      showFeedback("error", "网络错误");
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }

  function showFeedback(type, msg) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  }

  const motorLabel = motorState === "forward" ? "正转" : motorState === "back" ? "反转" : "停止";
  const rodLabel = rodState === "extend" ? "伸出" : rodState === "retract" ? "缩回" : "停止";
  const servoLabel = servoState === "left" ? "左转" : servoState === "right" ? "右转" : "停止";
  const motorActive = motorState !== "stop";
  const servoActive = servoState !== "stop";

  return (
    <div className="glass-card animate-in" style={{
      padding: "22px 20px 20px", animationDelay: "400ms"
    }}>
      {/* 标题 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 22
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", color: "var(--text-primary)" }}>
          设备控制
        </h3>
      </div>

      {/* 步进电机 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.03em" }}>
              步进电机
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: motorActive ? "var(--accent)" : "var(--text-muted)",
            padding: "3px 10px", borderRadius: 12,
            background: motorActive ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${motorActive ? "rgba(0,212,255,0.25)" : "var(--border-subtle)"}`,
            transition: "all 0.3s ease"
          }}>
            {motorLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["motor-forward"]}
            onClick={() => doControl("motor", "forward", setMotorState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            正转
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["motor-stop"]}
            onClick={() => doControl("motor", "stop", setMotorState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
            停止
          </button>
          <button
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["motor-back"]}
            onClick={() => doControl("motor", "back", setMotorState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 3 5 12 19 21 19 3"/></svg>
            反转
          </button>
        </div>
      </div>

      {/* 分割线 */}
      <div style={{
        height: 1, margin: "0 0 24px",
        background: "linear-gradient(90deg, transparent, var(--border-card) 20%, var(--border-card) 80%, transparent)"
      }} />

      {/* 电动推杆 */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="20" x2="12" y2="4"/><polyline points="8 8 12 4 16 8"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.03em" }}>
              电动推杆
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: rodState !== "stop" ? "var(--accent2)" : "var(--text-muted)",
            padding: "3px 10px", borderRadius: 12,
            background: rodState !== "stop" ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${rodState !== "stop" ? "rgba(59,130,246,0.25)" : "var(--border-subtle)"}`,
            transition: "all 0.3s ease"
          }}>
            {rodLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["rod-extend"]}
            onClick={() => doControl("rod", "extend", setRodState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
            伸出
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["rod-stop"]}
            onClick={() => doControl("rod", "stop", setRodState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
            停止
          </button>
          <button
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["rod-retract"]}
            onClick={() => doControl("rod", "retract", setRodState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            缩回
          </button>
        </div>
      </div>

      {/* 分割线 */}
      <div style={{
        height: 1, margin: "24px 0 24px",
        background: "linear-gradient(90deg, transparent, var(--border-card) 20%, var(--border-card) 80%, transparent)"
      }} />

      {/* 舵机云台 */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent3)" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.22-8.56"/><path d="M21 3v5h-5"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.03em" }}>
              舵机云台
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: servoActive ? "var(--accent3)" : "var(--text-muted)",
            padding: "3px 10px", borderRadius: 12,
            background: servoActive ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${servoActive ? "rgba(139,92,246,0.25)" : "var(--border-subtle)"}`,
            transition: "all 0.3s ease"
          }}>
            {servoLabel}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["servo-left"]}
            onClick={() => doControl("servo", "left", setServoState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            左转
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["servo-stop"]}
            onClick={() => doControl("servo", "stop", setServoState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
            停止
          </button>
          <button
            className="btn btn-accent"
            style={{ flex: 1, justifyContent: "center", fontSize: 12, fontWeight: 600 }}
            disabled={loading["servo-right"]}
            onClick={() => doControl("servo", "right", setServoState)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            右转
          </button>
        </div>
      </div>

      {/* 反馈信息 */}
      {feedback && (
        <div style={{
          marginTop: 18, padding: "10px 14px", borderRadius: "var(--radius-xs)",
          background: feedback.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${feedback.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          color: feedback.type === "success" ? "var(--success)" : "var(--danger)",
          fontSize: 12, fontFamily: "var(--font-mono)",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: feedback.type === "success" ? "var(--success)" : "var(--danger)"
          }} />
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
