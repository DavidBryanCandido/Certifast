// =============================================================
// FILE: client/src/pages/admin/ResidentRecords.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/residents?search=&status=&sort=&page=&limit=
//     → { residents: [...], total, page, totalPages }
//   - GET /api/residents/:id → full resident profile for drawer
//   - GET /api/residents/:id/requests → request history
//   - GET /api/residents/stats → { total, active, newThisMonth, totalRequests }
//   - All endpoints require adminToken in Authorization header
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
    ChevronLeft,
    ChevronRight,
    X,
    Printer,
    Menu,
} from "lucide-react";

// TODO: import { useAdminAuth } from "../../context/AdminAuthContext";
// TODO: import { getResidents, getResidentById } from "../../services/residentService";

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
if (!document.head.querySelector("[data-cf-rr]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-rr", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes sidebarSlideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes drawerSlideIn  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes drawerSlideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes modalFadeIn    { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
    .rr-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .rr-nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      font-size:12.5px; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; text-align:left; font-family:'Source Serif 4',serif;
    }
    .rr-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .rr-nav-item.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .rr-nav-item-icon {
      display:flex; align-items:center; justify-content:center; padding:10px 0;
      color:rgba(255,255,255,0.65); cursor:pointer; border-left:3px solid transparent;
      transition:all 0.15s; background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; font-family:'Source Serif 4',serif;
    }
    .rr-nav-item-icon:hover { background:rgba(255,255,255,0.06); }
    .rr-nav-item-icon.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    /* Table rows */
    .rr-res-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 140px 140px 90px 110px 90px;
  align-items: center;
  padding: 13px 22px;
  border-bottom: 1px solid #f0ece4;
  gap: 16px; /* 👈 adds consistent spacing */
}
    .rr-res-row:last-child { border-bottom:none; }
    .rr-res-row:hover { background:#faf8f4; }
    /* Pagination */
    .rr-pg-btn {
      min-width:32px; height:32px; padding:0 10px;
      border:1.5px solid #e4dfd4; border-radius:4px;
      background:#fff; font-size:12px; color:#4a4a6a;
      cursor:pointer; font-family:'Source Serif 4',serif;
      display:inline-flex; align-items:center; justify-content:center;
      transition:all .15s;
    }
    .rr-pg-btn:hover:not(:disabled) { background:#f8f6f1; border-color:#0e2554; color:#0e2554; }
    .rr-pg-btn.active { background:#0e2554; color:#fff; border-color:#0e2554; font-weight:700; }
    .rr-pg-btn:disabled { opacity:.35; cursor:not-allowed; }
    /* Drawer */
    .rr-drawer {
      position:fixed; top:0; right:0; bottom:0; width:520px;
      background:#fff; z-index:501; display:flex; flex-direction:column;
      box-shadow:-8px 0 32px rgba(0,0,0,.14);
      animation:drawerSlideIn .25s cubic-bezier(.4,0,.2,1) both;
    }
    .rr-drawer-mobile {
      position:fixed; left:0; right:0; bottom:0; max-height:92vh;
      background:#fff; z-index:501; display:flex; flex-direction:column;
      box-shadow:0 -8px 32px rgba(0,0,0,.14); border-radius:16px 16px 0 0;
      animation:drawerSlideUp .25s cubic-bezier(.4,0,.2,1) both;
    }
    .rr-drawer-body { flex:1; overflow-y:auto; padding:20px 24px; }
    .rr-drawer-body::-webkit-scrollbar { width:4px; }
    .rr-drawer-body::-webkit-scrollbar-thumb { background:#e4dfd4; border-radius:4px; }
    /* Drawer tabs */
    .rr-dtab {
      padding:11px 0; margin-right:24px; font-size:12px; font-weight:600;
      color:#9090aa; cursor:pointer; border-bottom:2px solid transparent;
      transition:all .15s; background:none; border-left:none; border-right:none; border-top:none;
      font-family:'Source Serif 4',serif;
    }
    .rr-dtab:hover { color:#1a1a2e; }
    .rr-dtab.active { color:#0e2554; border-bottom-color:#0e2554; }
    /* Profile fields */
    .rr-pf-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px 20px; margin-bottom:20px; }
    .rr-pf-field label { font-size:9.5px; font-weight:600; color:#9090aa; letter-spacing:1px; text-transform:uppercase; display:block; margin-bottom:4px; font-family:'Source Serif 4',serif; }
    .rr-pf-val { font-size:13px; color:#1a1a2e; font-weight:600; font-family:'Source Serif 4',serif; }
    /* History table */
    .rr-hist-table { width:100%; border-collapse:collapse; }
    .rr-hist-table th { font-size:9.5px; font-weight:600; color:#9090aa; letter-spacing:1px; text-transform:uppercase; padding:8px 14px; background:#f8f6f1; border-bottom:1px solid #e4dfd4; text-align:left; }
    .rr-hist-table td { padding:11px 14px; font-size:12px; border-bottom:1px solid #f0ece4; color:#1a1a2e; }
    .rr-hist-table tr:last-child td { border-bottom:none; }
    /* Filter inputs */
    .rr-search-input {
      width:100%; padding:8px 12px 8px 34px; border:1.5px solid #e4dfd4;
      border-radius:4px; font-family:'Source Serif 4',serif; font-size:12.5px;
      color:#1a1a2e; outline:none; transition:border-color .15s; background:#fff;
    }
    .rr-search-input:focus { border-color:#0e2554; }
    .rr-select {
      padding:8px 12px; border:1.5px solid #e4dfd4; border-radius:4px;
      font-family:'Source Serif 4',serif; font-size:12px; color:#1a1a2e;
      background:#fff; outline:none; cursor:pointer;
    }
    .rr-select:focus { border-color:#0e2554; }
    /* View btn */
    .rr-view-btn {
      background:none; border:1px solid #e4dfd4; border-radius:4px;
      padding:5px 12px; font-size:10.5px; color:#0e2554; cursor:pointer;
      font-family:'Source Serif 4',serif; transition:all .15s;
    }
    .rr-view-btn:hover { background:#0e2554; color:#fff; border-color:#0e2554; }
    /* Print card btn */
    .rr-print-card-btn {
      display:inline-flex; align-items:center; gap:7px; padding:8px 16px;
      background:#0e2554; color:#fff; border:none; border-radius:4px;
      font-size:12px; font-weight:600; cursor:pointer; font-family:'Source Serif 4',serif;
      transition:background .15s;
    }
    .rr-print-card-btn:hover { background:#163066; }
    /* QR Card wallet */
    .rr-wallet-card {
      width:420px; height:265px; border-radius:10px; overflow:hidden;
      position:relative; outline:2px dashed #aaa; outline-offset:4px;
      box-shadow:0 3px 14px rgba(0,0,0,.15); flex-shrink:0; background:#fff;
    }
    .rr-card-front {
      width:100%; height:100%; background:#fff; display:flex; flex-direction:column;
      overflow:hidden; padding:11px 13px; position:relative; border-radius:10px;
    }
    .rr-card-back { width:100%; height:100%; background:#fff; border-radius:10px; }
    /* Logout btn */
    .rr-logout-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); padding:4px; transition:color .15s; display:flex; align-items:center; }
    .rr-logout-btn:hover { color:rgba(255,255,255,.7); }
    /* Mobile resident card */
    .rr-mob-card { padding:14px 16px; border-bottom:1px solid #f0ece4; cursor:pointer; transition:background .1s; }
    .rr-mob-card:hover { background:#faf8f4; }
    .rr-mob-card:last-child { border-bottom:none; }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Mock data
// TODO: Replace with GET /api/residents and GET /api/residents/stats
// =============================================================
const MOCK_RESIDENTS = [
    {
        id: "#RES-0042",
        name: "Maria Reyes Santos",
        addr: "12 Rizal Street, East Tapinac",
        contact: "09171234567",
        date: "Jan 5, 2025",
        requests: 7,
        status: "Active",
        dob: "June 14, 1985",
        civil: "Married",
        nationality: "Filipino",
        email: "maria.santos@email.com",
        qr: "QR-ET-2025-0042",
    },
    {
        id: "#RES-0081",
        name: "Jose Dela Cruz Jr.",
        addr: "45 Magsaysay Ave, East Tapinac",
        contact: "09281234567",
        date: "Feb 12, 2025",
        requests: 4,
        status: "Active",
        dob: "March 3, 1990",
        civil: "Single",
        nationality: "Filipino",
        email: "jdc.jr@email.com",
        qr: "QR-ET-2025-0081",
    },
    {
        id: "#RES-0113",
        name: "Ana Liza Mendoza",
        addr: "8 Aguinaldo St., East Tapinac",
        contact: "09351234567",
        date: "Mar 1, 2025",
        requests: 2,
        status: "Active",
        dob: "Sept 22, 1998",
        civil: "Single",
        nationality: "Filipino",
        email: "ana.mendoza@email.com",
        qr: "QR-ET-2025-0113",
    },
    {
        id: "#RES-0055",
        name: "Roberto Villanueva",
        addr: "99 Burgos Ext., East Tapinac",
        contact: "09191234567",
        date: "Jan 18, 2025",
        requests: 9,
        status: "Active",
        dob: "July 7, 1978",
        civil: "Married",
        nationality: "Filipino",
        email: "rob.villa@email.com",
        qr: "QR-ET-2025-0055",
    },
    {
        id: "#RES-0204",
        name: "Carla Mae Bautista",
        addr: "3 Luna Street, East Tapinac",
        contact: "09451234567",
        date: "Apr 20, 2025",
        requests: 1,
        status: "Active",
        dob: "Nov 30, 2001",
        civil: "Single",
        nationality: "Filipino",
        email: "carla.mb@email.com",
        qr: "QR-ET-2025-0204",
    },
    {
        id: "#RES-0017",
        name: "Fernando Ocampo III",
        addr: "22 Mabini Street, East Tapinac",
        contact: "09261234567",
        date: "Dec 10, 2024",
        requests: 12,
        status: "Active",
        dob: "Feb 14, 1972",
        civil: "Widowed",
        nationality: "Filipino",
        email: "fern.ocampo@email.com",
        qr: "QR-ET-2024-0017",
    },
    {
        id: "#RES-0330",
        name: "Liza Gomez Aquino",
        addr: "67 Del Pilar St., East Tapinac",
        contact: "09111234567",
        date: "Jun 5, 2025",
        requests: 3,
        status: "Active",
        dob: "Aug 19, 1995",
        civil: "Married",
        nationality: "Filipino",
        email: "liza.aquino@email.com",
        qr: "QR-ET-2025-0330",
    },
    {
        id: "#RES-0009",
        name: "Danilo Ramos Pascual",
        addr: "101 Rizal Ave., East Tapinac",
        contact: "09321234567",
        date: "Nov 3, 2024",
        requests: 5,
        status: "Inactive",
        dob: "Jan 1, 1968",
        civil: "Separated",
        nationality: "Filipino",
        email: "danilo.rp@email.com",
        qr: "QR-ET-2024-0009",
    },
    {
        id: "#RES-0412",
        name: "Sheila Marie Torres",
        addr: "15 Quezon Blvd., East Tapinac",
        contact: "09211234567",
        date: "Jul 14, 2025",
        requests: 2,
        status: "Active",
        dob: "May 25, 2000",
        civil: "Single",
        nationality: "Filipino",
        email: "sheila.torres@email.com",
        qr: "QR-ET-2025-0412",
    },
    {
        id: "#RES-0188",
        name: "Benjamin Cruz Lopez",
        addr: "54 Gallagher Street, East Tapinac",
        contact: "09481234567",
        date: "Mar 22, 2025",
        requests: 6,
        status: "Active",
        dob: "Oct 10, 1983",
        civil: "Married",
        nationality: "Filipino",
        email: "ben.cl@email.com",
        qr: "QR-ET-2025-0188",
    },
];

const MOCK_HISTORY = [
    { cert: "Barangay Clearance", date: "Mar 10, 2026", status: "released" },
    {
        cert: "Certificate of Residency",
        date: "Jan 22, 2026",
        status: "released",
    },
    { cert: "Good Moral Certificate", date: "Nov 3, 2025", status: "released" },
    {
        cert: "Certificate of Indigency",
        date: "Sep 14, 2025",
        status: "released",
    },
    { cert: "Barangay Clearance", date: "Jul 8, 2025", status: "released" },
    { cert: "Business Permit", date: "Apr 2, 2025", status: "rejected" },
    {
        cert: "Certificate of Residency",
        date: "Jan 5, 2025",
        status: "released",
    },
];

const HIST_BADGE = {
    released: { bg: "#e8f5ee", color: "#1a7a4a", label: "Released" },
    rejected: { bg: "#fdecea", color: "#b02020", label: "Rejected" },
    pending: { bg: "#fff3e0", color: "#b86800", label: "Pending" },
    approved: { bg: "#e8eef8", color: "#1a4a8a", label: "Approved" },
    ready: { bg: "#e8eef8", color: "#1a4a8a", label: "Ready" },
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25];

function initials(name) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
function formatDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
function formatDateShort() {
    return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function calcAge(dob) {
    try {
        return 2026 - parseInt(dob.split(", ")[1]);
    } catch {
        return "—";
    }
}

// =============================================================
// Sidebar
// =============================================================
function Sidebar({ admin, activePage, onNavigate, onLogout, collapsed }) {
    const isSA = admin?.role === "superadmin";
    const nav = [
        { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { key: "walkIn", label: "Walk-in Issuance", Icon: FilePlus },
        {
            key: "manageRequests",
            label: "Manage Requests",
            Icon: FileText,
            badge: "12",
        },
        { key: "residentRecords", label: "Resident Records", Icon: Users },
        { key: "reports", label: "Reports & Statistics", Icon: BarChart2 },
        { key: "logs", label: "Logs & Audit Trail", Icon: ScrollText },
    ];
    const sa = [
        { key: "manageAccounts", label: "Manage Accounts", Icon: UserCog },
        { key: "settings", label: "System Settings", Icon: Settings },
    ];
    const NavBtn = ({ item }) =>
        collapsed ? (
            <button
                className={`rr-nav-item-icon${activePage === item.key ? " active" : ""}`}
                onClick={() => onNavigate(item.key)}
                title={item.label}
            >
                <item.Icon size={18} opacity={0.7} />
            </button>
        ) : (
            <button
                className={`rr-nav-item${activePage === item.key ? " active" : ""}`}
                onClick={() => onNavigate(item.key)}
            >
                <item.Icon size={15} opacity={0.7} />
                {item.label}
                {item.badge && <span style={sd.navBadge}>{item.badge}</span>}
            </button>
        );
    return (
        <aside style={{ ...sd.sidebar, width: collapsed ? 60 : 240 }}>
            <div
                style={{
                    ...sd.brand,
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "18px 0" : "20px 20px 16px",
                }}
            >
                <div style={sd.brandSeal}>
                    <span
                        style={{ fontSize: 14, color: "rgba(201,162,39,0.6)" }}
                    >
                        ⚜
                    </span>
                </div>
                {!collapsed && (
                    <div>
                        <div style={sd.brandName}>CertiFast</div>
                        <div style={sd.brandSub}>East Tapinac</div>
                    </div>
                )}
            </div>
            <div style={sd.goldBar} />
            {!collapsed && <div style={sd.sectionLabel}>Main Menu</div>}
            {nav.map((item) => (
                <NavBtn key={item.key} item={item} />
            ))}
            {isSA && (
                <div style={sd.superAdminSection}>
                    {!collapsed && (
                        <div style={{ ...sd.sectionLabel, paddingTop: 10 }}>
                            Superadmin
                        </div>
                    )}
                    {sa.map((item) => (
                        <NavBtn key={item.key} item={item} />
                    ))}
                </div>
            )}
            <div
                style={{
                    ...sd.userRow,
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "14px 0" : "14px 20px",
                }}
            >
                <div style={sd.userAvatar}>{initials(admin?.name || "DA")}</div>
                {!collapsed && (
                    <>
                        <div style={sd.userInfo}>
                            <div style={sd.userName}>
                                {admin?.name || "Dante Administrador"}
                            </div>
                            <div style={sd.userRole}>
                                {admin?.role || "Superadmin"}
                            </div>
                        </div>
                        <button className="rr-logout-btn" onClick={onLogout}>
                            <LogOut size={14} />
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}

// =============================================================
// Mobile sidebar overlay
// =============================================================
function MobileSidebar({ admin, activePage, onNavigate, onClose, onLogout }) {
    const isSA = admin?.role === "superadmin";
    const nav = [
        { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { key: "walkIn", label: "Walk-in Issuance", Icon: FilePlus },
        {
            key: "manageRequests",
            label: "Manage Requests",
            Icon: FileText,
            badge: "12",
        },
        { key: "residentRecords", label: "Resident Records", Icon: Users },
        { key: "reports", label: "Reports & Statistics", Icon: BarChart2 },
        { key: "logs", label: "Logs & Audit Trail", Icon: ScrollText },
    ];
    const sa = [
        { key: "manageAccounts", label: "Manage Accounts", Icon: UserCog },
        { key: "settings", label: "System Settings", Icon: Settings },
    ];
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 200,
                display: "flex",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                }}
                onClick={onClose}
            />
            <aside
                style={{
                    ...sd.sidebar,
                    width: 260,
                    position: "relative",
                    animation: "sidebarSlideIn 0.22s ease both",
                    zIndex: 1,
                }}
            >
                <div style={{ ...sd.brand, justifyContent: "space-between" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div style={sd.brandSeal}>
                            <span
                                style={{
                                    fontSize: 14,
                                    color: "rgba(201,162,39,0.6)",
                                }}
                            >
                                ⚜
                            </span>
                        </div>
                        <div>
                            <div style={sd.brandName}>CertiFast</div>
                            <div style={sd.brandSub}>East Tapinac</div>
                        </div>
                    </div>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.5)",
                            padding: 4,
                        }}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div style={sd.goldBar} />
                <div style={sd.sectionLabel}>Main Menu</div>
                {nav.map((item) => (
                    <button
                        key={item.key}
                        className={`rr-nav-item${activePage === item.key ? " active" : ""}`}
                        onClick={() => {
                            onNavigate(item.key);
                            onClose();
                        }}
                    >
                        <item.Icon size={15} opacity={0.7} />
                        {item.label}
                        {item.badge && (
                            <span style={sd.navBadge}>{item.badge}</span>
                        )}
                    </button>
                ))}
                {isSA && (
                    <div style={sd.superAdminSection}>
                        <div style={{ ...sd.sectionLabel, paddingTop: 10 }}>
                            Superadmin
                        </div>
                        {sa.map((item) => (
                            <button
                                key={item.key}
                                className={`rr-nav-item${activePage === item.key ? " active" : ""}`}
                                onClick={() => {
                                    onNavigate(item.key);
                                    onClose();
                                }}
                            >
                                <item.Icon size={15} opacity={0.7} />
                                {item.label}
                                <span style={sd.navBadgeSA}>SA</span>
                            </button>
                        ))}
                    </div>
                )}
                <div style={sd.userRow}>
                    <div style={sd.userAvatar}>
                        {initials(admin?.name || "DA")}
                    </div>
                    <div style={sd.userInfo}>
                        <div style={sd.userName}>
                            {admin?.name || "Dante Administrador"}
                        </div>
                        <div style={sd.userRole}>
                            {admin?.role || "Superadmin"}
                        </div>
                    </div>
                    <button className="rr-logout-btn" onClick={onLogout}>
                        <LogOut size={14} />
                    </button>
                </div>
            </aside>
        </div>
    );
}

// =============================================================
// QR Card Print Modal
// =============================================================
function QRCardModal({ resident, onClose }) {
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
    }, [onClose]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(9,26,62,.6)",
                zIndex: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 8,
                    width: "100%",
                    maxWidth: 680,
                    overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(0,0,0,.22)",
                    animation: "modalFadeIn .2s ease both",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#0e2554",
                        }}
                    >
                        Print QR Card —{" "}
                        <span style={{ color: "#4a4a6a", fontSize: 14 }}>
                            {resident.name}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9090aa",
                            padding: 4,
                            display: "flex",
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 24px" }}>
                    <p
                        style={{
                            fontSize: 10.5,
                            color: "#9090aa",
                            textAlign: "center",
                            marginBottom: 16,
                            lineHeight: 1.6,
                        }}
                    >
                        Print on card stock, cut along the dashed border, then
                        laminate. The back is intentionally blank.
                    </p>

                    {/* Card sheet */}
                    <div
                        style={{
                            background: "#f0ece4",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            padding: "28px 32px",
                            display: "flex",
                            gap: 28,
                            alignItems: "flex-start",
                            justifyContent: "center",
                            overflowX: "auto",
                        }}
                    >
                        {/* Front */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: "#9090aa",
                                    letterSpacing: "1.5px",
                                    textTransform: "uppercase",
                                }}
                            >
                                ▲ Front Side
                            </div>
                            <div className="rr-wallet-card">
                                <div className="rr-card-front">
                                    {/* Top: seal + barangay name */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 6,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                border: "1.5px solid #0e2554",
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                background: "#eee",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {/* TODO: replace with <img src="/logo.png" /> */}
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: "#0e2554",
                                                }}
                                            >
                                                ⚜
                                            </span>
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: "#0e2554",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                Barangay East Tapinac
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 6,
                                                    color: "#9090aa",
                                                    letterSpacing: ".8px",
                                                    textTransform: "uppercase",
                                                    marginTop: 1,
                                                }}
                                            >
                                                City of Olongapo · Republic of
                                                the Philippines
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            height: 1.5,
                                            background: "#c0392b",
                                            flexShrink: 0,
                                            marginBottom: 1,
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: 2,
                                            background:
                                                "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)",
                                            flexShrink: 0,
                                        }}
                                    />

                                    {/* Body */}
                                    <div
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            gap: 10,
                                            marginTop: 8,
                                        }}
                                    >
                                        {/* Info side */}
                                        <div
                                            style={{
                                                flex: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 5.5,
                                                        fontWeight: 700,
                                                        color: "#9090aa",
                                                        letterSpacing: "1.2px",
                                                        textTransform:
                                                            "uppercase",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Resident Name
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Playfair Display',serif",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        color: "#0e2554",
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {resident.name}
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 5.5,
                                                        fontWeight: 700,
                                                        color: "#9090aa",
                                                        letterSpacing: "1.2px",
                                                        textTransform:
                                                            "uppercase",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Address
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 7,
                                                        color: "#4a4a6a",
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {resident.addr}, Olongapo
                                                    City
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 5.5,
                                                        fontWeight: 700,
                                                        color: "#9090aa",
                                                        letterSpacing: "1.2px",
                                                        textTransform:
                                                            "uppercase",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Resident ID
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                        fontSize: 8,
                                                        color: "#0e2554",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {resident.id}
                                                </div>
                                            </div>
                                        </div>
                                        {/* QR side — empty rectangle placeholder */}
                                        {/* TODO: Replace this placeholder with actual generated QR code image using the qrcode npm package */}
                                        {/* Example: <img src={generateQRDataURL(resident.qr)} width={72} height={72} /> */}
                                        <div
                                            style={{
                                                flexShrink: 0,
                                                width: 76,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 72,
                                                    height: 72,
                                                    border: "1.5px solid #333",
                                                    borderRadius: 3,
                                                    background: "#fff",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Courier New',monospace",
                                                    fontSize: 5,
                                                    color: "#9090aa",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {resident.qr}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div
                            style={{
                                width: 1,
                                background: "#e4dfd4",
                                alignSelf: "stretch",
                                margin: "0 4px",
                            }}
                        />

                        {/* Back — intentionally blank */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: "#9090aa",
                                    letterSpacing: "1.5px",
                                    textTransform: "uppercase",
                                }}
                            >
                                ▲ Back Side (Blank)
                            </div>
                            <div className="rr-wallet-card">
                                <div className="rr-card-back" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "14px 24px",
                        borderTop: "1px solid #e4dfd4",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                        background: "#f8f6f1",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontSize: 11, color: "#9090aa", flex: 1 }}>
                        💡 Tip: Print on card stock or thick paper for best
                        results before laminating.
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 18px",
                            background: "#fff",
                            border: "1.5px solid #e4dfd4",
                            borderRadius: 4,
                            fontSize: 12.5,
                            cursor: "pointer",
                            fontFamily: "'Source Serif 4',serif",
                            color: "#4a4a6a",
                        }}
                    >
                        Cancel
                    </button>
                    {/* TODO: implement actual print — window.print() targets the card only */}
                    <button
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 22px",
                            background: "#0e2554",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'Source Serif 4',serif",
                        }}
                        onClick={() => window.print()}
                    >
                        <Printer size={13} /> Print Card
                    </button>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Resident Drawer
// =============================================================
function ResidentDrawer({ resident, onClose, isMobile, onPrintQR }) {
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        setActiveTab("profile");
        document.body.style.overflow = "hidden";
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [resident?.id, onClose]);

    if (!resident) return null;

    const isActive = resident.status === "Active";

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(9,26,62,.45)",
                    zIndex: 500,
                }}
                onClick={onClose}
            />

            <div className={isMobile ? "rr-drawer-mobile" : "rr-drawer"}>
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

                {/* Header */}
                <div
                    style={{
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "#0e2554",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 16,
                            color: "#fff",
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {initials(resident.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#0e2554",
                            }}
                        >
                            {resident.name}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                marginTop: 3,
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Courier New',monospace",
                                }}
                            >
                                {resident.id}
                            </span>
                            <span
                                style={{
                                    display: "inline-block",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: "2px 9px",
                                    borderRadius: 20,
                                    textTransform: "uppercase",
                                    background: isActive
                                        ? "#e8f5ee"
                                        : "#f0ece4",
                                    color: isActive ? "#1a7a4a" : "#9090aa",
                                }}
                            >
                                {resident.status}
                            </span>
                        </div>
                    </div>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9090aa",
                            padding: 4,
                            transition: "color .15s",
                            flexShrink: 0,
                            display: "flex",
                        }}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #e4dfd4",
                        flexShrink: 0,
                        padding: "0 24px",
                    }}
                >
                    {["profile", "history", "qr"].map((tab) => (
                        <button
                            key={tab}
                            className={`rr-dtab${activeTab === tab ? " active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === "profile"
                                ? "Profile"
                                : tab === "history"
                                  ? "Request History"
                                  : "QR Card"}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="rr-drawer-body">
                    {/* Profile tab */}
                    {activeTab === "profile" && (
                        <>
                            <div className="rr-pf-grid">
                                <div className="rr-pf-field">
                                    <label>Full Name</label>
                                    <div className="rr-pf-val">
                                        {resident.name}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Resident ID</label>
                                    <div
                                        className="rr-pf-val"
                                        style={{
                                            fontFamily:
                                                "'Courier New',monospace",
                                        }}
                                    >
                                        {resident.id}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Date of Birth</label>
                                    <div className="rr-pf-val">
                                        {resident.dob}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Age</label>
                                    <div className="rr-pf-val">
                                        {calcAge(resident.dob)} years old
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Civil Status</label>
                                    <div className="rr-pf-val">
                                        {resident.civil}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Nationality</label>
                                    <div className="rr-pf-val">
                                        {resident.nationality}
                                    </div>
                                </div>
                                <div
                                    className="rr-pf-field"
                                    style={{ gridColumn: "1/-1" }}
                                >
                                    <label>Address</label>
                                    <div className="rr-pf-val">
                                        {resident.addr}, Olongapo City
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Contact Number</label>
                                    <div className="rr-pf-val">
                                        {resident.contact}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Email Address</label>
                                    <div className="rr-pf-val">
                                        {resident.email}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Date Registered</label>
                                    <div className="rr-pf-val">
                                        {resident.date}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Account Status</label>
                                    <div className="rr-pf-val">
                                        <span
                                            style={{
                                                display: "inline-block",
                                                fontSize: 10,
                                                fontWeight: 600,
                                                padding: "2px 9px",
                                                borderRadius: 20,
                                                textTransform: "uppercase",
                                                background: isActive
                                                    ? "#e8f5ee"
                                                    : "#f0ece4",
                                                color: isActive
                                                    ? "#1a7a4a"
                                                    : "#9090aa",
                                            }}
                                        >
                                            {resident.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <hr
                                style={{
                                    border: "none",
                                    borderTop: "1px solid #e4dfd4",
                                    margin: "16px 0",
                                }}
                            />
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#9090aa",
                                    fontStyle: "italic",
                                }}
                            >
                                Resident information is provided during
                                self-registration. Contact the resident directly
                                for corrections.
                            </div>
                        </>
                    )}

                    {/* History tab */}
                    {activeTab === "history" && (
                        <>
                            <div
                                style={{
                                    marginBottom: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ fontSize: 12, color: "#9090aa" }}>
                                    All certificate and permit requests by this
                                    resident.
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    {MOCK_HISTORY.length} requests
                                </div>
                            </div>
                            {/* TODO: replace MOCK_HISTORY with GET /api/residents/:id/requests */}
                            <table className="rr-hist-table">
                                <thead>
                                    <tr>
                                        <th>Cert Type</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_HISTORY.map((h, i) => {
                                        const b =
                                            HIST_BADGE[h.status] ||
                                            HIST_BADGE.pending;
                                        return (
                                            <tr key={i}>
                                                <td>{h.cert}</td>
                                                <td>{h.date}</td>
                                                <td>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            fontSize: 9,
                                                            fontWeight: 600,
                                                            padding: "2px 8px",
                                                            borderRadius: 20,
                                                            background: b.bg,
                                                            color: b.color,
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                    >
                                                        {b.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* QR tab */}
                    {activeTab === "qr" && (
                        <>
                            <div
                                style={{
                                    background: "#f8f6f1",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 6,
                                    padding: 18,
                                    display: "flex",
                                    gap: 18,
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                {/* QR placeholder */}
                                <div
                                    style={{
                                        width: 96,
                                        height: 96,
                                        background: "#fff",
                                        border: "1.5px solid #e4dfd4",
                                        borderRadius: 4,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {/* TODO: render actual QR code using qrcode npm package */}
                                    {/* <img src={generateQRDataURL(resident.qr)} width={88} height={88} /> */}
                                    <QrCodeSVG />
                                </div>
                                <div style={{ flex: 1 }}>
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
                                        Resident QR Code
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Courier New',monospace",
                                            fontSize: 12,
                                            color: "#0e2554",
                                            fontWeight: 700,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {resident.qr}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            color: "#9090aa",
                                            lineHeight: 1.5,
                                            marginBottom: 12,
                                        }}
                                    >
                                        This QR code is permanent and uniquely
                                        tied to this resident's account. It is
                                        used to verify identity during
                                        certificate pickup.
                                    </div>
                                    <button
                                        className="rr-print-card-btn"
                                        onClick={() => onPrintQR(resident)}
                                    >
                                        <Printer size={13} /> Print QR Card
                                    </button>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "#fff3e0",
                                    border: "1px solid rgba(184,104,0,.25)",
                                    borderRadius: 6,
                                    padding: "12px 16px",
                                    fontSize: 11.5,
                                    color: "#b86800",
                                    lineHeight: 1.6,
                                }}
                            >
                                <strong>How to use:</strong> Print the QR card,
                                cut along the dashed border, and give it to the
                                resident to laminate. They present this card at
                                the barangay office during certificate pickup —
                                staff scans the QR to verify identity instantly.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// Simple decorative QR placeholder SVG (matches the HTML wireframe)
function QrCodeSVG() {
    return (
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="2" fill="#0e2554" />
            <rect x="8" y="8" width="16" height="16" rx="1" fill="#fff" />
            <rect x="11" y="11" width="10" height="10" fill="#0e2554" />
            <rect x="40" y="2" width="28" height="28" rx="2" fill="#0e2554" />
            <rect x="46" y="8" width="16" height="16" rx="1" fill="#fff" />
            <rect x="49" y="11" width="10" height="10" fill="#0e2554" />
            <rect x="2" y="40" width="28" height="28" rx="2" fill="#0e2554" />
            <rect x="8" y="46" width="16" height="16" rx="1" fill="#fff" />
            <rect x="11" y="49" width="10" height="10" fill="#0e2554" />
            <rect x="40" y="40" width="4" height="4" fill="#0e2554" />
            <rect x="46" y="40" width="4" height="4" fill="#0e2554" />
            <rect x="52" y="40" width="4" height="4" fill="#0e2554" />
            <rect x="58" y="40" width="10" height="4" fill="#0e2554" />
            <rect x="40" y="46" width="10" height="4" fill="#0e2554" />
            <rect x="54" y="46" width="4" height="4" fill="#0e2554" />
            <rect x="40" y="52" width="4" height="4" fill="#0e2554" />
            <rect x="46" y="52" width="10" height="4" fill="#0e2554" />
            <rect x="58" y="52" width="10" height="4" fill="#0e2554" />
            <rect x="40" y="58" width="4" height="4" fill="#0e2554" />
            <rect x="48" y="58" width="4" height="4" fill="#0e2554" />
            <rect x="56" y="58" width="4" height="4" fill="#0e2554" />
            <rect x="62" y="58" width="6" height="4" fill="#0e2554" />
        </svg>
    );
}

// =============================================================
// Main Component
// =============================================================
export default function ResidentRecords({
    admin,
    onLogout,
    onNavigate: navProp,
}) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("residentRecords");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Filter / search state
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortFilter, setSortFilter] = useState("name");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Drawer + modal state
    const [selectedResident, setSelectedResident] = useState(null);
    const [printResident, setPrintResident] = useState(null);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        console.log("Navigate to:", page);
    };
    const handleLogout = () => {
        if (onLogout) onLogout();
    };

    // Filter + sort
    const filtered = MOCK_RESIDENTS.filter((r) => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (![r.name, r.addr, r.id].join(" ").toLowerCase().includes(q))
                return false;
        }
        return true;
    }).sort((a, b) => {
        if (sortFilter === "name") return a.name.localeCompare(b.name);
        if (sortFilter === "date") return new Date(b.date) - new Date(a.date);
        if (sortFilter === "requests") return b.requests - a.requests;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginated = filtered.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortFilter, rowsPerPage]);

    // Stat strip values
    const stats = [
        {
            label: "Total Residents",
            value: "1,284",
            sub: "All registered accounts",
            color: "navy",
        },
        {
            label: "Active",
            value: "1,241",
            sub: "With valid QR cards",
            color: "green",
        },
        {
            label: "New This Month",
            value: "38",
            sub: "Registered in March 2026",
            color: "gold",
        },
        {
            label: "Total Requests",
            value: "3,910",
            sub: "Across all residents",
            color: "blue",
        },
    ];
    const statTopColor = {
        navy: "linear-gradient(90deg,#0e2554,#163066)",
        green: "linear-gradient(90deg,#1a7a4a,#2da866)",
        gold: "linear-gradient(90deg,#c9a227,#e8c54a)",
        blue: "linear-gradient(90deg,#1a4a8a,#3a6abf)",
    };

    return (
        <div className="rr-root">
            {!isMobile && (
                <Sidebar
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
                <MobileSidebar
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
            {selectedResident && (
                <ResidentDrawer
                    resident={selectedResident}
                    onClose={() => setSelectedResident(null)}
                    isMobile={isMobile}
                    onPrintQR={(r) => {
                        setPrintResident(r);
                    }}
                />
            )}
            {printResident && (
                <QRCardModal
                    resident={printResident}
                    onClose={() => setPrintResident(null)}
                />
            )}

            {/* Main */}
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
                        Resident Records
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
                                Registered residents of Barangay East Tapinac
                            </span>
                        )}
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
                    {/* Stat strip */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "repeat(2,1fr)"
                                : "repeat(4,1fr)",
                            gap: isMobile ? 10 : 14,
                            marginBottom: isMobile ? 16 : 24,
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
                                        ? "14px 16px"
                                        : "18px 22px",
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
                                        background: statTopColor[stat.color],
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        fontWeight: 600,
                                        color: "#9090aa",
                                        letterSpacing: "1.2px",
                                        textTransform: "uppercase",
                                        marginBottom: 8,
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
                                            marginTop: 5,
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
                            padding: "14px 20px",
                            marginBottom: 18,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
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
                                size={14}
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
                                className="rr-search-input"
                                type="text"
                                placeholder="Search by name, address, or resident ID…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div
                            style={{
                                width: 1,
                                height: 28,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <select
                            className="rr-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select
                            className="rr-select"
                            value={sortFilter}
                            onChange={(e) => setSortFilter(e.target.value)}
                        >
                            <option value="name">Sort: Name A–Z</option>
                            <option value="date">Sort: Newest First</option>
                            <option value="requests">
                                Sort: Most Requests
                            </option>
                        </select>
                        <div
                            style={{
                                width: 1,
                                height: 28,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 11.5,
                                color: "#9090aa",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Showing{" "}
                            <strong>
                                {Math.min(
                                    (currentPage - 1) * rowsPerPage + 1,
                                    filtered.length,
                                )}
                                –
                                {Math.min(
                                    currentPage * rowsPerPage,
                                    filtered.length,
                                )}
                            </strong>{" "}
                            of <strong>{filtered.length}</strong> residents
                        </div>
                    </div>

                    {/* Table card */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            overflow: "hidden",
                        }}
                    >
                        {/* Desktop table header */}
                        {!isMobile && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1.5fr 2fr 140px 140px 90px 110px 90px",
                                    background: "#f8f6f1",
                                    borderBottom: "1px solid #e4dfd4",
                                    padding: "10px 22px",
                                }}
                            >
                                {[
                                    "Resident",
                                    "Address",
                                    "Contact",
                                    "Date Registered",
                                    "Requests",
                                    "Status",
                                    "",
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

                        {/* Rows */}
                        <div id="rr-table-body">
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
                                    No residents found matching your search.
                                </div>
                            ) : (
                                paginated.map((r) => {
                                    const isActive = r.status === "Active";
                                    return !isMobile ? (
                                        // Desktop row
                                        <div
                                            key={r.id}
                                            className="rr-res-row"
                                            onClick={() =>
                                                setSelectedResident(r)
                                            }
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {r.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                        fontSize: 10,
                                                        color: "#9090aa",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {r.id}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    paddingRight: 12,
                                                }}
                                            >
                                                {r.addr}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                }}
                                            >
                                                {r.contact}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                {r.date}
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "#0e2554",
                                                }}
                                            >
                                                {r.requests}
                                            </div>
                                            <div>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        letterSpacing: ".5px",
                                                        padding: "3px 10px",
                                                        borderRadius: 20,
                                                        textTransform:
                                                            "uppercase",
                                                        background: isActive
                                                            ? "#e8f5ee"
                                                            : "#f0ece4",
                                                        color: isActive
                                                            ? "#1a7a4a"
                                                            : "#9090aa",
                                                    }}
                                                >
                                                    {r.status}
                                                </span>
                                            </div>
                                            <div>
                                                <button
                                                    className="rr-view-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedResident(r);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Mobile card
                                        <div
                                            key={r.id}
                                            className="rr-mob-card"
                                            onClick={() =>
                                                setSelectedResident(r)
                                            }
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
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {r.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: "#4a4a6a",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {r.addr}
                                                    </div>
                                                </div>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        padding: "2px 9px",
                                                        borderRadius: 20,
                                                        textTransform:
                                                            "uppercase",
                                                        background: isActive
                                                            ? "#e8f5ee"
                                                            : "#f0ece4",
                                                        color: isActive
                                                            ? "#1a7a4a"
                                                            : "#9090aa",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {r.status}
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
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                        fontSize: 10,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {r.id}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {r.requests} requests
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
                                    padding: "12px 22px",
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
                                        className="rr-pg-btn"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage((p) => p - 1)
                                        }
                                    >
                                        <ChevronLeft size={13} />
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
                                                    className={`rr-pg-btn${currentPage === p ? " active" : ""}`}
                                                    onClick={() =>
                                                        setCurrentPage(p)
                                                    }
                                                >
                                                    {p}
                                                </button>
                                            ),
                                        )}
                                    <button
                                        className="rr-pg-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage((p) => p + 1)
                                        }
                                    >
                                        <ChevronRight size={13} />
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
