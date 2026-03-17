// =============================================================
// FILE: client/src/pages/admin/Dashboard.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/dashboard/stats → { totalRequests, pending, released, residents, walkIn }
//   - GET /api/requests?limit=5&sort=latest → recent requests array
//   - GET /api/dashboard/cert-breakdown → [{ name, count }]
//   - GET /api/dashboard/activity → recent activity log entries
//   - GET /api/requests/ready-count → number of ready-for-pickup requests
//   - POST /api/qr/verify → { body: { qrData } } → resident/request info
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
    Calendar,
    QrCode,
    TrendingUp,
    AlertCircle,
    Check,
    ChevronRight,
    X,
    ScanLine,
    FileOutput,
    Menu,
} from "lucide-react";

import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import AdminQRScannerModal from "../../components/AdminQRScannerModal";

// TODO: import { useAdminAuth } from "../../context/AdminAuthContext";
// TODO: import { getDashboardStats, getRecentRequests, ... } from "../../services/dashboardService";

// =============================================================
// useWindowSize hook
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
// Inject global styles once
// =============================================================
if (!document.head.querySelector("[data-cf-dashboard]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-dashboard", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes scanline {
      0%   { top: 20px; opacity: 1; }
      50%  { top: 200px; opacity: 0.8; }
      100% { top: 20px; opacity: 1; }
    }
    @keyframes drawerSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes drawerSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes sidebarSlideIn {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    .cf-dash-root {
      font-family: 'Source Serif 4', serif;
      background: #f8f6f1;
      color: #1a1a2e;
      min-height: 100vh;
      display: flex;
    }
    .cf-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 20px; font-size: 12.5px;
      color: rgba(255,255,255,0.65); cursor: pointer;
      border-left: 3px solid transparent; transition: all 0.15s;
      text-decoration: none; background: none;
      border-right: none; border-top: none; border-bottom: none;
      width: 100%; text-align: left; font-family: 'Source Serif 4', serif;
    }
    .cf-nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
    .cf-nav-item.active { background: rgba(201,162,39,0.12); color: #fff; border-left-color: #c9a227; }
    .cf-nav-item.active svg { opacity: 1 !important; }
    .cf-nav-item-icon {
      display: flex; align-items: center; justify-content: center;
      padding: 10px 0; font-size: 12.5px;
      color: rgba(255,255,255,0.65); cursor: pointer;
      border-left: 3px solid transparent; transition: all 0.15s;
      background: none; border-right: none; border-top: none; border-bottom: none;
      width: 100%; font-family: 'Source Serif 4', serif;
    }
    .cf-nav-item-icon:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
    .cf-nav-item-icon.active { background: rgba(201,162,39,0.12); color: #fff; border-left-color: #c9a227; }
    .cf-action-btn {
      border: 1px solid #e4dfd4; border-radius: 4px;
      padding: 5px 12px; font-size: 11px; cursor: pointer;
      font-family: 'Source Serif 4', serif; transition: all 0.15s;
      font-weight: 600; white-space: nowrap;
    }
    .cf-qa-btn {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border-radius: 6px;
      cursor: pointer; text-align: left; width: 100%;
      font-family: 'Source Serif 4', serif; transition: opacity 0.15s;
    }
    .cf-qa-btn:hover { opacity: 0.88; }
    .cf-scan-sim-btn {
      padding: 9px 16px; border-radius: 5px;
      font-family: 'Source Serif 4', serif;
      font-size: 12px; font-weight: 700; cursor: pointer; transition: opacity 0.15s;
    }
    .cf-scan-sim-btn:hover { opacity: 0.85; }
    .cf-logout-btn {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.35); padding: 4px;
      transition: color 0.15s; display: flex; align-items: center;
    }
    .cf-logout-btn:hover { color: rgba(255,255,255,0.7); }
    .cf-panel-action {
      font-size: 11px; color: #163066; cursor: pointer;
      text-decoration: underline; background: none; border: none;
      font-family: 'Source Serif 4', serif;
    }

    /* ── Drawer ── */
    .cf-drawer {
      width: 480px; height: 100vh; background: #fff;
      display: flex; flex-direction: column;
      box-shadow: -8px 0 40px rgba(0,0,0,.2); overflow: hidden;
      animation: drawerSlideIn 0.22s ease both;
    }
    .cf-drawer-mobile {
      width: 100%; max-height: 92vh; background: #fff;
      display: flex; flex-direction: column;
      box-shadow: 0 -8px 40px rgba(0,0,0,.2); overflow: hidden;
      animation: drawerSlideUp 0.25s ease both;
      border-radius: 16px 16px 0 0;
    }
    .cf-drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
    .cf-drawer-body::-webkit-scrollbar { width: 4px; }
    .cf-drawer-body::-webkit-scrollbar-thumb { background: #e4dfd4; border-radius: 4px; }
    .cf-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cf-detail-item { display: flex; flex-direction: column; gap: 2px; }
    .cf-detail-item label { font-size: 10px; color: #9090aa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 3px; font-family: 'Source Serif 4', serif; }
    .cf-detail-value { font-size: 13px; color: #1a1a2e; font-weight: 600; display: block; font-family: 'Source Serif 4', serif; }
    .cf-tl-item { display: flex; gap: 12px; padding-bottom: 16px; }
    .cf-tl-item:last-child { padding-bottom: 0; }
    .cf-tl-dot-wrap { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .cf-tl-line { width: 2px; background: #e4dfd4; flex: 1; margin-top: 4px; }
    .cf-tl-item:last-child .cf-tl-line { display: none; }
    .cf-drawer-footer { padding: 16px 24px; border-top: 1px solid #e4dfd4; background: #f8f6f1; display: flex; gap: 10px; flex-wrap: wrap; }
    .cf-drawer-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; font-family: 'Playfair Display', serif; letter-spacing: .5px; cursor: pointer; border: none; flex: 1; transition: opacity .15s; min-width: 80px; }
    .cf-drawer-btn:hover { opacity: 0.88; }
    .cf-drawer-section { margin-bottom: 22px; }
    .cf-drawer-section-title { font-size: 10px; font-weight: 700; color: #9090aa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e4dfd4; font-family: 'Source Serif 4', serif; }
    .cf-reject-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e4dfd4; border-radius: 4px; font-family: 'Source Serif 4', serif; font-size: 12.5px; color: #1a1a2e; outline: none; resize: vertical; min-height: 80px; box-sizing: border-box; }
    .cf-reject-textarea:focus { border-color: #b02020; }
    /* ── Request card (mobile table replacement) ── */
    .cf-req-card {
      padding: 14px 16px; border-bottom: 1px solid #f0ece4;
      display: flex; flex-direction: column; gap: 8px;
      cursor: pointer; transition: background 0.1s;
    }
    .cf-req-card:last-child { border-bottom: none; }
    .cf-req-card:hover { background: #faf8f4; }
    .cf-req-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .cf-req-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: nowrap; }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Mock data
// =============================================================
const MOCK_STATS = [
    {
        label: "Total Requests",
        value: 148,
        color: "navy",
        iconColor: "#0e2554",
        iconBg: "#e8eef8",
        change: "+12% from last month",
        changeType: "up",
    },
    {
        label: "Pending",
        value: 12,
        color: "amber",
        iconColor: "#b86800",
        iconBg: "#fff3e0",
        change: "Needs attention",
        changeType: "warn",
    },
    {
        label: "Released",
        value: 124,
        color: "green",
        iconColor: "#1a7a4a",
        iconBg: "#e8f5ee",
        change: "+8% this month",
        changeType: "up",
    },
    {
        label: "Residents",
        value: 392,
        color: "gold",
        iconColor: "#9a7515",
        iconBg: "#f5edce",
        change: "+5 this week",
        changeType: "up",
    },
    {
        label: "Walk-in Issued",
        value: 34,
        color: "purple",
        iconColor: "#6a3db8",
        iconBg: "#f3eeff",
        change: "+4 this week",
        changeType: "up",
    },
];

const MOCK_REQUESTS = [
    {
        id: "#REQ-0148",
        name: "Juan dela Cruz",
        type: "Barangay Clearance",
        date: "Mar 11, 2026",
        status: "pending",
        action: "Review",
        hasFee: true,
    },
    {
        id: "#REQ-0147",
        name: "Maria Santos",
        type: "Certificate of Residency",
        date: "Mar 11, 2026",
        status: "approved",
        action: "View",
        hasFee: false,
    },
    {
        id: "#REQ-0146",
        name: "Ricardo Mendoza",
        type: "Certificate of Indigency",
        date: "Mar 10, 2026",
        status: "ready",
        action: "Scan QR",
        hasFee: false,
    },
    {
        id: "#REQ-0145",
        name: "Lorna Reyes",
        type: "Business Permit",
        date: "Mar 10, 2026",
        status: "pending",
        action: "Review",
        hasFee: true,
    },
    {
        id: "#REQ-0144",
        name: "Eduardo Bautista",
        type: "Barangay Clearance",
        date: "Mar 9, 2026",
        status: "released",
        action: "View",
        hasFee: true,
    },
];

const MOCK_CERT_BREAKDOWN = [
    { name: "Barangay Clearance", count: 58, pct: 100 },
    { name: "Certificate of Residency", count: 34, pct: 59 },
    { name: "Certificate of Indigency", count: 27, pct: 47 },
    { name: "Business Permit", count: 18, pct: 31 },
    { name: "Good Moral Certificate", count: 11, pct: 19 },
];

const MOCK_ACTIVITY = [
    {
        dot: "#2da866",
        text: (
            <>
                <strong>REQ-0147</strong> approved by Staff Reyes
            </>
        ),
        time: "Today, 10:42 AM",
    },
    {
        dot: "#3a6abf",
        text: (
            <>
                <strong>REQ-0146</strong> marked Ready for Pickup
            </>
        ),
        time: "Today, 9:15 AM",
    },
    {
        dot: "#c9a227",
        text: (
            <>
                New resident <strong>Juan dela Cruz</strong> registered
            </>
        ),
        time: "Today, 8:30 AM",
    },
    {
        dot: "#d04040",
        text: (
            <>
                <strong>REQ-0143</strong> rejected — incomplete info
            </>
        ),
        time: "Yesterday, 4:55 PM",
    },
];

const BADGE = {
    pending: { bg: "#fff3e0", color: "#b86800", label: "Pending" },
    approved: { bg: "#e8f5ee", color: "#1a7a4a", label: "Approved" },
    ready: { bg: "#e8eef8", color: "#1a4a8a", label: "Ready" },
    released: { bg: "#f0f0f0", color: "#666", label: "Released" },
};

const DOT_COLORS = {
    gold: "#c9a227",
    blue: "#1a4a8a",
    green: "#1a7a4a",
    amber: "#b86800",
    red: "#b02020",
    grey: "#ccc",
};

const DRAWER_STATES = {
    pending: {
        title: "Request #REQ-0148",
        sub: "Barangay Clearance · Filed Mar 11, 2026",
        certType: "Barangay Clearance",
        status: "pending",
        resident: {
            name: "Juan dela Cruz",
            email: "juan.delacruz@email.com",
            contact: "+63 912 345 6789",
            address: "123 Rizal St., Barangay East Tapinac, Olongapo City",
            civil: "Single",
            nationality: "Filipino",
        },
        purpose: "Employment",
        dateFiled: "Mar 11, 2026 · 10:24 AM",
        showRemarks: false,
        showSig: false,
        timeline: [
            {
                dot: "gold",
                text: "Request submitted by resident",
                time: "Mar 11, 2026 · 10:24 AM",
            },
            { dot: "grey", text: "Awaiting staff review", time: "Pending" },
        ],
        footerType: "pending",
    },
    approved: {
        title: "Request #REQ-0147",
        sub: "Certificate of Residency · Approved Mar 11, 2026",
        certType: "Certificate of Residency",
        status: "approved",
        resident: {
            name: "Maria Santos",
            email: "maria.santos@email.com",
            contact: "+63 917 654 3210",
            address: "45 Mabini St., Barangay East Tapinac, Olongapo City",
            civil: "Married",
            nationality: "Filipino",
        },
        purpose: "Bank Requirements",
        dateFiled: "Mar 11, 2026 · 9:15 AM",
        showRemarks: false,
        showSig: true,
        timeline: [
            {
                dot: "gold",
                text: "Request submitted by resident",
                time: "Mar 11, 2026 · 9:15 AM",
            },
            {
                dot: "blue",
                text: "Approved by Staff Reyes",
                time: "Mar 11, 2026 · 9:50 AM",
            },
            { dot: "grey", text: "Awaiting print & signing", time: "Pending" },
        ],
        footerType: "approved",
    },
    ready: {
        title: "Request #REQ-0146",
        sub: "Certificate of Indigency · Ready for Pickup",
        certType: "Certificate of Indigency",
        status: "ready",
        resident: {
            name: "Ricardo Mendoza",
            email: "r.mendoza@email.com",
            contact: "+63 905 111 2222",
            address: "78 Del Pilar St., Barangay East Tapinac, Olongapo City",
            civil: "Single",
            nationality: "Filipino",
        },
        purpose: "Medical Assistance",
        dateFiled: "Mar 10, 2026 · 11:00 AM",
        showRemarks: false,
        showSig: false,
        timeline: [
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
                text: "Certificate printed by Staff Cruz",
                time: "Mar 10, 2026 · 11:50 AM",
            },
            {
                dot: "green",
                text: "Marked Ready for Pickup — No fee",
                time: "Mar 10, 2026 · 2:00 PM",
            },
            {
                dot: "grey",
                text: "Awaiting resident pickup & QR scan",
                time: "Pending",
            },
        ],
        footerType: "ready_free",
    },
    released: {
        title: "Request #REQ-0144",
        sub: "Barangay Clearance · Released Mar 9, 2026",
        certType: "Barangay Clearance",
        status: "released",
        resident: {
            name: "Eduardo Bautista",
            email: "e.bautista@email.com",
            contact: "+63 918 987 6543",
            address: "12 Luna St., Barangay East Tapinac, Olongapo City",
            civil: "Married",
            nationality: "Filipino",
        },
        purpose: "Travel Abroad",
        dateFiled: "Mar 9, 2026 · 9:10 AM",
        showRemarks: false,
        showSig: false,
        timeline: [
            {
                dot: "gold",
                text: "Request submitted by resident",
                time: "Mar 9, 2026 · 9:10 AM",
            },
            {
                dot: "blue",
                text: "Approved by Staff Reyes",
                time: "Mar 9, 2026 · 10:00 AM",
            },
            {
                dot: "blue",
                text: "Certificate printed by Staff Reyes",
                time: "Mar 9, 2026 · 10:05 AM",
            },
            {
                dot: "green",
                text: "Marked Ready for Pickup",
                time: "Mar 9, 2026 · 10:30 AM",
            },
            {
                dot: "green",
                text: "Released · QR scanned by Staff Reyes",
                time: "Mar 9, 2026 · 3:15 PM",
            },
        ],
        footerType: "released",
    },
};

const STATUS_MAP = {
    pending: {
        drawerKey: "pending",
        btnLabel: "Review",
        btnStyle: { background: "#0e2554", color: "#fff" },
    },
    approved: {
        drawerKey: "approved",
        btnLabel: "View",
        btnStyle: { background: "#e8eef8", color: "#1a4a8a" },
    },
    ready: {
        drawerKey: "ready",
        btnLabel: "Scan QR",
        btnStyle: { background: "#e8f5ee", color: "#1a7a4a" },
    },
    released: {
        drawerKey: "released",
        btnLabel: "View",
        btnStyle: { background: "#e8eef8", color: "#1a4a8a" },
    },
};

const BADGE_DRAWER = {
    pending: { bg: "#fff3e0", color: "#b86800", label: "Pending" },
    approved: { bg: "#e8eef8", color: "#1a4a8a", label: "Approved" },
    ready: { bg: "#e8f5ee", color: "#1a7a4a", label: "Ready for Pickup" },
    released: { bg: "#f0f0f0", color: "#666", label: "Released" },
    rejected: { bg: "#fdecea", color: "#b02020", label: "Rejected" },
};

// =============================================================
// Helpers
// =============================================================
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
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
// =============================================================
// Request Drawer
// =============================================================
function RequestDrawer({ drawerKey, onClose, isMobile }) {
    const { key: dk, hasFee: reqHasFee } =
        typeof drawerKey === "object"
            ? drawerKey
            : { key: drawerKey, hasFee: false };
    const data = {
        ...DRAWER_STATES[dk],
        hasFee: reqHasFee ?? DRAWER_STATES[dk]?.hasFee,
    };
    const [step, setStep] = useState("default");

    useEffect(() => {
        setStep("default");
        document.body.style.overflow = "hidden";
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [drawerKey, onClose]);

    if (!data) return null;
    const badge = BADGE_DRAWER[data.status];

    const SectionTitle = ({ children }) => (
        <div className="cf-drawer-section-title">{children}</div>
    );

    const renderFooter = () => {
        if (step === "reject")
            return (
                <>
                    <button
                        className="cf-drawer-btn"
                        style={{
                            background: "#f8f6f1",
                            color: "#4a4a6a",
                            border: "1px solid #e4dfd4",
                        }}
                        onClick={() => setStep("default")}
                    >
                        Cancel
                    </button>
                    {/* TODO: POST /api/requests/:id/reject with reason */}
                    <button
                        className="cf-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#b02020",
                            color: "#fff",
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
                        className="cf-drawer-btn"
                        style={{
                            background: "#f8f6f1",
                            color: "#4a4a6a",
                            border: "1px solid #e4dfd4",
                        }}
                        onClick={() => setStep("default")}
                    >
                        Cancel
                    </button>
                    {/* TODO: POST /api/requests/:id/release → body: { requestId } */}
                    <button
                        className="cf-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#1a7a4a",
                            color: "#fff",
                        }}
                    >
                        <Check size={13} /> Confirm Release
                    </button>
                </>
            );
        if (data.footerType === "pending")
            return (
                <>
                    <button
                        className="cf-drawer-btn"
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
                        className="cf-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#1a7a4a",
                            color: "#fff",
                        }}
                    >
                        <Check size={11} /> Approve
                    </button>
                </>
            );
        if (data.footerType === "approved")
            return (
                <>
                    <button
                        className="cf-drawer-btn"
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
                        className="cf-drawer-btn"
                        style={{ background: "#1a4a8a", color: "#fff" }}
                    >
                        Print
                    </button>
                    <button
                        className="cf-drawer-btn"
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
        if (data.footerType === "ready_free" || data.footerType === "ready")
            return (
                <>
                    <button
                        className="cf-drawer-btn"
                        style={{
                            background: "#e8eef8",
                            color: "#1a4a8a",
                            border: "1px solid #b8cce8",
                        }}
                    >
                        Reprint
                    </button>
                    <button
                        className="cf-drawer-btn"
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
        if (data.footerType === "released")
            return (
                <button
                    className="cf-drawer-btn"
                    style={{
                        background: "#e8eef8",
                        color: "#1a4a8a",
                        border: "1px solid #b8cce8",
                    }}
                >
                    Reprint Certificate
                </button>
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
            <div className={isMobile ? "cf-drawer-mobile" : "cf-drawer"}>
                {/* Mobile drag handle */}
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

                <div style={dr.head}>
                    <div>
                        <h3 style={dr.headTitle}>{data.title}</h3>
                        <p style={dr.headSub}>{data.sub}</p>
                    </div>
                    <button style={dr.closeBtn} onClick={onClose}>
                        <X size={14} color="#fff" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="cf-drawer-body">
                    {/* Resident Info */}
                    <div className="cf-drawer-section">
                        <SectionTitle>Resident Information</SectionTitle>
                        <div className="cf-detail-grid">
                            <div
                                className="cf-detail-item"
                                style={{ gridColumn: "1/-1" }}
                            >
                                <label>Full Name</label>
                                <span className="cf-detail-value">
                                    {data.resident.name}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Email</label>
                                <span
                                    className="cf-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {data.resident.email}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Contact</label>
                                <span
                                    className="cf-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {data.resident.contact}
                                </span>
                            </div>
                            <div
                                className="cf-detail-item"
                                style={{ gridColumn: "1/-1" }}
                            >
                                <label>Address</label>
                                <span
                                    className="cf-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {data.resident.address}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Civil Status</label>
                                <span className="cf-detail-value">
                                    {data.resident.civil}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Nationality</label>
                                <span className="cf-detail-value">
                                    {data.resident.nationality}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="cf-drawer-section">
                        <SectionTitle>Request Details</SectionTitle>
                        <div className="cf-detail-grid">
                            <div className="cf-detail-item">
                                <label>Request ID</label>
                                <span
                                    className="cf-detail-value"
                                    style={{
                                        fontFamily: "'Courier New',monospace",
                                    }}
                                >
                                    {data.title.split(" ")[1]}
                                </span>
                            </div>
                            <div className="cf-detail-item">
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
                            <div className="cf-detail-item">
                                <label>Certificate Type</label>
                                <span className="cf-detail-value">
                                    {data.certType}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Purpose</label>
                                <span className="cf-detail-value">
                                    {data.purpose}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Date Filed</label>
                                <span className="cf-detail-value">
                                    {data.dateFiled}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Fee</label>
                                <span
                                    className="cf-detail-value"
                                    style={{
                                        color: data.hasFee
                                            ? "#b86800"
                                            : "#1a7a4a",
                                    }}
                                >
                                    {data.hasFee ? "⚠ With fee" : "✓ No fee"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Signature notice */}
                    {data.showSig && (
                        <div className="cf-drawer-section">
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
                                    <div
                                        style={{
                                            marginTop: 8,
                                            display: "flex",
                                            gap: 6,
                                            flexWrap: "wrap",
                                        }}
                                    >
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
                    {data.showRemarks && (
                        <div className="cf-drawer-section">
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
                            </div>
                        </div>
                    )}

                    {/* Reject input */}
                    {step === "reject" && (
                        <div className="cf-drawer-section">
                            <SectionTitle>Reason for Rejection *</SectionTitle>
                            <textarea
                                className="cf-reject-textarea"
                                placeholder="Enter reason for rejection — this will be visible to the resident…"
                            />
                        </div>
                    )}

                    {/* Fee notice on release */}
                    {step === "release" && data.hasFee && (
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
                            <AlertCircle
                                size={15}
                                color="#b86800"
                                strokeWidth={2}
                                style={{ flexShrink: 0 }}
                            />
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#7a4800",
                                    fontWeight: 600,
                                }}
                            >
                                Collect payment before confirming release.
                            </span>
                        </div>
                    )}

                    {/* No fee confirmation */}
                    {step === "release" && !data.hasFee && (
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
                    <div className="cf-drawer-section">
                        <SectionTitle>Request Timeline</SectionTitle>
                        {data.timeline.map((item, i) => (
                            <div key={i} className="cf-tl-item">
                                <div className="cf-tl-dot-wrap">
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
                                    {i < data.timeline.length - 1 && (
                                        <div className="cf-tl-line" />
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

                <div className="cf-drawer-footer">{renderFooter()}</div>
            </div>
        </div>
    );
}

// =============================================================
// Stat Card
// =============================================================
function StatCard({
    label,
    value,
    color,
    iconColor,
    iconBg,
    change,
    changeType,
    compact,
}) {
    const topColors = {
        navy: "linear-gradient(90deg,#0e2554,#163066)",
        amber: "linear-gradient(90deg,#b86800,#e08000)",
        green: "linear-gradient(90deg,#1a7a4a,#2da866)",
        gold: "linear-gradient(90deg,#9a7515,#c9a227,#f0d060)",
        purple: "#6a3db8",
    };
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e4dfd4",
                borderRadius: 6,
                overflow: "hidden",
            }}
        >
            <div style={{ height: 3, background: topColors[color] }} />
            <div
                style={{
                    padding: compact ? "12px 14px 14px" : "17px 22px 20px",
                }}
            >
                <div
                    style={{
                        width: compact ? 28 : 36,
                        height: compact ? 28 : 36,
                        borderRadius: 8,
                        background: iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: compact ? 8 : 14,
                    }}
                >
                    <StatIcon
                        color={iconColor}
                        type={label}
                        size={compact ? 14 : 18}
                    />
                </div>
                <div
                    style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: compact ? 22 : 30,
                        fontWeight: 700,
                        color: color === "purple" ? "#6a3db8" : "#0e2554",
                        lineHeight: 1,
                        marginBottom: compact ? 3 : 5,
                    }}
                >
                    {value}
                </div>
                <div
                    style={{
                        fontSize: compact ? 10 : 11,
                        color: "#9090aa",
                        letterSpacing: "0.5px",
                    }}
                >
                    {label}
                </div>
                {!compact && (
                    <div
                        style={{
                            fontSize: 10.5,
                            marginTop: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color:
                                changeType === "warn"
                                    ? color === "purple"
                                        ? "#6a3db8"
                                        : "#b86800"
                                    : "#1a7a4a",
                        }}
                    >
                        {changeType === "up" ? (
                            <TrendingUp size={11} strokeWidth={2.5} />
                        ) : (
                            <AlertCircle size={11} strokeWidth={2.5} />
                        )}
                        {change}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatIcon({ color, type, size = 18 }) {
    if (type.includes("Total") || type.includes("Walk"))
        return <FileText size={size} color={color} strokeWidth={2} />;
    if (type.includes("Pending"))
        return <AlertCircle size={size} color={color} strokeWidth={2} />;
    if (type.includes("Released") || type.includes("Release"))
        return <Check size={size} color={color} strokeWidth={2} />;
    if (type.includes("Resident"))
        return <Users size={size} color={color} strokeWidth={2} />;
    return <FileText size={size} color={color} strokeWidth={2} />;
}

// =============================================================
// Dashboard
// =============================================================
export default function Dashboard({ admin, onLogout, onNavigate: navProp }) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("dashboard");
    const [showQR, setShowQR] = useState(false);
    const [drawerKey, setDrawerKey] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // TODO: Replace mock data with API calls
    // useEffect(() => { fetchDashboardStats().then(setStats); }, []);

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        console.log("Navigate to:", page);
    };

    const handleLogout = () => {
        // TODO: localStorage.removeItem("adminToken"); logout();
        if (onLogout) onLogout();
    };

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    return (
        <div className="cf-dash-root">
            {/* ── Sidebar — desktop + tablet ── */}
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

            {/* ── Mobile sidebar overlay ── */}
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

            {/* ── Modals ── */}
            {showQR && (
                <AdminQRScannerModal
                    onClose={() => setShowQR(false)}
                    onNavigate={handleNavigate}
                    isMobile={isMobile}
                />
            )}
            {drawerKey && (
                <RequestDrawer
                    drawerKey={drawerKey}
                    onClose={() => setDrawerKey(null)}
                    isMobile={isMobile}
                />
            )}

            {/* ── Main content ── */}
            <div
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    paddingBottom: 0,
                }}
            >
                {/* Top bar */}
                <div
                    style={{
                        ...d.topbar,
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
                                padding: "4px",
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
                            ...d.topbarTitle,
                            fontSize: isMobile ? 16 : 18,
                        }}
                    >
                        Dashboard
                        {!isMobile && (
                            <span style={d.topbarGreeting}>
                                {getGreeting()},{" "}
                                {(admin?.name || "Dante").split(" ")[0]}
                            </span>
                        )}
                    </div>
                    {!isMobile && (
                        <div style={d.topbarDate}>
                            <Calendar size={12} />
                            {isTablet ? formatDateShort() : formatDate()}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div
                    style={{
                        padding: isMobile ? "16px 16px 20px" : "28px 32px",
                        flex: 1,
                    }}
                >
                    {/* Mobile greeting */}
                    {isMobile && (
                        <p
                            style={{
                                fontSize: 13,
                                color: "#9090aa",
                                marginBottom: 16,
                            }}
                        >
                            {getGreeting()},{" "}
                            {(admin?.name || "Dante").split(" ")[0]} ·{" "}
                            {formatDateShort()}
                        </p>
                    )}

                    {/* ── Stat cards ── */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "repeat(2,1fr)"
                                : isTablet
                                  ? "repeat(2,1fr)"
                                  : "repeat(5,1fr)",
                            gap: isMobile ? 10 : 14,
                            marginBottom: isMobile ? 20 : 24,
                        }}
                    >
                        {MOCK_STATS.map((stat, i) => (
                            <StatCard key={i} {...stat} compact={isMobile} />
                        ))}
                    </div>

                    {/* ── Two-column / single-column layout ── */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                isMobile || isTablet ? "1fr" : "1fr 340px",
                            gap: 20,
                        }}
                    >
                        {/* Recent Requests */}
                        <div style={d.panel}>
                            <div style={d.panelHeader}>
                                <span style={d.panelTitle}>
                                    Recent Requests
                                </span>
                                {/* TODO: navigate to /admin/manageRequests */}
                                <button
                                    className="cf-panel-action"
                                    onClick={() =>
                                        handleNavigate("manageRequests")
                                    }
                                >
                                    View all →
                                </button>
                            </div>

                            {/* Desktop/Tablet: table */}
                            {!isMobile ? (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={d.table}>
                                        <thead>
                                            <tr>
                                                {[
                                                    "Req. ID",
                                                    "Resident",
                                                    "Certificate Type",
                                                    "Date Filed",
                                                    "Status",
                                                    "Action",
                                                ].map((h) => (
                                                    <th key={h} style={d.th}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MOCK_REQUESTS.map((req) => {
                                                const b = BADGE[req.status];
                                                const sm =
                                                    STATUS_MAP[req.status];
                                                return (
                                                    <tr
                                                        key={req.id}
                                                        onMouseEnter={(e) =>
                                                            Array.from(
                                                                e.currentTarget
                                                                    .cells,
                                                            ).forEach(
                                                                (c) =>
                                                                    (c.style.background =
                                                                        "#faf8f4"),
                                                            )
                                                        }
                                                        onMouseLeave={(e) =>
                                                            Array.from(
                                                                e.currentTarget
                                                                    .cells,
                                                            ).forEach(
                                                                (c) =>
                                                                    (c.style.background =
                                                                        ""),
                                                            )
                                                        }
                                                    >
                                                        <td style={d.td}>
                                                            <span
                                                                style={d.reqId}
                                                            >
                                                                {req.id}
                                                            </span>
                                                        </td>
                                                        <td style={d.td}>
                                                            <span
                                                                style={
                                                                    d.reqName
                                                                }
                                                            >
                                                                {req.name}
                                                            </span>
                                                        </td>
                                                        <td style={d.td}>
                                                            <span
                                                                style={
                                                                    d.reqType
                                                                }
                                                            >
                                                                {req.type}
                                                            </span>
                                                        </td>
                                                        <td style={d.td}>
                                                            <span
                                                                style={
                                                                    d.reqDate
                                                                }
                                                            >
                                                                {req.date}
                                                            </span>
                                                        </td>
                                                        <td style={d.td}>
                                                            <span
                                                                style={{
                                                                    ...d.badge,
                                                                    background:
                                                                        b.bg,
                                                                    color: b.color,
                                                                }}
                                                            >
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
                                                        <td style={d.td}>
                                                            {sm && (
                                                                <button
                                                                    className="cf-action-btn"
                                                                    style={
                                                                        sm.btnStyle
                                                                    }
                                                                    onClick={() =>
                                                                        setDrawerKey(
                                                                            {
                                                                                key: sm.drawerKey,
                                                                                hasFee: req.hasFee,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        sm.btnLabel
                                                                    }
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                /* Mobile: card list */
                                <div>
                                    {MOCK_REQUESTS.map((req) => {
                                        const b = BADGE[req.status];
                                        const sm = STATUS_MAP[req.status];
                                        return (
                                            <div
                                                key={req.id}
                                                className="cf-req-card"
                                                onClick={() =>
                                                    sm &&
                                                    setDrawerKey({
                                                        key: sm.drawerKey,
                                                        hasFee: req.hasFee,
                                                    })
                                                }
                                            >
                                                <div className="cf-req-card-top">
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
                                                            {req.type}
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            ...d.badge,
                                                            background: b.bg,
                                                            color: b.color,
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {b.label}
                                                    </span>
                                                </div>
                                                <div className="cf-req-card-bottom">
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
                                                        {req.date}
                                                    </span>
                                                </div>
                                                {req.status === "ready" && (
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            fontWeight: 700,
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
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right column */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 20,
                            }}
                        >
                            {/* Quick Actions */}
                            <div style={d.panel}>
                                <div style={d.panelHeader}>
                                    <span style={d.panelTitle}>
                                        Quick Actions
                                    </span>
                                </div>
                                <div
                                    style={{
                                        padding: 16,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}
                                >
                                    <button
                                        className="cf-qa-btn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg,#e8eef8,#dce6f5)",
                                            border: "1.5px solid #b8cce8",
                                        }}
                                        onClick={() => setShowQR(true)}
                                    >
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                background: "#1a4a8a",
                                                borderRadius: 8,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <ScanLine
                                                size={20}
                                                color="white"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#1a3a6b",
                                                }}
                                            >
                                                Scan QR for Pickup
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#4a6a9a",
                                                    marginTop: 2,
                                                }}
                                            >
                                                Verify & release a ready
                                                document
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            {/* TODO: replace 7 with live ready count from API */}
                                            <span
                                                style={{
                                                    background: "#1a4a8a",
                                                    color: "#fff",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    padding: "3px 9px",
                                                    borderRadius: 20,
                                                }}
                                            >
                                                7 ready
                                            </span>
                                            <ChevronRight
                                                size={14}
                                                color="#4a6a9a"
                                            />
                                        </div>
                                    </button>
                                    <button
                                        className="cf-qa-btn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg,#f3eeff,#ede8ff)",
                                            border: "1.5px solid #c8b8e8",
                                        }}
                                        onClick={() => handleNavigate("walkIn")}
                                    >
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                background: "#6a3db8",
                                                borderRadius: 8,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FilePlus
                                                size={20}
                                                color="white"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#4a1fa8",
                                                }}
                                            >
                                                Walk-in Issuance
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#7a5ab8",
                                                    marginTop: 2,
                                                }}
                                            >
                                                Issue a certificate manually at
                                                the counter
                                            </div>
                                        </div>
                                        <ChevronRight
                                            size={14}
                                            color="#7a5ab8"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Certificate Breakdown */}
                            <div style={d.panel}>
                                <div style={d.panelHeader}>
                                    <span style={d.panelTitle}>
                                        Certificates This Month
                                    </span>
                                </div>
                                <div>
                                    {MOCK_CERT_BREAKDOWN.map((cert) => (
                                        <div key={cert.name} style={d.certRow}>
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#1a1a2e",
                                                        marginBottom: 5,
                                                    }}
                                                >
                                                    {cert.name}
                                                </div>
                                                <div
                                                    style={{
                                                        height: 5,
                                                        background: "#eee",
                                                        borderRadius: 3,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: "100%",
                                                            borderRadius: 3,
                                                            background:
                                                                "linear-gradient(90deg,#0e2554,#1e3d7a)",
                                                            width: `${cert.pct}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 15,
                                                    color: "#0e2554",
                                                    fontWeight: 700,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {cert.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div style={d.panel}>
                                <div style={d.panelHeader}>
                                    <span style={d.panelTitle}>
                                        Recent Activity
                                    </span>
                                </div>
                                <div>
                                    {MOCK_ACTIVITY.map((item, i) => (
                                        <div key={i} style={d.activityItem}>
                                            <div
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    background: item.dot,
                                                    marginTop: 5,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#4a4a6a",
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {item.text}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
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
        overflow: "hidden",
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

const d = {
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
        fontWeight: 700,
        color: "#0e2554",
        flex: 1,
    },
    topbarGreeting: {
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
    panel: {
        background: "#fff",
        border: "1px solid #e4dfd4",
        borderRadius: 6,
        overflow: "hidden",
    },
    panelHeader: {
        padding: "16px 22px",
        borderBottom: "1px solid #e4dfd4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    panelTitle: {
        fontFamily: "'Playfair Display',serif",
        fontSize: 14,
        fontWeight: 700,
        color: "#0e2554",
    },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 520 },
    th: {
        fontSize: 9.5,
        fontWeight: 600,
        color: "#9090aa",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        padding: "10px 16px",
        textAlign: "left",
        background: "#f8f6f1",
        borderBottom: "1px solid #e4dfd4",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "12px 16px",
        fontSize: 12.5,
        color: "#1a1a2e",
        borderBottom: "1px solid #f0ece4",
        verticalAlign: "middle",
        transition: "background 0.1s",
    },
    reqId: {
        fontFamily: "'Courier New',monospace",
        fontSize: 11,
        color: "#9090aa",
    },
    reqName: { fontWeight: 600, fontSize: 12.5 },
    reqType: { fontSize: 11.5, color: "#4a4a6a" },
    reqDate: { fontSize: 11, color: "#9090aa", whiteSpace: "nowrap" },
    badge: {
        display: "inline-block",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.5px",
        padding: "3px 10px",
        borderRadius: 20,
        textTransform: "uppercase",
    },
    certRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 22px",
        borderBottom: "1px solid #f0ece4",
        gap: 12,
    },
    activityItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 22px",
        borderBottom: "1px solid #f0ece4",
    },
};

const qr = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 300,
        display: "flex",
    },
    modal: {
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },
    header: {
        background: "linear-gradient(135deg,#0e2554,#163066)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontFamily: "'Playfair Display',serif",
        fontSize: 16,
        fontWeight: 700,
        color: "#fff",
        margin: 0,
    },
    headerSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 },
    closeBtn: {
        background: "rgba(255,255,255,0.1)",
        border: "none",
        borderRadius: 4,
        width: 32,
        height: 32,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    scanBox: {
        position: "relative",
        width: 240,
        height: 240,
        margin: "0 auto 20px",
        borderRadius: 8,
        overflow: "hidden",
        background: "#111",
    },
    scanLine: {
        position: "absolute",
        left: 12,
        right: 12,
        height: 2,
        background: "linear-gradient(90deg,transparent,#c9a227,transparent)",
        animation: "scanline 2s ease-in-out infinite",
    },
    scanningLabel: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        fontSize: 9,
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "1px",
        textTransform: "uppercase",
        textAlign: "center",
    },
};

const dr = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        zIndex: 500,
        display: "flex",
        justifyContent: "flex-end",
    },
    head: {
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        background: "linear-gradient(135deg,#0e2554,#163066)",
        flexShrink: 0,
    },
    headTitle: {
        fontFamily: "'Playfair Display',serif",
        fontSize: 16,
        color: "#fff",
        margin: 0,
    },
    headSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 },
    closeBtn: {
        background: "rgba(255,255,255,0.1)",
        border: "none",
        borderRadius: 4,
        color: "#fff",
        cursor: "pointer",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
};
