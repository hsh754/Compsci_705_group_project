import React, { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Results() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/public/user/results");
      setItems(data);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Submission History</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((r) => (
          <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
            <div><b>Questionnaire:</b> {r.questionnaireId}</div>
            <div><b>Submitted At:</b> {new Date(r.submittedAt).toLocaleString()}</div>
            <div><b>Score:</b> {r.score}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: "#fff", borderRadius: 12, padding: 24, textAlign: "center", color: "#6b7280", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
        Chart Placeholder
      </div>
    </div>
  );
}


