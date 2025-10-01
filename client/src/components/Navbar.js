import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const btnRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const onDocClick = (e) => {
            if (!open) return;
            const t = e.target;
            if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onEsc = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    const gotoProfile = () => {
        setOpen(false);
        nav("/profile");
    };

    const handleLogout = () => {
        setOpen(false);
        logout();
        nav("/"); // Back to homepage
    };

    return (
        <>
            <style>{`
        .navbar {
          height: 60px; padding: 0 20px; background: #fff; border-bottom: 1px solid #eee;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .nav-logo { font-weight: 800; font-size: 18px; text-decoration: none; color: #4F46E5; }
        body { background: #f7f8fc; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-center { display: flex; gap: 12px; align-items: center; }
        .nav-link { color: #374151; text-decoration: none; padding: 6px 10px; border-radius: 8px; }
        .nav-link.active, .nav-link:hover { background: #f6f7ff; color: #111827; }

        .avatar-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: #4F46E5; color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; user-select: none; box-shadow: 0 2px 6px rgba(79,70,229,.25);
          cursor: pointer; border: none;
        }

        .menu {
          position: absolute; right: 0; top: 46px; width: 180px;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,.08); overflow: hidden;
          opacity: 0; transform: translateY(-6px); pointer-events: none;
          transition: opacity .12s ease, transform .12s ease;
        }
        .menu.open { opacity: 1; transform: translateY(0); pointer-events: auto; }

        .menu-item {
          width: 100%; text-align: left; background: transparent; border: none;
          padding: 10px 12px; font-size: 14px; color: #1f2937; cursor: pointer;
        }
        .menu-item:hover { background: #f6f7ff; }
        .divider { height: 1px; background: #f0f0f5; }
        .logout { color: #dc2626; }
      `}</style>

            <nav className="navbar">
                <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="nav-logo">SurveyApp</Link>

                <div className="nav-center">
                    {user && user.role !== 'admin' && (
                        <>
                            <NavLink to="/dashboard" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Dashboard</NavLink>
                            <NavLink to="/questionnaire" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Questionnaire</NavLink>
                            <NavLink to="/results" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Results</NavLink>
                        </>
                    )}
                    {user && user.role === 'admin' && (
                        <>
                            <NavLink to="/admin" end className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Admin</NavLink>
                            <NavLink to="/admin/questionnaires" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Questionnaires</NavLink>
                            <NavLink to="/admin/reports" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Reports</NavLink>
                            <NavLink to="/admin/settings" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Settings</NavLink>
                        </>
                    )}
                </div>

                <div className="nav-right">
                    {user ? (
                        <div style={{ position: "relative" }}>
                            <button
                                ref={btnRef}
                                className="avatar-btn"
                                aria-haspopup="menu"
                                aria-expanded={open}
                                onClick={() => setOpen((v) => !v)}
                                title={user.username}
                            >
                                {user.username?.charAt(0)?.toUpperCase() || "U"}
                            </button>

                            <div
                                ref={menuRef}
                                role="menu"
                                className={`menu ${open ? "open" : ""}`}
                            >
                                <button className="menu-item" role="menuitem" onClick={gotoProfile}>
                                    Profile
                                </button>
                                <div className="divider" />
                                <button className="menu-item logout" role="menuitem" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        // 未登录用户：只在非首页且非登录/注册页面显示导航按钮
                        location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && (
                            <>
                                <NavLink to="/dashboard" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Dashboard</NavLink>
                                <NavLink to="/questionnaire" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Questionnaires</NavLink>
                                <NavLink to="/results" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Results</NavLink>
                                <NavLink to="/login" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Admin Login</NavLink>
                            </>
                        )
                    )}
                </div>
            </nav>
        </>
    );
}
