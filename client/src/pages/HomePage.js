// src/pages/HomePage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

export default function HomePage() {
  const nav = useNavigate();

  const QuickStartCard = () => (
    <div className="sv-card sv-pad" style={{ 
      background: "linear-gradient(135deg, #e9e5ff, #f3e8ff)",
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ 
          fontSize: 48, 
          fontWeight: 800, 
          color: "#4F46E5", 
          marginBottom: 12,
          textAlign: "center"
        }}>
          🧠
        </div>
        <h2 style={{ 
          fontSize: 28, 
          fontWeight: 800, 
          color: "#111827", 
          marginBottom: 12,
          textAlign: "center"
        }}>
          Quick Start
        </h2>
        <p style={{ 
          fontSize: 16, 
          color: "#6b7280", 
          lineHeight: 1.6,
          textAlign: "center",
          marginBottom: 20
        }}>
          Begin your personalized questionnaire journey. Complete a brief assessment to get insights about your wellbeing.
        </p>
      </div>
      
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => nav("/dashboard")}
          style={{
            background: "#4F46E5",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(79,70,229,.3)",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(79,70,229,.4)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(79,70,229,.3)";
          }}
        >
          Start Questionnaire
        </button>
      </div>
    </div>
  );

  const AdminCard = () => (
    <div className="sv-card sv-pad" style={{ 
      background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ 
          fontSize: 48, 
          fontWeight: 800, 
          color: "#64748b", 
          marginBottom: 12,
          textAlign: "center"
        }}>
          ⚙️
        </div>
        <h2 style={{ 
          fontSize: 28, 
          fontWeight: 800, 
          color: "#111827", 
          marginBottom: 12,
          textAlign: "center"
        }}>
          Admin Login
        </h2>
        <p style={{ 
          fontSize: 16, 
          color: "#6b7280", 
          lineHeight: 1.6,
          textAlign: "center",
          marginBottom: 20
        }}>
          Access the administrative dashboard to manage questionnaires, view reports, and analyze user submissions.
        </p>
      </div>
      
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => nav("/login")}
          style={{
            background: "#fff",
            color: "#4F46E5",
            border: "2px solid #4F46E5",
            padding: "14px 28px",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#4F46E5";
            e.target.style.color = "#fff";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(79,70,229,.2)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#fff";
            e.target.style.color = "#4F46E5";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,.1)";
          }}
        >
          Admin Access
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      padding: "40px 16px"
    }}>
      <div style={{ 
        maxWidth: 1000, 
        margin: "0 auto",
        textAlign: "center"
      }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ 
            fontSize: "clamp(28px, 6vw, 48px)", 
            fontWeight: 900, 
            color: "#111827", 
            marginBottom: 12,
            letterSpacing: "-0.02em",
            lineHeight: 1.2
          }}>
            Welcome to SurveyApp
          </h1>
          <p style={{ 
            fontSize: "clamp(16px, 3vw, 20px)", 
            color: "#6b7280", 
            fontWeight: 500,
            padding: "0 16px"
          }}>
            Multimodal Questionnaire Evaluation Platform
          </p>
        </div>

        {/* 两个主要卡片 */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", 
          gap: "clamp(16px, 4vw, 32px)",
          marginBottom: 32
        }}>
          <QuickStartCard />
          <AdminCard />
        </div>

        {/* 底部说明 */}
        <div style={{ 
          color: "#9ca3af", 
          fontSize: "clamp(13px, 2.5vw, 14px)",
          maxWidth: 600,
          margin: "0 auto",
          lineHeight: 1.6,
          padding: "0 16px"
        }}>
          Choose your path above to get started. Regular users can begin with a questionnaire, while administrators can access the management dashboard.
        </div>
      </div>
    </div>
  );
}
