// =============================================================
// FILE: client/src/pages/admin/WalkInIssuance.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/certificates/templates → ALL_CERTS list (from certificate_templates table)
//   - POST /api/walkin/issue → body: { certType, residentName, address, purpose, issuedBy }
//     Response: { id, docId, issuedAt }
//   - GET /api/walkin/today → today's walk-in log entries
//   - GET /api/walkin/:id/reprint → returns cert data for reprinting
//   - All endpoints require adminToken in Authorization header
// =============================================================

import { useState, useEffect, useRef } from "react";
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
    Calendar,
    Search,
    X,
    Eye,
    Printer,
    Check,
    ChevronRight,
    Plus,
    Menu,
} from "lucide-react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";

// TODO: import { useAdminAuth } from "../../context/AdminAuthContext";
// TODO: import { getCertTemplates, issueWalkIn, getTodayLog } from "../../services/walkInService";

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
if (!document.head.querySelector("[data-cf-walkin]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-walkin", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes wi-fadein {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes sidebarSlideIn {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    .wi-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .wi-nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      font-size:12.5px; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; text-align:left; font-family:'Source Serif 4',serif;
    }
    .wi-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .wi-nav-item.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .wi-nav-item-icon {
      display:flex; align-items:center; justify-content:center;
      padding:10px 0; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; font-family:'Source Serif 4',serif;
    }
    .wi-nav-item-icon:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .wi-nav-item-icon.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    /* Cert cards */
    .wi-cert-btn {
      display:flex; flex-direction:column; align-items:center; gap:6px;
      padding:14px 16px; border:1.5px solid #e4dfd4; border-radius:6px;
      cursor:pointer; background:#fff; min-width:100px; transition:all .15s;
      position:relative; font-family:'Source Serif 4',serif;
    }
    .wi-cert-btn:hover { border-color:#b8a8e0; background:#faf7ff; }
    .wi-cert-btn.selected { border-color:#6a3db8; background:#f3eeff; }
    .wi-cert-btn.view-more { border-style:dashed; border-color:#c8b8e0; background:#faf8ff; }
    .wi-cert-btn.view-more:hover { background:#f3eeff; border-color:#6a3db8; }
    /* Form inputs */
    .wi-input {
      width:100%; padding:9px 12px; border:1.5px solid #e4dfd4;
      border-radius:4px; font-family:'Source Serif 4',serif; font-size:12.5px;
      background:#fff; outline:none; color:#1a1a2e; transition:border-color .15s;
      box-sizing:border-box;
    }
    .wi-input:focus { border-color:#6a3db8; }
    /* Modal search input */
    .wi-modal-input {
      flex:1; padding:8px 12px; border:1.5px solid #e4dfd4; border-radius:4px;
      font-family:'Source Serif 4',serif; font-size:13px; outline:none; background:#fff;
    }
    .wi-modal-input:focus { border-color:#6a3db8; }
    /* Log search */
    .wi-log-input {
      flex:1; padding:7px 12px; border:1.5px solid #e4dfd4; border-radius:4px;
      font-family:'Source Serif 4',serif; font-size:12px; outline:none; background:#fff;
    }
    .wi-log-input:focus { border-color:#0e2554; }
    /* Modal item */
    .wi-modal-item {
      display:flex; align-items:center; gap:14px; padding:13px 20px;
      cursor:pointer; border-bottom:1px solid #f5f2ee; transition:background .12s;
    }
    .wi-modal-item:hover { background:#f8f5ff; }
    .wi-modal-item:last-child { border-bottom:none; }
    /* Log table rows */
    .wi-tr:hover td { background:#faf8f4; }
    /* Preview btn */
    .wi-preview-btn {
      padding:10px 22px; background:linear-gradient(135deg,#6a3db8,#4a1fa8);
      color:#fff; border:none; border-radius:4px; font-family:'Playfair Display',serif;
      font-size:12px; font-weight:700; letter-spacing:1px; cursor:pointer;
      white-space:nowrap; display:flex; align-items:center; gap:7px; transition:opacity .15s;
    }
    .wi-preview-btn:hover { opacity:.88; }
    /* Print btn */
    .wi-print-btn {
      padding:10px 24px; background:linear-gradient(135deg,#6a3db8,#4a1fa8);
      color:#fff; border:none; border-radius:4px; font-family:'Playfair Display',serif;
      font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center;
      gap:8px; transition:opacity .15s;
    }
    .wi-print-btn:hover { opacity:.88; }
    /* Action btn */
    .wi-action-btn {
      background:none; border:1px solid #e4dfd4; border-radius:4px;
      padding:4px 10px; font-size:10.5px; color:#0e2554; cursor:pointer;
      font-family:'Source Serif 4',serif; transition:all .15s;
    }
    .wi-action-btn:hover { background:#0e2554; color:white; border-color:#0e2554; }
    /* Toast */
    @keyframes wi-toast-in  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes wi-toast-out { from { opacity:1; } to { opacity:0; } }
    .wi-toast { position:fixed; top:80px; right:32px; background:#1a7a4a; color:#fff; border-radius:6px; padding:12px 18px; font-size:13px; font-weight:600; box-shadow:0 6px 24px rgba(0,0,0,.2); z-index:600; display:flex; align-items:center; gap:10px; pointer-events:none; animation:wi-toast-in .25s ease both; }
    .wi-toast.hiding { animation:wi-toast-out .3s ease both; }
    /* Cert paper */
    .wi-cert-paper { width:100%; max-width:500px; background:#fff; border:1px solid #ccc; box-shadow:0 4px 20px rgba(0,0,0,.14); padding:36px 40px; font-family:'Source Serif 4',serif; position:relative; }
    .wi-cert-paper::before { content:''; position:absolute; inset:10px; border:1.5px solid rgba(201,162,39,.3); pointer-events:none; }
    .wi-logout-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); padding:4px; transition:color .15s; display:flex; align-items:center; }
    .wi-logout-btn:hover { color:rgba(255,255,255,.7); }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Certificate registry
// TODO: Replace with GET /api/certificates/templates
// =============================================================
const ALL_CERTS = [
    {
        name: "Barangay Clearance",
        hasFee: true,
        desc: "For general official purposes. Certifies the holder is a resident in good standing.",
    },
    {
        name: "Certificate of Residency",
        hasFee: false,
        desc: "Certifies that the individual is a bona fide resident of Barangay East Tapinac.",
    },
    {
        name: "Certificate of Indigency",
        hasFee: false,
        desc: "Certifies that the individual belongs to an indigent family in the barangay.",
    },
    {
        name: "Business Permit",
        hasFee: true,
        desc: "Authorizes the holder to operate a business within Barangay East Tapinac.",
    },
    {
        name: "Good Moral Certificate",
        hasFee: false,
        desc: "Certifies that the individual is of good moral character in the community.",
    },
    {
        name: "Certificate of Live Birth (Endorsement)",
        hasFee: false,
        desc: "Endorsement for late registration of live birth at the civil registry.",
    },
    {
        name: "Certificate of Cohabitation",
        hasFee: false,
        desc: "Certifies that two individuals are cohabiting as a couple within the barangay.",
    },
    {
        name: "Certificate of No Business",
        hasFee: false,
        desc: "Certifies that the individual has no registered business in the barangay.",
    },
    {
        name: "Certificate of Guardianship",
        hasFee: false,
        desc: "Certifies guardianship relationship for use in official transactions.",
    },
    {
        name: "Certificate of Late Registration",
        hasFee: false,
        desc: "For late registration of vital civil events with the local civil registry.",
    },
    {
        name: "Barangay Business Clearance (Renewal)",
        hasFee: true,
        desc: "Annual renewal of barangay business clearance for existing permit holders.",
    },
    {
        name: "Certificate of Ownership",
        hasFee: false,
        desc: "Certifies ownership of property or assets within the jurisdiction of the barangay.",
    },
];

// Quick cards shown without opening modal (first 6)
const QUICK_CERTS = ALL_CERTS.slice(0, 6);

// =============================================================
// Helpers
// =============================================================
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

// Short names for log table
const SHORT_NAMES = {
    "Barangay Clearance": "Barangay Clearance",
    "Certificate of Residency": "Cert. of Residency",
    "Certificate of Indigency": "Cert. of Indigency",
    "Business Permit": "Business Permit",
    "Good Moral Certificate": "Good Moral Cert.",
    "Certificate of Live Birth (Endorsement)": "Birth Endorsement",
};
const shortName = (name) => SHORT_NAMES[name] || name;

// Mock today's log
// TODO: Replace with GET /api/walkin/today
const MOCK_LOG = [
    {
        id: "#WI-034",
        name: "Felicidad Ramos",
        type: "Barangay Clearance",
        purpose: "Employment",
        issuedBy: "Staff Reyes",
        time: "10:14 AM",
    },
    {
        id: "#WI-033",
        name: "Ernesto Villanueva",
        type: "Cert. of Indigency",
        purpose: "Medical Assistance",
        issuedBy: "Staff Cruz",
        time: "9:02 AM",
    },
    {
        id: "#WI-032",
        name: "Natividad Santos",
        type: "Cert. of Residency",
        purpose: "Senior Citizen ID",
        issuedBy: "Staff Reyes",
        time: "8:30 AM",
    },
];

// =============================================================
// Sidebar
// =============================================================
function Sidebar({ admin, activePage, onNavigate, onLogout, collapsed }) {
    const isSuperAdmin = admin?.role === "superadmin";
    const navItems = [
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
    const saItems = [
        { key: "manageAccounts", label: "Manage Accounts", Icon: UserCog },
        { key: "settings", label: "System Settings", Icon: Settings },
    ];
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
            {navItems.map(({ key, label, Icon, badge }) =>
                collapsed ? (
                    <button
                        key={key}
                        className={`wi-nav-item-icon${activePage === key ? " active" : ""}`}
                        onClick={() => onNavigate(key)}
                        title={label}
                    >
                        <Icon size={18} opacity={0.7} />
                    </button>
                ) : (
                    <button
                        key={key}
                        className={`wi-nav-item${activePage === key ? " active" : ""}`}
                        onClick={() => onNavigate(key)}
                    >
                        <Icon size={15} opacity={0.7} />
                        {label}
                        {badge && <span style={sd.navBadge}>{badge}</span>}
                    </button>
                ),
            )}
            {isSuperAdmin && (
                <div style={sd.superAdminSection}>
                    {!collapsed && (
                        <div style={{ ...sd.sectionLabel, paddingTop: 10 }}>
                            Superadmin
                        </div>
                    )}
                    {saItems.map(({ key, label, Icon }) =>
                        collapsed ? (
                            <button
                                key={key}
                                className={`wi-nav-item-icon${activePage === key ? " active" : ""}`}
                                onClick={() => onNavigate(key)}
                                title={label}
                            >
                                <Icon size={18} opacity={0.7} />
                            </button>
                        ) : (
                            <button
                                key={key}
                                className={`wi-nav-item${activePage === key ? " active" : ""}`}
                                onClick={() => onNavigate(key)}
                            >
                                <Icon size={15} opacity={0.7} />
                                {label}
                                <span style={sd.navBadgeSA}>SA</span>
                            </button>
                        ),
                    )}
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
                        <button className="wi-logout-btn" onClick={onLogout}>
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
    const isSuperAdmin = admin?.role === "superadmin";
    const navItems = [
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
    const saItems = [
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
                {navItems.map(({ key, label, Icon, badge }) => (
                    <button
                        key={key}
                        className={`wi-nav-item${activePage === key ? " active" : ""}`}
                        onClick={() => {
                            onNavigate(key);
                            onClose();
                        }}
                    >
                        <Icon size={15} opacity={0.7} />
                        {label}
                        {badge && <span style={sd.navBadge}>{badge}</span>}
                    </button>
                ))}
                {isSuperAdmin && (
                    <div style={sd.superAdminSection}>
                        <div style={{ ...sd.sectionLabel, paddingTop: 10 }}>
                            Superadmin
                        </div>
                        {saItems.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                className={`wi-nav-item${activePage === key ? " active" : ""}`}
                                onClick={() => {
                                    onNavigate(key);
                                    onClose();
                                }}
                            >
                                <Icon size={15} opacity={0.7} />
                                {label}
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
                    <button className="wi-logout-btn" onClick={onLogout}>
                        <LogOut size={14} />
                    </button>
                </div>
            </aside>
        </div>
    );
}

// =============================================================
// Cert Picker Modal
// =============================================================
function CertPickerModal({ onClose, onPick }) {
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        setTimeout(() => inputRef.current?.focus(), 80);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [onClose]);

    const filtered = ALL_CERTS.filter(
        (c) => !query || c.name.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.5)",
                zIndex: 400,
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
                    borderRadius: 10,
                    width: "100%",
                    maxWidth: 560,
                    maxHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#0e2554,#163066)",
                        padding: "18px 22px",
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
                                color: "#fff",
                            }}
                        >
                            All Certificate &amp; Permit Types
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,.5)",
                                marginTop: 2,
                            }}
                        >
                            Click any type to select · Manage cert types in
                            System Settings
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,.1)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            width: 30,
                            height: 30,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <X size={13} strokeWidth={2.5} />
                    </button>
                </div>
                {/* Search */}
                <div
                    style={{
                        padding: "12px 18px",
                        borderBottom: "1px solid #e4dfd4",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Search size={14} color="#9090aa" strokeWidth={2} />
                    <input
                        ref={inputRef}
                        className="wi-modal-input"
                        type="text"
                        placeholder="Search certificate or permit type…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                {/* List */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                    {filtered.length === 0 ? (
                        <div
                            style={{
                                padding: 32,
                                textAlign: "center",
                                color: "#9090aa",
                                fontSize: 12.5,
                            }}
                        >
                            No results for "<strong>{query}</strong>"
                        </div>
                    ) : (
                        filtered.map((cert) => (
                            <div
                                key={cert.name}
                                className="wi-modal-item"
                                onClick={() => {
                                    onPick(cert);
                                    onClose();
                                }}
                            >
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 8,
                                        background: "#f3eeff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <FileText
                                        size={18}
                                        color="#6a3db8"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#1a1a2e",
                                        }}
                                    >
                                        {cert.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#9090aa",
                                            marginTop: 2,
                                        }}
                                    >
                                        {cert.desc}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "2px 9px",
                                        borderRadius: 10,
                                        flexShrink: 0,
                                        background: cert.hasFee
                                            ? "#fff3e0"
                                            : "#e8f5ee",
                                        color: cert.hasFee
                                            ? "#b86800"
                                            : "#1a7a4a",
                                    }}
                                >
                                    {cert.hasFee ? "₱ Fee" : "No fee"}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Print Preview Modal
// =============================================================
function PrintPreviewModal({ cert, formData, docId, onClose, onConfirm }) {
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

    const now = new Date();
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const buildBody = () => {
        const name = formData.residentName;
        const address = formData.address;
        const purpose = formData.purpose;
        let body = `TO WHOM IT MAY CONCERN:<br/><br/>This is to certify that <strong style="text-decoration:underline;text-transform:uppercase;">${name}</strong>, of legal age, Filipino citizen, and a bona fide resident of <strong>${address}</strong>, Barangay East Tapinac, Olongapo City, is personally known to this office to be a person of good standing in the community.`;
        if (cert.name === "Certificate of Indigency") {
            body = `TO WHOM IT MAY CONCERN:<br/><br/>This is to certify that <strong style="text-decoration:underline;text-transform:uppercase;">${name}</strong>, of legal age, Filipino citizen, and a resident of <strong>${address}</strong>, Barangay East Tapinac, Olongapo City, belongs to an indigent family within the jurisdiction of this barangay and is qualified to avail of government assistance programs.`;
        } else if (cert.name === "Business Permit") {
            body = `TO WHOM IT MAY CONCERN:<br/><br/>This is to certify that <strong style="text-decoration:underline;text-transform:uppercase;">${name}</strong>, of legal age, Filipino citizen, and a resident of <strong>${address}</strong>, Barangay East Tapinac, Olongapo City, is hereby authorized to operate a business establishment within the jurisdiction of this barangay, for the purpose of <strong>${purpose}</strong>.`;
        }
        body += `<br/><br/>This certification is issued upon the request of the above-named individual for the purpose of <strong>${purpose}</strong> and for whatever legal purpose it may serve.`;
        return body;
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.6)",
                zIndex: 500,
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
                    borderRadius: 10,
                    width: "100%",
                    maxWidth: 640,
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,.3)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#0e2554,#163066)",
                        padding: "16px 22px",
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
                                color: "#fff",
                            }}
                        >
                            Print Preview
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,.5)",
                                marginTop: 2,
                            }}
                        >
                            Review before printing — click Confirm &amp; Print
                            to log and issue
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,.1)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            width: 30,
                            height: 30,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <X size={13} strokeWidth={2.5} />
                    </button>
                </div>
                {/* Paper preview */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: 28,
                        background: "#e8e4dc",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <div className="wi-cert-paper">
                        {/* Header */}
                        <div style={{ textAlign: "center", marginBottom: 18 }}>
                            <div
                                style={{
                                    fontSize: 9,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    color: "#9090aa",
                                }}
                            >
                                Republic of the Philippines
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#0e2554",
                                    marginTop: 2,
                                }}
                            >
                                City Government of Olongapo · Zambales
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 17,
                                    fontWeight: 700,
                                    color: "#0e2554",
                                    marginTop: 2,
                                }}
                            >
                                Barangay East Tapinac
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "#9090aa",
                                    marginTop: 3,
                                }}
                            >
                                54 – 14th Street corner Gallagher Street,
                                Olongapo City
                            </div>
                        </div>
                        <hr
                            style={{
                                border: "none",
                                borderTop: "2px solid #c9a227",
                                margin: "14px 0 10px",
                            }}
                        />
                        <div
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#0e2554",
                                textAlign: "center",
                                letterSpacing: 1,
                                marginBottom: 3,
                            }}
                        >
                            {cert.name.toUpperCase()}
                        </div>
                        <div
                            style={{
                                fontSize: 10,
                                textAlign: "center",
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                color: "#9090aa",
                                marginBottom: 18,
                            }}
                        >
                            Office of the Punong Barangay
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                lineHeight: 1.9,
                                color: "#1a1a2e",
                                textAlign: "justify",
                            }}
                            dangerouslySetInnerHTML={{ __html: buildBody() }}
                        />
                        {/* Footer */}
                        <div
                            style={{
                                marginTop: 32,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                            }}
                        >
                            <div style={{ fontSize: 11, color: "#4a4a6a" }}>
                                Issued at Barangay East Tapinac
                                <br />
                                <strong
                                    style={{
                                        display: "block",
                                        fontSize: 12,
                                        color: "#1a1a2e",
                                        marginTop: 2,
                                    }}
                                >
                                    {dateStr}
                                </strong>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        width: 180,
                                        borderTop: "1.5px solid #0e2554",
                                        paddingTop: 4,
                                        marginTop: 40,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#0e2554",
                                        }}
                                    >
                                        HON. DANTE L. HONDO
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9090aa",
                                            marginTop: 1,
                                        }}
                                    >
                                        Punong Barangay
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                bottom: 12,
                                right: 16,
                                fontFamily: "'Courier New',monospace",
                                fontSize: 9,
                                color: "#bbb",
                            }}
                        >
                            {docId}
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div
                    style={{
                        padding: "14px 22px",
                        borderTop: "1px solid #e4dfd4",
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                        background: "#fff",
                        flexShrink: 0,
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "9px 20px",
                            background: "#fff",
                            border: "1.5px solid #e4dfd4",
                            borderRadius: 4,
                            fontFamily: "'Source Serif 4',serif",
                            fontSize: 12.5,
                            color: "#4a4a6a",
                            cursor: "pointer",
                        }}
                    >
                        ← Back to Edit
                    </button>
                    {/* TODO: POST /api/walkin/issue then trigger window.print() */}
                    <button className="wi-print-btn" onClick={onConfirm}>
                        <Printer size={14} /> Confirm &amp; Print
                    </button>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Main Component
