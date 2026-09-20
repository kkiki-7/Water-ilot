const BASE = "/api";

async function request(url, options = {}) {
  const r = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  return r.json();
}

export function fetchSensors() {
  return request("/sensors/latest");
}

export function fetchStatus() {
  return request("/sensors/status");
}

export function controlMotor(cmd) {
  return request("/control/motor", {
    method: "POST",
    body: JSON.stringify({ cmd })
  });
}

export function controlRod(cmd) {
  return request("/control/rod", {
    method: "POST",
    body: JSON.stringify({ cmd })
  });
}

export function controlServo(cmd) {
  return request("/control/servo", {
    method: "POST",
    body: JSON.stringify({ cmd })
  });
}

export function runAnalysis(ph, ntu, ec, imm) {
  return request("/analysis/check", {
    method: "POST",
    body: JSON.stringify({ ph, ntu, ec, imm })
  });
}
