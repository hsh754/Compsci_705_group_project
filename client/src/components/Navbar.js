import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const btnRef = useRef(null);
    const mobileMenuRef = useRef(null);

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
          height: 60px; padding: 0 16px; background: #fff; border-bottom: 1px solid #eee;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .nav-logo { font-weight: 800; font-size: 18px; text-decoration: none; color: #4F46E5; }
        body { background: #f7f8fc; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-center { display: flex; gap: 12px; align-items: center; }
        .nav-link { color: #374151; text-decoration: none; padding: 6px 10px; border-radius: 8px; white-space: nowrap; }
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

        /* 汉堡菜单按钮 */
        .hamburger-btn {
          display: none;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          padding: 8px;
        }
        .hamburger-btn span {
          width: 24px;
          height: 2px;
          background: #4F46E5;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .hamburger-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .hamburger-btn.open span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        /* 移动端菜单 */
        .mobile-menu {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          background: #fff;
          border-bottom: 1px solid #eee;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,.08);
        }
        .mobile-menu.open {
          max-height: 400px;
        }
        .mobile-menu-content {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .navbar { padding: 0 12px; }
          .nav-center { display: none; }
          .hamburger-btn { display: flex; }
          .nav-right { gap: 8px; }
          .avatar-btn { width: 32px; height: 32px; font-size: 14px; }
          .nav-logo { font-size: 16px; }
        }

        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>

            <nav className="navbar">
                <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="nav-logo">SurveyApp</Link>

                {/* 汉堡菜单按钮（仅移动端显示） */}
                {user && (
                    <button 
                        className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                )}

                <div className="nav-center">
                    {user && user.role !== 'admin' && (
                        <>
                            <NavLink to="/dashboard" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Dashboard</NavLink>
                            <NavLink to="/questionnaire" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Questionnaire</NavLink>
                        </>
                    )}
                    {user && user.role === 'admin' && (
                        <>
                            <NavLink to="/admin" end className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Admin</NavLink>
                            <NavLink to="/admin/questionnaires" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Questionnaires</NavLink>
                            <NavLink to="/admin/reports" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Reports</NavLink>
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
                                <NavLink to="/login" className={({isActive})=>`nav-link ${isActive? 'active':''}`}>Admin Login</NavLink>
                            </>
                        )
                    )}
                </div>
            </nav>

            {/* 移动端菜单（仅在移动端显示） */}
            {user && (
                <div ref={mobileMenuRef} className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-menu-content">
                        {user.role !== 'admin' ? (
                            <>
                                <NavLink 
                                    to="/dashboard" 
                                    className={({isActive})=>`nav-link ${isActive? 'active':''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink 
                                    to="/questionnaire" 
                                    className={({isActive})=>`nav-link ${isActive? 'active':''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Questionnaire
                                </NavLink>
                                <div className="divider" style={{ margin: '8px 0' }} />
                                <button 
                                    className="nav-link" 
                                    onClick={() => { setMobileMenuOpen(false); nav("/profile"); }}
                                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    Profile
                                </button>
                                <button 
                                    className="nav-link logout" 
                                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink 
                                    to="/admin" 
                                    end 
                                    className={({isActive})=>`nav-link ${isActive? 'active':''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Admin
                                </NavLink>
                                <NavLink 
                                    to="/admin/questionnaires" 
                                    className={({isActive})=>`nav-link ${isActive? 'active':''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Questionnaires
                                </NavLink>
                                <NavLink 
                                    to="/admin/reports" 
                                    className={({isActive})=>`nav-link ${isActive? 'active':''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Reports
                                </NavLink>
                                <div className="divider" style={{ margin: '8px 0' }} />
                                <button 
                                    className="nav-link" 
                                    onClick={() => { setMobileMenuOpen(false); nav("/profile"); }}
                                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    Profile
                                </button>
                                <button 
                                    className="nav-link logout" 
                                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
