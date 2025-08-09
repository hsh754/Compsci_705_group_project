import React, { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Questionnaire() {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/public/user/questionnaires");
      setList(data);
      setSelectedId(data?.[0]?.id || null);
    })();
  }, []);

  const selected = list.find((q) => q.id === selectedId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Question List</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedId(q.id)}
              style={{
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #eee",
                background: selectedId === q.id ? "#f6f7ff" : "#fff",
                cursor: "pointer",
              }}
            >
              {q.title} <span style={{ color: "#6b7280" }}>v{q.version}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ height: 240, background: "#f3f4f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>Video Preview</div>
            <div style={{ height: 240, background: "#f3f4f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>Audio Wave</div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button style={{ padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: 0 }}>Enable Camera</button>
            <button style={{ padding: "8px 12px", borderRadius: 8, background: "#14B8A6", color: "#fff", border: 0 }}>Enable Microphone</button>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
          <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999 }}>
            <div style={{ width: "30%", height: 8, background: "#60a5fa", borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button style={{ padding: "8px 12px", borderRadius: 8, background: "#f3f4f6", border: 0 }}>Previous</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "8px 12px", borderRadius: 8, background: "#f3f4f6", border: 0 }}>Skip</button>
              <button style={{ padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: 0 }}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


