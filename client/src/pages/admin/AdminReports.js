import React from "react";

export default function AdminReports() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Reports</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, height: 260, color: "#6b7280", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>Trend Chart Placeholder</div>
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, height: 260, color: "#6b7280", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>Group Comparison Placeholder</div>
      </div>
    </div>
  );
}


