import React, { useEffect, useState } from "react";
import { http } from "../../api/http";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/admin/settings");
      setSettings(data);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    await http.put("/api/admin/settings", settings);
    setSaving(false);
  };

  if (!settings) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>System Settings</h2>
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, width: 420, boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
        <div style={{ marginBottom: 12 }}>
          <label>Evaluation Threshold</label>
          <input type="number" step="0.01" min="0" max="1" value={settings.evalThreshold} onChange={(e)=>setSettings({...settings, evalThreshold: Number(e.target.value)})} style={{ display: "block", width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={!!settings.permissions?.create} onChange={(e)=>setSettings({...settings, permissions: {...settings.permissions, create: e.target.checked}})} /> Allow Create
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={!!settings.permissions?.delete} onChange={(e)=>setSettings({...settings, permissions: {...settings.permissions, delete: e.target.checked}})} /> Allow Delete
          </label>
        </div>

        <button onClick={save} disabled={saving} style={{ marginTop: 16, padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: 0 }}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}


