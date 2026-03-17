// =============================================================
// FILE: client/src/pages/admin/ManageRequests.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/requests?status=&search=&certType=&dateRange=&sort=&page=&limit=
//     → { requests: [...], total, page, totalPages }
//   - GET /api/requests/:id → full request detail for drawer
//   - POST /api/requests/:id/approve → approve pending request
//   - POST /api/requests/:id/reject → body: { reason }
//   - POST /api/requests/:id/mark-ready → after cert is printed
//   - POST /api/requests/:id/release → body: { requestId }
//   - All endpoints require adminToken in Authorization header
//   - Status values: pending | approved | ready | released | rejected
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
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    QrCode,
    Printer,
    Eye,
    Menu,
} from "lucide-react";

import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";

// TODO: import { useAdminAuth } from "../../context/AdminAuthContext";
// TODO: import { getRequests, approveRequest, rejectRequest, markReady, releaseRequest } from "../../services/requestService";

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
if (!document.head.querySelector("[data-cf-mr]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-mr", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes sidebarSlideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes drawerSlideIn  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes drawerSlideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .mr-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .mr-nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      font-size:12.5px; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; text-align:left; font-family:'Source Serif 4',serif;
    }
    .mr-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .mr-nav-item.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .mr-nav-item-icon {
      display:flex; align-items:center; justify-content:center; padding:10px 0;
      color:rgba(255,255,255,0.65); cursor:pointer; border-left:3px solid transparent;
      transition:all 0.15s; background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; font-family:'Source Serif 4',serif;
    }
    .mr-nav-item-icon:hover { background:rgba(255,255,255,0.06); }
    .mr-nav-item-icon.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    /* Status tabs */
    .mr-stab {
      display:flex; align-items:center; gap:7px; padding:7px 16px; border-radius:20px;
      font-size:12px; font-weight:600; border:1.5px solid #e4dfd4;
      background:#fff; color:#4a4a6a; cursor:pointer; transition:all .15s;
      font-family:'Source Serif 4',serif; white-space:nowrap;
    }
    .mr-stab:hover { border-color:#bbb; }
    .mr-stab.active-all    { border-color:#0e2554; background:#0e2554; color:#fff; }
    .mr-stab.active-amber  { border-color:#b86800; background:#b86800; color:#fff; }
    .mr-stab.active-blue   { border-color:#1a4a8a; background:#1a4a8a; color:#fff; }
    .mr-stab.active-green  { border-color:#1a7a4a; background:#1a7a4a; color:#fff; }
    .mr-stab.active-grey   { border-color:#666; background:#666; color:#fff; }
    .mr-stab.active-red    { border-color:#b02020; background:#b02020; color:#fff; }
    .mr-stab-count { font-size:10px; font-weight:700; padding:1px 7px; border-radius:10px; background:#f8f6f1; color:#4a4a6a; }
    .mr-stab.active-all .mr-stab-count,
    .mr-stab.active-amber .mr-stab-count,
    .mr-stab.active-blue .mr-stab-count,
    .mr-stab.active-green .mr-stab-count,
    .mr-stab.active-grey .mr-stab-count,
    .mr-stab.active-red .mr-stab-count { background:rgba(255,255,255,0.2); color:#fff; }
    /* Filter inputs */
    .mr-search-input {
      width:100%; padding:9px 12px 9px 34px; border:1.5px solid #e4dfd4; border-radius:5px;
      font-family:'Source Serif 4',serif; font-size:12.5px; background:#fff; outline:none; color:#1a1a2e;
    }
    .mr-search-input:focus { border-color:#0e2554; }
    .mr-select {
      padding:9px 12px; border:1.5px solid #e4dfd4; border-radius:5px;
      font-family:'Source Serif 4',serif; font-size:12px; background:#fff; color:#4a4a6a;
      outline:none; cursor:pointer;
    }
    .mr-select:focus { border-color:#0e2554; }
    /* Table */
    .mr-tr:hover td { background:#fdfaf5; }
    /* Action buttons */
    .mr-btn {
      display:inline-flex; align-items:center; gap:5px; padding:5px 12px;
      border-radius:4px; font-size:11px; font-weight:700; font-family:'Playfair Display',serif;
      letter-spacing:.5px; cursor:pointer; border:none; white-space:nowrap; transition:opacity .15s;
    }
    .mr-btn:hover { opacity:.85; }
    .mr-btn-review  { background:#0e2554; color:#fff; }
    .mr-btn-view    { background:#e8eef8; color:#1a4a8a; }
    .mr-btn-scan    { background:#e8f5ee; color:#1a7a4a; }
    .mr-btn-icon    { background:#f8f6f1; color:#4a4a6a; border:1px solid #e4dfd4; padding:5px 8px; }
    /* Pagination */
    .mr-pag-btn {
      width:30px; height:30px; display:flex; align-items:center; justify-content:center;
      border:1px solid #e4dfd4; border-radius:4px; font-size:12px; font-weight:600;
      cursor:pointer; background:#fff; color:#4a4a6a; transition:all .15s;
      font-family:'Source Serif 4',serif;
    }
    .mr-pag-btn:hover { border-color:#0e2554; color:#0e2554; }
    .mr-pag-btn.active { background:#0e2554; color:#fff; border-color:#0e2554; }
    .mr-pag-btn:disabled { opacity:.4; cursor:default; }
    /* Drawer */
    .mr-drawer {
      width:480px; height:100vh; background:#fff;
      display:flex; flex-direction:column;
      box-shadow:-8px 0 40px rgba(0,0,0,.2); overflow:hidden;
      animation:drawerSlideIn .22s ease both;
    }
    .mr-drawer-mobile {
      width:100%; max-height:92vh; background:#fff;
      display:flex; flex-direction:column;
      box-shadow:0 -8px 40px rgba(0,0,0,.2); overflow:hidden;
      animation:drawerSlideUp .25s ease both; border-radius:16px 16px 0 0;
    }
    .mr-drawer-body { flex:1; overflow-y:auto; padding:24px; }
    .mr-drawer-body::-webkit-scrollbar { width:4px; }
    .mr-drawer-body::-webkit-scrollbar-thumb { background:#e4dfd4; border-radius:4px; }
    .mr-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .mr-detail-item { display:flex; flex-direction:column; gap:2px; }
    .mr-detail-item label { font-size:10px; color:#9090aa; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; font-family:'Source Serif 4',serif; }
    .mr-detail-value { font-size:13px; color:#1a1a2e; font-weight:600; font-family:'Source Serif 4',serif; }
    .mr-section-title { font-size:10px; font-weight:700; color:#9090aa; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #e4dfd4; font-family:'Source Serif 4',serif; }
    .mr-drawer-section { margin-bottom:22px; }
    .mr-tl-item { display:flex; gap:12px; padding-bottom:16px; }
    .mr-tl-item:last-child { padding-bottom:0; }
    .mr-tl-dot-wrap { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
    .mr-tl-line { width:2px; background:#e4dfd4; flex:1; margin-top:4px; }
    .mr-tl-item:last-child .mr-tl-line { display:none; }
    .mr-drawer-footer { padding:16px 24px; border-top:1px solid #e4dfd4; background:#f8f6f1; display:flex; gap:10px; flex-wrap:wrap; }
    .mr-drawer-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:10px 16px; border-radius:4px; font-size:12px; font-weight:700; font-family:'Playfair Display',serif; letter-spacing:.5px; cursor:pointer; border:none; flex:1; transition:opacity .15s; min-width:80px; }
    .mr-drawer-btn:hover { opacity:.88; }
    .mr-reject-textarea { width:100%; padding:10px 12px; border:1.5px solid #e4dfd4; border-radius:4px; font-family:'Source Serif 4',serif; font-size:12.5px; color:#1a1a2e; outline:none; resize:vertical; min-height:80px; box-sizing:border-box; }
    .mr-reject-textarea:focus { border-color:#b02020; }
    /* Mobile request card */
    .mr-req-card { padding:14px 16px; border-bottom:1px solid #f0ece4; cursor:pointer; transition:background .1s; }
    .mr-req-card:hover { background:#fdfaf5; }
    .mr-req-card:last-child { border-bottom:none; }
    /* Logout btn */
    .mr-logout-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); padding:4px; transition:color .15s; display:flex; align-items:center; }
    .mr-logout-btn:hover { color:rgba(255,255,255,.7); }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Mock data
// TODO: Replace with API calls
// =============================================================
const MOCK_REQUESTS = [
    {
        id: "#REQ-0148",
        name: "Juan dela Cruz",
        certType: "Barangay Clearance",
        purpose: "Employment",
        date: "Mar 11, 2026",
        time: "10:24 AM",
        status: "pending",
        hasFee: true,
        address: "123 Rizal St., East Tapinac",
        contact: "+63 912 345 6789",
        email: "juan@email.com",
        civil: "Single",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0147",
        name: "Lorna Reyes",
        certType: "Business Permit",
        purpose: "Business Registration",
        date: "Mar 11, 2026",
        time: "9:58 AM",
        status: "pending",
        hasFee: true,
        address: "45 Mabini St., East Tapinac",
        contact: "+63 917 654 3210",
        email: "lorna@email.com",
        civil: "Married",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0146",
        name: "Maria Santos",
        certType: "Certificate of Residency",
        purpose: "Bank Requirements",
        date: "Mar 10, 2026",
        time: "2:15 PM",
        status: "approved",
        hasFee: false,
        address: "78 Del Pilar St., East Tapinac",
        contact: "+63 905 111 2222",
        email: "maria@email.com",
        civil: "Married",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0145",
        name: "Ricardo Mendoza",
        certType: "Certificate of Indigency",
        purpose: "Medical Assistance",
        date: "Mar 10, 2026",
        time: "11:00 AM",
        status: "ready",
        hasFee: false,
        address: "12 Luna St., East Tapinac",
        contact: "+63 918 987 6543",
        email: "ricardo@email.com",
        civil: "Single",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0144",
        name: "Felicidad Torres",
        certType: "Barangay Clearance",
        purpose: "Employment",
        date: "Mar 9, 2026",
        time: "3:40 PM",
        status: "ready",
        hasFee: true,
        address: "56 Rizal St., East Tapinac",
        contact: "+63 912 000 1111",
        email: "felicidad@email.com",
        civil: "Single",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0143",
        name: "Eduardo Bautista",
        certType: "Barangay Clearance",
        purpose: "Travel Abroad",
        date: "Mar 9, 2026",
        time: "9:10 AM",
        status: "released",
        hasFee: true,
        address: "90 Aguinaldo St., East Tapinac",
        contact: "+63 910 222 3333",
        email: "eduardo@email.com",
        civil: "Married",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0142",
        name: "Natividad Garcia",
        certType: "Certificate of Indigency",
        purpose: "Financial Aid",
        date: "Mar 8, 2026",
        time: "4:55 PM",
        status: "rejected",
        hasFee: false,
        address: "34 Mabini St., East Tapinac",
        contact: "+63 916 444 5555",
        email: "naty@email.com",
        civil: "Widowed",
        nationality: "Filipino",
    },
    {
        id: "#REQ-0141",
        name: "Crisanto Villanueva",
        certType: "Barangay Clearance",
        purpose: "Employment",
        date: "Mar 8, 2026",
        time: "10:30 AM",
        status: "released",
        hasFee: true,
        address: "67 Del Pilar St., East Tapinac",
        contact: "+63 919 666 7777",
        email: "crisanto@email.com",
        civil: "Single",
        nationality: "Filipino",
    },
];

const STATUS_TABS = [
    { key: "all", label: "All", activeClass: "active-all", color: null },
    {
        key: "pending",
        label: "Pending",
        activeClass: "active-amber",
        color: "#b86800",
    },
    {
        key: "approved",
        label: "Approved",
        activeClass: "active-blue",
        color: "#1a4a8a",
    },
    {
        key: "ready",
        label: "Ready for Pickup",
        activeClass: "active-green",
        color: "#1a7a4a",
    },
    {
        key: "released",
        label: "Released",
        activeClass: "active-grey",
        color: "#666",
    },
    {
        key: "rejected",
        label: "Rejected",
        activeClass: "active-red",
        color: "#b02020",
    },
];

const BADGE_CFG = {
    pending: {
        bg: "#fff3e0",
        color: "#b86800",
        dot: "#b86800",
        label: "Pending",
    },
    approved: {
        bg: "#e8eef8",
        color: "#1a4a8a",
        dot: "#1a4a8a",
        label: "Approved",
    },
    ready: {
        bg: "#e8f5ee",
        color: "#1a7a4a",
        dot: "#1a7a4a",
        label: "Ready for Pickup",
    },
    released: { bg: "#f0f0f0", color: "#666", dot: "#999", label: "Released" },
    rejected: {
        bg: "#fdecea",
        color: "#b02020",
        dot: "#b02020",
        label: "Rejected",
    },
};

const DOT_COLORS = {
    gold: "#c9a227",
    blue: "#1a4a8a",
    green: "#1a7a4a",
    amber: "#b86800",
    red: "#b02020",
    grey: "#ccc",
};

const TIMELINE_MAP = {
    pending: [
        {
            dot: "gold",
            text: "Request submitted by resident",
            time: "Mar 11, 2026 · 10:24 AM",
        },
        { dot: "grey", text: "Awaiting staff review", time: "Pending" },
    ],
    approved: [
        {
            dot: "gold",
            text: "Request submitted by resident",
            time: "Mar 11, 2026 · 9:00 AM",
        },
        {
            dot: "blue",
            text: "Approved by Staff Reyes",
            time: "Mar 11, 2026 · 9:50 AM",
        },
        { dot: "grey", text: "Awaiting print & signing", time: "Pending" },
    ],
    ready: [
        {
            dot: "gold",
            text: "Request submitted by resident",
            time: "Mar 10, 2026 · 11:00 AM",
        },
        {
            dot: "blue",
            text: "Approved by Staff Cruz",
            time: "Mar 10, 2026 · 11:45 AM",
        },
        {
            dot: "blue",
            text: "Certificate printed",
            time: "Mar 10, 2026 · 11:50 AM",
        },
        {
            dot: "green",
            text: "Marked Ready for Pickup",
            time: "Mar 10, 2026 · 2:00 PM",
        },
        { dot: "grey", text: "Awaiting resident pickup", time: "Pending" },
    ],
    released: [
        {
            dot: "gold",
            text: "Request submitted by resident",
            time: "Mar 9, 2026 · 9:00 AM",
        },
        {
            dot: "blue",
            text: "Approved by Staff Reyes",
            time: "Mar 9, 2026 · 9:30 AM",
        },
        {
            dot: "blue",
            text: "Certificate printed",
            time: "Mar 9, 2026 · 9:35 AM",
        },
        {
            dot: "green",
            text: "Marked Ready for Pickup",
            time: "Mar 9, 2026 · 9:40 AM",
        },
        {
            dot: "green",
            text: "Released · QR scanned by Staff Reyes",
            time: "Mar 9, 2026 · 3:15 PM",
        },
    ],
    rejected: [
        {
            dot: "gold",
            text: "Request submitted by resident",
            time: "Mar 8, 2026 · 4:55 PM",
        },
        {
            dot: "red",
            text: "Rejected by Staff Cruz — Incomplete documents",
            time: "Mar 8, 2026 · 5:10 PM",
        },
    ],
};

const ITEMS_PER_PAGE = 8;

// Helpers
function formatDateShort() {
    return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function formatDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// =============================================================
// Request Drawer
// =============================================================
function RequestDrawer({ request, onClose, isMobile, onActionComplete }) {
    const [step, setStep] = useState("default"); // default | reject | release
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        setStep("default");
        setRejectReason("");
        document.body.style.overflow = "hidden";
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [request?.id, onClose]);

    if (!request) return null;

    const badge = BADGE_CFG[request.status];
    const timeline = TIMELINE_MAP[request.status] || [];

    const SectionTitle = ({ children }) => (
        <div className="mr-section-title">{children}</div>
    );

    const renderFooter = () => {
        if (step === "reject")
            return (
                <>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            background: "#f8f6f1",
                            color: "#4a4a6a",
                            border: "1px solid #e4dfd4",
                        }}
                        onClick={() => setStep("default")}
                    >
                        Cancel
                    </button>
                    {/* TODO: POST /api/requests/:id/reject with rejectReason */}
                    <button
                        className="mr-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#b02020",
                            color: "#fff",
                        }}
                        onClick={() => {
                            onActionComplete("rejected", request.id);
                            onClose();
                        }}
                    >
                        <X size={13} /> Confirm Rejection
                    </button>
                </>
            );
        if (step === "release")
            return (
                <>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            background: "#f8f6f1",
                            color: "#4a4a6a",
                            border: "1px solid #e4dfd4",
                        }}
                        onClick={() => setStep("default")}
                    >
                        Cancel
                    </button>
                    {/* TODO: POST /api/requests/:id/release */}
                    <button
                        className="mr-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#1a7a4a",
                            color: "#fff",
                        }}
                        onClick={() => {
                            onActionComplete("released", request.id);
                            onClose();
                        }}
                    >
                        <Check size={13} /> Confirm Release
                    </button>
                </>
            );
        if (request.status === "pending")
            return (
                <>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            background: "#fdecea",
                            color: "#b02020",
                            border: "1px solid #f5c0c0",
                        }}
                        onClick={() => setStep("reject")}
                    >
                        <X size={11} /> Reject
                    </button>
                    {/* TODO: POST /api/requests/:id/approve */}
                    <button
                        className="mr-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#1a7a4a",
                            color: "#fff",
                        }}
                        onClick={() => {
                            onActionComplete("approved", request.id);
                            onClose();
                        }}
                    >
                        <Check size={11} /> Approve Request
                    </button>
                </>
            );
        if (request.status === "approved")
            return (
                <>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            background: "#fdecea",
                            color: "#b02020",
                            border: "1px solid #f5c0c0",
                        }}
                        onClick={() => setStep("reject")}
                    >
                        <X size={11} /> Reject
                    </button>
                    {/* TODO: trigger print then POST /api/requests/:id/mark-ready */}
                    <button
                        className="mr-drawer-btn"
                        style={{ background: "#1a4a8a", color: "#fff" }}
                    >
                        <Printer size={13} /> Print Certificate
                    </button>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            background: "#d4edda",
                            color: "#8aaa8a",
                            cursor: "not-allowed",
                        }}
                        disabled
                        title="Print first"
                    >
                        Mark Ready
                    </button>
                </>
            );
        if (request.status === "ready")
            return (
                <>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            background: "#e8eef8",
                            color: "#1a4a8a",
                            border: "1px solid #b8cce8",
                        }}
                    >
                        <Printer size={13} /> Reprint
                    </button>
                    <button
                        className="mr-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#e8f5ee",
                            color: "#1a7a4a",
                            border: "1px solid #a8d8bc",
                        }}
                        onClick={() => setStep("release")}
                    >
                        <QrCode size={13} /> Scan QR &amp; Release
                    </button>
                </>
            );
        if (request.status === "released")
            return (
                <button
                    className="mr-drawer-btn"
                    style={{
                        background: "#e8eef8",
                        color: "#1a4a8a",
                        border: "1px solid #b8cce8",
                    }}
                >
                    <Printer size={13} /> Reprint Certificate
                </button>
            );
        if (request.status === "rejected")
            return (
                <div
                    style={{
                        fontSize: 11.5,
                        color: "#9090aa",
                        textAlign: "center",
                        width: "100%",
                        padding: "4px 0",
                    }}
                >
                    This request has been rejected. No further action available.
                </div>
            );
        return null;
    };

    const overlayStyle = isMobile
        ? {
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.5)",
              zIndex: 500,
              display: "flex",
              alignItems: "flex-end",
          }
        : {
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.35)",
              zIndex: 500,
              display: "flex",
              justifyContent: "flex-end",
          };

    return (
        <div
            style={overlayStyle}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={isMobile ? "mr-drawer-mobile" : "mr-drawer"}>
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
                        padding: "20px 24px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        background: "linear-gradient(135deg,#0e2554,#163066)",
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 16,
                                color: "#fff",
                                margin: 0,
                            }}
                        >
                            Request {request.id}
                        </h3>
                        <p
                            style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,0.5)",
                                marginTop: 3,
                            }}
                        >
                            {request.certType} · Filed {request.date}
                        </p>
                    </div>
                    <button
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                        onClick={onClose}
                    >
                        <X size={14} color="#fff" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="mr-drawer-body">
                    {/* Resident info */}
                    <div className="mr-drawer-section">
                        <SectionTitle>Resident Information</SectionTitle>
                        <div className="mr-detail-grid">
                            <div
                                className="mr-detail-item"
                                style={{ gridColumn: "1/-1" }}
                            >
                                <label>Full Name</label>
                                <span className="mr-detail-value">
                                    {request.name}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Email</label>
                                <span
                                    className="mr-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {request.email}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Contact</label>
                                <span
                                    className="mr-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {request.contact}
                                </span>
                            </div>
                            <div
                                className="mr-detail-item"
                                style={{ gridColumn: "1/-1" }}
                            >
                                <label>Address</label>
                                <span
                                    className="mr-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {request.address}, Olongapo City
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Civil Status</label>
                                <span className="mr-detail-value">
                                    {request.civil}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Nationality</label>
                                <span className="mr-detail-value">
                                    {request.nationality}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Request details */}
                    <div className="mr-drawer-section">
                        <SectionTitle>Request Details</SectionTitle>
                        <div className="mr-detail-grid">
                            <div className="mr-detail-item">
                                <label>Request ID</label>
                                <span
                                    className="mr-detail-value"
                                    style={{
                                        fontFamily: "'Courier New',monospace",
                                    }}
                                >
                                    {request.id}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Status</label>
                                <span
                                    style={{
                                        display: "inline-block",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        padding: "3px 10px",
                                        borderRadius: 20,
                                        background: badge.bg,
                                        color: badge.color,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Certificate Type</label>
                                <span className="mr-detail-value">
                                    {request.certType}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Purpose</label>
                                <span className="mr-detail-value">
                                    {request.purpose}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Date Filed</label>
                                <span className="mr-detail-value">
                                    {request.date} · {request.time}
                                </span>
                            </div>
                            <div className="mr-detail-item">
                                <label>Fee</label>
                                <span
                                    className="mr-detail-value"
                                    style={{
                                        color: request.hasFee
                                            ? "#b86800"
                                            : "#1a7a4a",
                                    }}
                                >
                                    {request.hasFee ? "⚠ With fee" : "✓ No fee"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Signature notice for approved */}
                    {request.status === "approved" && (
                        <div className="mr-drawer-section">
                            <SectionTitle>Signature Requirements</SectionTitle>
                            <div
                                style={{
                                    background: "#edfdf5",
                                    border: "1.5px solid #6ee7b7",
                                    borderRadius: 5,
                                    padding: "12px 14px",
                                    display: "flex",
                                    gap: 10,
                                }}
                            >
                                <Check
                                    size={16}
                                    color="#1a7a4a"
                                    strokeWidth={2}
                                    style={{ flexShrink: 0, marginTop: 2 }}
                                />
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#1a5c38",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Captain's e-signature only — ready to
                                        print
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color: "#2a7a4a",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        The Punong Barangay's e-signature will
                                        be applied automatically.
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <span
                                            style={{
                                                background: "#d1fae5",
                                                color: "#065f46",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: "2px 8px",
                                                borderRadius: 3,
                                            }}
                                        >
                                            ✓ Punong Barangay — E-Signature
                                            (auto)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rejection remarks */}
                    {request.status === "rejected" && (
                        <div className="mr-drawer-section">
                            <SectionTitle>Rejection Reason</SectionTitle>
                            <div
                                style={{
                                    background: "#f8f6f1",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 4,
                                    padding: "10px 12px",
                                    fontSize: 12,
                                    color: "#4a4a6a",
                                    lineHeight: 1.6,
                                }}
                            >
                                Incomplete supporting documents submitted.
                                Resident must re-submit with a valid
                                government-issued ID and proof of residency.
                            </div>
                        </div>
                    )}

                    {/* Reject input */}
                    {step === "reject" && (
                        <div className="mr-drawer-section">
                            <SectionTitle>Reason for Rejection *</SectionTitle>
                            <textarea
                                className="mr-reject-textarea"
                                placeholder="Enter reason for rejection — this will be visible to the resident…"
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                            />
                        </div>
                    )}

                    {/* Fee notice on release */}
                    {step === "release" && request.hasFee && (
                        <div
                            style={{
                                background: "#fff3e0",
                                border: "1.5px solid #f0b84a",
                                borderRadius: 5,
                                padding: "10px 14px",
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                marginBottom: 16,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#7a4800",
                                    fontWeight: 600,
                                }}
                            >
                                ⚠ Collect payment before confirming release.
                            </span>
                        </div>
                    )}
                    {step === "release" && !request.hasFee && (
                        <div
                            style={{
                                background: "#edfdf5",
                                border: "1.5px solid #6ee7b7",
                                borderRadius: 5,
                                padding: "10px 14px",
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                marginBottom: 16,
                            }}
                        >
                            <Check size={15} color="#1a7a4a" strokeWidth={2} />
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#1a5c38",
                                    fontWeight: 600,
                                }}
                            >
                                No fee required — ready to release.
                            </span>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="mr-drawer-section">
                        <SectionTitle>Request Timeline</SectionTitle>
                        {timeline.map((item, i) => (
                            <div key={i} className="mr-tl-item">
                                <div className="mr-tl-dot-wrap">
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            background: DOT_COLORS[item.dot],
                                            flexShrink: 0,
                                            marginTop: 3,
                                        }}
                                    />
                                    {i < timeline.length - 1 && (
                                        <div className="mr-tl-line" />
                                    )}
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#1a1a2e",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.text}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            color: "#9090aa",
                                            marginTop: 2,
                                        }}
                                    >
                                        {item.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mr-drawer-footer">{renderFooter()}</div>
            </div>
        </div>
    );
}

// =============================================================
// Main Component
// =============================================================
export default function ManageRequests({
    admin,
    onLogout,
    onNavigate: navProp,
}) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("manageRequests");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Filter/search state
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [certFilter, setCertFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [sortFilter, setSortFilter] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    // Requests state — in prod this comes from API
    const [requests, setRequests] = useState(MOCK_REQUESTS);

    // Drawer
    const [selectedRequest, setSelectedRequest] = useState(null);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        console.log("Navigate to:", page);
    };

    const handleLogout = () => {
        if (onLogout) onLogout();
    };

    // Filter logic
    const filtered = requests
        .filter((r) => {
            if (activeTab !== "all" && r.status !== activeTab) return false;
            if (certFilter !== "all" && r.certType !== certFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (
                    ![r.id, r.name, r.certType, r.purpose]
                        .join(" ")
                        .toLowerCase()
                        .includes(q)
                )
                    return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortFilter === "newest") return b.id.localeCompare(a.id);
            if (sortFilter === "oldest") return a.id.localeCompare(b.id);
            if (sortFilter === "name") return a.name.localeCompare(b.name);
            return 0;
        });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, search, certFilter, dateFilter, sortFilter]);

    // Tab counts
    const countByStatus = (status) =>
        requests.filter((r) => status === "all" || r.status === status).length;

    // Action complete callback (status update in local state)
    const handleActionComplete = (newStatus, reqId) => {
        // TODO: refetch from API instead
        setRequests((prev) =>
            prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r)),
        );
    };

    // Unique cert types for filter
    const certTypes = [...new Set(requests.map((r) => r.certType))];

    return (
        <div className="mr-root">
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

            {selectedRequest && (
                <RequestDrawer
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    isMobile={isMobile}
                    onActionComplete={handleActionComplete}
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
                        Manage Requests
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
                                Review and process certificate requests
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
                    {/* Page header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: 22,
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: isMobile ? 18 : 20,
                                    color: "#0e2554",
                                }}
                            >
                                All Requests
                            </h2>
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "#9090aa",
                                    marginTop: 3,
                                }}
                            >
                                {requests.length} total requests on record
                            </p>
                        </div>
                    </div>

                    {/* Status tabs */}
                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            marginBottom: 20,
                            flexWrap: "wrap",
                        }}
                    >
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`mr-stab${activeTab === tab.key ? ` ${tab.activeClass}` : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                                <span className="mr-stab-count">
                                    {countByStatus(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Filter bar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 18,
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Search */}
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
                                    left: 11,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <input
                                className="mr-search-input"
                                type="text"
                                placeholder="Search by name, ID, or certificate type…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Cert type filter */}
                        <select
                            className="mr-select"
                            value={certFilter}
                            onChange={(e) => setCertFilter(e.target.value)}
                        >
                            <option value="all">All Certificate Types</option>
                            {certTypes.map((ct) => (
                                <option key={ct} value={ct}>
                                    {ct}
                                </option>
                            ))}
                        </select>
                        {/* Date filter */}
                        <select
                            className="mr-select"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        {/* Sort */}
                        <select
                            className="mr-select"
                            value={sortFilter}
                            onChange={(e) => setSortFilter(e.target.value)}
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="oldest">Sort: Oldest First</option>
                            <option value="name">Sort: Name A–Z</option>
                        </select>
                    </div>

                    {/* Table panel */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            overflow: "hidden",
                        }}
                    >
                        {/* Panel header */}
                        <div
                            style={{
                                padding: "14px 20px",
                                borderBottom: "1px solid #e4dfd4",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#f8f6f1",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 14,
                                    color: "#0e2554",
                                    fontWeight: 700,
                                }}
                            >
                                {activeTab === "all"
                                    ? "All Requests"
                                    : STATUS_TABS.find(
                                          (t) => t.key === activeTab,
                                      )?.label}
                            </div>
                            <div style={{ fontSize: 11, color: "#9090aa" }}>
                                Showing{" "}
                                {Math.min(
                                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                    filtered.length,
                                )}
                                –
                                {Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    filtered.length,
                                )}{" "}
                                of {filtered.length}
                            </div>
                        </div>

                        {/* Desktop table */}
                        {!isMobile ? (
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        minWidth: 700,
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                "Request ID",
                                                "Resident",
                                                "Certificate Type",
                                                "Purpose",
                                                "Date Filed",
                                                "Status",
                                                "Actions",
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        padding: "10px 16px",
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: "#9090aa",
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "1.2px",
                                                        textAlign: "left",
                                                        borderBottom:
                                                            "1px solid #e4dfd4",
                                                        background: "#f8f6f1",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    style={{
                                                        textAlign: "center",
                                                        color: "#9090aa",
                                                        fontSize: 12,
                                                        padding: 32,
                                                    }}
                                                >
                                                    No requests match your
                                                    filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginated.map((req) => {
                                                const b = BADGE_CFG[req.status];
                                                return (
                                                    <tr
                                                        key={req.id}
                                                        className="mr-tr"
                                                    >
                                                        <td style={td}>
                                                            <span
                                                                style={{
                                                                    fontFamily:
                                                                        "'Courier New',monospace",
                                                                    fontSize: 11.5,
                                                                    color: "#0e2554",
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {req.id}
                                                            </span>
                                                        </td>
                                                        <td style={td}>
                                                            <div
                                                                style={{
                                                                    fontWeight: 600,
                                                                    color: "#1a1a2e",
                                                                }}
                                                            >
                                                                {req.name}
                                                            </div>
                                                        </td>
                                                        <td style={td}>
                                                            <span
                                                                style={{
                                                                    fontSize: 11.5,
                                                                    color: "#4a4a6a",
                                                                }}
                                                            >
                                                                {req.certType}
                                                            </span>
                                                        </td>
                                                        <td style={td}>
                                                            <span
                                                                style={{
                                                                    fontSize: 11.5,
                                                                    color: "#4a4a6a",
                                                                }}
                                                            >
                                                                {req.purpose}
                                                            </span>
                                                        </td>
                                                        <td style={td}>
                                                            <div
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: "#9090aa",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {req.date}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: "#c0bbb0",
                                                                }}
                                                            >
                                                                {req.time}
                                                            </div>
                                                        </td>
                                                        <td style={td}>
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "inline-flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 5,
                                                                    fontSize: 10.5,
                                                                    fontWeight: 700,
                                                                    padding:
                                                                        "3px 10px",
                                                                    borderRadius: 20,
                                                                    background:
                                                                        b.bg,
                                                                    color: b.color,
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        width: 6,
                                                                        height: 6,
                                                                        borderRadius:
                                                                            "50%",
                                                                        background:
                                                                            b.dot,
                                                                        flexShrink: 0,
                                                                    }}
                                                                />
                                                                {b.label}
                                                            </span>
                                                            {req.status ===
                                                                "ready" && (
                                                                <div
                                                                    style={{
                                                                        fontSize: 9.5,
                                                                        fontWeight: 700,
                                                                        marginTop: 3,
                                                                        color: req.hasFee
                                                                            ? "#b86800"
                                                                            : "#1a7a4a",
                                                                    }}
                                                                >
                                                                    {req.hasFee
                                                                        ? "⚠ With fee"
                                                                        : "✓ No fee"}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={td}>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap: 6,
                                                                    alignItems:
                                                                        "center",
                                                                }}
                                                            >
                                                                {req.status ===
                                                                    "pending" && (
                                                                    <button
                                                                        className="mr-btn mr-btn-review"
                                                                        onClick={() =>
                                                                            setSelectedRequest(
                                                                                req,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        Review
                                                                    </button>
                                                                )}
                                                                {req.status ===
                                                                    "approved" && (
                                                                    <button
                                                                        className="mr-btn mr-btn-view"
                                                                        onClick={() =>
                                                                            setSelectedRequest(
                                                                                req,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        View
                                                                    </button>
                                                                )}
                                                                {req.status ===
                                                                    "ready" && (
                                                                    <button
                                                                        className="mr-btn mr-btn-scan"
                                                                        onClick={() =>
                                                                            setSelectedRequest(
                                                                                req,
                                                                            )
                                                                        }
                                                                    >
                                                                        <QrCode
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        Scan QR
                                                                    </button>
                                                                )}
                                                                {(req.status ===
                                                                    "released" ||
                                                                    req.status ===
                                                                        "rejected") && (
                                                                    <button
                                                                        className="mr-btn mr-btn-view"
                                                                        onClick={() =>
                                                                            setSelectedRequest(
                                                                                req,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        View
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Mobile cards */
                            <div>
                                {paginated.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            color: "#9090aa",
                                            fontSize: 12,
                                            padding: 28,
                                        }}
                                    >
                                        No requests match your filters.
                                    </div>
                                ) : (
                                    paginated.map((req) => {
                                        const b = BADGE_CFG[req.status];
                                        return (
                                            <div
                                                key={req.id}
                                                className="mr-req-card"
                                                onClick={() =>
                                                    setSelectedRequest(req)
                                                }
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems:
                                                            "flex-start",
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
                                                                color: "#1a1a2e",
                                                            }}
                                                        >
                                                            {req.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11.5,
                                                                color: "#4a4a6a",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {req.certType}
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            padding: "3px 9px",
                                                            borderRadius: 20,
                                                            background: b.bg,
                                                            color: b.color,
                                                            whiteSpace:
                                                                "nowrap",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: 5,
                                                                height: 5,
                                                                borderRadius:
                                                                    "50%",
                                                                background:
                                                                    b.dot,
                                                            }}
                                                        />
                                                        {b.label}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
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
                                                        {req.id}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#9090aa",
                                                        }}
                                                    >
                                                        {req.date} · {req.time}
                                                    </span>
                                                </div>
                                                {req.status === "ready" && (
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            marginTop: 4,
                                                            color: req.hasFee
                                                                ? "#b86800"
                                                                : "#1a7a4a",
                                                        }}
                                                    >
                                                        {req.hasFee
                                                            ? "⚠ With fee"
                                                            : "✓ No fee"}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 20px",
                                borderTop: "1px solid #e4dfd4",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            <div style={{ fontSize: 11.5, color: "#9090aa" }}>
                                Showing{" "}
                                {Math.min(
                                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                    filtered.length,
                                )}
                                –
                                {Math.min(
                                    currentPage * ITEMS_PER_PAGE,
                                    filtered.length,
                                )}{" "}
                                of {filtered.length} requests
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                                <button
                                    className="mr-pag-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    <ChevronLeft size={14} />
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
                                                    width: 30,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 12,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                className={`mr-pag-btn${currentPage === p ? " active" : ""}`}
                                                onClick={() =>
                                                    setCurrentPage(p)
                                                }
                                            >
                                                {p}
                                            </button>
                                        ),
                                    )}
                                <button
                                    className="mr-pag-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
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

const td = {
    padding: "12px 16px",
    fontSize: 12.5,
    borderBottom: "1px solid #f5f0ea",
    verticalAlign: "middle",
    transition: "background 0.1s",
};
