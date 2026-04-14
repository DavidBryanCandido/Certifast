// =============================================================
// FILE: client/src/pages/resident/MyRequests.jsx
// =============================================================

import { useState, useEffect } from "react";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileCheck,
} from "lucide-react";

import requestService from "../../services/requestService";
import formatDate from "../../utils/formatDate";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";

if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .rh-topbar { background:linear-gradient(135deg,#0e2554 0%,#163066 100%); border-bottom:1px solid rgba(201,162,39,0.2); position:sticky; top:0; z-index:100; }
    .rh-topbar-inner { padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    .rh-panel { background:#fff; border:1px solid #e4dfd4; border-radius:8px; overflow:hidden; margin-bottom:20px; }
    .rh-panel-header { padding:14px 20px; border-bottom:1px solid #e4dfd4; background:#f8f6f1; display:flex; align-items:center; justify-content:space-between; }
    .rh-panel-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:#0e2554; }
    .rh-req-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid #f0ece4; transition:background 0.1s; cursor:default; }
    .rh-req-row:last-child { border-bottom:none; }
    .rh-req-row:hover { background:#faf8f4; }
    .rh-badge-pending    { font-size:10px; background:#fff7e6; color:#b86800; border:1px solid #f5d78e; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-processing { font-size:10px; background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-ready      { font-size:10px; background:#e8f5ee; color:#1a7a4a; border:1px solid #a8d8bc; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-released   { font-size:10px; background:#e8f5ee; color:#1a7a4a; border:1px solid #a8d8bc; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-rejected   { font-size:10px; background:#fdecea; color:#b02020; border:1px solid #f5c6c6; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    @keyframes rhFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .rh-fadein { animation:rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
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

export default function MyRequests({ resident, onLogout }) {
    const [width, setWidth] = useState(window.innerWidth);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const result = await requestService.getAllRequests();
                if (mounted) setRows(result.data || []);
            } catch (err) {
                if (mounted)
                    setError(
                        err?.response?.data?.message ||
                            "Failed to load requests.",
                    );
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const isMobile = width < 768;
    const isTablet = width >= 640 && width < 1024;

    return (
        <div
            className="rh-root"
            style={{ display: "flex", minHeight: "100vh" }}
        >
            {!isMobile && (
                <ResidentSidebar
                    active="history"
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

                <div
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: isMobile
                            ? "16px 14px"
                            : isTablet
                              ? "20px 18px 30px"
                              : "28px 24px 40px",
                    }}
                >
                    {/* Page heading — no redundant New Request button, sidebar handles it */}
                    <div className="rh-fadein" style={{ marginBottom: 20 }}>
                        <h1
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: isMobile ? 20 : 22,
                                fontWeight: 700,
                                color: "#0e2554",
                                margin: "0 0 3px",
                            }}
                        >
                            My Requests
                        </h1>
                        <p
                            style={{
                                fontSize: 12.5,
                                color: "#9090aa",
                                margin: 0,
                            }}
                        >
                            All your submitted certificate requests
                        </p>
                    </div>

                    {error && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 6,
                                padding: "11px 14px",
                                color: "#b02020",
                                fontSize: 12.5,
                                marginBottom: 16,
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}

                    <div className="rh-panel rh-fadein">
                        <div className="rh-panel-header">
                            <div className="rh-panel-title">
                                Certificate Requests
                            </div>
                            {!loading && (
                                <span
                                    style={{ fontSize: 11.5, color: "#9090aa" }}
                                >
                                    {rows.length} total
                                </span>
                            )}
                        </div>

                        {/* Loading skeleton */}
                        {loading &&
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
                                                width: "50%",
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

                        {/* Empty state */}
                        {!loading && rows.length === 0 && !error && (
                            <div
                                style={{
                                    padding: "40px 20px",
                                    textAlign: "center",
                                    color: "#9090aa",
                                    fontStyle: "italic",
                                    fontSize: 13,
                                }}
                            >
                                No requests yet. Use the{" "}
                                <strong>New Request</strong> button in the
                                sidebar to get started.
                            </div>
                        )}

                        {/* Rows */}
                        {!loading &&
                            rows.map((row) => {
                                const isDenied =
                                    String(row.status || "").toLowerCase() ===
                                    "rejected";
                                const denialReason =
                                    row.rejection_reason ||
                                    "No denial reason was provided by the admin.";

                                return (
                                    <div key={row.request_id}>
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
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <StatusIcon
                                                    status={row.status}
                                                />
                                            </div>
                                            <div
                                                style={{ flex: 1, minWidth: 0 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#1a1a2e",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                    }}
                                                >
                                                    {row.type ||
                                                        row.cert_type ||
                                                        "Certificate Request"}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10.5,
                                                        color: "#9090aa",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {formatRequestId(
                                                        row.request_id,
                                                    )}{" "}
                                                    · Submitted{" "}
                                                    {formatDate(
                                                        row.requested_at,
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
                                                    status={row.status}
                                                />
                                                {isDenied && (
                                                    <div
                                                        style={{
                                                            background:
                                                                "#fdecea",
                                                            border: "1px solid #f5c6c6",
                                                            borderRadius: 6,
                                                            padding: "5px 9px",
                                                            marginTop: 4,
                                                            fontSize: 10.5,
                                                            color: "#7a1f1f",
                                                            lineHeight: 1.4,
                                                            textAlign: "right",
                                                            maxWidth: 240,
                                                        }}
                                                    >
                                                        {denialReason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        {!loading && rows.length > 0 && (
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
                        )}
                    </div>
                </div>

                {isMobile && <ResidentBottomNav active="history" />}
            </div>
        </div>
    );
}
