import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // questionnaire state
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [videoBlobs, setVideoBlobs] = useState([]);
  const [stage, setStage] = useState(STAGE.INTRO);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));

  // recording state
  const [recState, setRecState] = useState("inactive"); // "inactive" | "recording" | "paused"
  const [liveStream, setLiveStream] = useState(null);
  const recorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);

  // overlay (single overlay, two-phase: loading -> done)
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState("loading"); // "loading" | "done" | "error"
  const [overlayTitle, setOverlayTitle] = useState("Uploading videos …");
  const [overlaySub, setOverlaySub] = useState("Large uploads may take a moment.");
  const [overlayProgress, setOverlayProgress] = useState(undefined);
  const [resultId, setResultId] = useState(null);

  const stopMedia = () => {
    try {
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
    } catch {}
    try {
      mediaStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch {}
    recorderRef.current = null;
    mediaStreamRef.current = null;
    chunksRef.current = [];
  };

  const saveVideoBlob = (blob, questionIndex) => {
    setVideoBlobs((prev) => {
      const next = [...prev];
      next[questionIndex] = blob;
      return next;
    });
  };

  // fetch list
  useEffect(() => {
    (async () => {
      const { data } = await http.get("/api/public/user/questionnaires");
      setList(data);
      setSelectedId(data?.[0]?.id || null);
    })();
  }, []);

  const selected = list.find((q) => q.id === selectedId);

  // fetch detail
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    (async () => {
      const { data } = await http.get(`/api/public/user/questionnaires/${selectedId}`);
      setDetail(data);
      setIdx(0);
      setAnswers({});
      setVideoBlobs([]);
      setStage(STAGE.INTRO);
      stopMedia();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // recording lifecycle per question during QUIZ
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

        const questionIndex = idx;

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

    return () => {
      stopMedia();
      setLiveStream(null);
      setRecState("inactive");
    };
  }, [detail, idx, stage]);

  // page hide/cleanup
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) stopMedia();
    };
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
  useEffect(() => {
    return () => stopMedia();
  }, []);

  // submit & analysis (single overlay, two phases)
  const handleSubmit = async () => {
    const arr = detail.items.map((it, i) => ({
      questionId: it.id,
      optionIndex: typeof answers[i] === "number" ? answers[i] : -1,
    }));

    const form = new FormData();
    form.append("sessionId", sessionId);
    form.append("answers", JSON.stringify(arr));
    videoBlobs.forEach((blob, i) => {
      if (blob) form.append("videos", blob, `question_${i}.webm`);
    });

    // open overlay in "loading"
    setOverlayOpen(true);
    setOverlayMode("loading");
    setOverlayTitle("Uploading videos …");
    setOverlaySub("Large uploads may take a moment.");
    setOverlayProgress(0);
    setResultId(null);

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
              setOverlayProgress(pct);

              if (pct >= 100 && !analyzingTimer) {
                // switch to analyzing phase (still same overlay)
                setOverlayProgress(undefined);
                setOverlayTitle("Analyzing your answers");
                setOverlaySub("This may take 1–3 minutes depending on video length.");
                analyzingTimer = setInterval(() => {
                  dots = (dots + 1) % 4;
                  setOverlayTitle(`Analyzing your answers${".".repeat(dots)}`);
                }, 600);
              }
            },
          }
      );

      // success → same overlay switches to "done"
      clearInterval(analyzingTimer);

      // prefer server resultUrl if provided; otherwise construct from id
      const rid = data?.id || data?._id;
      const resultUrl = data?.resultUrl || (rid ? `/result/${rid}` : null);
      setResultId(rid);

      // 保存到 sessionStorage，允许在有效期内重复访问结果
      if (rid) {
        sessionStorage.setItem("lastSubmission", JSON.stringify({ 
          id: rid, 
          ts: Date.now() 
        }));
      }

      setOverlayMode("done");
      setOverlayTitle("Analysis complete");
      setOverlaySub("Analysis has finished. Continue to the result page for the full report.");

      // onConfirm navigates
      const goResult = () => {
        if (resultUrl) {
          navigate(resultUrl);
        } else if (rid) {
          navigate(`/result/${rid}`);
        } else {
          // fallback: close overlay if no id returned (shouldn't happen)
          setOverlayOpen(false);
        }
      };

      // attach handler to window so we can pass into overlay below
      // (alternatively, keep in state — simple closure works here)
      window.__GO_RESULT__ = goResult;
    } catch (e) {
      clearInterval(analyzingTimer);
      setOverlayMode("error");
      setOverlayTitle("Submission failed");
      setOverlaySub(e?.response?.data?.error || e.message || "Please try again later.");
      setOverlayProgress(undefined);
    }
  };

  // ---------- render ----------
  if (!detail) {
    return (
        <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 14px rgba(0,0,0,.06)", padding: 24 }}>
            Loading...
          </div>
        </div>
    );
  }

  if (stage === STAGE.INTRO) {
    return <SurveyIntro onContinue={() => setStage(STAGE.CONSENT)} />;
  }

  if (stage === STAGE.CONSENT) {
    return <SurveyConsent onBack={() => setStage(STAGE.INTRO)} onStart={() => { stopMedia(); setStage(STAGE.QUIZ); }} />;
  }

  return (
      <div
          style={{
            width: "100%",
            minHeight: "calc(100vh - 64px)",
            padding: 16,
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            gap: 16,
            background: "var(--page-bg, #f6f7fb)",
          }}
      >
        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>{detail?.title || "Preview"}</h3>

            {stage === STAGE.QUIZ ? (
                detail?.items?.length > 0 && (
                    <div className="sv-col">
                      <ProgressSteps current={idx} total={detail.items.length} />

                      <div className="sv-row" style={{ alignItems: "flex-start" }}>
                        {/* Left: live preview */}
                        <div>
                          <RecordingPreview stream={liveStream} recState={recState} />
                        </div>

                        {/* Right: question block - 固定宽度 */}
                        <div className="sv-card sv-pad" style={{ width: 400, minWidth: 400, maxWidth: 400 }}>
                          <div className="q-title">Q{idx + 1}.</div>
                          <div className="q-lead sv-muted">Over the last 2 weeks …</div>
                          <div className="q-prompt" style={{ margin: "6px 0 12px" }}>
                            {detail.items[idx].prompt}
                          </div>

                          {detail.items[idx].options?.length > 0 && (
                              <EmojiOptions
                                  options={detail.items[idx].options}
                                  value={answers[idx]}
                                  onChange={(val) => setAnswers((a) => ({ ...a, [idx]: val }))}
                                  name={`q_${idx}`}
                              />
                          )}

                          <div style={{ marginTop: 18 }}>
                            <NextArrowButton
                                onClick={() => {
                                  try {
                                    recorderRef.current?.state === "recording" && recorderRef.current.stop();
                                  } catch {}
                                  if (idx >= detail.items.length - 1) {
                                    setStage(STAGE.REVIEW);
                                    stopMedia();
                                  } else {
                                    setTimeout(() => setIdx((i) => Math.min(detail.items.length - 1, i + 1)), 0);
                                  }
                                }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                )
            ) : (
                <div className="sv-card sv-pad" style={{ width: 600, margin: "0 auto" }}>
                  <div className="q-title" style={{ fontSize: 32, marginBottom: 16 }}>Review your answers</div>
                  <div className="sv-col">
                    {detail.items.map((q, i) => (
                        <div key={i} className="sv-card sv-pad" style={{ marginBottom: 12 }}>
                          <div className="q-prompt" style={{ fontSize: 18, marginBottom: 8 }}>
                            Q{i + 1}. {q.prompt}
                          </div>
                          <div className="sv-muted" style={{ marginBottom: 4 }}>
                            Answer: <span style={{ color: "#111827", fontWeight: 600 }}>
                              {typeof answers[i] === "number" ? q.options[answers[i]] : "Not answered"}
                            </span>
                          </div>
                          <div className="sv-muted">
                            Video: <span style={{ color: videoBlobs[i] ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                              {videoBlobs[i] ? "Saved" : "Missing"}
                            </span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Footer actions */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: 16 }}>
            {stage === STAGE.QUIZ ? (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  {/* 答题阶段不显示底部Next按钮，使用卡片内的NextArrowButton */}
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
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

        {/* Single overlay component: loading -> done (navigate) */}
        <LoadingOverlay
            open={overlayOpen}
            mode={overlayMode}
            title={overlayTitle}
            subtitle={overlaySub}
            progress={overlayMode === "loading" ? overlayProgress : undefined}
            onConfirm={
              overlayMode === "done"
                  ? () => {
                    if (window.__GO_RESULT__) window.__GO_RESULT__();
                  }
                  : undefined
            }
            confirmText="Go to result page"
            onClose={
              overlayMode === "error"
                  ? () => {
                    setOverlayOpen(false);
                  }
                  : undefined
            }
        />
      </div>
  );
}
