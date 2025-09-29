import React from "react";
import "../components/survey.css";

export default function NextArrowButton({ onClick, disabled }) {
    return (
        <button className="next-btn" onClick={onClick} disabled={disabled} title="Next">
            <span style={{fontWeight:700}}> </span>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                <path d="M13 5l7 7-7 7M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </button>
    );
}
