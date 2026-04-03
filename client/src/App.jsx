import { useMemo } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import WalkInIssuance from "./pages/admin/WalkInIssuance";
import ManageRequests from "./pages/admin/ManageRequests";
import ResidentRecords from "./pages/admin/ResidentRecords";
import Reports from "./pages/admin/Reports";
import LogsAuditTrail from "./pages/admin/LogsAuditTrail";
import ManageAccounts from "./pages/admin/ManageAccounts";
import Settings from "./pages/admin/Settings";

import ResidentLogin from "./pages/resident/ResidentLogin";
import ResidentRegister from "./pages/resident/ResidentRegister";
import ResidentHome from "./pages/resident/ResidentHome";
import SubmitRequest from "./pages/resident/SubmitRequest";
import MyRequests from "./pages/resident/MyRequests";
import MyQRCode from "./pages/resident/MyQRCode";
import ResidentProfile from "./pages/resident/ResidentProfile";

const ADMIN_KEY_TO_ROUTE = {
    dashboard: "/admin/dashboard",
    walkIn: "/admin/walkin-issuance",
    manageRequests: "/admin/manage-requests",
    residentRecords: "/admin/resident-records",
    reports: "/admin/reports",
    logs: "/admin/logs-audit-trail",
    manageAccounts: "/admin/manage-accounts",
    settings: "/admin/settings",
};

function readStoredAuth(storageKey) {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function useSessionData() {
    const adminState = readStoredAuth("certifast_admin_auth");
    const residentState = readStoredAuth("certifast_resident_auth");
    console.log("[useSessionData] certifast_admin_auth", adminState);
    console.log("[useSessionData] certifast_resident_auth", residentState);

    return {
        admin: adminState?.admin || null,
        resident: residentState?.resident || null,
    };
}

const ADMIN_ONLY_ROUTES = [
    "/admin/logs-audit-trail",
    "/admin/manage-accounts",
    "/admin/settings",
];

function AdminPage({ Component, adminOnly = false }) {
    const navigate = useNavigate();
    const { admin } = useSessionData();
    console.log("[AdminPage] session admin:", admin);

    if (!admin) {
        return <Navigate to="/admin/login" replace />;
    }

    const resolvedAdmin = admin; // Use actual logged-in admin object

    const handleAdminNavigate = (pageKey) => {
        const route = ADMIN_KEY_TO_ROUTE[pageKey];
        if (route) navigate(route);
    };

    const handleAdminLogout = () => {
        localStorage.removeItem("certifast_admin_auth");
        localStorage.removeItem("certifast_admin_token");
        navigate("/admin/login");
    };

    // Redirect non-admin users away from admin-only pages
    const resolvedRole = String(resolvedAdmin.role || "")
        .trim()
        .toLowerCase();
    if (
        adminOnly &&
        resolvedRole !== "admin" &&
        resolvedRole !== "superadmin"
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <Component
            admin={resolvedAdmin}
            onNavigate={handleAdminNavigate}
            onLogout={handleAdminLogout}
        />
    );
}

function ResidentLoginRoute() {
    const navigate = useNavigate();

    return <ResidentLogin onLogin={() => navigate("/resident/home")} />;
}

function ResidentRegisterRoute() {
    const navigate = useNavigate();

    return <ResidentRegister onSuccess={() => navigate("/resident/login")} />;
}

function ResidentHomeRoute() {
    const navigate = useNavigate();
    const { resident } = useSessionData();

    const handleResidentLogout = () => {
        localStorage.removeItem("certifast_resident_auth");
        localStorage.removeItem("certifast_resident_token");
        navigate("/resident/login");
    };

    return <ResidentHome resident={resident} onLogout={handleResidentLogout} />;
}

function ResidentQrRoute() {
    const { resident } = useSessionData();
    return <MyQRCode resident={resident} />;
}

function ResidentProfileRoute() {
    const navigate = useNavigate();
    const { resident } = useSessionData();
    const handleLogout = () => {
        localStorage.removeItem("certifast_resident_auth");
        localStorage.removeItem("certifast_resident_token");
        navigate("/resident/login");
    };
    return <ResidentProfile resident={resident} onLogout={handleLogout} />;
}

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/resident/login" replace />}
            />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/admin/dashboard"
                element={<AdminPage Component={Dashboard} />}
            />
            <Route
                path="/admin/walkin-issuance"
                element={<AdminPage Component={WalkInIssuance} />}
            />
            <Route
                path="/admin/manage-requests"
                element={<AdminPage Component={ManageRequests} />}
            />
            <Route
                path="/admin/resident-records"
                element={<AdminPage Component={ResidentRecords} />}
            />
            <Route
                path="/admin/reports"
                element={<AdminPage Component={Reports} />}
            />
            <Route
                path="/admin/logs-audit-trail"
                element={<AdminPage Component={LogsAuditTrail} adminOnly />}
            />
            <Route
                path="/admin/manage-accounts"
                element={<AdminPage Component={ManageAccounts} />}
            />
            <Route
                path="/admin/settings"
                element={<AdminPage Component={Settings} adminOnly />}
            />
            <Route path="/resident/login" element={<ResidentLoginRoute />} />
            <Route
                path="/resident/register"
                element={<ResidentRegisterRoute />}
            />
            <Route
                path="/login"
                element={<Navigate to="/resident/login" replace />}
            />
            <Route
                path="/register"
                element={<Navigate to="/resident/register" replace />}
            />
            <Route
                path="/signup"
                element={<Navigate to="/resident/register" replace />}
            />
            <Route
                path="/resident/signup"
                element={<Navigate to="/resident/register" replace />}
            />
            <Route path="/resident/home" element={<ResidentHomeRoute />} />
            <Route
                path="/resident/submit-request"
                element={<SubmitRequest />}
            />
            <Route path="/resident/my-requests" element={<MyRequests />} />
            <Route path="/resident/my-qr" element={<ResidentQrRoute />} />
            <Route
                path="/resident/profile"
                element={<ResidentProfileRoute />}
            />

            <Route
                path="*"
                element={<Navigate to="/resident/login" replace />}
            />
        </Routes>
    );
}
