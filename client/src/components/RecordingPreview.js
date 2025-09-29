import React, { useEffect, useRef } from "react";
import "../components/survey.css";

export default function RecordingPreview({ stream, recState="inactive" }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(()=>{});
        }
    }, [stream]);

    return (
        <div className="rec-wrap sv-card">
            <video className="rec-video" ref={videoRef} muted playsInline />
            <div className="rec-bar">
                <span className="rec-dot" style={{opacity: recState === "recording" ? 1 : .25}} />
                <span style={{fontWeight:700, letterSpacing:.5}}>
          {recState === "recording" ? "REC" : recState === "paused" ? "PAUSED" : "READY"}
        </span>
            </div>
        </div>
    );
}
