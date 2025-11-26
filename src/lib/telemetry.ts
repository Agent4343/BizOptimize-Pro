type TelemetryPayload = Record<string, unknown>;

export function trackEvent(name: string, payload: TelemetryPayload = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[telemetry] ${name}`, payload);
    return;
  }
  if (typeof window !== "undefined" && "navigator" in window && typeof window.navigator.sendBeacon === "function") {
    const body = JSON.stringify({
      name,
      payload,
      timestamp: Date.now(),
    });
    const blob = new Blob([body], { type: "application/json" });
    window.navigator.sendBeacon("/api/telemetry", blob);
  }
}
