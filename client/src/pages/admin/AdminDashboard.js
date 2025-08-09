import React, { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/admin/overview");
      setStats(data);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Overview</h2>
      {!stats ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>Users: {stats.usersTotal}</div>
          <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>Questionnaires: {stats.questionnairesTotal}</div>
          <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>Submissions: {stats.submissionsTotal}</div>
        </div>
      )}
    </div>
  );
}


