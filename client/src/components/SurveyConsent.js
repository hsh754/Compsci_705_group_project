// src/components/SurveyConsent.js
import React from "react";

export default function SurveyConsent({ onBack, onStart }) {
    return (
        <div style={{ display:"grid", placeItems:"center", padding:24 }}>
            <div style={{ width:760, maxWidth:"100%", background:"#fff", borderRadius:16, boxShadow:"0 2px 14px rgba(0,0,0,.06)", padding:32 }}>
                <h1 style={{ fontSize:40, margin:"4px 0 16px" }}>Before we start</h1>
                <p style={{ fontSize:18 }}>During the survey:</p>
                <ul style={{ fontSize:18, lineHeight:1.6 }}>
                    <li><b>Your camera will turn on</b> so we can collect data about your facial expressions.</li>
                    <li>
                        You’ll need to <b>turn on your microphone</b> and <b>read each question and your answer out loud</b>,
                        so we can capture your voice and speech patterns.
                    </li>
                </ul>
                <p style={{ fontSize:18, marginTop:12 }}>
                    All your responses and recordings are kept private and confidential.
                </p>
                <div style={{ marginTop:24, display:"flex", gap:12 }}>
                    <button
                        onClick={onBack}
                        style={{ padding:"10px 16px", borderRadius:10, background:"#FBCFE8", color:"#111827", border:0, cursor:"pointer" }}
                    >
                        ← Back
                    </button>
                    <button
                        onClick={onStart}
                        style={{ padding:"10px 16px", borderRadius:10, background:"#F472B6", color:"#fff", border:0, cursor:"pointer" }}
                    >
                        Start
                    </button>
                </div>
            </div>
        </div>
    );
}
