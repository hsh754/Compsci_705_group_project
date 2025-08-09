// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./auth.css";
import { http } from "../api/http";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/public/user/overview");
      setOverview(data);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
          Completed: {overview?.completed ?? "-"}
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
          Pending: {overview?.pending ?? "-"}
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
          Last Active: {overview?.lastActiveAt ? new Date(overview.lastActiveAt).toLocaleString() : "-"}
        </div>
      </div>
    </div>
  );
}
