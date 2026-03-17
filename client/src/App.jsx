// 📄 DEV ONLY — replace with the real App.jsx before pushing to GitHub
// ⚠️  Add client/src/App.jsx to .gitignore so this never gets committed

import { useState } from "react";

// ── Admin pages ───────────────────────────────────────────────
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import WalkInIssuance from "./pages/admin/WalkInIssuance";
import ManageRequests from "./pages/admin/ManageRequests";
import ResidentRecords from "./pages/admin/ResidentRecords";
// import Reports from "./pages/admin/Reports";
// import LogsAuditTrail from "./pages/admin/LogsAuditTrail";
// import ManageAccounts from "./pages/admin/ManageAccounts";
// import Settings from "./pages/admin/Settings";

// ── Resident pages ────────────────────────────────────────────
// import ResidentLogin from "./pages/resident/ResidentLogin";
// import ResidentRegister from "./pages/resident/ResidentRegister";
// import ResidentHome from "./pages/resident/ResidentHome";
// import SubmitRequest from "./pages/resident/SubmitRequest";
// import MyRequests from "./pages/resident/MyRequests";
// import MyQRCode from "./pages/resident/MyQRCode";

// =============================================================
// Mock data — pass as props when pages need user context
// TODO: Update fields to match your actual DB schema
// =============================================================
const MOCK_ADMIN = {
    id: 1,
    name: "Dante Administrador",
    email: "admin@easttapinac.gov.ph",
    role: "superadmin", // or "admin"
};

const MOCK_RESIDENT = {
    id: 101,
    name: "Juan Dela Cruz",
    email: "juan@email.com",
    address: "14th Street, East Tapinac, Olongapo City",
};

// =============================================================
// Page registry
// Uncomment the import above first, then add key to builtPages
// =============================================================
const PAGES = [
    { key: "adminLogin", label: "Admin Login", group: "Admin" },
    { key: "dashboard", label: "Dashboard", group: "Admin" },
    { key: "walkIn", label: "Walk-in Issuance", group: "Admin" },
    { key: "manageRequests", label: "Manage Requests", group: "Admin" },
    { key: "residentRecords", label: "Resident Records", group: "Admin" },
    { key: "reports", label: "Reports & Stats", group: "Admin" },
    { key: "logs", label: "Logs & Audit Trail", group: "Admin" },
    { key: "manageAccounts", label: "Manage Accounts", group: "Admin — SA" },
    { key: "settings", label: "System Settings", group: "Admin — SA" },
    { key: "residentLogin", label: "Login", group: "Resident" },
    { key: "residentRegister", label: "Register", group: "Resident" },
    { key: "residentHome", label: "Home", group: "Resident" },
    { key: "submitRequest", label: "Submit Request", group: "Resident" },
    { key: "myRequests", label: "My Requests", group: "Resident" },
    { key: "myQRCode", label: "My QR Code", group: "Resident" },
];

const GROUPS = [...new Set(PAGES.map((p) => p.group))];

// TODO: Add key here as each page gets built
const builtPages = new Set([
    "adminLogin",
    "dashboard",
    "walkIn",
    "manageRequests",
    "residentRecords",
    "reports",
    "logs",
    "manageAccounts",
    "settings",
    "residentLogin",
    "residentRegister",
    "residentHome",
    "submitRequest",
    "myRequests",
    "myQRCode",
]);