// =============================================================
export default function WalkInIssuance({
    admin,
    onLogout,
    onNavigate: navProp,
}) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("walkIn");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Issuance state
    const [selectedCert, setSelectedCert] = useState(null);
    const [formData, setFormData] = useState({
        residentName: "",
        address: "",
        purpose: "",
    });
    const [showCertModal, setShowCertModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formError, setFormError] = useState("");

    // Log state
    const [log, setLog] = useState(MOCK_LOG);
    const [logQuery, setLogQuery] = useState("");
    const [wiCounter, setWiCounter] = useState(35);

    // Toast
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        // TODO: navigate(`/admin/${page}`) when all pages are built
        console.log("Navigate to:", page);
    };

    const handleLogout = () => {
        // TODO: localStorage.removeItem("adminToken"); logout();
        if (onLogout) onLogout();
    };

    const showToast = (msg) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ msg, hiding: false });
        toastTimer.current = setTimeout(() => {
            setToast((t) => (t ? { ...t, hiding: true } : null));
            setTimeout(() => setToast(null), 350);
        }, 3500);
    };

    const handleSelectCert = (cert) => {
        setSelectedCert(cert);
        setFormData({ residentName: "", address: "", purpose: "" });
        setFormError("");
    };

    const handleFormChange = (e) => {
        setFormError("");
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOpenPreview = () => {
        if (!selectedCert) {
            setFormError("Please select a certificate type.");
            return;
        }
        if (!formData.residentName.trim()) {
            setFormError("Please enter the resident's full name.");
            return;
        }
        if (!formData.address.trim()) {
            setFormError("Please enter the resident's address.");
            return;
        }
        if (!formData.purpose.trim()) {
            setFormError("Please enter the purpose.");
            return;
        }
        setFormError("");
        setShowPreview(true);
    };

    const handleConfirmPrint = () => {
        // TODO: POST /api/walkin/issue with formData + selectedCert + admin info
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-PH", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const newEntry = {
            id: `#WI-0${wiCounter}`,
            name: formData.residentName,
            type: shortName(selectedCert.name),
            purpose: formData.purpose,
            issuedBy: admin?.name?.split(" ").slice(-1)[0] || "Staff",
            time: timeStr,
        };
        setLog((prev) => [newEntry, ...prev]);
        setWiCounter((prev) => prev + 1);
        showToast(
            `${newEntry.id} — ${shortName(selectedCert.name)} issued and logged.`,
        );
        // Reset
        setSelectedCert(null);
        setFormData({ residentName: "", address: "", purpose: "" });
        setShowPreview(false);
        // TODO: trigger window.print() after logging
    };

    const filteredLog = log.filter(
        (entry) =>
            !logQuery ||
            [entry.id, entry.name, entry.type, entry.purpose]
                .join(" ")
                .toLowerCase()
                .includes(logQuery.toLowerCase()),
    );

    const nextDocId = `#WI-0${wiCounter}`;

    return (
        <div className="wi-root">
            {/* Sidebar — desktop + tablet */}
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

            {/* Mobile sidebar overlay */}
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

            {/* Cert picker modal */}
            {showCertModal && (
                <CertPickerModal
                    onClose={() => setShowCertModal(false)}
                    onPick={handleSelectCert}
                />
            )}

            {/* Print preview modal */}
            {showPreview && selectedCert && (
                <PrintPreviewModal
                    cert={selectedCert}
                    formData={formData}
                    docId={nextDocId}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleConfirmPrint}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`wi-toast${toast.hiding ? " hiding" : ""}`}>
                    <Check size={16} color="white" strokeWidth={2.5} />
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* ── Main ── */}
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
                        ...tb.topbar,
                        padding: isMobile ? "0 16px" : "0 32px",
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
                    <div style={tb.topbarTitle}>
                        Walk-in Issuance
                        {!isMobile && (
                            <span style={tb.topbarSub}>
                                Issue certificates directly at the counter
                            </span>
                        )}
                    </div>
                    {!isMobile && (
                        <div style={tb.topbarDate}>
                            <Calendar size={12} />
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
                    {/* ── Issuance panel ── */}
                    <div style={p.panel}>
                        {/* Panel header */}
                        <div
                            style={{
                                ...p.panelHeader,
                                background:
                                    "linear-gradient(135deg,#f3eeff,#ede8ff)",
                                borderBottomColor: "#d4c8f0",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        background: "#6a3db8",
                                        borderRadius: 6,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <FilePlus
                                        size={16}
                                        color="white"
                                        strokeWidth={2}
                                    />
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#4a1fa8",
                                        }}
                                    >
                                        Walk-in / Manual Issuance
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#7a5ab8",
                                            marginTop: 2,
                                        }}
                                    >
                                        Select a certificate type, fill in
                                        details, preview, then print &amp; log.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 1 label */}
                        <div
                            style={{
                                padding: "12px 22px 8px",
                                background: "#faf8ff",
                                borderBottom: "1px solid #ede8ff",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 10,
                                    color: "#9090aa",
                                    letterSpacing: "1.2px",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                }}
                            >
                                Step 1 — Select Certificate / Permit Type
                            </span>
                        </div>

                        {/* Quick cert cards */}
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                                padding: "18px 22px",
                                borderBottom: "1px solid #e4dfd4",
                            }}
                        >
                            {QUICK_CERTS.map((cert) => (
                                <button
                                    key={cert.name}
                                    className={`wi-cert-btn${selectedCert?.name === cert.name ? " selected" : ""}`}
                                    onClick={() => handleSelectCert(cert)}
                                    style={{ minWidth: isMobile ? 80 : 100 }}
                                >
                                    {cert.hasFee && (
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: 7,
                                                right: 7,
                                                fontSize: 8.5,
                                                fontWeight: 700,
                                                color: "#b86800",
                                                background: "#fff3e0",
                                                borderRadius: 8,
                                                padding: "1px 5px",
                                            }}
                                        >
                                            ₱ Fee
                                        </span>
                                    )}
                                    <FileText
                                        size={20}
                                        color={
                                            selectedCert?.name === cert.name
                                                ? "#6a3db8"
                                                : "#0e2554"
                                        }
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color:
                                                selectedCert?.name === cert.name
                                                    ? "#4a1fa8"
                                                    : "#1a1a2e",
                                            textAlign: "center",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {cert.name
                                            .replace(
                                                "Certificate of ",
                                                "Cert. of ",
                                            )
                                            .replace("Barangay ", "Brgy. ")}
                                    </span>
                                </button>
                            ))}
                            {/* View All */}
                            <button
                                className="wi-cert-btn view-more"
                                onClick={() => setShowCertModal(true)}
                                style={{ minWidth: isMobile ? 80 : 100 }}
                            >
                                <Plus
                                    size={20}
                                    color="#6a3db8"
                                    strokeWidth={1.5}
                                />
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "#6a3db8",
                                        textAlign: "center",
                                        lineHeight: 1.3,
                                    }}
                                >
                                    View All
                                    <br />
                                    Cert Types
                                </span>
                                <span
                                    style={{ fontSize: 8.5, color: "#9090aa" }}
                                >
                                    Select only
                                </span>
                            </button>
                        </div>

                        {/* Step 2 form — shown when cert is selected */}
                        {selectedCert && (
                            <div
                                style={{
                                    padding: "20px 22px",
                                    background: "#faf8ff",
                                    borderTop: "1px solid #ede8ff",
                                    animation: "wi-fadein .2s ease both",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#9090aa",
                                        letterSpacing: "1.2px",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                        marginBottom: 12,
                                    }}
                                >
                                    Step 2 — Fill in Resident Details
                                </div>

                                {/* Selected cert bar */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 14px",
                                        background: "#f3eeff",
                                        border: "1.5px solid #c8b8e8",
                                        borderRadius: 5,
                                        marginBottom: 16,
                                    }}
                                >
                                    <Check
                                        size={14}
                                        color="#6a3db8"
                                        strokeWidth={2}
                                    />
                                    <span
                                        style={{
                                            fontSize: 12.5,
                                            fontWeight: 700,
                                            color: "#4a1fa8",
                                        }}
                                    >
                                        {selectedCert.name}
                                    </span>
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: "2px 9px",
                                            borderRadius: 10,
                                            background: selectedCert.hasFee
                                                ? "#fff3e0"
                                                : "#e8f5ee",
                                            color: selectedCert.hasFee
                                                ? "#b86800"
                                                : "#1a7a4a",
                                        }}
                                    >
                                        {selectedCert.hasFee
                                            ? "₱ Fee required"
                                            : "✓ No fee"}
                                    </span>
                                </div>

                                {/* Error */}
                                {formError && (
                                    <div
                                        style={{
                                            background: "rgba(176,32,32,.07)",
                                            border: "1px solid rgba(176,32,32,.25)",
                                            borderRadius: 4,
                                            padding: "8px 12px",
                                            marginBottom: 12,
                                            fontSize: 12,
                                            color: "#b02020",
                                        }}
                                    >
                                        {formError}
                                    </div>
                                )}

                                {/* Form fields */}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: isMobile
                                            ? "1fr"
                                            : "1fr 1fr 1fr auto",
                                        gap: 12,
                                        alignItems: "flex-end",
                                    }}
                                >
                                    <div>
                                        <div style={f.label}>
                                            Full Name{" "}
                                            <span style={{ color: "#b02020" }}>
                                                *
                                            </span>
                                        </div>
                                        <input
                                            className="wi-input"
                                            name="residentName"
                                            type="text"
                                            placeholder="e.g. Juan dela Cruz"
                                            value={formData.residentName}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div>
                                        <div style={f.label}>
                                            Address{" "}
                                            <span style={{ color: "#b02020" }}>
                                                *
                                            </span>
                                        </div>
                                        <input
                                            className="wi-input"
                                            name="address"
                                            type="text"
                                            placeholder="Street, East Tapinac"
                                            value={formData.address}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div>
                                        <div style={f.label}>
                                            Purpose{" "}
                                            <span style={{ color: "#b02020" }}>
                                                *
                                            </span>
                                        </div>
                                        <input
                                            className="wi-input"
                                            name="purpose"
                                            type="text"
                                            placeholder="e.g. Employment"
                                            value={formData.purpose}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <button
                                            className="wi-preview-btn"
                                            onClick={handleOpenPreview}
                                            style={{
                                                width: isMobile
                                                    ? "100%"
                                                    : "auto",
                                            }}
                                        >
                                            <Eye size={13} /> Preview &amp;
                                            Print
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Today's Log ── */}
                    <div style={p.panel}>
                        {/* Log header */}
                        <div style={p.panelHeader}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    Today's Walk-in Issuances
                                </div>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        background: "#f3eeff",
                                        color: "#6a3db8",
                                        padding: "2px 9px",
                                        borderRadius: 10,
                                    }}
                                >
                                    {log.length} issued
                                </span>
                            </div>
                            <span style={{ fontSize: 11, color: "#9090aa" }}>
                                {formatDateShort()}
                            </span>
                        </div>

                        {/* Log search */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 22px",
                                borderBottom: "1px solid #e4dfd4",
                                background: "#f8f6f1",
                            }}
                        >
                            <Search size={14} color="#9090aa" strokeWidth={2} />
                            <input
                                className="wi-log-input"
                                type="text"
                                placeholder="Search by name, certificate type, or Doc. ID…"
                                value={logQuery}
                                onChange={(e) => setLogQuery(e.target.value)}
                            />
                        </div>

                        {/* Log table — desktop */}
                        {!isMobile ? (
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        minWidth: 600,
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                "Doc. ID",
                                                "Resident Name",
                                                "Certificate Type",
                                                "Purpose",
                                                "Issued By",
                                                "Time",
                                                "Action",
                                            ].map((h) => (
                                                <th key={h} style={p.th}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLog.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    style={{
                                                        textAlign: "center",
                                                        color: "#9090aa",
                                                        fontSize: 12,
                                                        padding: 28,
                                                    }}
                                                >
                                                    No records match your
                                                    search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLog.map((entry, i) => (
                                                <tr key={i} className="wi-tr">
                                                    <td style={p.td}>
                                                        <span
                                                            style={{
                                                                fontFamily:
                                                                    "'Courier New',monospace",
                                                                fontSize: 11,
                                                                color: "#9090aa",
                                                            }}
                                                        >
                                                            {entry.id}
                                                        </span>
                                                    </td>
                                                    <td style={p.td}>
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {entry.name}
                                                        </div>
                                                    </td>
                                                    <td style={p.td}>
                                                        <span
                                                            style={{
                                                                fontSize: 11.5,
                                                                color: "#4a4a6a",
                                                            }}
                                                        >
                                                            {entry.type}
                                                        </span>
                                                    </td>
                                                    <td style={p.td}>
                                                        <span
                                                            style={{
                                                                fontSize: 11.5,
                                                                color: "#4a4a6a",
                                                            }}
                                                        >
                                                            {entry.purpose}
                                                        </span>
                                                    </td>
                                                    <td style={p.td}>
                                                        <span
                                                            style={{
                                                                fontSize: 11.5,
                                                                color: "#4a4a6a",
                                                            }}
                                                        >
                                                            {entry.issuedBy}
                                                        </span>
                                                    </td>
                                                    <td style={p.td}>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#9090aa",
                                                            }}
                                                        >
                                                            {entry.time}
                                                        </span>
                                                    </td>
                                                    <td style={p.td}>
                                                        {/* TODO: GET /api/walkin/:id/reprint */}
                                                        <button className="wi-action-btn">
                                                            Reprint
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Log cards — mobile */
                            <div>
                                {filteredLog.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            color: "#9090aa",
                                            fontSize: 12,
                                            padding: 28,
                                        }}
                                    >
                                        No records match your search.
                                    </div>
                                ) : (
                                    filteredLog.map((entry, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: "14px 16px",
                                                borderBottom:
                                                    "1px solid #f0ece4",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {entry.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: "#4a4a6a",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {entry.type} ·{" "}
                                                        {entry.purpose}
                                                    </div>
                                                </div>
                                                <button className="wi-action-btn">
                                                    Reprint
                                                </button>
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
                                                        fontSize: 11,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {entry.id}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {entry.issuedBy} ·{" "}
                                                    {entry.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
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

const tb = {
    topbar: {
        height: 62,
        background: "#fff",
        borderBottom: "1px solid #e4dfd4",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    },
    topbarTitle: {
        fontFamily: "'Playfair Display',serif",
        fontSize: 18,
        fontWeight: 700,
        color: "#0e2554",
        flex: 1,
    },
    topbarSub: {
        fontSize: 12,
        fontFamily: "'Source Serif 4',serif",
        color: "#9090aa",
        fontWeight: 400,
        marginLeft: 10,
    },
    topbarDate: {
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
    },
};

const p = {
    panel: {
        background: "#fff",
        border: "1px solid #e4dfd4",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 20,
    },
    panelHeader: {
        padding: "16px 22px",
        borderBottom: "1px solid #e4dfd4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    th: {
        fontSize: 9.5,
        fontWeight: 600,
        color: "#9090aa",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        padding: "10px 22px",
        textAlign: "left",
        background: "#f8f6f1",
        borderBottom: "1px solid #e4dfd4",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "12px 22px",
        fontSize: 12.5,
        color: "#1a1a2e",
        borderBottom: "1px solid #f0ece4",
        verticalAlign: "middle",
        transition: "background 0.1s",
    },
};

const f = {
    label: {
        fontSize: 10,
        fontWeight: 600,
        color: "#4a4a6a",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginBottom: 6,
    },
};
