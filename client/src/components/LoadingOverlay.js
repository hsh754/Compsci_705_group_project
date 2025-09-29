// src/components/LoadingOverlay.js
import React from "react";
import "./survey.css";

/**
 * props:
 * - open: boolean
 * - title: string
 * - subtitle?: string
 * - progress?: number (0~100)  // 可选：显示进度条
 */
export default function LoadingOverlay({ open, title, subtitle, progress }) {
    if (!open) return null;

    return (
        <div className="overlay-root" role="alert" aria-live="assertive">
            <div className="overlay-card sv-card">
                <div className="spinner" aria-hidden />
                <div className="overlay-title">{title}</div>
                {subtitle && <div className="overlay-sub">{subtitle}</div>}

                {typeof progress === "number" && !Number.isNaN(progress) && (
                    <div className="overlay-progress">
                        <div className="overlay-progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                    </div>
                )}

                <div className="overlay-hint sv-muted">
                    Please keep this tab open. Video transcoding and model inference are running securely on the server.
                </div>
            </div>
        </div>
    );
}
