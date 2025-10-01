// src/components/LoadingOverlay.js
import React from "react";
import "./survey.css";

/**
 * props:
 * - open: boolean
 * - mode: "loading" | "done" | "error"
 * - title: string
 * - subtitle?: string
 * - progress?: number (0~100)
 * - onConfirm?: () => void     // used in "done" mode
 * - confirmText?: string       // button text in "done" mode
 * - onClose?: () => void       // optional close for "error"
 */
export default function LoadingOverlay({
                                           open,
                                           mode = "loading",
                                           title,
                                           subtitle,
                                           progress,
                                           onConfirm,
                                           confirmText = "Go to result page",
                                           onClose,
                                       }) {
    if (!open) return null;

    return (
        <div className="overlay-root" role="alert" aria-live="assertive">
            <div className="overlay-card sv-card">
                {mode === "loading" && (
                    <>
                        <div className="spinner" aria-hidden />
                        <div className="overlay-title">{title}</div>
                        {subtitle && <div className="overlay-sub">{subtitle}</div>}
                        {typeof progress === "number" && !Number.isNaN(progress) && (
                            <div className="overlay-progress" aria-label="Upload progress">
                                <div
                                    className="overlay-progress-fill"
                                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                />
                            </div>
                        )}
                        <div className="overlay-hint sv-muted">
                            Please keep this tab open. Video transcoding and model inference are running securely on the server.
                        </div>
                    </>
                )}

                {mode === "done" && (
                    <>
                        <div className="overlay-title">{title || "Analysis complete"}</div>
                        {subtitle && <div className="overlay-sub">{subtitle}</div>}
                        <button
                            className="sv-btn sv-btn-primary"
                            style={{ marginTop: 16, width: "100%" }}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </>
                )}

                {mode === "error" && (
                    <>
                        <div className="overlay-title" style={{ color: "#b91c1c" }}>
                            {title || "Submission failed"}
                        </div>
                        {subtitle && <div className="overlay-sub">{subtitle}</div>}
                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                            {onClose && (
                                <button className="sv-btn" onClick={onClose} style={{ flex: 1 }}>
                                    Close
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
