// src/App.js
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthProvider, { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import Results from "./pages/Results";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuestionnaires from "./pages/admin/AdminQuestionnaires";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";

function Nav() {
    const { user, logout } = useAuth();
    return (
        <nav style={{padding:12, display:"flex", gap:12, alignItems:"center"}}>
            <Link to="/register">Register</Link>
            <Link to="/login">Log in</Link>
            <Link to="/profile">Profile</Link>
            <div style={{marginLeft:"auto"}}>{user?.username && <>Hi, {user.username} <button onClick={logout} style={{marginLeft:8}}>Log out</button></>}</div>
        </nav>
    );
}

function PrivateRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}
function RoleRoute({ children, roles }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
}
function PublicOnlyRoute({ children }) {
    const { token, user } = useAuth();
    if (!token) return children;
    const redirectTo = user?.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/questionnaire" element={<PrivateRoute><Questionnaire /></PrivateRoute>} />
                    <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
                    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    <Route path="/admin" element={<RoleRoute roles={["admin"]}><AdminDashboard /></RoleRoute>} />
                    <Route path="/admin/questionnaires" element={<RoleRoute roles={["admin"]}><AdminQuestionnaires /></RoleRoute>} />
                    <Route path="/admin/reports" element={<RoleRoute roles={["admin"]}><AdminReports /></RoleRoute>} />
                    <Route path="/admin/settings" element={<RoleRoute roles={["admin"]}><AdminSettings /></RoleRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
