// =============================================================
// FILE: client/src/pages/admin/Dashboard.jsx
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
    Printer,
    Eye,
} from "lucide-react";
import adminDashboardService from "../../services/adminDashboardService";
import adminRequestService from "../../services/adminRequestService";
import reportsService from "../../services/reportsService";
import logsService from "../../services/logsService";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import AdminQRScannerModal from "../../components/AdminQRScannerModal";

function useWindowSize() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    return width;
}

if (!document.head.querySelector("[data-cf-dashboard]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-dashboard", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes scanline { 0% { top:20px;opacity:1; } 50% { top:200px;opacity:0.8; } 100% { top:20px;opacity:1; } }
    @keyframes drawerSlideIn { from { transform:translateX(100%);opacity:0; } to { transform:translateX(0);opacity:1; } }
    @keyframes drawerSlideUp { from { transform:translateY(100%);opacity:0; } to { transform:translateY(0);opacity:1; } }
    @keyframes sidebarSlideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    .cf-dash-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .cf-nav-item { display:flex;align-items:center;gap:10px;padding:10px 20px;font-size:12.5px;color:rgba(255,255,255,0.65);cursor:pointer;border-left:3px solid transparent;transition:all 0.15s;text-decoration:none;background:none;border-right:none;border-top:none;border-bottom:none;width:100%;text-align:left;font-family:'Source Serif 4',serif; }
    .cf-nav-item:hover { background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9); }
    .cf-nav-item.active { background:rgba(201,162,39,0.12);color:#fff;border-left-color:#c9a227; }
    .cf-nav-item.active svg { opacity:1 !important; }
    .cf-action-btn { border:1px solid #e4dfd4;border-radius:4px;padding:5px 12px;font-size:11px;cursor:pointer;font-family:'Source Serif 4',serif;transition:all 0.15s;font-weight:600;white-space:nowrap; }
    .cf-qa-btn { display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:6px;cursor:pointer;text-align:left;width:100%;font-family:'Source Serif 4',serif;transition:opacity 0.15s; }
    .cf-qa-btn:hover { opacity:0.88; }
    .cf-logout-btn { background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.35);padding:4px;transition:color 0.15s;display:flex;align-items:center; }
    .cf-logout-btn:hover { color:rgba(255,255,255,0.7); }
    .cf-panel-action { font-size:11px;color:#163066;cursor:pointer;text-decoration:underline;background:none;border:none;font-family:'Source Serif 4',serif; }
    /* Drawer */
    .cf-drawer { width:480px;height:100vh;background:#fff;display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,.2);overflow:hidden;animation:drawerSlideIn 0.22s ease both; }
    .cf-drawer-mobile { width:100%;max-height:92vh;background:#fff;display:flex;flex-direction:column;box-shadow:0 -8px 40px rgba(0,0,0,.2);overflow:hidden;animation:drawerSlideUp 0.25s ease both;border-radius:16px 16px 0 0; }
    .cf-drawer-body { flex:1;overflow-y:auto;padding:24px; }
    .cf-drawer-body::-webkit-scrollbar { width:4px; }
    .cf-drawer-body::-webkit-scrollbar-thumb { background:#e4dfd4;border-radius:4px; }
    .cf-detail-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
    .cf-detail-item { display:flex;flex-direction:column;gap:2px; }
    .cf-detail-item label { font-size:10px;color:#9090aa;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;font-family:'Source Serif 4',serif; }
    .cf-detail-value { font-size:13px;color:#1a1a2e;font-weight:600;display:block;font-family:'Source Serif 4',serif; }
    .cf-tl-item { display:flex;gap:12px;padding-bottom:16px; }
    .cf-tl-item:last-child { padding-bottom:0; }
    .cf-tl-dot-wrap { display:flex;flex-direction:column;align-items:center;flex-shrink:0; }
    .cf-tl-line { width:2px;background:#e4dfd4;flex:1;margin-top:4px; }
    .cf-tl-item:last-child .cf-tl-line { display:none; }
    .cf-drawer-footer { padding:16px 24px;border-top:1px solid #e4dfd4;background:#f8f6f1;display:flex;gap:10px;flex-wrap:wrap; }
    .cf-drawer-btn { display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:4px;font-size:12px;font-weight:700;font-family:'Playfair Display',serif;letter-spacing:.5px;cursor:pointer;border:none;flex:1;transition:opacity .15s;min-width:80px; }
    .cf-drawer-btn:hover { opacity:0.88; }
    .cf-drawer-btn:disabled { opacity:.45;cursor:not-allowed; }
    .cf-drawer-section { margin-bottom:22px; }
    .cf-drawer-section-title { font-size:10px;font-weight:700;color:#9090aa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e4dfd4;font-family:'Source Serif 4',serif; }
    .cf-reject-textarea { width:100%;padding:10px 12px;border:1.5px solid #e4dfd4;border-radius:4px;font-family:'Source Serif 4',serif;font-size:12.5px;color:#1a1a2e;outline:none;resize:vertical;min-height:80px;box-sizing:border-box; }
    .cf-reject-textarea:focus { border-color:#b02020; }
    .cf-req-card { padding:14px 16px;border-bottom:1px solid #f0ece4;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:background 0.1s; }
    .cf-req-card:last-child { border-bottom:none; }
    .cf-req-card:hover { background:#faf8f4; }
    .cf-req-card-top { display:flex;align-items:flex-start;justify-content:space-between;gap:8px; }
    .cf-req-card-bottom { display:flex;align-items:center;justify-content:space-between;gap:8px; }
    `;
    document.head.appendChild(s);
}

// ── Timeline map (mock — replace with real API data when available) ──
const TIMELINE_MAP = {
    pending: [
        { dot: "gold", text: "Request submitted by resident", time: "" },
        { dot: "grey", text: "Awaiting staff review", time: "Pending" },
    ],
    approved: [
        { dot: "gold", text: "Request submitted by resident", time: "" },
        { dot: "blue", text: "Approved by staff", time: "" },
        { dot: "grey", text: "Awaiting print & signing", time: "Pending" },
    ],
    ready: [
        { dot: "gold", text: "Request submitted by resident", time: "" },
        { dot: "blue", text: "Approved by staff", time: "" },
        { dot: "blue", text: "Certificate printed", time: "" },
        { dot: "green", text: "Marked Ready for Pickup", time: "" },
        { dot: "grey", text: "Awaiting resident pickup", time: "Pending" },
    ],
    released: [
        { dot: "gold", text: "Request submitted by resident", time: "" },
        { dot: "blue", text: "Approved by staff", time: "" },
        { dot: "blue", text: "Certificate printed", time: "" },
        { dot: "green", text: "Marked Ready for Pickup", time: "" },
        { dot: "green", text: "Released — QR verified by staff", time: "" },
    ],
    rejected: [
        { dot: "gold", text: "Request submitted by resident", time: "" },
        { dot: "red", text: "Rejected by staff", time: "" },
    ],
};

const DOT_COLORS = {
    gold: "#c9a227",
    blue: "#1a4a8a",
    green: "#1a7a4a",
    amber: "#b86800",
    red: "#b02020",
    grey: "#ccc",
};

const BADGE = {
    pending: { bg: "#fff3e0", color: "#b86800", label: "Pending" },
    approved: { bg: "#e8eef8", color: "#1a4a8a", label: "Approved" },
    ready: { bg: "#e8f5ee", color: "#1a7a4a", label: "Ready" },
    released: { bg: "#f0f0f0", color: "#666", label: "Released" },
    rejected: { bg: "#fdecea", color: "#b02020", label: "Rejected" },
};

const BADGE_DRAWER = {
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

// Maps status → table action button appearance
const STATUS_MAP = {
    pending: {
        btnLabel: "Review",
        btnStyle: { background: "#0e2554", color: "#fff" },
    },
    approved: {
        btnLabel: "View",
        btnStyle: { background: "#e8eef8", color: "#1a4a8a" },
    },
    ready: {
        btnLabel: "Scan QR",
        btnStyle: { background: "#e8f5ee", color: "#1a7a4a" },
    },
    released: {
        btnLabel: "View",
        btnStyle: { background: "#f0f0f0", color: "#666" },
    },
    rejected: {
        btnLabel: "View",
        btnStyle: { background: "#fdecea", color: "#b02020" },
    },
};

// ── Helpers ──
function activityDot(type, description) {
    const desc = String(description || "").toLowerCase();
    switch (type) {
        case "login":
            return "#c9a227";
        case "logout":
            return "#9090aa";
        case "walkin":
            return "#6a3db8";
        case "qrscan":
            return "#3a6abf";
        case "settings":
            return "#b86800";
        case "request":
            if (desc.includes("released") || desc.includes("approved"))
                return "#2da866";
            if (desc.includes("rejected") || desc.includes("denied"))
                return "#d04040";
            return "#3a6abf";
        default:
            return "#9090aa";
    }
}
function formatActivityTime(isoStr) {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    const now = new Date();
    const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString())
        return `Yesterday, ${time}`;
    return (
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        `, ${time}`
    );
}
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
// Request Drawer — wired to real API, same pattern as ManageRequests
// =============================================================
function RequestDrawer({
    request,
    onClose,
    isMobile,
    onRefresh,
    onOpenQRScanner,
    onLogout,
}) {
    const [step, setStep] = useState("default");
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [currentStatus, setCurrentStatus] = useState(null);
    const [hasPrinted, setHasPrinted] = useState(false);

    useEffect(() => {
        if (!request) return;
        setCurrentStatus(request.status);
        setHasPrinted(false);
        setStep("default");
        setRejectReason("");
        setActionError("");
    }, [request]);

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

    if (!request) return null;

    const status = currentStatus || request.status;
    const badge = BADGE_DRAWER[status] || BADGE_DRAWER.pending;
    const timeline = TIMELINE_MAP[request.status] || TIMELINE_MAP.pending;

    const handleApiError = (err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
            onLogout?.();
            return;
        }
        setActionError(
            err?.response?.data?.message || err?.message || "Action failed.",
        );
    };

    // ── Approve — stay open, show approved state ──
    const handleApprove = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        setActionError("");
        try {
            await adminRequestService.approveRequest(request.rawId);
            await onRefresh?.();
            setCurrentStatus("approved");
            setHasPrinted(false);
            setStep("default");
        } catch (err) {
            handleApiError(err);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Reject — close after ──
    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            setActionError("Please provide a rejection reason.");
            return;
        }
        if (actionLoading) return;
        setActionLoading(true);
        setActionError("");
        try {
            await adminRequestService.rejectRequest(
                request.rawId,
                rejectReason.trim(),
            );
            await onRefresh?.();
            onClose();
        } catch (err) {
            handleApiError(err);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Mark Ready — only after printing, close after ──
    const handleMarkReady = async () => {
        if (!hasPrinted || actionLoading) return;
        setActionLoading(true);
        setActionError("");
        try {
            await adminRequestService.markReady(request.rawId);
            await onRefresh?.();
            onClose();
        } catch (err) {
            handleApiError(err);
        } finally {
            setActionLoading(false);
        }
    };

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
                        onClick={() => {
                            setStep("default");
                            setRejectReason("");
                            setActionError("");
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className="cf-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#b02020",
                            color: "#fff",
                        }}
                        onClick={handleRejectConfirm}
                        disabled={actionLoading}
                    >
                        <X size={13} />{" "}
                        {actionLoading ? "Saving…" : "Confirm Rejection"}
                    </button>
                </>
            );

        if (status === "pending")
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
                    <button
                        className="cf-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#1a7a4a",
                            color: "#fff",
                        }}
                        onClick={handleApprove}
                        disabled={actionLoading}
                    >
                        <Check size={11} />{" "}
                        {actionLoading ? "Approving…" : "Approve Request"}
                    </button>
                </>
            );

        if (status === "approved")
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
                    <button
                        className="cf-drawer-btn"
                        style={{ background: "#1a4a8a", color: "#fff" }}
                        onClick={() => {
                            setHasPrinted(true);
                            window.print();
                        }}
                    >
                        <Printer size={13} />{" "}
                        {hasPrinted ? "Reprint" : "Print Certificate"}
                    </button>
                    <button
                        className="cf-drawer-btn"
                        style={{
                            background: hasPrinted ? "#d4edda" : "#f0f0f0",
                            color: hasPrinted ? "#1a5c38" : "#aaa",
                            border:
                                "1px solid " +
                                (hasPrinted ? "#a8d8bc" : "#e4dfd4"),
                            cursor:
                                hasPrinted && !actionLoading
                                    ? "pointer"
                                    : "not-allowed",
                        }}
                        onClick={handleMarkReady}
                        disabled={!hasPrinted || actionLoading}
                        title={
                            !hasPrinted
                                ? "Print the certificate first"
                                : "Notify resident — ready for pickup"
                        }
                    >
                        {actionLoading ? "Saving…" : "Mark Ready"}
                    </button>
                </>
            );

        if (status === "ready")
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
                        <Printer size={13} /> Reprint
                    </button>
                    <button
                        className="cf-drawer-btn"
                        style={{
                            flex: 2,
                            background: "#e8f5ee",
                            color: "#1a7a4a",
                            border: "1px solid #a8d8bc",
                        }}
                        onClick={() => onOpenQRScanner(request)}
                    >
                        <QrCode size={13} /> Scan QR &amp; Release
                    </button>
                </>
            );

        if (status === "released")
            return (
                <button
                    className="cf-drawer-btn"
                    style={{
                        background: "#e8eef8",
                        color: "#1a4a8a",
                        border: "1px solid #b8cce8",
                    }}
                >
                    <Printer size={13} /> Reprint Certificate
                </button>
            );

        if (status === "rejected")
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
            <div className={isMobile ? "cf-drawer-mobile" : "cf-drawer"}>
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
                                margin: "3px 0 0",
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
                                    {request.name}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Email</label>
                                <span
                                    className="cf-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {request.email}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Contact</label>
                                <span
                                    className="cf-detail-value"
                                    style={{ fontSize: 12 }}
                                >
                                    {request.contact}
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
                                    {request.address}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Civil Status</label>
                                <span className="cf-detail-value">
                                    {request.civil}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Nationality</label>
                                <span className="cf-detail-value">
                                    {request.nationality}
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
                                    {request.id}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Current Status</label>
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
                                    {request.certType}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Purpose</label>
                                <span className="cf-detail-value">
                                    {request.purpose}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Date Filed</label>
                                <span className="cf-detail-value">
                                    {request.date}{" "}
                                    {request.time && `· ${request.time}`}
                                </span>
                            </div>
                            <div className="cf-detail-item">
                                <label>Fee</label>
                                <span
                                    className="cf-detail-value"
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

                    {/* Workflow hint for approved */}
                    {status === "approved" && (
                        <div className="cf-drawer-section">
                            <SectionTitle>Workflow</SectionTitle>
                            {!hasPrinted ? (
                                <div
                                    style={{
                                        background: "#fff3e0",
                                        border: "1px solid #f5d78e",
                                        borderRadius: 6,
                                        padding: "12px 14px",
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <AlertCircle
                                        size={14}
                                        color="#b86800"
                                        style={{ flexShrink: 0, marginTop: 1 }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            color: "#7a4800",
                                            lineHeight: 1.65,
                                        }}
                                    >
                                        <strong>Step 1:</strong> Click{" "}
                                        <em>Print Certificate</em> below to
                                        generate and print the document.
                                        <br />
                                        <span
                                            style={{
                                                fontSize: 11.5,
                                                color: "#9a6520",
                                                marginTop: 4,
                                                display: "block",
                                            }}
                                        >
                                            <strong>Mark Ready</strong> unlocks
                                            after printing.
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        background: "#e8f5ee",
                                        border: "1px solid #a8d8bc",
                                        borderRadius: 6,
                                        padding: "12px 14px",
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <Check
                                        size={14}
                                        color="#1a7a4a"
                                        style={{ flexShrink: 0, marginTop: 1 }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            color: "#1a5c38",
                                            lineHeight: 1.65,
                                        }}
                                    >
                                        Certificate printed. Click{" "}
                                        <strong>Mark Ready</strong> to notify
                                        the resident.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rejection reason */}
                    {status === "rejected" && request.rejection_reason && (
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
                                {request.rejection_reason}
                            </div>
                        </div>
                    )}

                    {/* Reject textarea */}
                    {step === "reject" && (
                        <div className="cf-drawer-section">
                            <SectionTitle>Reason for Rejection *</SectionTitle>
                            <textarea
                                className="cf-reject-textarea"
                                placeholder="Enter reason for rejection — visible to the resident…"
                                value={rejectReason}
                                onChange={(e) => {
                                    setRejectReason(e.target.value);
                                    if (actionError) setActionError("");
                                }}
                            />
                        </div>
                    )}

                    {/* Error */}
                    {actionError && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 6,
                                padding: "9px 11px",
                                color: "#b02020",
                                fontSize: 11.5,
                                marginBottom: 12,
                                display: "flex",
                                gap: 7,
                                alignItems: "center",
                            }}
                        >
                            <AlertCircle size={12} /> {actionError}
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="cf-drawer-section">
                        <SectionTitle>Request Timeline</SectionTitle>
                        {timeline.map((item, i) => (
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
                                    {i < timeline.length - 1 && (
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
                                    {item.time && (
                                        <div
                                            style={{
                                                fontSize: 10.5,
                                                color: "#9090aa",
                                                marginTop: 2,
                                            }}
                                        >
                                            {item.time}
                                        </div>
                                    )}
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
    if (type.includes("Released"))
        return <Check size={size} color={color} strokeWidth={2} />;
    if (type.includes("Resident"))
        return <Users size={size} color={color} strokeWidth={2} />;
    return <FileText size={size} color={color} strokeWidth={2} />;
}

// =============================================================
// Dashboard
// =============================================================
export default function Dashboard({ admin, onLogout, onNavigate: navProp }) {
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("dashboard");
    const [showQR, setShowQR] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [qrReleaseData, setQrReleaseData] = useState(null);
    const [qrReleaseLoading, setQrReleaseLoading] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const [statsData, setStatsData] = useState({
        totalRequests: 0,
        pending: 0,
        released: 0,
        residents: 0,
        walkIn: 0,
        ready: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [certBreakdown, setCertBreakdown] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState("");

    const loadDashboardData = useCallback(async () => {
        let mounted = true;
        async function load() {
            setDashboardLoading(true);
            setDashboardError("");
            try {
                const [statsRes, recentRes, reportsRes, logsRes] =
                    await Promise.all([
                        adminDashboardService.getStats(),
                        adminDashboardService.getRecentRequests(5),
                        reportsService.getOverview("month").catch(() => null),
                        logsService.getLogs({ limit: 5 }).catch(() => null),
                    ]);
                if (!mounted) return;

                const nextStats = statsRes?.stats || statsRes || {};
                const nextRecent = Array.isArray(recentRes?.data)
                    ? recentRes.data
                    : Array.isArray(recentRes)
                      ? recentRes
                      : [];

                setStatsData({
                    totalRequests: nextStats.totalRequests || 0,
                    pending: nextStats.pending || 0,
                    released: nextStats.released || 0,
                    residents: nextStats.residents || 0,
                    walkIn: nextStats.walkIn || 0,
                    ready: nextStats.ready || 0,
                });

                setRecentRequests(
                    nextRecent.map((row) => {
                        const requestedAt = row.requested_at
                            ? new Date(row.requested_at)
                            : null;
                        const address = [
                            row.resident_address_house,
                            row.resident_address_street,
                        ]
                            .filter((v) => String(v || "").trim())
                            .join(", ");
                        return {
                            rawId: row.request_id,
                            id: `#REQ-${String(row.request_id || "").padStart(4, "0")}`,
                            name: row.resident_name || "Unknown Resident",
                            certType: row.cert_type || "Certificate Request",
                            type: row.cert_type || "Certificate Request",
                            purpose: row.purpose || "—",
                            date: requestedAt
                                ? requestedAt.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "—",
                            time: requestedAt
                                ? requestedAt.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "—",
                            status: String(
                                row.status || "pending",
                            ).toLowerCase(),
                            hasFee: Boolean(row.has_fee),
                            address: address || "N/A",
                            contact: row.resident_contact || "N/A",
                            email: row.resident_email || "N/A",
                            civil: row.resident_civil || "N/A",
                            nationality: row.resident_nationality || "Filipino",
                            rejection_reason: row.rejection_reason || "",
                            requestedAtMs: requestedAt
                                ? requestedAt.getTime()
                                : 0,
                        };
                    }),
                );

                const rawBreakdown = reportsRes?.data?.byCertType || [];
                const maxCount = Math.max(
                    1,
                    ...rawBreakdown.map((c) => c.count || 0),
                );
                setCertBreakdown(
                    rawBreakdown.slice(0, 5).map((c) => ({
                        name: c.label || "—",
                        count: c.count || 0,
                        pct: Math.round(((c.count || 0) / maxCount) * 100),
                    })),
                );

                const rawLogs = logsRes?.data || [];
                setRecentActivity(
                    rawLogs.map((row) => ({
                        dot: activityDot(row.type, row.description),
                        text:
                            row.description ||
                            row.action_type ||
                            "System activity",
                        time: formatActivityTime(row.created_at),
                    })),
                );
            } catch (err) {
                if (!mounted) return;
                if (
                    err?.response?.status === 401 ||
                    err?.response?.status === 403
                ) {
                    onLogout?.();
                    return;
                }
                setDashboardError(
                    err?.response?.data?.message ||
                        "Failed to load dashboard data.",
                );
            } finally {
                if (mounted) setDashboardLoading(false);
            }
        }
        await load();
        return () => {
            mounted = false;
        };
    }, [onLogout]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Handle QR release confirmation from the scanner modal
    const handleQRRelease = async () => {
        if (!qrReleaseData || qrReleaseLoading) return;
        setQrReleaseLoading(true);
        try {
            await adminRequestService.releaseRequest(qrReleaseData.rawId);
            await loadDashboardData();
            setQrReleaseData(null);
            setSelectedRequest(null);
        } catch {
            // errors surface inside the QR modal UI
        } finally {
            setQrReleaseLoading(false);
        }
    };

    const dynamicStats = [
        {
            label: "Total Requests",
            value: statsData.totalRequests,
            color: "navy",
            iconColor: "#0e2554",
            iconBg: "#e8eef8",
            change: "Live data",
            changeType: "up",
        },
        {
            label: "Pending",
            value: statsData.pending,
            color: "amber",
            iconColor: "#b86800",
            iconBg: "#fff3e0",
            change: "Needs attention",
            changeType: "warn",
        },
        {
            label: "Released",
            value: statsData.released,
            color: "green",
            iconColor: "#1a7a4a",
            iconBg: "#e8f5ee",
            change: "Completed requests",
            changeType: "up",
        },
        {
            label: "Residents",
            value: statsData.residents,
            color: "gold",
            iconColor: "#9a7515",
            iconBg: "#f5edce",
            change: "Active residents",
            changeType: "up",
        },
        {
            label: "Walk-in Issued",
            value: statsData.walkIn,
            color: "purple",
            iconColor: "#6a3db8",
            iconBg: "#f3eeff",
            change: "Walk-in certificates",
            changeType: "up",
        },
    ];

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
    };
    const handleLogout = () => {
        if (onLogout) onLogout();
    };
    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    return (
        <div className="cf-dash-root">
            {!isMobile && (
                <AdminSidebar
                    admin={admin || { name: "Administrator", role: "admin" }}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    collapsed={isTablet}
                />
            )}
            {showMobileSidebar && (
                <AdminMobileSidebar
                    admin={admin || { name: "Administrator", role: "admin" }}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobileSidebar(false)}
                    onLogout={handleLogout}
                />
            )}

            {/* ── Quick-action general QR scanner (no release) ── */}
            {showQR && (
                <AdminQRScannerModal
                    onClose={() => setShowQR(false)}
                    onNavigate={handleNavigate}
                    isMobile={isMobile}
                />
            )}

            {/* ── Request drawer ── */}
            {selectedRequest && (
                <RequestDrawer
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    isMobile={isMobile}
                    onRefresh={loadDashboardData}
                    onOpenQRScanner={(req) => {
                        setQrReleaseData(req);
                        setSelectedRequest(null);
                    }}
                    onLogout={onLogout}
                />
            )}

            {/* ── QR release scanner — above the drawer ── */}
            {qrReleaseData && (
                <AdminQRScannerModal
                    onClose={() => setQrReleaseData(null)}
                    onNavigate={handleNavigate}
                    isMobile={isMobile}
                    releaseRequestId={qrReleaseData.rawId}
                    onReleaseConfirm={handleQRRelease}
                    releaseHasFee={qrReleaseData.hasFee}
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
                                {(admin?.name || "Admin").split(" ")[0]}
                            </span>
                        )}
                    </div>
                    {!isMobile && (
                        <div style={d.topbarDate}>
                            <Calendar size={13} style={{ opacity: 0.6 }} />
                            {isTablet ? formatDateShort() : formatDate()}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div
                    style={{
                        padding: isMobile
                            ? "16px 16px 24px"
                            : isTablet
                              ? "20px 24px"
                              : "28px 32px",
                        flex: 1,
                    }}
                >
                    {dashboardError && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 6,
                                padding: "10px 12px",
                                color: "#b02020",
                                fontSize: 12,
                                marginBottom: 14,
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <AlertCircle size={13} /> {dashboardError}
                        </div>
                    )}

                    {/* Stats grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "1fr 1fr"
                                : isTablet
                                  ? "repeat(3,1fr)"
                                  : "repeat(5,1fr)",
                            gap: 14,
                            marginBottom: 24,
                        }}
                    >
                        {dynamicStats.map((s) => (
                            <StatCard
                                key={s.label}
                                {...s}
                                compact={isMobile || isTablet}
                            />
                        ))}
                    </div>

                    {/* Main grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                isMobile || isTablet ? "1fr" : "1fr 320px",
                            gap: 20,
                            alignItems: "start",
                        }}
                    >
                        {/* Recent Requests panel */}
                        <div
                            style={{
                                ...d.panel,
                                gridRow: isMobile || isTablet ? 2 : 1,
                            }}
                        >
                            <div style={d.panelHeader}>
                                <span style={d.panelTitle}>
                                    Recent Requests
                                </span>
                                <button
                                    className="cf-panel-action"
                                    onClick={() =>
                                        handleNavigate("manageRequests")
                                    }
                                >
                                    View all →
                                </button>
                            </div>

                            {/* Desktop table */}
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
                                            {dashboardLoading && (
                                                <tr>
                                                    <td
                                                        style={d.td}
                                                        colSpan={6}
                                                    >
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                color: "#9090aa",
                                                                fontStyle:
                                                                    "italic",
                                                                padding:
                                                                    "16px 0",
                                                            }}
                                                        >
                                                            Loading…
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {!dashboardLoading &&
                                                recentRequests.length === 0 && (
                                                    <tr>
                                                        <td
                                                            style={d.td}
                                                            colSpan={6}
                                                        >
                                                            <div
                                                                style={{
                                                                    textAlign:
                                                                        "center",
                                                                    color: "#9090aa",
                                                                    fontStyle:
                                                                        "italic",
                                                                    padding:
                                                                        "16px 0",
                                                                }}
                                                            >
                                                                No recent
                                                                requests found.
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            {recentRequests.map((req) => {
                                                const b =
                                                    BADGE[req.status] ||
                                                    BADGE.pending;
                                                const sm =
                                                    STATUS_MAP[req.status];
                                                return (
                                                    <tr
                                                        key={req.id}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() =>
                                                            setSelectedRequest(
                                                                req,
                                                            )
                                                        }
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
                                                                {req.certType}
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
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setSelectedRequest(
                                                                            req,
                                                                        );
                                                                    }}
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
                                /* Mobile cards */
                                <div>
                                    {dashboardLoading && (
                                        <div
                                            style={{
                                                padding: "20px 16px",
                                                textAlign: "center",
                                                color: "#9090aa",
                                                fontStyle: "italic",
                                                fontSize: 12.5,
                                            }}
                                        >
                                            Loading…
                                        </div>
                                    )}
                                    {!dashboardLoading &&
                                        recentRequests.length === 0 && (
                                            <div
                                                style={{
                                                    padding: "20px 16px",
                                                    textAlign: "center",
                                                    color: "#9090aa",
                                                    fontStyle: "italic",
                                                    fontSize: 12.5,
                                                }}
                                            >
                                                No recent requests found.
                                            </div>
                                        )}
                                    {recentRequests.map((req) => {
                                        const b =
                                            BADGE[req.status] || BADGE.pending;
                                        return (
                                            <div
                                                key={req.id}
                                                className="cf-req-card"
                                                onClick={() =>
                                                    setSelectedRequest(req)
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
                                                            {req.certType}
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
                                gridRow: isMobile || isTablet ? 1 : 1,
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
                                            border: "1px solid #b8cce8",
                                            borderRadius: 6,
                                        }}
                                        onClick={() => handleNavigate("walkIn")}
                                    >
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                background: "#1a4a8a",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FilePlus
                                                size={17}
                                                color="#fff"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#1a4a8a",
                                                }}
                                            >
                                                Walk-in Issuance
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#3a6abf",
                                                    marginTop: 1,
                                                }}
                                            >
                                                Issue certificate for walk-in
                                                residents
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        className="cf-qa-btn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg,#e8f5ee,#d4edda)",
                                            border: "1px solid #a8d8bc",
                                            borderRadius: 6,
                                        }}
                                        onClick={() => setShowQR(true)}
                                    >
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                background: "#1a7a4a",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <ScanLine
                                                size={17}
                                                color="#fff"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#1a7a4a",
                                                }}
                                            >
                                                Scan QR Code
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#2a7a4a",
                                                    marginTop: 1,
                                                }}
                                            >
                                                Scan resident QR for quick
                                                lookup
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        className="cf-qa-btn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg,#fff3e0,#fde8c0)",
                                            border: "1px solid #f5d78e",
                                            borderRadius: 6,
                                        }}
                                        onClick={() =>
                                            handleNavigate("manageRequests")
                                        }
                                    >
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                background: "#b86800",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FileOutput
                                                size={17}
                                                color="#fff"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#b86800",
                                                }}
                                            >
                                                Manage Requests
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9a6520",
                                                    marginTop: 1,
                                                }}
                                            >
                                                Review, approve, and release
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Certificate Breakdown */}
                            {certBreakdown.length > 0 && (
                                <div style={d.panel}>
                                    <div style={d.panelHeader}>
                                        <span style={d.panelTitle}>
                                            Cert. Breakdown
                                        </span>
                                    </div>
                                    <div style={{ padding: "10px 0" }}>
                                        {certBreakdown.map((c) => (
                                            <div key={c.name} style={d.certRow}>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#1a1a2e",
                                                            fontWeight: 600,
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {c.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginTop: 5,
                                                            height: 4,
                                                            background:
                                                                "#f0ece4",
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: "100%",
                                                                width: `${c.pct}%`,
                                                                background:
                                                                    "linear-gradient(90deg,#163066,#0e2554)",
                                                                borderRadius: 2,
                                                                transition:
                                                                    "width 0.6s ease",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12.5,
                                                        fontWeight: 700,
                                                        color: "#0e2554",
                                                        flexShrink: 0,
                                                        marginLeft: 12,
                                                    }}
                                                >
                                                    {c.count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity */}
                            {!(isMobile || isTablet) && (
                                <div style={d.panel}>
                                    <div style={d.panelHeader}>
                                        <span style={d.panelTitle}>
                                            Recent Activity
                                        </span>
                                    </div>
                                    <div style={{ padding: "6px 0" }}>
                                        {recentActivity.length === 0 ? (
                                            <div
                                                style={{
                                                    padding: "16px 22px",
                                                    fontSize: 12,
                                                    color: "#9090aa",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                No recent activity.
                                            </div>
                                        ) : (
                                            recentActivity.map((item, i) => (
                                                <div
                                                    key={i}
                                                    style={d.activityItem}
                                                >
                                                    <div
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: "50%",
                                                            background:
                                                                item.dot,
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
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {(isMobile || isTablet) && (
                        <div style={{ marginTop: 20 }}>
                            <div style={d.panel}>
                                <div style={d.panelHeader}>
                                    <span style={d.panelTitle}>
                                        Recent Activity
                                    </span>
                                </div>
                                <div style={{ padding: "6px 0" }}>
                                    {recentActivity.length === 0 ? (
                                        <div
                                            style={{
                                                padding: "16px 22px",
                                                fontSize: 12,
                                                color: "#9090aa",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            No recent activity.
                                        </div>
                                    ) : (
                                        recentActivity.map((item, i) => (
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
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Style objects ──
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
