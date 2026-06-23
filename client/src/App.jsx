import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useMemo } from "react";

import LandingPage from "./pages/LandingPage";
import { getPublicBrandingSettings } from "./services/publicBrandingService";
import {
    applySystemTheme,
    cacheSystemTheme,
    getCachedSystemTheme,
} from "./theme";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const WalkInIssuance = lazy(() => import("./pages/admin/WalkInIssuance"));
const ManageRequests = lazy(() => import("./pages/admin/ManageRequests"));
const ResidentRecords = lazy(() => import("./pages/admin/ResidentRecords"));
const LogsAuditTrail = lazy(() => import("./pages/admin/LogsAuditTrail"));
const ManageAccounts = lazy(() => import("./pages/admin/ManageAccounts"));
const Settings = lazy(() => import("./pages/admin/Settings"));

const ResidentLogin = lazy(() => import("./pages/resident/ResidentLogin"));
const ResidentRegister = lazy(() => import("./pages/resident/ResidentRegister"));
const CompleteRegistration = lazy(
    () => import("./pages/resident/CompleteRegistration"),
);
const ResidentHome = lazy(() => import("./pages/resident/ResidentHome"));
const SubmitRequest = lazy(() => import("./pages/resident/SubmitRequest"));
const MyRequests = lazy(() => import("./pages/resident/MyRequests"));
const MyQRCode = lazy(() => import("./pages/resident/MyQRCode"));
const ResidentProfile = lazy(() => import("./pages/resident/ResidentProfile"));
const ResidentNotifications = lazy(
    () => import("./pages/resident/ResidentNotifications"),
);

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

function AdminPage({
    PageComponent,
    adminOnly = false,
    superadminOnly = false,
}) {
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

    const normalizedRole = String(resolvedAdmin.role || "").toLowerCase();

    if (superadminOnly && normalizedRole !== "superadmin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Admin pages are available to both admin and superadmin.
    if (
        adminOnly &&
        normalizedRole !== "admin" &&
        normalizedRole !== "superadmin"
    ) {
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

function RouteLoadingFallback() {
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                background:
                    "linear-gradient(145deg, var(--color-primary-dark), var(--color-primary))",
                color: "#fff",
                fontFamily: "'Source Serif 4', serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    border: "1px solid rgba(var(--color-accent-rgb), 0.24)",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                }}
            >
                <span
                    aria-hidden="true"
                    style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "var(--color-accent-soft)",
                        borderRadius: "50%",
                        animation: "route-loading-spin 0.7s linear infinite",
                    }}
                />
                Loading CertiFast...
                <style>{`
                    @keyframes route-loading-spin {
                        to { transform: rotate(360deg); }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        [role="status"] span { animation: none !important; }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default function App() {
    useEffect(() => {
        let mounted = true;
        applySystemTheme(getCachedSystemTheme());

        getPublicBrandingSettings()
            .then((branding) => {
                if (!mounted) return;
                const appliedTheme = applySystemTheme(branding.systemTheme);
                cacheSystemTheme(appliedTheme);
            })
            .catch(() => {});

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
                <Route path="/" element={<LandingPage />} />

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
                    element={
                        <AdminPage
                            PageComponent={LogsAuditTrail}
                            superadminOnly
                        />
                    }
                />
                <Route
                    path="/admin/manage-accounts"
                    element={
                        <AdminPage
                            PageComponent={ManageAccounts}
                            superadminOnly
                        />
                    }
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
                <Route
                    path="/resident/my-requests"
                    element={<MyRequestsRoute />}
                />
                <Route path="/resident/my-qr" element={<ResidentQrRoute />} />
                <Route
                    path="/resident/notifications"
                    element={<ResidentNotificationsRoute />}
                />
                <Route
                    path="/resident/profile"
                    element={<ResidentProfileRoute />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
