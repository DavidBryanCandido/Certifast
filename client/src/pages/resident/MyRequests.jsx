// =============================================================
// FILE: client/src/pages/resident/MyRequests.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/resident/requests → { data: [...] }
//   - All endpoints require residentToken in Authorization header
//   - Status values: pending | processing | released | rejected
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText, Clock, CheckCircle, XCircle, Plus,
    QrCode, LogOut, Home, AlertCircle, FileCheck,
} from "lucide-react";

import requestService from "../../services/requestService";
import formatDate from "../../utils/formatDate";

// ─── Reuse ResidentHome styles if already injected ────────────
if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');

    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .rh-topbar { background:linear-gradient(135deg,#0e2554 0%,#163066 100%); border-bottom:1px solid rgba(201,162,39,0.2); position:sticky; top:0; z-index:100; }
    .rh-topbar-inner { max-width:1000px; margin:0 auto; padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    .rh-bottom-nav { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #e4dfd4; display:flex; z-index:100; box-shadow:0 -2px 12px rgba(0,0,0,0.08); }
    .rh-nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; background:none; border:none; cursor:pointer; font-family:'Source Serif 4',serif; font-size:9.5px; color:#9090aa; transition:color 0.15s; }
    .rh-nav-btn.active { color:#0e2554; }
    .rh-nav-btn svg { opacity:0.5; }
    .rh-nav-btn.active svg { opacity:1; }
    .rh-panel { background:#fff; border:1px solid #e4dfd4; border-radius:8px; overflow:hidden; margin-bottom:20px; }
    .rh-panel-header { padding:14px 20px; border-bottom:1px solid #e4dfd4; background:#f8f6f1; display:flex; align-items:center; justify-content:space-between; }
    .rh-panel-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:#0e2554; }
    .rh-req-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid #f0ece4; transition:background 0.1s; cursor:default; }
    .rh-req-row:last-child { border-bottom:none; }
    .rh-req-row:hover { background:#faf8f4; }
    .rh-badge-pending    { font-size:10px; background:#fff7e6; color:#b86800; border:1px solid #f5d78e; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-released   { font-size:10px; background:#e8f5ee; color:#1a7a4a; border:1px solid #a8d8bc; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-rejected   { font-size:10px; background:#fdecea; color:#b02020; border:1px solid #f5c6c6; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-processing { font-size:10px; background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    @keyframes rhFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .rh-fadein { animation:rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
}

// ─── Helpers ──────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        pending:    { cls: "rh-badge-pending",    label: "Pending"    },
        processing: { cls: "rh-badge-processing", label: "Processing" },
        released:   { cls: "rh-badge-released",   label: "Released"   },
        rejected:   { cls: "rh-badge-rejected",   label: "Rejected"   },
    };
    const { cls, label } = map[status] || { cls: "rh-badge-pending", label: status };
    return <span className={cls}>{label}</span>;
}

function StatusIcon({ status }) {
    const props = { size: 16, strokeWidth: 2 };
    if (status === "released")   return <CheckCircle {...props} color="#1a7a4a" />;
    if (status === "rejected")   return <XCircle     {...props} color="#b02020" />;
    if (status === "processing") return <FileCheck   {...props} color="#3730a3" />;
    return <Clock {...props} color="#b86800" />;
}

// ─── Main Component ───────────────────────────────────────────
export default function MyRequests({ resident, onLogout }) {
    const navigate = useNavigate();
    const [width, setWidth]     = useState(window.innerWidth);
    const [activeNav, setActiveNav] = useState("history");
    const [rows, setRows]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [expandedReasonId, setExpandedReasonId] = useState(null);

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    // ── Data load ──
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const result = await requestService.getAllRequests();
                if (mounted) setRows(result.data || []);
            } catch (err) {
                if (mounted) setError(err?.response?.data?.message || "Failed to load requests.");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    const isMobile  = width < 768;
    const name      = resident?.full_name || resident?.name || "Resident";
    const firstName = name.split(" ")[0];

    return (
        <div className="rh-root">

            {/* ── TOPBAR ── */}
            <div className="rh-topbar">
                <div className="rh-topbar-inner">
                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(201,162,39,0.5)", overflow: "hidden", flexShrink: 0 }}>
                            <img src="/logo.png" alt="Seal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>CertiFast</div>
                            <div style={{ fontSize: 9, color: "rgba(201,162,39,0.7)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Resident Portal</div>
                        </div>
                    </div>

                    {/* Desktop back to home */}
                    {!isMobile && (
                        <button onClick={() => navigate("/resident/home")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "rgba(255,255,255,0.7)", fontFamily: "'Source Serif 4', serif", fontSize: 12, cursor: "pointer" }}>
                            <Home size={13} /> Home
                        </button>
                    )}

                    {/* User + logout */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,162,39,0.15)", border: "1.5px solid rgba(201,162,39,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c9a227", flexShrink: 0 }}>
                            {firstName[0]?.toUpperCase()}
                        </div>
                        {!isMobile && (
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{name}</div>
                                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Resident</div>
                            </div>
                        )}
                        <button onClick={onLogout} title="Log out" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontFamily: "'Source Serif 4', serif" }}>
                            <LogOut size={13} />
                            {!isMobile && "Logout"}
                        </button>
                    </div>
                </div>
                <div style={{ height: 2, background: "linear-gradient(90deg, #c9a227, #f0d060, #c9a227)" }} />
            </div>

            {/* ── CONTENT ── */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: isMobile ? "20px 16px 80px" : "28px 24px 40px" }}>

                {/* Page heading */}
                <div className="rh-fadein" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#0e2554", margin: "0 0 3px" }}>
                            My Requests
                        </h1>
                        <p style={{ fontSize: 12.5, color: "#9090aa", margin: 0 }}>
                            All your submitted certificate requests
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/resident/submit-request")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "linear-gradient(135deg, #163066, #091a3e)", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                        <Plus size={13} /> New Request
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 6, padding: "11px 14px", color: "#b02020", fontSize: 12.5, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                        <AlertCircle size={13} /> {error}
                    </div>
                )}

                {/* ── Requests panel — identical to ResidentHome style ── */}
                <div className="rh-panel rh-fadein">
                    <div className="rh-panel-header">
                        <div className="rh-panel-title">Recent Requests</div>
                        {!loading && (
                            <span style={{ fontSize: 11.5, color: "#9090aa" }}>{rows.length} total</span>
                        )}
                    </div>

                    {/* Loading skeleton */}
                    {loading && [1, 2, 3].map((i) => (
                        <div key={i} className="rh-req-row">
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0ece4", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ width: "50%", height: 12, background: "#f0ece4", borderRadius: 4, marginBottom: 6 }} />
                                <div style={{ width: "35%", height: 10, background: "#f5f2ee", borderRadius: 4 }} />
                            </div>
                            <div style={{ width: 64, height: 20, background: "#f0ece4", borderRadius: 20 }} />
                        </div>
                    ))}

                    {/* Empty state */}
                    {!loading && rows.length === 0 && !error && (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: "#9090aa", fontStyle: "italic", fontSize: 13 }}>
                            No requests yet. Submit your first one!
                        </div>
                    )}

                    {/* Rows — same markup as ResidentHome "Recent Requests" */}
                    {!loading && rows.map((row) => {
                        const isRejected = String(row.status || "").toLowerCase() === "rejected";
                        const isExpanded = expandedReasonId === row.request_id;
                        const rejectionReason = row.rejection_reason || "No rejection reason was provided by the admin.";

                        return (
                            <div key={row.request_id}>
                                <div className="rh-req-row">
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f8f6f1", border: "1px solid #e4dfd4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <StatusIcon status={row.status} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {row.type || row.cert_type || "Certificate Request"}
                                        </div>
                                        <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 2 }}>
                                            {row.request_id} · Submitted {formatDate(row.requested_at)}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                        <StatusBadge status={row.status} />
                                        {isRejected && (
                                            <button
                                                onClick={() => setExpandedReasonId(isExpanded ? null : row.request_id)}
                                                style={{ background: "none", border: "none", color: "#b02020", fontSize: 10.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "'Source Serif 4', serif" }}
                                            >
                                                {isExpanded ? "Hide reason" : "View reason"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isRejected && isExpanded && (
                                    <div style={{ margin: "0 20px 12px 70px", background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 6, padding: "10px 12px", fontSize: 11.5, color: "#7a1f1f", lineHeight: 1.6 }}>
                                        <strong style={{ color: "#b02020" }}>Rejection Reason:</strong> {rejectionReason}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Footer note */}
                    {!loading && rows.length > 0 && (
                        <div style={{ padding: "12px 20px", background: "#f8f6f1", borderTop: "1px solid #e4dfd4", fontSize: 11, color: "#9090aa", display: "flex", alignItems: "center", gap: 6 }}>
                            <AlertCircle size={11} />
                            Processing time is typically 1–3 business days. Visit the barangay office to claim released certificates.
                        </div>
                    )}
                </div>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            {isMobile && (
                <div className="rh-bottom-nav">
                    {[
                        { key: "home",    icon: Home,     label: "Home",    path: "/resident/home"           },
                        { key: "request", icon: Plus,     label: "Request", path: "/resident/submit-request" },
                        { key: "history", icon: FileText, label: "History", path: "/resident/my-requests"    },
                        { key: "qr",      icon: QrCode,   label: "My QR",   path: "/resident/my-qr"          },
                    ].map(({ key, icon: Icon, label, path }) => (
                        <button key={key} className={`rh-nav-btn${activeNav === key ? " active" : ""}`} onClick={() => { setActiveNav(key); navigate(path); }}>
                            <Icon size={20} strokeWidth={1.8} />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
