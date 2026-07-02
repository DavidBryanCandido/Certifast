// =============================================================
// FILE: client/src/pages/resident/MyRequests.jsx
// =============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileCheck,
    Pencil,
    Eye,
    X,
    Paperclip,
} from "lucide-react";

import requestService from "../../services/requestService";
import formatDate from "../../utils/formatDate";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";
import {
    DATA_TABLE_REFRESH_MS,
    shouldRefreshVisiblePage,
} from "../../utils/autoRefresh";

if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .rh-topbar { background:linear-gradient(135deg,var(--color-primary, #0e2554) 0%,var(--color-primary-soft, #163066) 100%); border-bottom:1px solid rgba(var(--color-accent-rgb, 201, 162, 39),0.2); position:sticky; top:0; z-index:100; }
    .rh-topbar-inner { padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    .rh-panel { background:#fff; border:1px solid #e4dfd4; border-radius:8px; overflow:hidden; margin-bottom:20px; }
    .rh-panel-header { padding:14px 20px; border-bottom:1px solid #e4dfd4; background:#f8f6f1; display:flex; align-items:center; justify-content:space-between; }
    .rh-panel-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:var(--color-primary, #0e2554); }
    .rh-req-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid #f0ece4; transition:background 0.1s; cursor:default; }
    .rh-req-row:last-child { border-bottom:none; }
    .rh-req-row:hover { background:#faf8f4; }
    .rh-badge-pending    { font-size:10px; background:#fff7e6; color:#b86800; border:1px solid #f5d78e; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-processing { font-size:10px; background:#eef2ff; color:#3730a3; border:1px solid #c7d2fe; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-ready      { font-size:10px; background:#e8f5ee; color:#1a7a4a; border:1px solid #a8d8bc; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-released   { font-size:10px; background:#e8f5ee; color:#1a7a4a; border:1px solid #a8d8bc; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-rejected   { font-size:10px; background:#fdecea; color:#b02020; border:1px solid #f5c6c6; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
    .rh-badge-correction { font-size:10px; background:#fff7e6; color:#9a5b00; border:1px solid #f5d78e; border-radius:20px; padding:2px 10px; font-weight:700; white-space:nowrap; }
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

function correctionEventTime(value) {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) return "Time unavailable";
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatAttachmentSize(size = 0) {
    const value = Number(size || 0);
    if (!value) return "0 KB";
    if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentFileName(attachment) {
    return attachment?.fileName || attachment?.file_name || "Uploaded file";
}

function attachmentFileUrl(attachment) {
    return (
        attachment?.viewUrl ||
        attachment?.view_url ||
        attachment?.fileUrl ||
        attachment?.file_url ||
        ""
    );
}

function attachmentMime(attachment) {
    return attachment?.mimeType || attachment?.mime_type || "";
}

function attachmentLabel(attachment) {
    return attachment?.label || "Supporting document";
}

function normalizeProofKey(raw = "") {
    return String(raw || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_ -]+/g, "")
        .replace(/[\s-]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function attachmentProofKey(attachment) {
    return normalizeProofKey(attachment?.proofKey || attachment?.proof_key);
}

function requirementKeys(requirement = {}) {
    return [
        normalizeProofKey(requirement.key || requirement.proofKey),
        ...(Array.isArray(requirement.legacyKeys)
            ? requirement.legacyKeys.map(normalizeProofKey)
            : []),
        ...(Array.isArray(requirement.legacy_keys)
            ? requirement.legacy_keys.map(normalizeProofKey)
            : []),
    ].filter(Boolean);
}

function requirementGroupKey(requirement = {}) {
    return normalizeProofKey(
        requirement.groupKey ||
            requirement.group_key ||
            requirement.key ||
            requirement.proofKey,
    );
}

function requirementGroupLabel(requirement = {}) {
    return (
        requirement.groupLabel ||
        requirement.group_label ||
        requirement.label ||
        "Supporting documents"
    );
}

function requirementLabel(requirement = {}) {
    return requirement.label || "Supporting document";
}

function groupProofRequirements(requirements = []) {
    const groups = new Map();
    requirements.forEach((proof) => {
        const groupKey = requirementGroupKey(proof);
        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                key: groupKey,
                label: requirementGroupLabel(proof),
                items: [],
            });
        }
        groups.get(groupKey).items.push(proof);
    });
    return [...groups.values()];
}

function attachmentMatchesRequirement(attachment, requirement) {
    return requirementKeys(requirement).includes(attachmentProofKey(attachment));
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
        needs_correction: {
            cls: "rh-badge-correction",
            label: "Needs Correction",
        },
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
    if (normalized === "needs_correction")
        return <AlertCircle {...props} color="#b86800" />;
    return <Clock {...props} color="#b86800" />;
}

export default function MyRequests({ resident, onLogout }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const loadRequests = useCallback(async ({ showLoading = true } = {}) => {
        if (showLoading) setLoading(true);
        setError("");

        try {
            const result = await requestService.getAllRequests();
            if (mountedRef.current) setRows(result.data || []);
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                onLogout?.();
                return;
            }
            if (mountedRef.current) {
                setError(
                    err?.response?.data?.message || "Failed to load requests.",
                );
            }
        } finally {
            if (mountedRef.current && showLoading) setLoading(false);
        }
    }, [onLogout]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        const id = window.setInterval(() => {
            if (!shouldRefreshVisiblePage()) return;
            loadRequests({ showLoading: false });
        }, DATA_TABLE_REFRESH_MS);

        return () => window.clearInterval(id);
    }, [loadRequests]);

    const isMobile = width < 768;
    const isTablet = width >= 640 && width < 1024;

    function openPreview(attachment) {
        const url = attachmentFileUrl(attachment);
        if (!url) {
            setError("This uploaded file is not available for preview.");
            return;
        }
        setPreview({
            url,
            label: attachmentLabel(attachment),
            fileName: attachmentFileName(attachment),
            mimeType: attachmentMime(attachment),
        });
    }

    function closePreview() {
        setPreview(null);
    }

    const previewName = preview?.fileName || "";
    const previewMime = preview?.mimeType || "";
    const previewIsImage =
        previewMime.startsWith("image/") ||
        /\.(jpe?g|png|webp|gif)$/i.test(previewName);
    const previewIsPdf =
        previewMime === "application/pdf" || /\.pdf$/i.test(previewName);

    const previewModal = preview && (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Submitted document preview"
            onClick={closePreview}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 300,
                background: "rgba(12,18,32,.58)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? 14 : 24,
            }}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: "min(920px, 100%)",
                    maxHeight: "88vh",
                    background: "#fff",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow: "0 18px 50px rgba(0,0,0,.24)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #e4dfd4", background: "#f8f6f1", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: 0.8 }}>
                            {preview.label}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary, #0e2554)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {preview.fileName}
                        </div>
                    </div>
                    <button type="button" onClick={closePreview} title="Close preview" style={{ width: 34, height: 34, border: "1px solid #e4dfd4", borderRadius: 4, background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#4a4a6a", cursor: "pointer", flexShrink: 0 }}>
                        <X size={16} />
                    </button>
                </div>
                <div style={{ padding: 14, background: "#f4f2ed", minHeight: 280, overflow: "auto" }}>
                    {previewIsImage ? (
                        <img src={preview.url} alt={preview.fileName} style={{ display: "block", maxWidth: "100%", maxHeight: "70vh", margin: "0 auto", objectFit: "contain", background: "#fff" }} />
                    ) : previewIsPdf ? (
                        <iframe src={preview.url} title={preview.fileName} style={{ width: "100%", height: "70vh", border: "1px solid #e4dfd4", background: "#fff" }} />
                    ) : (
                        <div style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 6, padding: 18, textAlign: "center", color: "#4a4a6a", fontSize: 13 }}>
                            Preview is not available for this file type.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

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
                                color: "var(--color-primary, #0e2554)",
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
                                const needsCorrection =
                                    String(row.status || "").toLowerCase() ===
                                    "needs_correction";
                                const isDenied =
                                    String(row.status || "").toLowerCase() ===
                                    "rejected";
                                const denialReason =
                                    row.rejection_reason ||
                                    "No correction note was provided by staff.";
                                const proofRequirements = Array.isArray(
                                    row.proofRequirements,
                                )
                                    ? row.proofRequirements
                                    : Array.isArray(row.proof_requirements)
                                      ? row.proof_requirements
                                      : [];
                                const proofGroups =
                                    groupProofRequirements(proofRequirements);
                                const attachments = Array.isArray(row.attachments)
                                    ? row.attachments
                                    : [];

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
                                                {(isDenied ||
                                                    needsCorrection) && (
                                                    <div
                                                        style={{
                                                            background:
                                                                needsCorrection
                                                                    ? "#fff7e6"
                                                                    : "#fdecea",
                                                            border: needsCorrection
                                                                ? "1px solid #f5d78e"
                                                                : "1px solid #f5c6c6",
                                                            borderRadius: 6,
                                                            padding: "5px 9px",
                                                            marginTop: 4,
                                                            fontSize: 10.5,
                                                            color: needsCorrection
                                                                ? "#7a4a00"
                                                                : "#7a1f1f",
                                                            lineHeight: 1.4,
                                                            textAlign: "right",
                                                            maxWidth: 240,
                                                        }}
                                                    >
                                                        {denialReason}
                                                    </div>
                                                )}
                                                {needsCorrection && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/resident/submit-request?edit=${row.request_id}`,
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 5,
                                                            border:
                                                                "1px solid #d7a545",
                                                            borderRadius: 4,
                                                            background:
                                                                "#fff",
                                                            color: "#8a5300",
                                                            padding: "5px 9px",
                                                            fontSize: 10.5,
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <Pencil size={11} /> Edit
                                                        &amp; Resubmit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {attachments.length > 0 && (
                                                <div
                                                    style={{
                                                        margin: "0 20px 14px 70px",
                                                        padding: "10px 12px",
                                                        border: "1px solid #e4dfd4",
                                                        borderRadius: 6,
                                                        background: "#fffdf8",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 10.5,
                                                            fontWeight: 700,
                                                            color: "var(--color-primary, #0e2554)",
                                                            textTransform: "uppercase",
                                                            letterSpacing: 0.7,
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        Submitted Documents
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gap: 8,
                                                        }}
                                                    >
                                                        {proofGroups.length > 0 &&
                                                            proofGroups.map((group) => (
                                                                <div
                                                                    key={group.key}
                                                                    style={{
                                                                        border: "1px solid #efe8dc",
                                                                        borderRadius: 5,
                                                                        background: "#fff",
                                                                        padding: 9,
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontSize: 10.5,
                                                                            fontWeight: 700,
                                                                            color: "var(--color-primary, #0e2554)",
                                                                            textTransform:
                                                                                "uppercase",
                                                                            letterSpacing: 0.7,
                                                                            marginBottom: 8,
                                                                        }}
                                                                    >
                                                                        {group.label}
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            display: "grid",
                                                                            gap: 8,
                                                                        }}
                                                                    >
                                                                        {group.items.map((proof) => {
                                                                            const files =
                                                                                attachments.filter(
                                                                                    (attachment) =>
                                                                                        attachmentMatchesRequirement(
                                                                                            attachment,
                                                                                            proof,
                                                                                        ),
                                                                                );
                                                                            if (files.length === 0) {
                                                                                return null;
                                                                            }
                                                                            return files.map(
                                                                                (attachment) => (
                                                                                    <div
                                                                                        key={
                                                                                            attachment.id ||
                                                                                            `${attachment.proofKey || attachment.proof_key}-${attachmentFileName(attachment)}`
                                                                                        }
                                                                                        style={{
                                                                                            display:
                                                                                                "grid",
                                                                                            gridTemplateColumns:
                                                                                                "minmax(0,1fr) auto",
                                                                                            gap: 10,
                                                                                            alignItems:
                                                                                                "center",
                                                                                            padding:
                                                                                                "8px 9px",
                                                                                            border:
                                                                                                "1px solid #efe8dc",
                                                                                            borderRadius: 5,
                                                                                            background:
                                                                                                "#fffdf8",
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            style={{
                                                                                                display:
                                                                                                    "flex",
                                                                                                alignItems:
                                                                                                    "center",
                                                                                                gap: 9,
                                                                                                minWidth: 0,
                                                                                            }}
                                                                                        >
                                                                                            <span
                                                                                                style={{
                                                                                                    width: 32,
                                                                                                    height: 32,
                                                                                                    border:
                                                                                                        "1px solid #e4dfd4",
                                                                                                    borderRadius: 4,
                                                                                                    background:
                                                                                                        "#f8f6f1",
                                                                                                    display:
                                                                                                        "inline-flex",
                                                                                                    alignItems:
                                                                                                        "center",
                                                                                                    justifyContent:
                                                                                                        "center",
                                                                                                    color: "var(--color-primary, #0e2554)",
                                                                                                    flexShrink: 0,
                                                                                                }}
                                                                                            >
                                                                                                <Paperclip
                                                                                                    size={
                                                                                                        14
                                                                                                    }
                                                                                                />
                                                                                            </span>
                                                                                            <span
                                                                                                style={{
                                                                                                    minWidth: 0,
                                                                                                }}
                                                                                            >
                                                                                                <span
                                                                                                    style={{
                                                                                                        display:
                                                                                                            "block",
                                                                                                        fontSize: 10.5,
                                                                                                        fontWeight: 700,
                                                                                                        color: "#6f6680",
                                                                                                        textTransform:
                                                                                                            "uppercase",
                                                                                                        letterSpacing: 0.6,
                                                                                                    }}
                                                                                                >
                                                                                                    {requirementLabel(
                                                                                                        proof,
                                                                                                    )}
                                                                                                </span>
                                                                                                <span
                                                                                                    style={{
                                                                                                        display:
                                                                                                            "block",
                                                                                                        fontSize: 12,
                                                                                                        color: "#1a1a2e",
                                                                                                        overflow:
                                                                                                            "hidden",
                                                                                                        textOverflow:
                                                                                                            "ellipsis",
                                                                                                        whiteSpace:
                                                                                                            "nowrap",
                                                                                                    }}
                                                                                                >
                                                                                                    {attachmentFileName(
                                                                                                        attachment,
                                                                                                    )}
                                                                                                </span>
                                                                                                <span
                                                                                                    style={{
                                                                                                        display:
                                                                                                            "block",
                                                                                                        fontSize: 10.5,
                                                                                                        color: "#9090aa",
                                                                                                        marginTop: 1,
                                                                                                    }}
                                                                                                >
                                                                                                    {formatAttachmentSize(
                                                                                                        attachment.fileSize ||
                                                                                                            attachment.file_size,
                                                                                                    )}
                                                                                                </span>
                                                                                            </span>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                openPreview(
                                                                                                    attachment,
                                                                                                )
                                                                                            }
                                                                                            title="View submitted file"
                                                                                            style={{
                                                                                                display:
                                                                                                    "inline-flex",
                                                                                                alignItems:
                                                                                                    "center",
                                                                                                justifyContent:
                                                                                                    "center",
                                                                                                gap: 5,
                                                                                                minHeight: 30,
                                                                                                padding:
                                                                                                    "0 9px",
                                                                                                border:
                                                                                                    "1px solid var(--color-primary, #0e2554)",
                                                                                                borderRadius: 4,
                                                                                                background:
                                                                                                    "#fff",
                                                                                                color: "var(--color-primary, #0e2554)",
                                                                                                fontSize: 10.5,
                                                                                                fontWeight: 700,
                                                                                                cursor: "pointer",
                                                                                            }}
                                                                                        >
                                                                                            <Eye
                                                                                                size={
                                                                                                    12
                                                                                                }
                                                                                            />
                                                                                            View
                                                                                        </button>
                                                                                    </div>
                                                                                ),
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        {proofGroups.length === 0 &&
                                                            attachments.map(
                                                            (attachment) => (
                                                                <div
                                                                    key={
                                                                        attachment.id ||
                                                                        `${attachment.proofKey || attachment.proof_key}-${attachmentFileName(attachment)}`
                                                                    }
                                                                    style={{
                                                                        display:
                                                                            "grid",
                                                                        gridTemplateColumns:
                                                                            "minmax(0,1fr) auto",
                                                                        gap: 10,
                                                                        alignItems:
                                                                            "center",
                                                                        padding:
                                                                            "8px 9px",
                                                                        border:
                                                                            "1px solid #efe8dc",
                                                                        borderRadius: 5,
                                                                        background:
                                                                            "#fff",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            gap: 9,
                                                                            minWidth: 0,
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                width: 32,
                                                                                height: 32,
                                                                                border:
                                                                                    "1px solid #e4dfd4",
                                                                                borderRadius: 4,
                                                                                background:
                                                                                    "#f8f6f1",
                                                                                display:
                                                                                    "inline-flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                justifyContent:
                                                                                    "center",
                                                                                color: "var(--color-primary, #0e2554)",
                                                                                flexShrink: 0,
                                                                            }}
                                                                        >
                                                                            <Paperclip
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span
                                                                            style={{
                                                                                minWidth: 0,
                                                                            }}
                                                                        >
                                                                            <span
                                                                                style={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontSize: 10.5,
                                                                                    fontWeight: 700,
                                                                                    color: "#6f6680",
                                                                                    textTransform:
                                                                                        "uppercase",
                                                                                    letterSpacing: 0.6,
                                                                                }}
                                                                            >
                                                                                {attachmentLabel(
                                                                                    attachment,
                                                                                )}
                                                                            </span>
                                                                            <span
                                                                                style={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontSize: 12,
                                                                                    color: "#1a1a2e",
                                                                                    overflow:
                                                                                        "hidden",
                                                                                    textOverflow:
                                                                                        "ellipsis",
                                                                                    whiteSpace:
                                                                                        "nowrap",
                                                                                }}
                                                                            >
                                                                                {attachmentFileName(
                                                                                    attachment,
                                                                                )}
                                                                            </span>
                                                                            <span
                                                                                style={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontSize: 10.5,
                                                                                    color: "#9090aa",
                                                                                    marginTop: 1,
                                                                                }}
                                                                            >
                                                                                {formatAttachmentSize(
                                                                                    attachment.fileSize ||
                                                                                        attachment.file_size,
                                                                                )}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openPreview(
                                                                                attachment,
                                                                            )
                                                                        }
                                                                        title="View submitted file"
                                                                        style={{
                                                                            display:
                                                                                "inline-flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            gap: 5,
                                                                            minHeight: 30,
                                                                            padding:
                                                                                "0 9px",
                                                                            border:
                                                                                "1px solid var(--color-primary, #0e2554)",
                                                                            borderRadius: 4,
                                                                            background:
                                                                                "#fff",
                                                                            color: "var(--color-primary, #0e2554)",
                                                                            fontSize: 10.5,
                                                                            fontWeight: 700,
                                                                            cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        <Eye
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        View
                                                                    </button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        {row.correction_history?.length > 0 && (
                                            <div
                                                style={{
                                                    margin: "0 20px 14px 70px",
                                                    padding: "10px 12px",
                                                    border: "1px solid #eadfc9",
                                                    borderRadius: 6,
                                                    background: "#fffdf8",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10.5,
                                                        fontWeight: 700,
                                                        color: "#7a6530",
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: 0.7,
                                                        marginBottom: 7,
                                                    }}
                                                >
                                                    Correction History ·{" "}
                                                    {row.revision_count || 0}{" "}
                                                    revision
                                                    {Number(
                                                        row.revision_count || 0,
                                                    ) === 1
                                                        ? ""
                                                        : "s"}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gap: 7,
                                                    }}
                                                >
                                                    {row.correction_history.map(
                                                        (event) => {
                                                            const resubmitted =
                                                                event.event_type ===
                                                                "resident_resubmitted";
                                                            return (
                                                                <div
                                                                    key={
                                                                        event.correction_history_id
                                                                    }
                                                                    style={{
                                                                        borderLeft: `3px solid ${resubmitted ? "#1a7a4a" : "#b86800"}`,
                                                                        paddingLeft:
                                                                            9,
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontSize: 11.5,
                                                                            fontWeight: 700,
                                                                            color: resubmitted
                                                                                ? "#1a7a4a"
                                                                                : "#9a5b00",
                                                                        }}
                                                                    >
                                                                        {resubmitted
                                                                            ? `Revision ${event.revision_number} resubmitted`
                                                                            : "Staff requested correction"}
                                                                    </div>
                                                                    {event.message && (
                                                                        <div
                                                                            style={{
                                                                                fontSize: 11.5,
                                                                                color: "#4a4a6a",
                                                                                lineHeight: 1.45,
                                                                                marginTop: 2,
                                                                            }}
                                                                        >
                                                                            {
                                                                                event.message
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    <div
                                                                        style={{
                                                                            fontSize: 10,
                                                                            color: "#9090aa",
                                                                            marginTop: 2,
                                                                        }}
                                                                    >
                                                                        {correctionEventTime(
                                                                            event.created_at,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                Online review may be approved immediately when
                                staff is available; otherwise allow 1-3
                                business days. Visit the barangay office to
                                claim released certificates.
                            </div>
                        )}
                    </div>
                </div>

                {previewModal}
                {isMobile && <ResidentBottomNav active="history" />}
            </div>
        </div>
    );
}
