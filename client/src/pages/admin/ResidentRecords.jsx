// =============================================================
// FILE: client/src/pages/admin/ResidentRecords.jsx
// =============================================================

import { useState, useEffect, useCallback } from "react";
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
    AlertCircle,
    Menu,
} from "lucide-react";

import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import residentRecordsService from "../../services/residentRecordsService";

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
      display:inline-flex; align-items:center; gap:7px; padding:10px 18px;
      background:linear-gradient(135deg,#163066,#091a3e); color:#fff; border:none; border-radius:4px;
      font-size:12px; font-weight:700; cursor:pointer; font-family:'Playfair Display',serif;
      letter-spacing:1px; text-transform:uppercase; transition:opacity .15s;
    }
    .rr-print-card-btn:hover { opacity:.88; }

    /* Print sheet — hidden on screen; shown via separate print stylesheet below */
    #rr-qr-print-sheet { display: none; }
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
        const birth = new Date(dob);
        if (Number.isNaN(birth.getTime())) return "—";
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age -= 1;
        }
        return age;
    } catch {
        return "—";
    }
}

// =============================================================
// Resident Drawer
// =============================================================
function ResidentDrawer({
    resident,
    onClose,
    isMobile,
    history,
    historyLoading,
}) {
    const [activeTab, setActiveTab] = useState("profile");

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
                    {["profile", "history"].map((tab) => (
                        <button
                            key={tab}
                            className={`rr-dtab${activeTab === tab ? " active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === "profile" ? "Profile" : "Request History"}
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
                                    {history.length} requests
                                </div>
                            </div>
                            <table className="rr-hist-table">
                                <thead>
                                    <tr>
                                        <th>Cert Type</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyLoading ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                style={{
                                                    color: "#9090aa",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                Loading request history...
                                            </td>
                                        </tr>
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                style={{
                                                    color: "#9090aa",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                No request history found.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((h, i) => {
                                            const b =
                                                HIST_BADGE[h.status] ||
                                                HIST_BADGE.pending;
                                            return (
                                                <tr
                                                    key={`${h.cert}-${h.date}-${i}`}
                                                >
                                                    <td>{h.cert}</td>
                                                    <td>{h.date}</td>
                                                    <td>
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-block",
                                                                fontSize: 9,
                                                                fontWeight: 600,
                                                                padding:
                                                                    "2px 8px",
                                                                borderRadius: 20,
                                                                background:
                                                                    b.bg,
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
                                        })
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                </div>
            </div>
        </>
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
    const [residents, setResidents] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState("");
    const [totalResidents, setTotalResidents] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [statsData, setStatsData] = useState({
        total: 0,
        active: 0,
        newThisMonth: 0,
        totalRequests: 0,
    });

    // Drawer + modal state
    const [selectedResident, setSelectedResident] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        console.log("Navigate to:", page);
    };
    const handleLogout = () => {
        if (onLogout) onLogout();
    };

    const mapResidentRow = useCallback((row) => {
        const status = String(row.status || "active").toLowerCase();
        const registeredAt = row.created_at ? new Date(row.created_at) : null;
        const dob = row.date_of_birth ? new Date(row.date_of_birth) : null;

        return {
            rawId: row.resident_id,
            id: `#RES-${String(row.resident_id || "").padStart(4, "0")}`,
            name: row.full_name || "Unknown Resident",
            addr:
                [row.address_house, row.address_street]
                    .filter((v) => String(v || "").trim())
                    .join(" ") || "N/A",
            contact: row.contact_number || "N/A",
            date: registeredAt
                ? registeredAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                  })
                : "—",
            requests: Number(row.request_count || 0),
            status: status === "inactive" ? "Inactive" : "Active",
            dob: dob
                ? dob.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                  })
                : "—",
            civil: row.civil_status || "N/A",
            nationality: "Filipino",
            email: row.email || "N/A",
            qr: `QR-ET-${new Date().getFullYear()}-${String(row.resident_id || "").padStart(4, "0")}`,
        };
    }, []);

    const mapHistoryRow = useCallback((row) => {
        const requestedAt = row.requested_at
            ? new Date(row.requested_at)
            : null;
        return {
            cert: row.cert_type || "Certificate Request",
            date: requestedAt
                ? requestedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                  })
                : "—",
            status: String(row.status || "pending").toLowerCase(),
        };
    }, []);

    const loadResidents = useCallback(async () => {
        setListLoading(true);
        setListError("");

        try {
            const result = await residentRecordsService.getResidents({
                search,
                status: statusFilter ? statusFilter.toLowerCase() : "",
                sort: sortFilter,
                page: currentPage,
                limit: rowsPerPage,
            });

            const rows = Array.isArray(result?.data) ? result.data : [];

            setResidents(rows.map(mapResidentRow));
            setTotalResidents(Number(result?.total || 0));
            setTotalPages(Number(result?.totalPages || 1));
        } catch (err) {
            if (
                err?.response?.status === 401 ||
                err?.response?.status === 403
            ) {
                onLogout?.();
                return;
            }
            setResidents([]);
            setTotalResidents(0);
            setTotalPages(1);
            setListError(
                err?.response?.data?.message || "Failed to load residents.",
            );
        } finally {
            setListLoading(false);
        }
    }, [
        currentPage,
        mapResidentRow,
        onLogout,
        rowsPerPage,
        search,
        sortFilter,
        statusFilter,
    ]);

    const loadResidentStats = useCallback(async () => {
        try {
            const result = await residentRecordsService.getResidentStats();
            const s = result?.stats || {};
            setStatsData({
                total: Number(s.total || 0),
                active: Number(s.active || 0),
                newThisMonth: Number(s.newThisMonth || 0),
                totalRequests: Number(s.totalRequests || 0),
            });
        } catch (err) {
            if (
                err?.response?.status === 401 ||
                err?.response?.status === 403
            ) {
                onLogout?.();
            }
        }
    }, [onLogout]);

    const openResident = useCallback(
        async (resident) => {
            setSelectedResident(resident);
            setSelectedHistory([]);
            setHistoryLoading(true);

            try {
                const [detailResult, historyResult] = await Promise.all([
                    residentRecordsService.getResidentById(resident.rawId),
                    residentRecordsService.getResidentRequests(resident.rawId),
                ]);

                if (detailResult?.data) {
                    setSelectedResident(mapResidentRow(detailResult.data));
                }

                const rows = Array.isArray(historyResult?.data)
                    ? historyResult.data
                    : [];
                setSelectedHistory(rows.map(mapHistoryRow));
            } catch (err) {
                if (
                    err?.response?.status === 401 ||
                    err?.response?.status === 403
                ) {
                    onLogout?.();
                    return;
                }
                setSelectedHistory([]);
            } finally {
                setHistoryLoading(false);
            }
        },
        [mapHistoryRow, mapResidentRow, onLogout],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortFilter, rowsPerPage]);

    useEffect(() => {
        loadResidents();
    }, [loadResidents]);

    useEffect(() => {
        loadResidentStats();
    }, [loadResidentStats]);

    // Stat strip values
    const stats = [
        {
            label: "Total Residents",
            value: statsData.total.toLocaleString(),
            sub: "All registered accounts",
            color: "navy",
        },
        {
            label: "Active",
            value: statsData.active.toLocaleString(),
            sub: "With valid QR cards",
            color: "green",
        },
        {
            label: "New This Month",
            value: statsData.newThisMonth.toLocaleString(),
            sub: "Recently registered residents",
            color: "gold",
        },
        {
            label: "Total Requests",
            value: statsData.totalRequests.toLocaleString(),
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
            {selectedResident && (
                <ResidentDrawer
                    key={selectedResident?.id || "resident-drawer"}
                    resident={selectedResident}
                    onClose={() => setSelectedResident(null)}
                    isMobile={isMobile}
                    history={selectedHistory}
                    historyLoading={historyLoading}
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
                    {listError && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 6,
                                padding: "10px 12px",
                                color: "#b02020",
                                fontSize: 12,
                                marginBottom: 14,
                            }}
                        >
                            {listError}
                        </div>
                    )}

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
                                    totalResidents,
                                )}
                                –
                                {Math.min(
                                    currentPage * rowsPerPage,
                                    totalResidents,
                                )}
                            </strong>{" "}
                            of <strong>{totalResidents}</strong> residents
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
                                        "1.4fr 1.4fr 1fr 1.1fr 0.7fr 0.9fr 0.6fr",
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
                                    "Action",
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
                            {listLoading ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: 40,
                                        color: "#9090aa",
                                        fontSize: 13,
                                        fontStyle: "italic",
                                    }}
                                >
                                    Loading residents...
                                </div>
                            ) : residents.length === 0 ? (
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
                                residents.map((r) => {
                                    const isActive = r.status === "Active";
                                    return !isMobile ? (
                                        // Desktop row
                                        <div
                                            key={r.id}
                                            className="rr-res-row"
                                            style={{
                                                gridTemplateColumns:
                                                    "1.4fr 1.4fr 1fr 1.1fr 0.7fr 0.9fr 0.6fr",
                                            }}
                                            onClick={() => openResident(r)}
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
                                                        openResident(r);
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
                                            onClick={() => openResident(r)}
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
                        {totalResidents > 0 && (
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
const _SD = {
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
