import React, { useEffect, useState, useRef } from "react";
import { http } from "../../api/http";

export default function AdminQuestionnaires() {
  const [list, setList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [viewDetail, setViewDetail] = useState(null);
  const dropRef = useRef(null);
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/admin/questionnaires");
      setList(data);
    })();
  }, []);

  const refresh = async () => {
    const { data } = await http.get("/api/admin/questionnaires");
    setList(data);
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (uploadTitle.trim()) form.append("title", uploadTitle.trim());
      await http.post("/api/admin/questionnaires/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setUploadTitle("");
      setShowUpload(false);
      await refresh();
    } catch (err) {
      alert(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this questionnaire?")) return;
    await http.delete(`/api/admin/questionnaires/${id}`);
    await refresh();
  };

  const openView = async (id) => {
    try {
      const { data } = await http.get(`/api/admin/questionnaires/${id}`);
      setViewDetail(data);
    } catch {
      setViewDetail(null);
    }
  };

  // drag & drop in upload modal
  useEffect(() => {
    if (!showUpload) return;
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e) => {
      prevent(e);
      const f = e.dataTransfer.files?.[0];
      if (f) setFile(f);
    };
    ["dragenter","dragover","dragleave","drop"].forEach(evt => el.addEventListener(evt, prevent));
    el.addEventListener("drop", onDrop);
    return () => {
      ["dragenter","dragover","dragleave","drop"].forEach(evt => el.removeEventListener(evt, prevent));
      el.removeEventListener("drop", onDrop);
    };
  }, [showUpload]);

  return (
    <div style={{ 
      padding: "32px 150px",
      background: "#f8fafc",
      minHeight: "100vh"
    }}>
      <style>{`
        .modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-card { width: 560px; max-width: calc(100% - 32px); background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.2); padding: 20px; }
        .drop { border: 2px dashed #e5e7eb; border-radius: 16px; height: 220px; display: grid; place-items: center; color: #6b7280; background: #fafafa; }
        .btn { padding: 8px 12px; border-radius: 8px; border: 0; cursor: pointer; }
        .btn-primary { background: #4F46E5; color: #fff; }
        .btn-ghost { background: #f3f4f6; }
        .list-card { background: #fff; padding: 12px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.05); display:flex; justify-content: space-between; align-items:center; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: "600", 
          color: "#1e293b",
          margin: 0
        }}>Questionnaire Management</h2>
        <button className="btn btn-primary" onClick={()=>setShowUpload(true)}>Upload file</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {list.map((q) => (
          <div key={q._id || q.id} className="list-card">
            <div>
              <div style={{ fontWeight: 600 }}>{q.title}</div>
              <div style={{ color: "#6b7280" }}>v{q.version} · {new Date(q.createdAt).toLocaleString?.() || ''}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={()=>openView(q._id || q.id)}>View</button>
              <button className="btn" style={{ background: "#fee2e2", color: "#b91c1c" }} onClick={()=>onDelete(q._id || q.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showUpload && (
        <div className="modal-mask" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 style={{ marginTop: 0 }}>Upload your files</h3>
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#6b7280' }}>Questionnaire title</label>
              <input
                placeholder="e.g., GAD-7"
                value={uploadTitle}
                onChange={(e)=>setUploadTitle(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
              />
            </div>
            <div ref={dropRef} className="drop" onClick={()=>document.getElementById('fileInputHidden')?.click()}>
              {file ? <div>{file.name}</div> : <div>Drag and drop files here</div>}
            </div>
            <input id="fileInputHidden" type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={()=>{ setShowUpload(false); setFile(null); }}>Cancel</button>
              <button className="btn btn-primary" disabled={uploading || !file} onClick={onUpload}>{uploading? 'Uploading...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}

      {viewDetail && (
        <div className="modal-mask" role="dialog" aria-modal="true" onClick={()=>setViewDetail(null)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()} style={{ width: 820 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{viewDetail.title} <span style={{ color: '#6b7280' }}>v{viewDetail.version}</span></h3>
              <button className="btn btn-ghost" onClick={()=>setViewDetail(null)}>Close</button>
            </div>
            {/* matrix header */}
            <div style={{ overflow: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Question</th>
                    {((viewDetail.items?.[0]?.options)||[]).map((opt, i)=> (
                      <th key={i} style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #eee', color: '#6b7280' }}>{opt}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewDetail.items?.map((it, rIdx) => (
                    <tr key={rIdx} style={{ background: rIdx%2? '#f9fafb' : '#fff' }}>
                      <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{it.prompt}</td>
                      {((viewDetail.items?.[0]?.options)||[]).map((_, cIdx)=> (
                        <td key={cIdx} style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