// =============================================================
// App
// =============================================================
export default function App() {
    const [page, setPage] = useState("adminLogin");
    const [minimized, setMinimized] = useState(false);

    const renderPage = () => {
        switch (page) {
            case "adminLogin":
                return <AdminLogin onLogin={() => setPage("dashboard")} />;
            case "dashboard":
                // return <Dashboard admin={MOCK_ADMIN} onLogout={() => setPage("adminLogin")} />;
                return (
                    <Dashboard
                        admin={MOCK_ADMIN}
                        onLogout={() => setPage("adminLogin")}
                    />
                );
            case "walkIn":
                // return <WalkInIssuance admin={MOCK_ADMIN} />;
                return (
                    <WalkInIssuance
                        admin={MOCK_ADMIN}
                        onLogout={() => setPage("adminLogin")}
                    />
                );
            case "manageRequests":
                // return <ManageRequests admin={MOCK_ADMIN} />;
                return (
                    <ManageRequests
                        admin={MOCK_ADMIN}
                        onLogout={() => setPage("adminLogin")}
                    />
                );
            case "residentRecords":
                // return <ResidentRecords admin={MOCK_ADMIN} />;
                return (
                    <ResidentRecords
                        admin={MOCK_ADMIN}
                        onLogout={() => setPage("adminLogin")}
                    />
                );
            case "reports":
                // return <Reports admin={MOCK_ADMIN} />;
                return <Placeholder label="Reports & Statistics" />;
            case "logs":
                // return <LogsAuditTrail admin={MOCK_ADMIN} />;
                return <Placeholder label="Logs & Audit Trail" />;
            case "manageAccounts":
                // return <ManageAccounts admin={MOCK_ADMIN} />;
                return <Placeholder label="Manage Accounts" />;
            case "settings":
                // return <Settings admin={MOCK_ADMIN} />;
                return <Placeholder label="System Settings" />;
            case "residentLogin":
                // return <ResidentLogin onLogin={() => setPage("residentHome")} />;
                return <Placeholder label="Resident Login" />;
            case "residentRegister":
                // return <ResidentRegister onSuccess={() => setPage("residentLogin")} />;
                return <Placeholder label="Resident Register" />;
            case "residentHome":
                // return <ResidentHome resident={MOCK_RESIDENT} onLogout={() => setPage("residentLogin")} />;
                return <Placeholder label="Resident Home" />;
            case "submitRequest":
                // return <SubmitRequest resident={MOCK_RESIDENT} />;
                return <Placeholder label="Submit Request" />;
            case "myRequests":
                // return <MyRequests resident={MOCK_RESIDENT} />;
                return <Placeholder label="My Requests" />;
            case "myQRCode":
                // return <MyQRCode resident={MOCK_RESIDENT} />;
                return <Placeholder label="My QR Code" />;
            default:
                return <Placeholder label="Page not found" />;
        }
    };

    return (
        <>
            {renderPage()}

            {/* ── Floating dev switcher ── */}
            <div style={sw.wrapper}>
                {/* Title row with minimize button */}
                <div style={sw.titleRow}>
                    <span style={sw.title}>🛠 Dev Switcher</span>
                    <button
                        style={sw.minimizeBtn}
                        onClick={() => setMinimized((m) => !m)}
                        title={minimized ? "Expand" : "Minimize"}
                    >
                        {minimized ? "▲" : "▼"}
                    </button>
                </div>

                {/* Page buttons — hidden when minimized */}
                {!minimized && (
                    <div style={sw.body}>
                        {GROUPS.map((group, gi) => (
                            <div key={group}>
                                {gi > 0 && <div style={sw.divider} />}
                                <div style={sw.groupRow}>
                                    <span style={sw.groupLabel}>{group}</span>
                                    <div style={sw.btnRow}>
                                        {PAGES.filter(
                                            (p) => p.group === group,
                                        ).map((p) => {
                                            const isBuilt = builtPages.has(
                                                p.key,
                                            );
                                            const isActive = page === p.key;
                                            return (
                                                <button
                                                    key={p.key}
                                                    style={btnStyle(
                                                        isActive,
                                                        isBuilt,
                                                    )}
                                                    onClick={() =>
                                                        isBuilt &&
                                                        setPage(p.key)
                                                    }
                                                    title={
                                                        isBuilt
                                                            ? p.label
                                                            : `${p.label} — not built yet`
                                                    }
                                                >
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// =============================================================
// Switcher styles
// =============================================================
const sw = {
    wrapper: {
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#0E2554",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        maxWidth: "calc(100vw - 32px)",
        border: "1px solid rgba(201,162,39,0.25)",
        overflow: "hidden",
        fontFamily: "sans-serif",
    },
    titleRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 12px",
        borderBottom: "1px solid rgba(201,162,39,0.15)",
    },
    title: {
        fontSize: 11,
        fontWeight: 700,
        color: "rgba(201,162,39,0.8)",
        letterSpacing: "0.05em",
    },
    minimizeBtn: {
        background: "none",
        border: "none",
        color: "rgba(255,255,255,0.45)",
        fontSize: 10,
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: 4,
        lineHeight: 1,
        transition: "color 0.15s",
    },
    body: {
        padding: "8px 12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    divider: {
        height: 1,
        background: "rgba(201,162,39,0.12)",
        margin: "2px 0",
    },
    groupRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
    },
    groupLabel: {
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(201,162,39,0.5)",
        minWidth: 58,
        flexShrink: 0,
        paddingTop: 5,
    },
    btnRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
    },
};

const btnStyle = (active, built) => ({
    padding: "4px 10px",
    borderRadius: 6,
    border: built ? "none" : "1px dashed rgba(255,255,255,0.15)",
    cursor: built ? "pointer" : "default",
    fontSize: 10,
    fontWeight: 600,
    background: active
        ? "#C9A227"
        : built
          ? "rgba(255,255,255,0.08)"
          : "transparent",
    color: active
        ? "#0E2554"
        : built
          ? "rgba(255,255,255,0.8)"
          : "rgba(255,255,255,0.28)",
    transition: "all 0.15s",
});

// =============================================================
// Placeholder for unbuilt pages
// =============================================================
function Placeholder({ label }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#091a3e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "1.5px dashed rgba(201,162,39,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                }}
            >
                🚧
            </div>
            <p
                style={{
                    color: "#C9A227",
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                }}
            >
                {label}
            </p>
            <p
                style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 12,
                    margin: 0,
                }}
            >
                Not built yet — coming soon
            </p>
        </div>
    );
}
