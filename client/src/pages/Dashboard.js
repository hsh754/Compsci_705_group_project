// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const [recentId, setRecentId] = useState(null);

  // 读取最近一次提交
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastSubmission");
      if (!raw) return;
      const rec = JSON.parse(raw);
      const ttl = 10 * 60 * 1000; // 10 分钟有效期
      if (rec && rec.id && (Date.now() - rec.ts) <= ttl) {
        setRecentId(rec.id);
      }
    } catch {}
  }, []);

  const handleViewResults = () => {
    if (recentId) {
      nav(`/result/${recentId}`);
    } else {
      alert("请先完成问卷测试，然后您就可以查看结果了！");
    }
  };

  const Card = ({ bg, title, desc, btnText, onClick, illustration, disabled = false }) => (
    <div
      style={{
        background: bg,
        borderRadius: 20,
        padding: 24,
        display: "flex",
        gap: 20,
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,.12)",
        minHeight: 140,
        maxWidth: 800,
        margin: "0 auto"
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: 800, 
          fontSize: 20, 
          marginBottom: 8, 
          color: disabled ? "#9ca3af" : "#111827" 
        }}>
          {title}
        </div>
        <div style={{ 
          color: disabled ? "#9ca3af" : "#374151", 
          marginBottom: 16, 
          lineHeight: 1.5,
          fontSize: 16
        }}>
          {desc}
        </div>
        <button
          onClick={onClick}
          disabled={disabled}
          style={{
            background: disabled ? "#e5e7eb" : "#111827",
            color: disabled ? "#9ca3af" : "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: 12,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: 600,
            opacity: disabled ? 0.6 : 1
          }}
        >
          {btnText}
        </button>
      </div>
      <div aria-hidden style={{ width: 120, height: 120 }}>
        {illustration}
      </div>
    </div>
  );

  // 更丰富的图案设计
  const SurveyIllustration = () => (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      position: "relative",
      background: "linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)",
      borderRadius: 20,
      overflow: "hidden"
    }}>
      {/* 人物剪影 */}
      <div style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: 60,
        height: 80,
        background: "rgba(255,255,255,0.9)",
        borderRadius: "30px 30px 20px 20px"
      }} />
      {/* 头部 */}
      <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: 40,
        height: 40,
        background: "rgba(255,255,255,0.9)",
        borderRadius: "50%"
      }} />
      {/* 装饰性圆圈 */}
      <div style={{
        position: "absolute",
        top: 15,
        right: 15,
        width: 20,
        height: 20,
        background: "rgba(255,255,255,0.3)",
        borderRadius: "50%"
      }} />
      <div style={{
        position: "absolute",
        top: 25,
        right: 35,
        width: 12,
        height: 12,
        background: "rgba(255,255,255,0.2)",
        borderRadius: "50%"
      }} />
    </div>
  );

  const ResultsIllustration = () => (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      position: "relative",
      background: "linear-gradient(135deg, #c4b5fd, #e9d5ff, #f3e8ff)",
      borderRadius: 20,
      overflow: "hidden"
    }}>
      {/* 图表柱状图 */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        display: "flex",
        alignItems: "end",
        gap: 4
      }}>
        {[40, 60, 35, 80, 45].map((h, i) => (
          <div key={i} style={{
            width: 8,
            height: h,
            background: "rgba(255,255,255,0.8)",
            borderRadius: "2px 2px 0 0"
          }} />
        ))}
      </div>
      {/* 趋势线 */}
      <div style={{
        position: "absolute",
        top: 30,
        left: 15,
        right: 15,
        height: 2,
        background: "rgba(255,255,255,0.6)",
        borderRadius: 1
      }} />
      {/* 装饰性元素 */}
      <div style={{
        position: "absolute",
        top: 15,
        right: 20,
        width: 16,
        height: 16,
        background: "rgba(255,255,255,0.4)",
        borderRadius: "50%"
      }} />
      <div style={{
        position: "absolute",
        top: 25,
        right: 35,
        width: 8,
        height: 8,
        background: "rgba(255,255,255,0.3)",
        borderRadius: "50%"
      }} />
    </div>
  );

  return (
    <div style={{ 
      padding: "40px 20px", 
      minHeight: "calc(100vh - 120px)",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
    }}>
      <div style={{ 
        display: "grid", 
        gap: 24,
        maxWidth: 900,
        margin: "0 auto"
      }}>
        <Card
          bg="linear-gradient(135deg, #e9e5ff, #f3e8ff)"
          title="Quick check-in to see how you've been feeling lately."
          desc="Start a brief survey to reflect on your recent wellbeing and get personalized insights."
          btnText="Take Survey"
          onClick={() => nav("/questionnaire")}
          illustration={<SurveyIllustration />}
        />

        <Card
          bg="linear-gradient(135deg, #f1edff, #faf5ff)"
          title="See my previous survey taken."
          desc={recentId ? "Review your recent submission summary and detailed analysis." : "Complete a survey first to view your personalized results and insights."}
          btnText="View Results"
          onClick={handleViewResults}
          disabled={!recentId}
          illustration={<ResultsIllustration />}
        />
      </div>
    </div>
  );
}
