import React, { useEffect, useState, useRef } from "react";
import { http } from "../api/http";
import SurveyIntro from "../components/SurveyIntro";
import SurveyConsent from "../components/SurveyConsent";

import RecordingPreview from "../components/RecordingPreview";
import ProgressSteps from "../components/ProgressSteps";
import EmojiOptions from "../components/EmojiOptions";
import NextArrowButton from "../components/NextArrowButton";
import "../components/survey.css";
import LoadingOverlay from "../components/LoadingOverlay";

const STAGE = {
  INTRO: "intro",
  CONSENT: "consent",
  QUIZ: "quiz",
  REVIEW: "review",
};

export default function Questionnaire() {
  // 数据与答题状态
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [videoBlobs, setVideoBlobs] = useState([]);
  const [stage, setStage] = useState(STAGE.INTRO);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));

  const [recState, setRecState] = useState("inactive"); // "inactive" | "recording" | "paused"
  const [liveStream, setLiveStream] = useState(null);

  // 录制相关引用
  const recorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState("Uploading videos …");
  const [uploadPct, setUploadPct] = useState(undefined); // number | undefined

  const stopMedia = () => {
    try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch {}
    try { mediaStreamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    recorderRef.current = null;
    mediaStreamRef.current = null;
    chunksRef.current = [];
  };

  const saveVideoBlob = (blob, questionIndex) => {
    setVideoBlobs(prev => {
      const next = [...prev];
      next[questionIndex] = blob;
      return next;
    });
  };

  // 取问卷列表
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/public/user/questionnaires");
      setList(data);
      setSelectedId(data?.[0]?.id || null);
    })();
  }, []);

  const selected = list.find(q => q.id === selectedId);

  // 取问卷详情
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    (async () => {
      const { data } = await http.get(`/api/public/user/questionnaires/${selectedId}`);
      setDetail(data);
      setIdx(0);
      setAnswers({});
      setVideoBlobs([]);
      setStage(STAGE.INTRO);       // 进入新问卷先回 Intro
      stopMedia();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // 仅在 QUIZ 阶段、且每次换题时开启媒体与录制
  useEffect(() => {
    if (!detail || stage !== STAGE.QUIZ) return;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLiveStream(stream);
        let options = { mimeType: "video/webm;codecs=vp8,opus" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: "video/webm;codecs=vp9,opus" };
        }

        const rec = new MediaRecorder(stream, options);
        chunksRef.current = [];

        rec.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        const questionIndex = idx;      // 绑定当前题号

        rec.onstart = () => setRecState("recording");
        rec.onpause = () => setRecState("paused");
        rec.onresume = () => setRecState("recording");
        rec.onstop = () => {
          const parts = chunksRef.current.slice();
          const blob = new Blob(parts, { type: "video/webm" });
          chunksRef.current = [];
          if (blob.size > 0) saveVideoBlob(blob, questionIndex);
          setRecState("inactive");
        };

        mediaStreamRef.current = stream;
        recorderRef.current = rec;
        rec.start();
      } catch (e) {
        console.warn("Media permission denied or not available", e);
      }
    })();

    return () => { stopMedia();
      setLiveStream(null);
      setRecState("inactive"); };
  }, [detail, idx, stage]);

  // 页面隐藏/关闭时停止媒体
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

  // 提交
  const handleSubmit = async () => {
    const arr = detail.items.map((it, i) => ({
      questionId: it.id,
      optionIndex: typeof answers[i] === 'number' ? answers[i] : -1,
    }));

    const form = new FormData();
    form.append("sessionId", sessionId);
    form.append("answers", JSON.stringify(arr));
    videoBlobs.forEach((blob, i) => { if (blob) form.append("videos", blob, `question_${i}.webm`); });

    setSubmitting(true);
    setSubmitPhase("Uploading videos …");
    setUploadPct(0);

    // 在“分析中”阶段做一个动态省略号动画（纯前端）
    let dots = 0;
    let analyzingTimer;

    try {
      const { data } = await http.post(
          `/api/public/user/questionnaires/${selectedId}/submitWithVideos`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (!evt.total) return;
              const pct = Math.round((evt.loaded / evt.total) * 100);
              setUploadPct(pct);
              if (pct >= 100 && !analyzingTimer) {
                // 进入分析阶段
                setUploadPct(undefined);
                setSubmitPhase("Analyzing your answers …");
                analyzingTimer = setInterval(() => {
                  dots = (dots + 1) % 4;
                  setSubmitPhase(`Analyzing your answers ${".".repeat(dots)}`);
                }, 600);
              }
            },
          }
      );

      // 成功
      clearInterval(analyzingTimer);
      setSubmitting(false);
      alert(
          `Submitted.\n` +
          `Original total score: ${data.totalScore}\n` +
          (data.emotionResults
              ? `Emotion analysis: Completed\nAdjusted total score: ${data.adjustedTotal}`
              : `Emotion analysis: Failed`)
      );
    } catch (e) {
      clearInterval(analyzingTimer);
      setSubmitting(false);
      alert("Submit failed: " + (e?.response?.data?.error || e.message));
    }
  };


  // ---------- 渲染：Intro → Consent → Quiz → Review ----------
  if (!detail) {
    return (
        <div style={{ display:"grid", placeItems:"center", padding:24 }}>
          <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 14px rgba(0,0,0,.06)", padding:24 }}>
            Loading...
          </div>
        </div>
    );
  }

  if (stage === STAGE.INTRO) {
    return <SurveyIntro onContinue={() => setStage(STAGE.CONSENT)} />;
  }

  if (stage === STAGE.CONSENT) {
    return (
        <SurveyConsent
            onBack={() => setStage(STAGE.INTRO)}
            onStart={() => { stopMedia(); setStage(STAGE.QUIZ); }}
        />
    );
  }

  // QUIZ / REVIEW 主体
  return (
      <div
          style={{
            width: "100%",
            minHeight: "calc(100vh - 64px)", // 64px 预估你的顶部导航高度，按需改
            padding: 16,
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            gap: 16,
            background: "var(--page-bg, #f6f7fb)", // 可选：与右侧浅灰一致
          }}
      >
        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>{detail?.title || "Preview"}</h3>

            {stage === STAGE.QUIZ ? (
                detail?.items?.length > 0 && (
                    <div className="sv-col">
                      {/* 顶部进度条 */}
                      <ProgressSteps current={idx} total={detail.items.length} />

                      <div className="sv-row" style={{ alignItems:"flex-start" }}>
                        {/* 左侧：录制预览与音量按钮位 */}
                        <div>
                          <RecordingPreview stream={liveStream} recState={recState} />
                          {/* 如果以后要加静音/音量按钮，可以放这里 */}
                        </div>

                        {/* 右侧：题干与选项 */}
                        <div className="sv-card sv-pad" style={{ flex:1 }}>
                          <div className="q-title">Q{idx + 1}.</div>

                          {/* 问题背景句 */}
                          <div className="q-lead sv-muted">Over the last 2 weeks …</div>

                          {/* 题干正文 */}
                          <div className="q-prompt" style={{ margin:"6px 0 12px" }}>
                            {detail.items[idx].prompt}
                          </div>

                          {/* 表情选项 */}
                          {detail.items[idx].options?.length > 0 && (
                              <EmojiOptions
                                  options={detail.items[idx].options}
                                  value={answers[idx]}
                                  onChange={(val) => setAnswers(a => ({ ...a, [idx]: val }))}
                                  name={`q_${idx}`}
                              />
                          )}

                          {/* 下一题按钮 */}
                          <div style={{ marginTop:18 }}>
                            <NextArrowButton
                                onClick={() => {
                                  try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch {}
                                  if (idx >= detail.items.length - 1) {
                                    setStage(STAGE.REVIEW);
                                    stopMedia();
                                  } else {
                                    setTimeout(() => setIdx(i => Math.min(detail.items.length - 1, i + 1)), 0);
                                  }
                                }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                )
            ) : (
                <div>
                  <h4>Review your answers</h4>
                  <ul>
                    {detail.items.map((q, i) => (
                        <li key={i} style={{ marginBottom: 12 }}>
                          <strong>{q.prompt}</strong><br />
                          Answer: {typeof answers[i] === 'number' ? q.options[answers[i]] : "Not answered"}<br />
                          Video: {videoBlobs[i] ? "Saved" : "Missing"}
                        </li>
                    ))}
                  </ul>
                </div>
            )}
          </div>

          {/* 底部操作区 */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
            {stage === STAGE.QUIZ ? (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                      onClick={() => {
                        // 结束本题录制；onstop 会保存 blob
                        try { recorderRef.current?.state === "recording" && recorderRef.current.stop(); } catch {}
                        if (idx >= detail.items.length - 1) {
                          setStage(STAGE.REVIEW);
                          stopMedia();
                        } else {
                          setTimeout(() => setIdx(i => Math.min(detail.items.length - 1, i + 1)), 0);
                        }
                      }}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#4F46E5", color: "#fff", border: 0 }}
                  >
                    Next
                  </button>
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                      onClick={() => { setStage(STAGE.QUIZ); setIdx(0); stopMedia(); }}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#E5E7EB", color: "#111827", border: 0 }}
                  >
                    Back to questions
                  </button>
                  <button
                      onClick={handleSubmit}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#16a34a", color: "#fff", border: 0 }}
                  >
                    Submit
                  </button>
                </div>
            )}
          </div>
        </div>
        <LoadingOverlay
            open={submitting}
            title={submitPhase}
            subtitle={
              submitPhase.startsWith("Uploading")
                  ? "Large uploads may take a moment."
                  : "This may take 1–3 minutes depending on video length."
            }
            progress={uploadPct}
        />
      </div>
  );
}
