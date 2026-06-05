import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import WalkInIssuance from "./pages/admin/WalkInIssuance";
import ManageRequests from "./pages/admin/ManageRequests";
import ResidentRecords from "./pages/admin/ResidentRecords";
import LogsAuditTrail from "./pages/admin/LogsAuditTrail";
import ManageAccounts from "./pages/admin/ManageAccounts";
import Settings from "./pages/admin/Settings";

import ResidentLogin from "./pages/resident/ResidentLogin";
import ResidentRegister from "./pages/resident/ResidentRegister";
import CompleteRegistration from "./pages/resident/CompleteRegistration";
import ResidentHome from "./pages/resident/ResidentHome";
import SubmitRequest from "./pages/resident/SubmitRequest";
import MyRequests from "./pages/resident/MyRequests";
import MyQRCode from "./pages/resident/MyQRCode";
import ResidentProfile from "./pages/resident/ResidentProfile";
import ResidentNotifications from "./pages/resident/ResidentNotifications";
import { getPublicBrandingSettings } from "./services/publicBrandingService";
import { applySystemTheme } from "./theme";

const ADMIN_KEY_TO_ROUTE = {
    dashboard: "/admin/dashboard",
    walkIn: "/admin/walkin-issuance",
    manageRequests: "/admin/manage-requests",
    residentRecords: "/admin/resident-records",
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
    return useMemo(() => {
        const adminState = readStoredAuth("certifast_admin_auth");
        const residentState = readStoredAuth("certifast_resident_auth");

        return {
            admin: adminState?.admin || null,
            resident: residentState?.resident || null,
        };
    }, []);
}

function clearResidentAuth() {
    localStorage.removeItem("certifast_resident_auth");
    localStorage.removeItem("certifast_resident_token");
}

function useResidentPageProps() {
    const navigate = useNavigate();
    const { resident } = useSessionData();

    const handleResidentLogout = () => {
        clearResidentAuth();
        navigate("/resident/login");
    };

    return { resident, onLogout: handleResidentLogout };
}

const ADMIN_ONLY_ROUTES = [
    "/admin/logs-audit-trail",
    "/admin/manage-accounts",
    "/admin/settings",
];

function AdminPage({ PageComponent, adminOnly = false }) {
    const ResolvedPage = PageComponent;
    const navigate = useNavigate();
    const { admin } = useSessionData();

    const resolvedAdmin = admin || { name: "Administrator", role: "admin" };

    const handleAdminNavigate = (pageKey) => {
        if (typeof pageKey !== "string" || !pageKey.trim()) return;
        const normalizedKey = pageKey.trim();
        const route =
            ADMIN_KEY_TO_ROUTE[normalizedKey] ||
            (normalizedKey.startsWith("/") ? normalizedKey : null);
        if (route) navigate(route);
    };

    const handleAdminLogout = () => {
        localStorage.removeItem("certifast_admin_auth");
        localStorage.removeItem("certifast_admin_token");
        navigate("/admin/login");
    };

    // Redirect staff away from admin-only pages
    if (adminOnly && resolvedAdmin.role !== "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <ResolvedPage
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
    const props = useResidentPageProps();
    return <ResidentHome {...props} />;
}

function ResidentQrRoute() {
    const props = useResidentPageProps();
    return <MyQRCode {...props} />;
}

function ResidentProfileRoute() {
    const props = useResidentPageProps();
    return <ResidentProfile {...props} />;
}

function SubmitRequestRoute() {
    const props = useResidentPageProps();
    return <SubmitRequest {...props} />;
}

function MyRequestsRoute() {
    const props = useResidentPageProps();
    return <MyRequests {...props} />;
}

function ResidentNotificationsRoute() {
    const props = useResidentPageProps();
    return <ResidentNotifications {...props} />;
}

export default function App() {
    useEffect(() => {
        let mounted = true;
        applySystemTheme("default");

        getPublicBrandingSettings()
            .then((branding) => {
                if (mounted) applySystemTheme(branding.systemTheme);
            })
            .catch(() => {
                if (mounted) applySystemTheme("default");
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/resident/login" replace />}
            />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/admin/dashboard"
                element={<AdminPage PageComponent={Dashboard} />}
            />
            <Route
                path="/admin/walkin-issuance"
                element={<AdminPage PageComponent={WalkInIssuance} />}
            />
            <Route
                path="/admin/manage-requests"
                element={<AdminPage PageComponent={ManageRequests} />}
            />
            <Route
                path="/admin/resident-records"
                element={<AdminPage PageComponent={ResidentRecords} />}
            />
            <Route
                path="/admin/logs-audit-trail"
                element={<AdminPage PageComponent={LogsAuditTrail} adminOnly />}
            />
            <Route
                path="/admin/manage-accounts"
                element={<AdminPage PageComponent={ManageAccounts} adminOnly />}
            />
            <Route
                path="/admin/settings"
                element={<AdminPage PageComponent={Settings} adminOnly />}
            />
            <Route path="/resident/login" element={<ResidentLoginRoute />} />
            <Route
                path="/resident/register"
                element={<ResidentRegisterRoute />}
            />
            <Route
                path="/resident/complete-registration"
                element={<CompleteRegistration />}
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
                element={<SubmitRequestRoute />}
            />
            <Route path="/resident/my-requests" element={<MyRequestsRoute />} />
            <Route path="/resident/my-qr" element={<ResidentQrRoute />} />
            <Route
                path="/resident/notifications"
                element={<ResidentNotificationsRoute />}
            />
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
