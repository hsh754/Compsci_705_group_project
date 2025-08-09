// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await http.get("/api/users/profile");
                setProfile(data);
            } catch (e) {
                setErr("Failed to fetch profile. Please re-login.");
            }
        })();
    }, []);

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1 className="auth-title">Profile</h1>
                <p className="auth-sub">Hello, {user?.username || "User"}</p>

                {err && <div className="auth-error">{err}</div>}
                {profile && (
                    <div className="profile-box">
                        <div><b>Username: </b>{profile.username}</div>
                        <div><b>Email: </b>{profile.email || "-"}</div>
                        <div><b>Role: </b>{profile.role || 'user'}</div>
                        <div><b>Created At: </b>{new Date(profile.createdAt).toLocaleString()}</div>
                    </div>
                )}

                <button className="auth-btn ghost" onClick={logout}>Log out</button>
            </div>
        </div>
    );
}
