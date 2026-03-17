// =============================================================
// FILE: client/src/pages/admin/LogsAuditTrail.jsx
// SUPERADMIN ONLY — do not show in sidebar for regular staff
// =============================================================
// TODO (Backend Dev):
//   - GET /api/logs?search=&type=&actor=&date=&page=&limit=
//     → { logs: [...], total, page, totalPages }
//   - GET /api/logs/stats → { total, today, activeSessions, settingsChanges }
//   - GET /api/logs/:id → single log entry detail
//   - Logs are immutable — no DELETE or UPDATE endpoints
//   - All endpoints require adminToken + superadmin role
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FilePlus,
    FileText,
    Users,
    BarChart2,
    ScrollText,
    UserCog,
    Settings,
    LogOut,
    Search,
    Lock,
    ChevronLeft,
    ChevronRight,
    X,
    Menu,
} from "lucide-react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";

// =============================================================
// useWindowSize
// =============================================================
function useWindowSize() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    return width;
}

// =============================================================
// Inject styles once
// =============================================================
if (!document.head.querySelector("[data-cf-logs]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-logs", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes sidebarSlideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes drawerSlideIn  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes drawerSlideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .lg-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .lg-nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      font-size:12.5px; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; text-align:left; font-family:'Source Serif 4',serif;
    }
    .lg-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .lg-nav-item.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .lg-nav-item-icon {
      display:flex; align-items:center; justify-content:center; padding:10px 0;
      color:rgba(255,255,255,0.65); cursor:pointer; border-left:3px solid transparent;
      transition:all 0.15s; background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; font-family:'Source Serif 4',serif;
    }
    .lg-nav-item-icon:hover { background:rgba(255,255,255,0.06); }
    .lg-nav-item-icon.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .lg-log-row {
      display:grid; grid-template-columns:140px 110px 1fr 160px 100px;
      align-items:center; padding:12px 20px; border-bottom:1px solid #f0ece4;
      transition:background .1s; cursor:pointer;
    }
    .lg-log-row:last-child { border-bottom:none; }
    .lg-log-row:hover { background:#faf8f4; }
    .lg-mob-row { padding:14px 16px; border-bottom:1px solid #f0ece4; cursor:pointer; transition:background .1s; }
    .lg-mob-row:hover { background:#faf8f4; }
    .lg-mob-row:last-child { border-bottom:none; }
    .lg-badge { display:inline-flex; align-items:center; gap:5px; font-size:9.5px; font-weight:700; letter-spacing:.5px; padding:3px 9px; border-radius:10px; text-transform:uppercase; white-space:nowrap; }
    .lg-badge.login    { background:#e8eef8; color:#1a4a8a; }
    .lg-badge.logout   { background:#f0ece4; color:#6a5a4a; }
    .lg-badge.request  { background:#e8f5ee; color:#1a7a4a; }
    .lg-badge.walkin   { background:#f0ebff; color:#6a3db8; }
    .lg-badge.qrscan   { background:#fff3e0; color:#b86800; }
    .lg-badge.settings { background:#fdecea; color:#b02020; }
    .lg-search-input {
      width:100%; padding:7px 12px 7px 32px; border:1.5px solid #e4dfd4;
      border-radius:4px; font-family:'Source Serif 4',serif; font-size:12px;
      color:#1a1a2e; outline:none; background:#fff;
    }
    .lg-search-input:focus { border-color:#0e2554; }
    .lg-select {
      padding:7px 12px; border:1.5px solid #e4dfd4; border-radius:4px;
      font-family:'Source Serif 4',serif; font-size:11.5px; color:#1a1a2e;
      background:#fff; outline:none; cursor:pointer;
    }
    .lg-select:focus { border-color:#0e2554; }
    .lg-pg-btn {
      min-width:30px; height:30px; padding:0 9px; border:1.5px solid #e4dfd4;
      border-radius:4px; background:#fff; font-size:11.5px; color:#4a4a6a;
      cursor:pointer; font-family:'Source Serif 4',serif;
      display:inline-flex; align-items:center; justify-content:center; transition:all .15s;
    }
    .lg-pg-btn:hover:not(:disabled) { background:#f8f6f1; border-color:#0e2554; color:#0e2554; }
    .lg-pg-btn.active { background:#0e2554; color:#fff; border-color:#0e2554; font-weight:700; }
    .lg-pg-btn:disabled { opacity:.35; cursor:not-allowed; }
    .lg-drawer {
      position:fixed; top:0; right:0; bottom:0; width:440px;
      background:#fff; z-index:501; display:flex; flex-direction:column;
      box-shadow:-8px 0 32px rgba(0,0,0,.14);
      animation:drawerSlideIn .25s cubic-bezier(.4,0,.2,1) both;
    }
    .lg-drawer-mobile {
      position:fixed; left:0; right:0; bottom:0; max-height:88vh;
      background:#fff; z-index:501; display:flex; flex-direction:column;
      box-shadow:0 -8px 32px rgba(0,0,0,.14); border-radius:16px 16px 0 0;
      animation:drawerSlideUp .25s cubic-bezier(.4,0,.2,1) both;
    }
    .lg-drawer-body { flex:1; overflow-y:auto; padding:22px 24px; }
    .lg-drawer-body::-webkit-scrollbar { width:4px; }
    .lg-drawer-body::-webkit-scrollbar-thumb { background:#e4dfd4; border-radius:4px; }
    .lg-logout-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); padding:4px; transition:color .15s; display:flex; align-items:center; }
    .lg-logout-btn:hover { color:rgba(255,255,255,.7); }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Helpers
// =============================================================
function formatDate() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function formatDateShort() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// =============================================================
// Mock data
// =============================================================
const MOCK_LOGS = [
    {
        id: "LOG-2841",
        date: "Mar 14, 2026",
        time: "09:41:22",
        type: "request",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "Released certificate for Maria Reyes Santos",
        meta: "REQ-2026-0198 · Barangay Clearance",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2840",
        date: "Mar 14, 2026",
        time: "09:38:05",
        type: "qrscan",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "QR scan verified for Maria Reyes Santos",
        meta: "QR-ET-2025-0042 · Pickup verification",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2839",
        date: "Mar 14, 2026",
        time: "09:22:14",
        type: "walkin",
        actor: "Maria Santos",
        role: "Staff",
        desc: "Walk-in issuance: Certificate of Residency",
        meta: "WI-2026-0091 · Jose Mendoza",
        ip: "192.168.1.15",
    },
    {
        id: "LOG-2838",
        date: "Mar 14, 2026",
        time: "09:15:00",
        type: "login",
        actor: "Maria Santos",
        role: "Staff",
        desc: "Successful login to CertiFast admin panel",
        meta: "Session started · Chrome 122 · Windows 11",
        ip: "192.168.1.15",
    },
    {
        id: "LOG-2837",
        date: "Mar 14, 2026",
        time: "08:58:33",
        type: "request",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "Approved request for Roberto Villanueva",
        meta: "REQ-2026-0197 · Good Moral Certificate",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2836",
        date: "Mar 14, 2026",
        time: "08:45:10",
        type: "request",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "Rejected request — insufficient documents",
        meta: "REQ-2026-0196 · Business Permit · Ana Bautista",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2835",
        date: "Mar 14, 2026",
        time: "08:30:01",
        type: "login",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "Successful login to CertiFast admin panel",
        meta: "Session started · Firefox 124 · Windows 10",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2834",
        date: "Mar 13, 2026",
        time: "17:02:45",
        type: "logout",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "User logged out of CertiFast admin panel",
        meta: "Session ended · Duration: 8h 12m",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2833",
        date: "Mar 13, 2026",
        time: "16:48:20",
        type: "settings",
        actor: "Admin Superuser",
        role: "Superadmin",
        desc: "Updated barangay branding — captain name changed",
        meta: "system_settings · captain_name field",
        ip: "192.168.1.1",
    },
    {
        id: "LOG-2832",
        date: "Mar 13, 2026",
        time: "16:30:11",
        type: "walkin",
        actor: "Maria Santos",
        role: "Staff",
        desc: "Walk-in issuance: Barangay Clearance",
        meta: "WI-2026-0090 · Danilo Ramos",
        ip: "192.168.1.15",
    },
    {
        id: "LOG-2831",
        date: "Mar 13, 2026",
        time: "15:55:04",
        type: "qrscan",
        actor: "Maria Santos",
        role: "Staff",
        desc: "QR scan verified for Fernando Ocampo III",
        meta: "QR-ET-2024-0017 · Pickup verification",
        ip: "192.168.1.15",
    },
    {
        id: "LOG-2830",
        date: "Mar 13, 2026",
        time: "15:40:22",
        type: "request",
        actor: "Maria Santos",
        role: "Staff",
        desc: "Marked ready for pickup — Fernando Ocampo III",
        meta: "REQ-2026-0195 · Barangay Clearance",
        ip: "192.168.1.15",
    },
    {
        id: "LOG-2829",
        date: "Mar 13, 2026",
        time: "14:22:18",
        type: "settings",
        actor: "Admin Superuser",
        role: "Superadmin",
        desc: "Certificate type disabled — Cert of Cohabitation",
        meta: "certificate_templates · is_active set to 0",
        ip: "192.168.1.1",
    },
    {
        id: "LOG-2828",
        date: "Mar 13, 2026",
        time: "13:10:05",
        type: "login",
        actor: "Admin Superuser",
        role: "Superadmin",
        desc: "Successful login to CertiFast admin panel",
        meta: "Session started · Chrome 122 · macOS Sonoma",
        ip: "192.168.1.1",
    },
    {
        id: "LOG-2827",
        date: "Mar 13, 2026",
        time: "11:05:33",
        type: "walkin",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "Walk-in issuance: Certificate of Indigency",
        meta: "WI-2026-0089 · Liza Gomez",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2826",
        date: "Mar 13, 2026",
        time: "10:44:19",
        type: "request",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "Approved request for Carla Mae Bautista",
        meta: "REQ-2026-0194 · Certificate of Residency",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2825",
        date: "Mar 13, 2026",
        time: "10:28:07",
        type: "qrscan",
        actor: "Juan Dela Cruz",
        role: "Staff",
        desc: "QR scan verified for Benjamin Cruz Lopez",
        meta: "QR-ET-2025-0188 · Pickup verification",
        ip: "192.168.1.12",
    },
    {
        id: "LOG-2824",
        date: "Mar 12, 2026",
        time: "16:59:00",
        type: "logout",
        actor: "Maria Santos",
        role: "Staff",
        desc: "User logged out of CertiFast admin panel",
        meta: "Session ended · Duration: 7h 44m",
        ip: "192.168.1.15",
    },
    {
        id: "LOG-2823",
        date: "Mar 12, 2026",
        time: "15:30:44",
        type: "settings",
        actor: "Admin Superuser",
        role: "Superadmin",
        desc: "E-signature updated for Punong Barangay",
        meta: "system_settings · esig_primary field",
        ip: "192.168.1.1",
    },
    {
        id: "LOG-2822",
        date: "Mar 12, 2026",
        time: "14:12:30",
        type: "request",
        actor: "Maria Santos",
        role: "Staff",
        desc: "Released certificate for Jose Dela Cruz Jr.",
        meta: "REQ-2026-0193 · Certificate of Indigency",
        ip: "192.168.1.15",
    },
];

const TYPE_CONFIG = {
    login: { label: "Login" },
    logout: { label: "Logout" },
    request: { label: "Request" },
    walkin: { label: "Walk-in" },
    qrscan: { label: "QR Scan" },
    settings: { label: "Settings" },
};

const UNIQUE_ACTORS = [...new Set(MOCK_LOGS.map((l) => l.actor))];
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

// =============================================================
// Log Detail Drawer
// =============================================================
function LogDrawer({ log, onClose, isMobile }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [log?.id, onClose]);

    if (!log) return null;
    const cfg = TYPE_CONFIG[log.type] || TYPE_CONFIG.login;

    const Row = ({ label, children, mono }) => (
        <div style={{ marginBottom: 16 }}>
            <div
                style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "#9090aa",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 4,
                    fontFamily: "'Source Serif 4',serif",
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 13,
                    color: "#1a1a2e",
                    lineHeight: 1.5,
                    fontFamily: mono
                        ? "'Courier New',monospace"
                        : "'Source Serif 4',serif",
                    fontSize: mono ? 11.5 : 13,
                }}
            >
                {children}
            </div>
        </div>
    );

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(9,26,62,.45)",
                    zIndex: 500,
                }}
                onClick={onClose}
            />
            <div className={isMobile ? "lg-drawer-mobile" : "lg-drawer"}>
                {isMobile && (
                    <div
                        style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            background: "#ddd",
                            margin: "12px auto 0",
                        }}
                    />
                )}
                <div
                    style={{
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#0e2554",
                            }}
                        >
                            Log Entry Detail
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                marginTop: 2,
                                fontFamily: "'Courier New',monospace",
                            }}
                        >
                            {log.id}
                        </div>
                    </div>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9090aa",
                            padding: 4,
                            display: "flex",
                        }}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="lg-drawer-body">
                    <Row label="Action Type">
                        <span
                            className={`lg-badge ${log.type}`}
                            style={{ fontSize: 11, padding: "4px 12px" }}
                        >
                            {cfg.label}
                        </span>
                    </Row>
                    <Row label="Timestamp" mono>
                        {log.date} at {log.time}
                    </Row>
                    <hr
                        style={{
                            border: "none",
                            borderTop: "1px solid #e4dfd4",
                            margin: "16px 0",
                        }}
                    />
                    <Row label="Description">{log.desc}</Row>
                    <Row label="Reference / Metadata" mono>
                        {log.meta}
                    </Row>
                    <hr
                        style={{
                            border: "none",
                            borderTop: "1px solid #e4dfd4",
                            margin: "16px 0",
                        }}
                    />
                    <Row label="Performed By">
                        <strong>{log.actor}</strong>
                        <span
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                marginLeft: 6,
                            }}
                        >
                            ({log.role})
                        </span>
                    </Row>
                    <Row label="IP Address" mono>
                        {log.ip}
                    </Row>
                    <hr
                        style={{
                            border: "none",
                            borderTop: "1px solid #e4dfd4",
                            margin: "16px 0",
                        }}
                    />
                    <div
                        style={{
                            background: "#f8f6f1",
                            border: "1px solid #e4dfd4",
                            borderRadius: 4,
                            padding: "12px 16px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#9090aa",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                marginBottom: 4,
                            }}
                        >
                            System Note
                        </div>
                        <div
                            style={{
                                fontSize: 11.5,
                                color: "#4a4a6a",
                                lineHeight: 1.6,
                            }}
                        >
                            This log entry is permanent and cannot be modified
                            or deleted. It serves as an immutable audit record
                            for accountability and compliance purposes.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// =============================================================
// Main
// =============================================================
export default function LogsAuditTrail({
    admin,
    onLogout,
    onNavigate: navProp,
}) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("logs");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [actorFilter, setActorFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const initials = (name = "") =>
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join("");

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
    };
    const handleLogout = () => {
        if (onLogout) onLogout();
    };
    const clearFilters = () => {
        setSearch("");
        setTypeFilter("");
        setActorFilter("");
        setDateFilter("");
    };

    const filtered = MOCK_LOGS.filter((l) => {
        if (typeFilter && l.type !== typeFilter) return false;
        if (actorFilter && l.actor !== actorFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (
                ![l.actor, l.desc, l.meta, l.id]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            )
                return false;
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginated = filtered.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
    );
    const showStart = filtered.length
        ? Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)
        : 0;
    const showEnd = Math.min(currentPage * rowsPerPage, filtered.length);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, actorFilter, dateFilter, rowsPerPage]);

    const stats = [
        {
            label: "Total Logs",
            value: "2,841",
            sub: "All time entries",
            color: "navy",
        },
        {
            label: "Today's Activity",
            value: "47",
            sub: formatDateShort(),
            color: "green",
        },
        {
            label: "Active Sessions",
            value: "3",
            sub: "Currently logged in",
            color: "amber",
        },
        {
            label: "Settings Changes",
            value: "12",
            sub: "This month",
            color: "purple",
        },
    ];
    const statTop = {
        navy: "linear-gradient(90deg,#0e2554,#163066)",
        green: "linear-gradient(90deg,#1a7a4a,#2da866)",
        amber: "linear-gradient(90deg,#b86800,#e08c20)",
        purple: "linear-gradient(90deg,#6a3db8,#9060e0)",
    };

    return (
        <div className="lg-root">
            {!isMobile && (
                <AdminSidebar
                    admin={
                        admin || {
                            name: "Dante Administrador",
                            role: "superadmin",
                        }
                    }
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    collapsed={isTablet}
                />
            )}
            {showMobileSidebar && (
                <AdminMobileSidebar
                    admin={
                        admin || {
                            name: "Dante Administrador",
                            role: "superadmin",
                        }
                    }
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobileSidebar(false)}
                    onLogout={handleLogout}
                />
            )}
            {selectedLog && (
                <LogDrawer
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                    isMobile={isMobile}
                />
            )}

            <div
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                {/* Topbar */}
                <div
                    style={{
                        height: 62,
                        background: "#fff",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "center",
                        padding: isMobile ? "0 16px" : "0 32px",
                        gap: 12,
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    }}
                >
                    {isMobile && (
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#4a4a6a",
                                padding: 4,
                                display: "flex",
                                alignItems: "center",
                                marginRight: 8,
                            }}
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 700,
                            color: "#0e2554",
                            flex: 1,
                        }}
                    >
                        Logs &amp; Audit Trail
                        {!isMobile && (
                            <span
                                style={{
                                    fontSize: 12,
                                    fontFamily: "'Source Serif 4',serif",
                                    color: "#9090aa",
                                    fontWeight: 400,
                                    marginLeft: 10,
                                }}
                            >
                                Superadmin view — all system activity
                            </span>
                        )}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#f0ebff",
                            border: "1px solid #d4c8f0",
                            borderRadius: 4,
                            padding: "5px 12px",
                            flexShrink: 0,
                        }}
                    >
                        <Lock size={11} color="#6a3db8" strokeWidth={2} />
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#6a3db8",
                                letterSpacing: ".5px",
                            }}
                        >
                            SUPERADMIN ONLY
                        </span>
                    </div>
                    {!isMobile && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                background: "#f8f6f1",
                                border: "1px solid #e4dfd4",
                                borderRadius: 4,
                                padding: "5px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isTablet ? formatDateShort() : formatDate()}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div
                    style={{
                        padding: isMobile ? "16px 16px 24px" : "28px 32px",
                        flex: 1,
                    }}
                >
                    {/* SA notice */}
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg,#f3eeff,#ede8ff)",
                            border: "1px solid #d4c8f0",
                            borderRadius: 6,
                            padding: "12px 18px",
                            marginBottom: 22,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                background: "#6a3db8",
                                borderRadius: 5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Lock size={15} color="white" strokeWidth={2} />
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    color: "#4a1fa8",
                                }}
                            >
                                This page is restricted to Superadmin accounts
                                only.
                            </div>
                            <div
                                style={{
                                    fontSize: 11.5,
                                    color: "#7a5ab8",
                                    marginTop: 2,
                                }}
                            >
                                All system activity is recorded automatically.
                                Logs cannot be deleted or modified.
                            </div>
                        </div>
                    </div>

                    {/* Stat strip */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "repeat(2,1fr)"
                                : "repeat(4,1fr)",
                            gap: isMobile ? 10 : 14,
                            marginBottom: 22,
                        }}
                    >
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 6,
                                    padding: isMobile
                                        ? "12px 14px"
                                        : "16px 20px",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 3,
                                        background: statTop[stat.color],
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        fontWeight: 600,
                                        color: "#9090aa",
                                        letterSpacing: "1.2px",
                                        textTransform: "uppercase",
                                        marginBottom: 6,
                                    }}
                                >
                                    {stat.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: isMobile ? 22 : 26,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                        lineHeight: 1,
                                    }}
                                >
                                    {stat.value}
                                </div>
                                {!isMobile && (
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            color: "#9090aa",
                                            marginTop: 4,
                                        }}
                                    >
                                        {stat.sub}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filter bar */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            padding: "12px 18px",
                            marginBottom: 18,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                flex: 1,
                                minWidth: 200,
                            }}
                        >
                            <Search
                                size={13}
                                color="#9090aa"
                                strokeWidth={2}
                                style={{
                                    position: "absolute",
                                    left: 10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <input
                                className="lg-search-input"
                                type="text"
                                placeholder="Search by actor, description, or reference ID…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div
                            style={{
                                width: 1,
                                height: 24,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <select
                            className="lg-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Action Types</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                            <option value="request">
                                Request Status Change
                            </option>
                            <option value="walkin">Walk-in Issuance</option>
                            <option value="qrscan">QR Scan</option>
                            <option value="settings">Settings Change</option>
                        </select>
                        <select
                            className="lg-select"
                            value={actorFilter}
                            onChange={(e) => setActorFilter(e.target.value)}
                        >
                            <option value="">All Actors</option>
                            {UNIQUE_ACTORS.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>
                        <select
                            className="lg-select"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <div
                            style={{
                                width: 1,
                                height: 24,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: "7px 14px",
                                background: "#fff",
                                border: "1.5px solid #e4dfd4",
                                borderRadius: 4,
                                fontSize: 11.5,
                                color: "#4a4a6a",
                                cursor: "pointer",
                                fontFamily: "'Source Serif 4',serif",
                            }}
                        >
                            Clear Filters
                        </button>
                        <div
                            style={{
                                marginLeft: "auto",
                                fontSize: 11.5,
                                color: "#9090aa",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Showing{" "}
                            <strong>
                                {showStart}–{showEnd}
                            </strong>{" "}
                            of <strong>{filtered.length}</strong> logs
                        </div>
                    </div>

                    {/* Table */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            overflow: "hidden",
                        }}
                    >
                        {!isMobile && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "140px 110px 1fr 160px 100px",
                                    background: "#f8f6f1",
                                    borderBottom: "1px solid #e4dfd4",
                                    padding: "9px 20px",
                                }}
                            >
                                {[
                                    "Timestamp",
                                    "Action",
                                    "Description",
                                    "Actor",
                                    "IP Address",
                                ].map((h) => (
                                    <div
                                        key={h}
                                        style={{
                                            fontSize: 9.5,
                                            fontWeight: 600,
                                            color: "#9090aa",
                                            letterSpacing: "1.2px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            {filtered.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: 40,
                                        color: "#9090aa",
                                        fontSize: 13,
                                        fontStyle: "italic",
                                    }}
                                >
                                    No log entries match your filters.
                                </div>
                            ) : (
                                paginated.map((log) => {
                                    const cfg =
                                        TYPE_CONFIG[log.type] ||
                                        TYPE_CONFIG.login;
                                    const ini = initials(log.actor);
                                    return !isMobile ? (
                                        <div
                                            key={log.id}
                                            className="lg-log-row"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Courier New',monospace",
                                                    fontSize: 10.5,
                                                    color: "#9090aa",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: "#4a4a6a",
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {log.date}
                                                </div>
                                                {log.time}
                                            </div>
                                            <div>
                                                <span
                                                    className={`lg-badge ${log.type}`}
                                                >
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div style={{ paddingRight: 12 }}>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#1a1a2e",
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {log.desc}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10.5,
                                                        color: "#9090aa",
                                                        marginTop: 2,
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                    }}
                                                >
                                                    {log.meta}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 7,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 26,
                                                        height: 26,
                                                        borderRadius: "50%",
                                                        background: "#0e2554",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        color: "#fff",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {ini}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: "#1a1a2e",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {log.actor}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 9.5,
                                                            color: "#9090aa",
                                                        }}
                                                    >
                                                        {log.role}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Courier New',monospace",
                                                    fontSize: 10,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                {log.ip}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            key={log.id}
                                            className="lg-mob-row"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: 8,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 12.5,
                                                            color: "#1a1a2e",
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {log.desc}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#9090aa",
                                                            fontFamily:
                                                                "'Courier New',monospace",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {log.meta}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`lg-badge ${log.type}`}
                                                    style={{ flexShrink: 0 }}
                                                >
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#4a4a6a",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {log.actor}
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                        fontSize: 10,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {log.date} · {log.time}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        {filtered.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "11px 20px",
                                    borderTop: "1px solid #e4dfd4",
                                    background: "#f8f6f1",
                                    flexWrap: "wrap",
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{ fontSize: 11.5, color: "#9090aa" }}
                                >
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <button
                                        className="lg-pg-btn"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage((p) => p - 1)
                                        }
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === totalPages ||
                                                Math.abs(p - currentPage) <= 1,
                                        )
                                        .reduce((acc, p, i, arr) => {
                                            if (i > 0 && p - arr[i - 1] > 1)
                                                acc.push("...");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, i) =>
                                            p === "..." ? (
                                                <span
                                                    key={`e${i}`}
                                                    style={{
                                                        padding: "0 4px",
                                                        color: "#9090aa",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    className={`lg-pg-btn${currentPage === p ? " active" : ""}`}
                                                    onClick={() =>
                                                        setCurrentPage(p)
                                                    }
                                                >
                                                    {p}
                                                </button>
                                            ),
                                        )}
                                    <button
                                        className="lg-pg-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage((p) => p + 1)
                                        }
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: "#9090aa",
                                        }}
                                    >
                                        Rows per page:
                                    </span>
                                    <select
                                        style={{
                                            padding: "4px 8px",
                                            border: "1.5px solid #e4dfd4",
                                            borderRadius: 4,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fontSize: 11.5,
                                            background: "#fff",
                                            outline: "none",
                                            cursor: "pointer",
                                        }}
                                        value={rowsPerPage}
                                        onChange={(e) =>
                                            setRowsPerPage(
                                                parseInt(e.target.value),
                                            )
                                        }
                                    >
                                        {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Styles
// =============================================================
const sd = {
    sidebar: {
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0e2554 0%,#091a3e 100%)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        borderRight: "1px solid rgba(201,162,39,0.15)",
        transition: "width 0.2s",
    },
    brand: {
        padding: "20px 20px 16px",
        borderBottom: "1px solid rgba(201,162,39,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    brandSeal: {
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1.5px solid rgba(201,162,39,0.5)",
        background: "rgba(201,162,39,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    brandName: {
        fontFamily: "'Playfair Display',serif",
        fontSize: 14,
        fontWeight: 700,
        color: "#fff",
        lineHeight: 1.2,
    },
    brandSub: {
        fontSize: 9,
        color: "rgba(201,162,39,0.7)",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        marginTop: 1,
    },
    goldBar: {
        height: 3,
        background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)",
        flexShrink: 0,
    },
    sectionLabel: {
        fontSize: 9,
        color: "rgba(201,162,39,0.5)",
        letterSpacing: "2px",
        textTransform: "uppercase",
        padding: "18px 20px 8px",
        fontWeight: 600,
    },
    navBadge: {
        marginLeft: "auto",
        background: "#c9a227",
        color: "#091a3e",
        fontSize: 9,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 10,
        fontFamily: "'Courier New',monospace",
    },
    navBadgeSA: {
        marginLeft: "auto",
        background: "rgba(201,162,39,0.25)",
        color: "#c9a227",
        fontSize: 9,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 10,
    },
    superAdminSection: {
        marginTop: "auto",
        borderTop: "1px solid rgba(201,162,39,0.15)",
        paddingTop: 8,
        paddingBottom: 8,
    },
    userRow: {
        padding: "14px 20px",
        borderTop: "1px solid rgba(201,162,39,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(201,162,39,0.15)",
        border: "1.5px solid rgba(201,162,39,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "#c9a227",
        fontWeight: 700,
        flexShrink: 0,
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: {
        fontSize: 11.5,
        color: "#fff",
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    userRole: {
        fontSize: 9.5,
        color: "#c9a227",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginTop: 1,
    },
};
