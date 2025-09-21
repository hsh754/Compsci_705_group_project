import React, { useEffect, useState, useRef } from "react";
import { http } from "../api/http";

export default function Questionnaire() {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const recorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [showConsent, setShowConsent] = useState(true);
  const [videoBlobs, setVideoBlobs] = useState([]);
  const [reviewMode, setReviewMode] = useState(false); // ⭐ 新增：总览模式

  const stopMedia = () => {
    try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch {}
    try { mediaStreamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    recorderRef.current = null;
    mediaStreamRef.current = null;
    chunksRef.current = [];
  };

  const saveVideoBlob = (blob, questionIndex) => {
    setVideoBlobs(prev => {
      const newBlobs = [...prev];
      newBlobs[questionIndex] = blob;
      return newBlobs;
    });
  };

  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/public/user/questionnaires");
      setList(data);
      setSelectedId(data?.[0]?.id || null);
    })();
  }, []);

  const selected = list.find((q) => q.id === selectedId);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    (async () => {
      const { data } = await http.get(`/api/public/user/questionnaires/${selectedId}`);
      setDetail(data);
      setIdx(0);
      setAnswers({});
      setVideoBlobs([]);
      setReviewMode(false);
    })();
  }, [selectedId]);

  // 开始录制
  useEffect(() => {
    if (!detail || showConsent || reviewMode) return; // 总览模式不录制
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        let options = { mimeType: "video/webm;codecs=vp8,opus" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: "video/webm;codecs=vp9,opus" };
        }
        const rec = new MediaRecorder(stream, options);
        chunksRef.current = [];
        rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };

        const questionIndex = idx;
        rec.onstop = () => {
          const parts = chunksRef.current.slice();
          const blob = new Blob(parts, { type: "video/webm" });
          chunksRef.current = [];
          if (blob.size > 0) {
            saveVideoBlob(blob, questionIndex);
          }
        };

        mediaStreamRef.current = stream;
        recorderRef.current = rec;
        rec.start();
      } catch (e) {
        console.warn("Media permission denied or not available", e);
      }
    })();
    return () => { stopMedia(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, idx, showConsent, reviewMode]);

  useEffect(() => { setShowConsent(true); stopMedia(); }, [selectedId]);

  useEffect(() => {
    const onHide = () => { if (document.hidden) stopMedia(); };
    const onPageHide = () => stopMedia();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
    };
  }, []);

  useEffect(() => { return () => stopMedia(); }, []);

  // 提交函数
  const handleSubmit = async () => {
    const arr = detail.items.map((it, i)=>({
      questionId: it.id,
      optionIndex: typeof answers[i]==='number'? answers[i]: -1
    }));

    const form = new FormData();
    form.append("sessionId", sessionId);
    form.append("answers", JSON.stringify(arr));

    videoBlobs.forEach((blob, i) => {
      if (blob) {
        form.append("videos", blob, `question_${i}.webm`);
      }
    });

    try {
      const { data } = await http.post(
          `/api/public/user/questionnaires/${selectedId}/submitWithVideos`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(
          `Submitted.\n` +
          `Original total score: ${data.totalScore}\n` +
          (data.emotionResults
              ? `Emotion analysis: Completed\nAdjusted total score: ${data.adjustedTotal}`
              : `Emotion analysis: Failed`)
      );

    } catch (e) {
      alert("Submit failed: " + (e?.response?.data?.error || e.message));
    }
  };

  return (
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, padding: 16 }}>
        {/* 左侧问卷列表 */}
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

        {/* 右侧内容：答题 or 总览 */}
        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>{detail?.title || "Preview"}</h3>

            {!reviewMode ? (
                detail?.items?.length > 0 && (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ fontWeight: 600 }}>Question {idx + 1} / {detail.items.length}</div>
                      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                        <div style={{ marginBottom: 8 }}>[{detail.items[idx].type}]</div>
                        <div style={{ fontSize: 16 }}>{detail.items[idx].prompt}</div>
                        {detail.items[idx].options?.length > 0 && (
                            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                              {detail.items[idx].options.map((op, i) => (
                                  <label key={i} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                                    <input type="radio" name={`q_${idx}`} checked={answers[idx]===i} onChange={()=>setAnswers(a=>({...a,[idx]:i}))} />
                                    <span>{op}</span>
                                  </label>
                              ))}
                            </div>
                        )}
                      </div>
                    </div>
                )
            ) : (
                <div>
                  <h4>Review your answers</h4>
                  <ul>
                    {detail.items.map((q,i)=>(
                        <li key={i} style={{ marginBottom: 12 }}>
                          <strong>{q.prompt}</strong><br/>
                          Answer: {typeof answers[i]==='number' ? q.options[answers[i]] : "Not answered"}<br/>
                          Video: {videoBlobs[i] ? "Saved" : "Missing"}
                        </li>
                    ))}
                  </ul>
                </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
            {!reviewMode ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button disabled={!detail} onClick={()=>{
                    try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch {}
                    if (idx >= detail.items.length-1) {
                      setReviewMode(true);
                      stopMedia();
                    } else {
                      setTimeout(() => setIdx(i=>Math.min(detail.items.length-1, i+1)), 0);
                    }
                  }} style={{ padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: 0 }}>
                    Next
                  </button>
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleSubmit} style={{ padding: "8px 12px", borderRadius: 8, background: "#16a34a", color: "#fff", border: 0 }}>
                    Submit
                  </button>
                </div>
            )}
          </div>
        </div>

        {/* 授权提示 */}
        {showConsent && detail && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
              <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,.2)", padding:20, width:420, maxWidth:"calc(100% - 32px)" }}>
                <h3 style={{ marginTop:0 }}>Allow camera and microphone</h3>
                <p style={{ color:"#6b7280" }}>We need access to record a short clip for each question. Click Continue to request permission.</p>
                <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
                  <button onClick={()=>{ setShowConsent(false); }} style={{ padding:"8px 12px", borderRadius:8, background:"#4F46E5", color:"#fff", border:0 }}>Continue</button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
