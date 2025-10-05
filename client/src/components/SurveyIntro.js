// src/components/SurveyIntro.js
import React from "react";

export default function SurveyIntro({ onContinue }) {
    return (
        <div style={{ display:"grid", placeItems:"center", padding:24 }}>
            <div style={{ width:760, maxWidth:"100%", background:"#fff", borderRadius:16, boxShadow:"0 2px 14px rgba(0,0,0,.06)", padding:32 }}>
                <h1 style={{ fontSize:40, margin:"4px 0 16px" }}>Before we start</h1>
                <p style={{ fontSize:18, lineHeight:1.6 }}>
                    This survey has <b>7 quick questions</b> and takes <b>only 2–3 minutes</b>.
                </p>
                
                <div style={{ 
                    fontSize:16, 
                    lineHeight:1.6, 
                    marginTop:16, 
                    padding:16, 
                    background:"#f8fafc", 
                    borderRadius:12, 
                    border:"1px solid #e2e8f0" 
                }}>
                    <h3 style={{ fontSize:18, margin:"0 0 12px", color:"#374151" }}>Here's how it works:</h3>
                    <ol style={{ margin:0, paddingLeft:20, color:"#4b5563" }}>
                        <li><b>You answer questions</b> while we record your responses</li>
                        <li><b>Our multimodal model analyzes</b> your facial expressions and voice patterns</li>
                        <li><b>We compare</b> your answers with what we observe emotionally</li>
                        <li><b>If needed, we adjust</b> your scores to better reflect your true feelings</li>
                        <li><b>You get a personalized report</b> about your mental health status</li>
                    </ol>
                </div>
                
                <p style={{ fontSize:18, lineHeight:1.6, marginTop:12 }}>
                    This study helps us understand stress better and can provide you with feedback about your mental health status.
                </p>
                <div style={{ marginTop:24, display:"flex", justifyContent:"flex-start" }}>
                    <button
                        onClick={onContinue}
                        style={{ padding:"10px 16px", borderRadius:10, background:"#F472B6", color:"#fff", border:0, cursor:"pointer" }}
                    >
                        Continue →
                    </button>
                </div>
            </div>
        </div>
    );
}
