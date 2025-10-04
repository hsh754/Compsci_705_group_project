// AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { getSimpleReport } from "../../api/stats";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PieLegend = ({ items }) => (
    <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          paddingTop: 8,
        }}
    >
      {items.map((it, i) => (
          <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                maxWidth: 160,
                lineHeight: "16px",
              }}
          >
        <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: it.color,
              display: "inline-block",
              flex: "0 0 auto",
            }}
        />
            <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#475569",
                  wordBreak: "keep-all",
                  whiteSpace: "nowrap",
                }}
                title={it.label}
            >
          {it.label}
        </span>
          </div>
      ))}
    </div>
);

export default function AdminDashboard() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const qRes = await http.get("/api/admin/questionnaires");
        setQuestionnaires(qRes.data || []);
        if (qRes.data && qRes.data.length > 0) {
          setSelectedQuestionnaire(qRes.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedQuestionnaire) return;
    (async () => {
      try {
        const res = await getSimpleReport({ questionnaireId: selectedQuestionnaire });
        setReportData(res.data.data);
        setTotalAnalyzed(res.data.data?.n ?? 0);
      } catch (err) {
        console.error("Failed to load report:", err);
        setReportData(null);
        setTotalAnalyzed(0);
      }
    })();
  }, [selectedQuestionnaire]);

  if (loading) {
    return (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading...
        </div>
    );
  }

  const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#F44336", "#9C27B0"];

  const kpis = reportData
      ? [
        { title: "Subjective mean", value: reportData.means?.subjective, state: reportData.states?.subjective },
        { title: "Objective mean", value: reportData.means?.objective, state: reportData.states?.objective },
        { title: "Adjusted mean", value: reportData.means?.adjusted, state: reportData.states?.adjusted },
      ]
      : [];

  const pieData = reportData
      ? (reportData.pie?.labels || []).map((name, i) => ({
        name,
        value: reportData.pie?.values?.[i] ?? 0,
      }))
      : [];

  return (
      <div
          style={{
            padding: "32px 150px",
            background: "#f8fafc",
            minHeight: "100vh",
          }}
      >
        <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "24px",
            }}
        >
          Admin Overview
        </h2>

        <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
        >
          <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                color: "#fff",
              }}
          >
            <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
              Total Questionnaires
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>{questionnaires.length}</div>
          </div>

          <div
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(245, 87, 108, 0.3)",
                color: "#fff",
              }}
          >
            <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
              Total Analyzed
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              {totalAnalyzed}
            </div>
          </div>
        </div>

        {questionnaires.length > 0 ? (
            <>
              <div style={{ marginBottom: "24px" }}>
                <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                >
                  Select Questionnaire
                </label>
                <select
                    value={selectedQuestionnaire || ""}
                    onChange={(e) => setSelectedQuestionnaire(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      padding: "12px 16px",
                      fontSize: "15px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#fff",
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                >
                  {questionnaires.map((q) => (
                      <option key={q._id} value={q._id}>
                        {q.title} (v{q.version})
                      </option>
                  ))}
                </select>
              </div>

              {reportData ? (
                  <>
                    <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "20px",
                          marginBottom: "32px",
                        }}
                    >
                      {kpis.map((k) => (
                          <div
                              key={k.title}
                              style={{
                                background: "#fff",
                                padding: "24px",
                                borderRadius: "16px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                minHeight: "140px",
                              }}
                          >
                            <div>
                              <div
                                  style={{
                                    fontSize: "13px",
                                    color: "#64748b",
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                              >
                                {k.title}
                              </div>
                              <div
                                  style={{
                                    fontSize: "32px",
                                    fontWeight: "700",
                                    color: "#1e293b",
                                    marginTop: "8px",
                                  }}
                              >
                                {Number.isFinite(k.value) ? Number(k.value).toFixed(2) : "—"}
                              </div>
                            </div>
                            <div
                                style={{
                                  fontSize: "14px",
                                  color: "#475569",
                                  marginTop: "12px",
                                  paddingTop: "12px",
                                  borderTop: "1px solid #f1f5f9",
                                }}
                            >
                              State: <strong>{k.state ?? "—"}</strong>
                            </div>
                          </div>
                      ))}
                    </div>

                    <div
                        style={{
                          background: "#fff",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          padding: "24px",
                          marginBottom: "32px",
                          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                        }}
                    >
                      <h4
                          style={{
                            margin: "0 0 20px",
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#1e293b",
                          }}
                      >
                        Adjustment Ratio
                      </h4>

                      <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                              {pieData.map((_, i) => (
                                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <PieLegend
                          items={pieData.map((d, i) => ({
                            label: d.name,
                            color: COLORS[i % COLORS.length],
                          }))}
                      />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <button
                          onClick={() =>
                              navigate(`/admin/reports?questionnaireId=${selectedQuestionnaire}`)
                          }
                          style={{
                            padding: "14px 32px",
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#fff",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            borderRadius: "12px",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                            transition: "all 0.3s",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                          }}
                      >
                        View Detailed Reports →
                      </button>
                    </div>
                  </>
              ) : (
                  <div
                      style={{
                        background: "#fff",
                        padding: "40px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                  >
                    No report data available for this questionnaire
                  </div>
              )}
            </>
        ) : (
            <div
                style={{
                  background: "#fff",
                  padding: "40px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  color: "#64748b",
                }}
            >
              No questionnaires available. Please create one first.
        </div>
      )}
    </div>
  );
}
