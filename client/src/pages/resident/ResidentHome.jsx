// =============================================================
// FILE: client/src/pages/resident/ResidentHome.jsx
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    QrCode,
    ChevronRight,
    LogOut,
    Bell,
    FileCheck,
    AlertCircle,
    Home,
    UserCircle,
} from "lucide-react";
import requestService from "../../services/requestService";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";

// ─── Inject styles ────────────────────────────────────────────
if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');

    .rh-root {
        min-height: 100vh;
        background: #f4f2ed;
        font-family: 'Source Serif 4', serif;
    }
    /* TOPBAR */
    .rh-topbar {
        background: linear-gradient(135deg, #0e2554 0%, #163066 100%);
        border-bottom: 1px solid rgba(201,162,39,0.2);
        position: sticky; top: 0; z-index: 100;
    }
    .rh-topbar-inner {
        max-width: 1000px;
        padding: 0 24px; height: 60px;
        display: flex; align-items: center; gap: 12px;
    }
    /* CARDS */
    .rh-stat-card {
        background: #fff; border: 1px solid #e4dfd4;
        border-radius: 8px; padding: 18px 20px;
        display: flex; align-items: center; gap: 14px;
        transition: box-shadow 0.15s;
    }
    .rh-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .rh-panel {
        background: #fff; border: 1px solid #e4dfd4;
        border-radius: 8px; overflow: hidden; margin-bottom: 20px;
    }
    .rh-panel-header {
        padding: 14px 20px; border-bottom: 1px solid #e4dfd4;
        background: #f8f6f1; display: flex; align-items: center;
        justify-content: space-between;
    }
    .rh-panel-title {
        font-family: 'Playfair Display', serif; font-size: 14px;
        font-weight: 700; color: #0e2554;
    }
    /* REQUEST ROWS */
    .rh-req-row {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 20px; border-bottom: 1px solid #f0ece4;
        transition: background 0.1s; cursor: default;
    }
    .rh-req-row:last-child { border-bottom: none; }
    .rh-req-row:hover { background: #faf8f4; }
    /* QUICK ACTION BUTTONS */
    .rh-action-btn {
        display: flex; flex-direction: column; align-items: center;
        gap: 10px; padding: 20px 16px; background: #fff;
        border: 1.5px solid #e4dfd4; border-radius: 8px;
        cursor: pointer; transition: all 0.15s; flex: 1;
        font-family: 'Source Serif 4', serif;
    }
    .rh-action-btn:hover { border-color: #0e2554; box-shadow: 0 4px 16px rgba(14,37,84,0.1); transform: translateY(-1px); }
    .rh-action-btn.primary { background: linear-gradient(135deg, #163066, #091a3e); border-color: transparent; color: #fff; }
    .rh-action-btn.primary:hover { opacity: 0.92; transform: translateY(-1px); }
    /* BADGE */
    .rh-badge-pending  { font-size: 10px; background: #fff7e6; color: #b86800; border: 1px solid #f5d78e; border-radius: 20px; padding: 2px 10px; font-weight: 700; white-space: nowrap; }
    .rh-badge-processing { font-size: 10px; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; border-radius: 20px; padding: 2px 10px; font-weight: 700; white-space: nowrap; }
    .rh-badge-ready { font-size: 10px; background: #e8f5ee; color: #1a7a4a; border: 1px solid #a8d8bc; border-radius: 20px; padding: 2px 10px; font-weight: 700; white-space: nowrap; }
    .rh-badge-released { font-size: 10px; background: #e8f5ee; color: #1a7a4a; border: 1px solid #a8d8bc; border-radius: 20px; padding: 2px 10px; font-weight: 700; white-space: nowrap; }
    .rh-badge-rejected { font-size: 10px; background: #fdecea; color: #b02020; border: 1px solid #f5c6c6; border-radius: 20px; padding: 2px 10px; font-weight: 700; white-space: nowrap; }

    @keyframes rhFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .rh-fadein { animation: rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
}

function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatRequestId(raw) {
    const num = Number(raw);
    if (!Number.isFinite(num)) return String(raw || "");
    return `REQ-${String(num).padStart(4, "0")}`;
}

function StatusBadge({ status }) {
    const normalized = String(status || "").toLowerCase();
    const map = {
        pending: { cls: "rh-badge-pending", label: "Pending" },
        processing: { cls: "rh-badge-processing", label: "Processing" },
        approved: { cls: "rh-badge-processing", label: "Approved" },
        ready: { cls: "rh-badge-ready", label: "Ready for Pickup" },
        released: { cls: "rh-badge-released", label: "Released" },
        rejected: { cls: "rh-badge-rejected", label: "Denied" },
    };
    const { cls, label } = map[normalized] || {
        cls: "rh-badge-pending",
        label: status ? String(status) : "Pending",
    };
    return <span className={cls}>{label}</span>;
}

function StatusIcon({ status }) {
    const normalized = String(status || "").toLowerCase();
    const props = { size: 16, strokeWidth: 2 };
    if (normalized === "released")
        return <CheckCircle {...props} color="#1a7a4a" />;
    if (normalized === "ready")
        return <CheckCircle {...props} color="#1a7a4a" />;
    if (normalized === "approved" || normalized === "processing")
        return <FileCheck {...props} color="#3730a3" />;
    if (normalized === "rejected")
        return <XCircle {...props} color="#b02020" />;
    return <Clock {...props} color="#b86800" />;
}

// ─── Main Component ───────────────────────────────────────────
export default function ResidentHome({ resident, onLogout }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [requestsError, setRequestsError] = useState("");

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    useEffect(() => {
        let mounted = true;

        async function loadRequests() {
            try {
                const result = await requestService.getAllRequests();
                const rawRows = Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result)
                      ? result
                      : [];

                const normalized = rawRows.map((row) => ({
                    request_id: row.request_id || row.id || "N/A",
                    type:
                        row.type ||
                        row.cert_type ||
                        row.certType ||
                        "Certificate Request",
                    status: String(row.status || "pending").toLowerCase(),
                    rejection_reason: row.rejection_reason || null,
                    requested_at: row.requested_at || row.created_at || null,
                    released_at: row.released_at || null,
                }));

                if (mounted) {
                    setRequests(normalized);
                    setRequestsError("");
                }
            } catch (err) {
                if (mounted) {
                    setRequests([]);
                    setRequestsError(
                        err?.response?.data?.message ||
                            "Unable to load your requests right now.",
                    );
                }
            } finally {
                if (mounted) setLoadingRequests(false);
            }
        }

        loadRequests();
        return () => {
            mounted = false;
        };
    }, []);

    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const name = resident?.full_name || resident?.name || "Resident";

    // Stats
    const stats = {
        total: requests.length,
        pending: requests.filter((r) => {
            const s = String(r.status || "").toLowerCase();
            return ["pending", "processing", "approved", "ready"].includes(s);
        }).length,
        released: requests.filter(
            (r) => String(r.status || "").toLowerCase() === "released",
        ).length,
        rejected: requests.filter(
            (r) => String(r.status || "").toLowerCase() === "rejected",
        ).length,
    };

    const recentRequests = [...requests]
        .sort(
            (a, b) =>
                new Date(b.requested_at || 0) - new Date(a.requested_at || 0),
        )
        .slice(0, 5);

    return (
        <div
            className="rh-root"
            style={{ display: "flex", minHeight: "100vh" }}
        >
            {/* ── DESKTOP SIDEBAR ── */}
            {!isMobile && (
                <ResidentSidebar
                    active="home"
                    resident={resident}
                    onLogout={onLogout}
                />
            )}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                <ResidentTopbar
                    resident={resident}
                    onLogout={onLogout}
                    isMobile={isMobile}
                />

                {/* ── CONTENT ── */}
                <div
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: isMobile
                            ? "16px 14px 80px"
                            : isTablet
                              ? "20px 18px 30px"
                              : "28px 24px 40px",
                    }}
                >
                    {/* Welcome banner — with office hours on the right */}
                    <div
                        className="rh-fadein"
                        style={{
                            background:
                                "linear-gradient(135deg, #0e2554 0%, #163066 60%, #1a3a7a 100%)",
                            borderRadius: 10,
                            padding: isMobile ? "22px 20px" : "26px 32px",
                            marginBottom: 22,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundImage:
                                    "linear-gradient(rgba(201,162,39,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.04) 1px, transparent 1px)",
                                backgroundSize: "32px 32px",
                                pointerEvents: "none",
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                top: -20,
                                right: -20,
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                background: "rgba(201,162,39,0.06)",
                                border: "1px solid rgba(201,162,39,0.1)",
                            }}
                        />
                        <div
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: isMobile ? "flex-start" : "center",
                                justifyContent: "space-between",
                                gap: 20,
                                flexDirection: isMobile ? "column" : "row",
                            }}
                        >
                            {/* Left — greeting */}
                            <div>
                                <p
                                    style={{
                                        fontSize: 11,
                                        color: "rgba(201,162,39,0.8)",
                                        letterSpacing: "1.5px",
                                        textTransform: "uppercase",
                                        fontFamily: "'Source Serif 4', serif",
                                        margin: "0 0 6px",
                                    }}
                                >
                                    Good day,
                                </p>
                                <p
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: isMobile ? 20 : 24,
                                        fontWeight: 700,
                                        color: "#fff",
                                        margin: "0 0 6px",
                                    }}
                                >
                                    {name}
                                </p>
                                <p
                                    style={{
                                        fontSize: 12.5,
                                        color: "rgba(255,255,255,0.55)",
                                        fontFamily: "'Source Serif 4', serif",
                                        margin: "0 0 18px",
                                    }}
                                >
                                    Barangay East Tapinac · City of Olongapo
                                </p>
                                <button
                                    onClick={() =>
                                        navigate("/resident/submit-request")
                                    }
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "10px 22px",
                                        background:
                                            "linear-gradient(135deg, #c9a227, #9a7515)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 4,
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        letterSpacing: 1.5,
                                        textTransform: "uppercase",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Plus size={14} /> Request a Certificate
                                </button>
                            </div>

                            {/* Right — office hours */}
                            <div
                                style={{
                                    flexShrink: 0,
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(201,162,39,0.2)",
                                    borderRadius: 8,
                                    padding: "14px 18px",
                                    minWidth: isMobile ? "100%" : 210,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 7,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Bell size={12} color="#c9a227" />
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "#c9a227",
                                            letterSpacing: "1.2px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Office Hours
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "rgba(255,255,255,0.75)",
                                        lineHeight: 1.9,
                                        fontFamily: "'Source Serif 4', serif",
                                    }}
                                >
                                    <div>
                                        <span
                                            style={{
                                                color: "rgba(255,255,255,0.4)",
                                                fontSize: 11,
                                                display: "inline-block",
                                                width: 72,
                                            }}
                                        >
                                            Mon – Fri
                                        </span>
                                        8:00 AM – 5:00 PM
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                color: "rgba(255,255,255,0.4)",
                                                fontSize: 11,
                                                display: "inline-block",
                                                width: 72,
                                            }}
                                        >
                                            Saturday
                                        </span>
                                        8:00 AM – 12:00 PM
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                color: "rgba(255,255,255,0.4)",
                                                fontSize: 11,
                                                display: "inline-block",
                                                width: 72,
                                            }}
                                        >
                                            Sun & Hol.
                                        </span>
                                        Closed
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: 10,
                                        paddingTop: 10,
                                        borderTop:
                                            "1px solid rgba(201,162,39,0.15)",
                                        fontSize: 10.5,
                                        color: "rgba(255,255,255,0.38)",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    54 - 14th St. cor. Gallagher St., Olongapo
                                    City
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div
                        className="rh-fadein"
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "1fr 1fr"
                                : "repeat(4,1fr)",
                            gap: 12,
                            marginBottom: 22,
                        }}
                    >
                        {[
                            {
                                icon: FileText,
                                label: "Total Requests",
                                value: stats.total,
                                accent: "#0e2554",
                                bg: "rgba(14,37,84,0.08)",
                            },
                            {
                                icon: Clock,
                                label: "In Progress",
                                value: stats.pending,
                                accent: "#b86800",
                                bg: "rgba(184,104,0,0.08)",
                            },
                            {
                                icon: CheckCircle,
                                label: "Released",
                                value: stats.released,
                                accent: "#1a7a4a",
                                bg: "rgba(26,122,74,0.08)",
                            },
                            {
                                icon: XCircle,
                                label: "Denied",
                                value: stats.rejected,
                                accent: "#b02020",
                                bg: "rgba(176,32,32,0.08)",
                            },
                        ].map((item) => (
                            <div key={item.label} className="rh-stat-card">
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 8,
                                        background: item.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <item.icon
                                        size={17}
                                        color={item.accent}
                                        strokeWidth={2}
                                    />
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: "#0e2554",
                                            fontFamily:
                                                "'Playfair Display', serif",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9090aa",
                                            marginTop: 3,
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                </div>
                            </div>
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
                        {/* Recent requests */}
                        <div className="rh-panel rh-fadein">
                            <div className="rh-panel-header">
                                <div className="rh-panel-title">
                                    Recent Requests
                                </div>
                                <button
                                    onClick={() =>
                                        navigate("/resident/my-requests")
                                    }
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        background: "none",
                                        border: "none",
                                        color: "#163066",
                                        fontSize: 12,
                                        fontFamily: "'Source Serif 4', serif",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    View all <ChevronRight size={13} />
                                </button>
                            </div>

                            {requestsError && (
                                <div
                                    style={{
                                        margin: "12px 20px 0",
                                        background: "#fdecea",
                                        border: "1px solid #f5c6c6",
                                        borderRadius: 6,
                                        padding: "10px 12px",
                                        color: "#b02020",
                                        fontSize: 12,
                                        display: "flex",
                                        gap: 7,
                                        alignItems: "center",
                                    }}
                                >
                                    <AlertCircle size={12} />
                                    {requestsError}
                                </div>
                            )}

                            {loadingRequests &&
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="rh-req-row">
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                background: "#f0ece4",
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    width: "55%",
                                                    height: 12,
                                                    background: "#f0ece4",
                                                    borderRadius: 4,
                                                    marginBottom: 6,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: "35%",
                                                    height: 10,
                                                    background: "#f5f2ee",
                                                    borderRadius: 4,
                                                }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: 64,
                                                height: 20,
                                                background: "#f0ece4",
                                                borderRadius: 20,
                                            }}
                                        />
                                    </div>
                                ))}

                            {!loadingRequests && recentRequests.length === 0 ? (
                                <div
                                    style={{
                                        padding: "36px 20px",
                                        textAlign: "center",
                                        color: "#9090aa",
                                        fontSize: 13,
                                        fontStyle: "italic",
                                    }}
                                >
                                    No requests yet. Submit your first one!
                                </div>
                            ) : (
                                !loadingRequests &&
                                recentRequests.map((req) => {
                                    const isDenied =
                                        String(
                                            req.status || "",
                                        ).toLowerCase() === "rejected";
                                    const rejectionReason =
                                        req.rejection_reason ||
                                        "No denial reason was provided by the admin.";

                                    return (
                                        <div key={req.request_id}>
                                            <div className="rh-req-row">
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 8,
                                                        background: "#f8f6f1",
                                                        border: "1px solid #e4dfd4",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <StatusIcon
                                                        status={req.status}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: "#1a1a2e",
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        {req.type}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10.5,
                                                            color: "#9090aa",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {formatRequestId(
                                                            req.request_id,
                                                        )}{" "}
                                                        · Submitted{" "}
                                                        {formatDate(
                                                            req.requested_at,
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "flex-end",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <StatusBadge
                                                        status={req.status}
                                                    />
                                                    {isDenied && (
                                                        <div
                                                            style={{
                                                                background:
                                                                    "#fdecea",
                                                                border: "1px solid #f5c6c6",
                                                                borderRadius: 6,
                                                                padding:
                                                                    "5px 9px",
                                                                marginTop: 4,
                                                                fontSize: 10.5,
                                                                color: "#7a1f1f",
                                                                lineHeight: 1.4,
                                                                textAlign:
                                                                    "right",
                                                                maxWidth: 240,
                                                            }}
                                                        >
                                                            {rejectionReason}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <div
                                style={{
                                    padding: "12px 20px",
                                    background: "#f8f6f1",
                                    borderTop: "1px solid #e4dfd4",
                                    fontSize: 11,
                                    color: "#9090aa",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <AlertCircle size={11} />
                                Processing time is typically 1–3 business days.
                                Visit the barangay office to claim released
                                certificates.
                            </div>
                        </div>

                        {/* Right sidebar */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                            }}
                        >
                            {/* Available Certificates */}
                            <div className="rh-panel rh-fadein">
                                <div className="rh-panel-header">
                                    <div className="rh-panel-title">
                                        Available Certificates
                                    </div>
                                </div>
                                <div style={{ padding: "8px 0" }}>
                                    {[
                                        {
                                            name: "Barangay Clearance",
                                            fee: true,
                                        },
                                        {
                                            name: "Certificate of Residency",
                                            fee: false,
                                        },
                                        {
                                            name: "Certificate of Indigency",
                                            fee: false,
                                        },
                                        { name: "Business Permit", fee: true },
                                        {
                                            name: "Good Moral Certificate",
                                            fee: false,
                                        },
                                        {
                                            name: "Cert. of Live Birth (Endorsement)",
                                            fee: false,
                                        },
                                    ].map((cert) => (
                                        <div
                                            key={cert.name}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "9px 20px",
                                                borderBottom:
                                                    "1px solid #f0ece4",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: "#1a7a4a",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#1a1a2e",
                                                    }}
                                                >
                                                    {cert.name}
                                                </span>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    color: cert.fee
                                                        ? "#b86800"
                                                        : "#9090aa",
                                                    fontWeight: cert.fee
                                                        ? 600
                                                        : 400,
                                                }}
                                            >
                                                {cert.fee ? "₱ Fee" : "Free"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MOBILE BOTTOM NAV ── */}
                {isMobile && <ResidentBottomNav active="home" />}
            </div>
            {/* end inner flex */}
        </div>
    );
}
