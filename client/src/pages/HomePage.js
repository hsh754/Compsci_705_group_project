// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./auth.css";

export default function HomePage() {
  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1 className="auth-title">Welcome to SurveyApp</h1>
        <p className="auth-sub">Multimodal Questionnaire Evaluation Demo</p>
        <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/dashboard" className="auth-btn" style={{ textDecoration: "none" }}>Start Using App</Link>
          <Link to="/login" className="auth-btn ghost" style={{ textDecoration: "none" }}>Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
