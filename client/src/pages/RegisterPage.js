// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { http } from "../api/http";
import "./auth.css";

export default function RegisterPage() {
    const nav = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [form, setForm] = useState({ username: "", email: "", password: "" });

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setLoading(true);
        try {
            const { data } = await http.post("/api/users/register", form);
            // 注册后自动登录并根据角色跳转
            if (data?.token && data?.user) {
                login({ token: data.token, user: data.user });
            }
            nav(data?.user?.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            setErr(error?.response?.data?.error || "Registration failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1 className="auth-title">Admin Registration</h1>
                <p className="auth-sub">Create administrator account for system management.</p>

                <form onSubmit={onSubmit} className="auth-form">
                    <label>Username</label>
                    <input name="username" value={form.username} onChange={onChange} required />

                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={onChange} required />

                    <label>Password</label>
                    <input name="password" type="password" value={form.password} onChange={onChange} required />

                    <button className="auth-btn" disabled={loading}>
                        {loading ? "Registering..." : "Create Admin Account"}
                    </button>

                    {err && <div className="auth-error">{err}</div>}
                </form>

                <div className="auth-foot">
                    Already have an admin account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
}
