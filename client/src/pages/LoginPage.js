// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { http } from "../api/http";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

export default function LoginPage() {
    const nav = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [form, setForm] = useState({ username: "", password: "" });

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setLoading(true);
        try {
            const { data } = await http.post("/api/users/login", form);
            // 关键：不展示 token，直接保存到 context/localStorage，并跳转
            login({ token: data.token, user: data.user });
            nav(data?.user?.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            setErr(error?.response?.data?.error || "Login failed. Please check your credentials or try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            padding: "60px 20px 40px"
        }}>
            <div style={{ 
                maxWidth: 1200, 
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 60,
                alignItems: "center",
                minHeight: "calc(100vh - 100px)"
            }}>
                {/* 左侧：品牌介绍 */}
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center",
                    padding: "40px 0"
                }}>
                    <div style={{ marginBottom: 40 }}>
                        <h1 style={{ 
                            fontSize: 48, 
                            fontWeight: 900, 
                            color: "#111827", 
                            marginBottom: 16,
                            letterSpacing: "-0.02em"
                        }}>
                            Admin Portal
                        </h1>
                        <p style={{ 
                            fontSize: 20, 
                            color: "#6b7280", 
                            fontWeight: 500,
                            lineHeight: 1.6,
                            marginBottom: 24
                        }}>
                            Access the administrative dashboard to manage questionnaires, view reports, and analyze user submissions.
                        </p>
                    </div>

                    <div style={{ 
                        display: "grid", 
                        gap: 20,
                        maxWidth: 400
                    }}>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12,
                            padding: "16px 20px",
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 2px 10px rgba(0,0,0,.05)"
                        }}>
                            <div style={{ 
                                width: 40, 
                                height: 40, 
                                background: "linear-gradient(135deg, #4F46E5, #7c3aed)", 
                                borderRadius: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20
                            }}>
                                📊
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: "#111827" }}>Analytics Dashboard</div>
                                <div style={{ fontSize: 14, color: "#6b7280" }}>View detailed reports and insights</div>
                            </div>
                        </div>

                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12,
                            padding: "16px 20px",
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 2px 10px rgba(0,0,0,.05)"
                        }}>
                            <div style={{ 
                                width: 40, 
                                height: 40, 
                                background: "linear-gradient(135deg, #10b981, #059669)", 
                                borderRadius: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20
                            }}>
                                ⚙️
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: "#111827" }}>Question Management</div>
                                <div style={{ fontSize: 14, color: "#6b7280" }}>Create and manage questionnaires</div>
                            </div>
                        </div>

                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12,
                            padding: "16px 20px",
                            background: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 2px 10px rgba(0,0,0,.05)"
                        }}>
                            <div style={{ 
                                width: 40, 
                                height: 40, 
                                background: "linear-gradient(135deg, #f59e0b, #d97706)", 
                                borderRadius: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20
                            }}>
                                👥
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: "#111827" }}>User Management</div>
                                <div style={{ fontSize: 14, color: "#6b7280" }}>Monitor user activity and submissions</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧：登录表单 */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "center",
                    padding: "40px 0"
                }}>
                    <div style={{
                        width: "100%",
                        maxWidth: 420,
                        background: "#fff",
                        borderRadius: 20,
                        padding: "40px 36px",
                        boxShadow: "0 20px 40px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
                        border: "1px solid rgba(0,0,0,.04)"
                    }}>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <h2 style={{ 
                                fontSize: 32, 
                                fontWeight: 800, 
                                color: "#111827", 
                                marginBottom: 8
                            }}>
                                Admin Login
                            </h2>
                            <p style={{ 
                                fontSize: 16, 
                                color: "#6b7280",
                                margin: 0
                            }}>
                                Administrator access only
                            </p>
                        </div>

                        <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>
                            <div>
                                <label style={{ 
                                    display: "block", 
                                    fontSize: 14, 
                                    fontWeight: 600,
                                    color: "#374151", 
                                    marginBottom: 8
                                }}>
                                    Username
                                </label>
                                <input 
                                    name="username" 
                                    value={form.username} 
                                    onChange={onChange} 
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: 12,
                                        outline: "none",
                                        fontSize: 16,
                                        background: "#fafafa",
                                        transition: "all .2s ease"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#4F46E5";
                                        e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,.1)";
                                        e.target.style.background = "#fff";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "#e5e7eb";
                                        e.target.style.boxShadow = "none";
                                        e.target.style.background = "#fafafa";
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ 
                                    display: "block", 
                                    fontSize: 14, 
                                    fontWeight: 600,
                                    color: "#374151", 
                                    marginBottom: 8
                                }}>
                                    Password
                                </label>
                                <input 
                                    name="password" 
                                    type="password" 
                                    value={form.password} 
                                    onChange={onChange} 
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: 12,
                                        outline: "none",
                                        fontSize: 16,
                                        background: "#fafafa",
                                        transition: "all .2s ease"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#4F46E5";
                                        e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,.1)";
                                        e.target.style.background = "#fff";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "#e5e7eb";
                                        e.target.style.boxShadow = "none";
                                        e.target.style.background = "#fafafa";
                                    }}
                                />
                            </div>

                            <button 
                                className="auth-btn" 
                                disabled={loading}
                                style={{
                                    marginTop: 8,
                                    padding: "16px 20px",
                                    border: "none",
                                    borderRadius: 12,
                                    background: "linear-gradient(135deg, #4F46E5, #4338ca)",
                                    color: "#fff",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all .2s ease",
                                    opacity: loading ? 0.7 : 1
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.target.style.transform = "translateY(-1px)";
                                        e.target.style.boxShadow = "0 8px 20px rgba(79,70,229,.3)";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                }}
                            >
                                {loading ? "Logging in..." : "Admin Login"}
                            </button>

                            {err && (
                                <div style={{
                                    marginTop: 12,
                                    padding: "12px 16px",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    borderRadius: 8,
                                    color: "#dc2626",
                                    fontSize: 14,
                                    textAlign: "center"
                                }}>
                                    {err}
                                </div>
                            )}
                        </form>

                        <div style={{ 
                            marginTop: 24, 
                            textAlign: "center",
                            color: "#6b7280", 
                            fontSize: 14
                        }}>
                            Need an admin account? <Link to="/register" style={{ 
                                color: "#4F46E5", 
                                textDecoration: "none", 
                                fontWeight: 600 
                            }}>Register</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

