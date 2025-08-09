import React, { useEffect, useState } from "react";
import { http } from "../../api/http";
import { Link } from "react-router-dom";

export default function AdminQuestionnaires() {
  const [list, setList] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/admin/questionnaires");
      setList(data);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Questionnaire Management</h2>
      <div style={{ marginBottom: 12 }}>
        <button style={{ padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: 0 }}>Create Questionnaire</button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((q) => (
          <div key={q.id} style={{ background: "#fff", padding: 12, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{q.title}</div>
              <div style={{ color: "#6b7280" }}>v{q.version}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "8px 12px", borderRadius: 8, background: "#f3f4f6", border: 0 }}>Edit</button>
              <button style={{ padding: "8px 12px", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", border: 0 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


