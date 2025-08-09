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
        <div className="auth-shell">
            <div className="auth-card">
                <h1 className="auth-title">Log in</h1>
                <p className="auth-sub">Welcome back</p>

                <form onSubmit={onSubmit} className="auth-form">
                    <label>Username</label>
                    <input name="username" value={form.username} onChange={onChange} required />

                    <label>Password</label>
                    <input name="password" type="password" value={form.password} onChange={onChange} required />

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>

                    {err && <div className="auth-error">{err}</div>}
                </form>

                <div className="auth-foot">
                    Don't have an account? <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
}
