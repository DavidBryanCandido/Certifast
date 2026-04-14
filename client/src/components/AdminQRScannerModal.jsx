// =============================================================
// FILE: client/src/components/AdminQRScannerModal.jsx
// =============================================================
// SETUP: Run this once in your client directory:
//   npm install jsqr
//
// Props:
//   onClose()           — close the modal
//   onNavigate(page)    — navigate to a page key
//   isMobile            — boolean
//
//   // Optional — pass these when using from ManageRequests "Scan QR & Release"
//   onReleaseConfirm()  — async callback that performs the API release
//   releaseHasFee       — boolean; shows fee-collection warning before release
//
// =============================================================

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
    X,
    Check,
    FileOutput,
    Clock,
    AlertCircle,
    User,
    FileText,
    RefreshCw,
    Camera,
    CameraOff,
    ShieldCheck,
} from "lucide-react";
import authService from "../services/authService";

// ─── Helpers ──────────────────────────────────────────────────
function fmtDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }) {
    const map = {
        pending:    { bg: "#fff7e6", color: "#b86800", border: "#f5d78e", label: "Pending" },
        processing: { bg: "#eef2ff", color: "#3730a3", border: "#c7d2fe", label: "Processing" },
        released:   { bg: "#e8f5ee", color: "#1a7a4a", border: "#a8d8bc", label: "Released" },
        rejected:   { bg: "#fdecea", color: "#b02020", border: "#f5c6c6", label: "Rejected" },
    };
    const s = map[status] || map.pending;
    return (
        <span style={{ fontSize: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "2px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>
            {s.label}
        </span>
    );
}

// =============================================================
// Main Component
// =============================================================
export default function AdminQRScannerModal({
    onClose,
    onNavigate,
    isMobile,
    // Release-context props (optional — passed from ManageRequests)
    onReleaseConfirm = null,
    releaseHasFee    = false,
}) {
    const [state, setState]       = useState("idle");
    const [scanData, setScanData] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [camReady, setCamReady] = useState(false);
    const [flash, setFlash]       = useState(false);
    const [releaseLoading, setReleaseLoading] = useState(false);

    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef    = useRef(null);
    const pausedRef = useRef(false);

    // Escape + body scroll lock
    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", fn);
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
    }, [onClose]);

    // Skip idle if camera already permitted
    useEffect(() => {
        if (!navigator.permissions) return;
        navigator.permissions.query({ name: "camera" })
            .then((result) => { if (result.state === "granted") handleRequestPermission(); })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Stop stream on unmount
    useEffect(() => {
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); stopStream(); };
    }, []);

    function stopStream() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }

    async function handleRequestPermission() {
        setState("granting");
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            });
        } catch (err) {
            const msg = (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") ? null : "Could not open camera: " + err.message;
            setErrorMsg(msg || "");
            setState("denied");
            return;
        }
        streamRef.current = stream;
        setState("scanning");
        startScanLoop(stream);
    }

    function startScanLoop(stream) {
        pausedRef.current = false;
        setCamReady(false);
        const video = videoRef.current;
        video.srcObject = stream;
        video.play().then(() => {
            setCamReady(true);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            function tick() {
                if (pausedRef.current) return;
                if (video.readyState >= video.HAVE_ENOUGH_DATA) {
                    canvas.width  = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "dontInvert" });
                    if (code?.data) { pausedRef.current = true; handleDetected(code.data); return; }
                }
                rafRef.current = requestAnimationFrame(tick);
            }
            rafRef.current = requestAnimationFrame(tick);
        }).catch(() => setState("denied"));
    }

    async function handleDetected(rawValue) {
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
        setState("loading");
        await new Promise((r) => setTimeout(r, 650));

        const match = rawValue.match(/^certifast:resident:(.+)$/);
        if (!match) {
            setErrorMsg(`"${rawValue.slice(0, 60)}${rawValue.length > 60 ? "…" : ""}"`);
            setState("error");
            return;
        }

        const token = authService.getAdminToken();
        if (!token) {
            setErrorMsg("Admin session expired. Please log in again.");
            setState("error");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/admin/scan-resident-qr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ resident_id: match[1] }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || "Failed to verify QR code");
            }

            if (!payload?.resident) {
                throw new Error("Invalid scan response from server");
            }

            setScanData(payload);
            setState("result");
        } catch (err) {
            setErrorMsg(err.message || "Failed to verify resident QR code");
            setState("error");
        }
    }

    function handleReset() {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        pausedRef.current = false;
        setScanData(null);
        setErrorMsg("");
        setReleaseLoading(false);
        if (streamRef.current) { setState("scanning"); startScanLoop(streamRef.current); }
        else { setState("idle"); }
    }

    const handleConfirmRelease = async () => {
        if (!onReleaseConfirm || releaseLoading) return;
        setReleaseLoading(true);
        try {
            await onReleaseConfirm();
            // onReleaseConfirm closes the modal from the parent
        } catch {
            setReleaseLoading(false);
        }
    };

    const modalRadius = isMobile ? "16px 16px 0 0" : "10px";
    const modalWidth  = isMobile ? "100%" : "440px";

    const subtitle = {
        idle:     "Camera access required to scan",
        granting: "Requesting camera access…",
        scanning: "Point camera at resident's QR card",
        loading:  "Identifying resident…",
        result:   onReleaseConfirm ? "Resident verified — confirm release" : "Resident identified",
        error:    "Unrecognised QR code",
        denied:   "Camera access unavailable",
    }[state] ?? "";

    return (
        // z-index 600 — sits above the ManageRequests drawer (500) and other overlays
        <div
            style={{ position: "fixed", inset: 0, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", padding: isMobile ? 0 : 20, zIndex: 600, backdropFilter: "blur(2px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <style>{`
                @keyframes qr-spin  { to { transform:rotate(360deg); } }
                @keyframes qr-scan  { 0%{top:18px} 50%{top:calc(100% - 22px)} 100%{top:18px} }
                @keyframes qr-flash { 0%{opacity:0} 25%{opacity:.5} 100%{opacity:0} }
                @keyframes qr-in    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .qr-in { animation: qr-in .28s ease both; }
            `}</style>

            <div style={{ width: modalWidth, borderRadius: modalRadius, background: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,.3)", overflow: "hidden", maxHeight: isMobile ? "92vh" : "auto", display: "flex", flexDirection: "column", fontFamily: "'Source Serif 4', serif" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #0e2554, #163066)", flexShrink: 0 }}>
                    <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                            {onReleaseConfirm ? "Scan to Release" : "Scan Resident QR"}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{subtitle}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>
                <div style={{ height: 3, background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)", flexShrink: 0 }} />

                {/* Release context banner */}
                {onReleaseConfirm && state !== "result" && (
                    <div style={{ padding: "10px 18px", background: "#eef2ff", borderBottom: "1px solid #c7d2fe", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
                        <FileText size={13} color="#3730a3" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#3730a3", fontWeight: 600 }}>
                            Release mode — scan the resident's QR card to verify, then confirm release.
                        </span>
                    </div>
                )}

                {/* ── IDLE ── */}
                {state === "idle" && (
                    <div className="qr-in" style={{ padding: "36px 28px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(14,37,84,0.07)", border: "2px solid rgba(14,37,84,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                            <Camera size={30} color="#0e2554" strokeWidth={1.5} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#0e2554", marginBottom: 8 }}>Camera Access Required</div>
                        <p style={{ fontSize: 13, color: "#6a6a88", margin: "0 0 24px", lineHeight: 1.7, maxWidth: 320 }}>
                            This scanner needs your camera to read the resident's QR card.
                        </p>
                        <div style={{ background: "#f8f6f1", border: "1px solid #e4dfd4", borderRadius: 8, padding: "14px 18px", marginBottom: 24, width: "100%", textAlign: "left" }}>
                            {[
                                { icon: <ShieldCheck size={14} color="#1a7a4a" />, text: "Camera is only used for QR scanning — no photos are saved or stored" },
                                { icon: <Camera size={14} color="#0e2554" />,    text: "Camera turns off automatically when this modal is closed" },
                            ].map(({ icon, text }, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i === 0 ? 10 : 0 }}>
                                    <div style={{ flexShrink: 0, marginTop: 1 }}>{icon}</div>
                                    <span style={{ fontSize: 12, color: "#4a4a6a", lineHeight: 1.55 }}>{text}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleRequestPermission} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 24px", background: "linear-gradient(135deg, #163066, #091a3e)", color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                            <Camera size={15} /> Allow Camera Access
                        </button>
                    </div>
                )}

                {/* ── GRANTING ── */}
                {state === "granting" && (
                    <div className="qr-in" style={{ padding: "52px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, border: "3px solid rgba(14,37,84,0.12)", borderTopColor: "#0e2554", borderRadius: "50%", animation: "qr-spin 0.8s linear infinite", marginBottom: 18 }} />
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#0e2554", marginBottom: 6 }}>Waiting for permission…</div>
                        <p style={{ fontSize: 12.5, color: "#9090aa", margin: 0, lineHeight: 1.65 }}>
                            Your browser should show a permission prompt.<br />Click <strong>Allow</strong> to start scanning.
                        </p>
                    </div>
                )}

                {/* ── SCANNING + LOADING ── */}
                {(state === "scanning" || state === "loading") && (
                    <div style={{ padding: "18px 20px 20px" }}>
                        <div style={{ position: "relative", width: "100%", paddingBottom: "72%", borderRadius: 10, overflow: "hidden", background: "#080c14", marginBottom: 14, border: "1px solid rgba(201,162,39,0.2)" }}>
                            <video ref={videoRef} playsInline muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            <canvas ref={canvasRef} style={{ display: "none" }} />
                            {/* Gold corner brackets */}
                            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v, h]) => (
                                <div key={v+h} style={{ position: "absolute", [v]: 20, [h]: 20, width: 26, height: 26, [`border${v[0].toUpperCase()+v.slice(1)}`]: "3px solid #c9a227", [`border${h[0].toUpperCase()+h.slice(1)}`]: "3px solid #c9a227", borderRadius: v==="top"&&h==="left"?"3px 0 0 0":v==="top"&&h==="right"?"0 3px 0 0":v==="bottom"&&h==="left"?"0 0 0 3px":"0 0 3px 0", zIndex: 2, pointerEvents: "none" }} />
                            ))}
                            {/* Scan line */}
                            {camReady && state === "scanning" && (
                                <div style={{ position: "absolute", left: 20, right: 20, height: 2.5, background: "rgba(201,162,39,0.8)", borderRadius: 999, zIndex: 2, pointerEvents: "none", animation: "qr-scan 2s ease-in-out infinite" }} />
                            )}
                            {/* Flash */}
                            {flash && <div style={{ position: "absolute", inset: 0, background: "#22c55e", zIndex: 5, pointerEvents: "none", animation: "qr-flash 0.4s ease-out both" }} />}
                            {/* Warming up */}
                            {!camReady && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
                                    <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.12)", borderTopColor: "#c9a227", borderRadius: "50%", animation: "qr-spin 0.8s linear infinite", marginBottom: 10 }} />
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Starting camera…</div>
                                </div>
                            )}
                            {/* Processing overlay */}
                            {state === "loading" && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(8,12,20,0.75)", zIndex: 4 }}>
                                    <div style={{ width: 42, height: 42, border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "#c9a227", borderRadius: "50%", animation: "qr-spin 0.8s linear infinite", marginBottom: 12 }} />
                                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Identifying resident…</div>
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: 12, color: "#9090aa", margin: 0, textAlign: "center", lineHeight: 1.65 }}>
                            Ask the resident to show their <strong>QR Code</strong> and hold it steady in front of the camera.
                        </p>
                    </div>
                )}

                {/* ── DENIED ── */}
                {state === "denied" && (
                    <div className="qr-in" style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fdecea", border: "1.5px solid #f5c6c6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <CameraOff size={26} color="#b02020" strokeWidth={1.5} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#b02020", marginBottom: 8 }}>Camera Access Blocked</div>
                        <p style={{ fontSize: 12.5, color: "#9090aa", margin: "0 0 20px", lineHeight: 1.65 }}>
                            {errorMsg || "Camera permission was denied. To enable it, click the camera icon in your browser's address bar and set it to Allow, then try again."}
                        </p>
                        <button onClick={() => { setErrorMsg(""); setState("idle"); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", background: "linear-gradient(135deg, #163066, #091a3e)", color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                            <Camera size={14} /> Try Again
                        </button>
                    </div>
                )}

                {/* ── ERROR ── */}
                {state === "error" && (
                    <div className="qr-in" style={{ padding: "28px 24px 24px", textAlign: "center" }}>
                        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#fdecea", border: "1.5px solid #f5c6c6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                            <AlertCircle size={24} color="#b02020" strokeWidth={1.8} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#b02020", marginBottom: 8 }}>Unrecognised QR Code</div>
                        <p style={{ fontSize: 12, color: "#9090aa", margin: "0 0 4px", lineHeight: 1.6, wordBreak: "break-all" }}>Scanned: {errorMsg}</p>
                        <p style={{ fontSize: 12, color: "#9090aa", margin: "0 0 22px", lineHeight: 1.6 }}>
                            Only CertiFast resident QR cards are supported. Make sure the resident shows their <strong>My QR</strong> page.
                        </p>
                        <button onClick={handleReset} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#4a4a6a", fontFamily: "'Source Serif 4',serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Scan Again
                        </button>
                    </div>
                )}

                {/* ── RESULT ── */}
                {state === "result" && scanData && (
                    <div className="qr-in" style={{ padding: "20px 24px 24px", overflowY: "auto" }}>
                        {/* Resident identity */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f8f6f1", border: "1px solid #e4dfd4", borderRadius: 8, marginBottom: 16 }}>
                            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(14,37,84,0.08)", border: "1.5px solid rgba(14,37,84,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <User size={18} color="#0e2554" strokeWidth={1.8} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#0e2554" }}>{scanData.resident.full_name}</div>
                                <div style={{ fontSize: 11, color: "#9090aa", marginTop: 2 }}>{scanData.resident.resident_id} · {scanData.resident.address}</div>
                            </div>
                            <Check size={18} color="#1a7a4a" strokeWidth={2.5} />
                        </div>

                        {scanData.latestRequest ? (
                            <>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
                                    {onReleaseConfirm ? "Request Being Released" : "Latest Request"}
                                </div>

                                <div style={{ border: `1.5px solid ${scanData.latestRequest.has_fee ? "#f5d78e" : "#c7d2fe"}`, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                                    <div style={{ padding: "12px 16px", background: scanData.latestRequest.has_fee ? "#fff7e6" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <FileText size={15} color={scanData.latestRequest.has_fee ? "#b86800" : "#3730a3"} strokeWidth={1.8} />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{scanData.latestRequest.cert_type}</div>
                                                <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 1 }}>{scanData.latestRequest.request_id} · Submitted {fmtDate(scanData.latestRequest.requested_at)}</div>
                                            </div>
                                        </div>
                                        <StatusBadge status={scanData.latestRequest.status} />
                                    </div>
                                    <div style={{ padding: "10px 16px", borderTop: `1px solid ${scanData.latestRequest.has_fee ? "#f5d78e" : "#c7d2fe"}`, background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
                                        <span style={{ fontSize: 10, color: "#9090aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, flexShrink: 0 }}>Purpose</span>
                                        <span style={{ fontSize: 12.5, color: "#1a1a2e" }}>{scanData.latestRequest.purpose}</span>
                                    </div>
                                    <div style={{ padding: "10px 16px", borderTop: `1px solid ${scanData.latestRequest.has_fee ? "#f5d78e" : "#c7d2fe"}`, background: scanData.latestRequest.has_fee ? "#fff7e6" : "#e8f5ee", display: "flex", gap: 8, alignItems: "center" }}>
                                        <AlertCircle size={13} color={scanData.latestRequest.has_fee ? "#b86800" : "#1a7a4a"} style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: scanData.latestRequest.has_fee ? "#b86800" : "#1a7a4a" }}>
                                            {scanData.latestRequest.has_fee ? "Fee required — collect payment before releasing" : "No fee — ready to release directly"}
                                        </span>
                                    </div>
                                </div>

                                {/* Release context: fee warning + confirm button */}
                                {onReleaseConfirm ? (
                                    <>
                                        {releaseHasFee && (
                                            <div style={{ background: "#fff3e0", border: "1.5px solid #f0b84a", borderRadius: 6, padding: "11px 14px", display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                                                <AlertCircle size={15} color="#b86800" strokeWidth={2} style={{ flexShrink: 0 }} />
                                                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#7a4800" }}>
                                                    Collect payment from the resident before confirming release.
                                                </span>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#4a4a6a", fontFamily: "'Source Serif 4',serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                <RefreshCw size={12} /> Rescan
                                            </button>
                                            <button
                                                onClick={handleConfirmRelease}
                                                disabled={releaseLoading}
                                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px", background: releaseLoading ? "#aaa" : "linear-gradient(135deg,#1a7a4a,#0f5234)", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, cursor: releaseLoading ? "default" : "pointer" }}>
                                                <Check size={13} /> {releaseLoading ? "Releasing…" : "Confirm Release"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#4a4a6a", fontFamily: "'Source Serif 4',serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                            <RefreshCw size={12} /> Scan Another
                                        </button>
                                        <button onClick={() => { onClose(); onNavigate("manageRequests"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px", background: "linear-gradient(135deg,#163066,#091a3e)", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, cursor: "pointer" }}>
                                            <FileOutput size={13} /> Open in Manage Requests
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: "center", padding: "12px 0 18px" }}>
                                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f0ece4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                        <Clock size={22} color="#c4bfb5" />
                                    </div>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "#0e2554", marginBottom: 6 }}>No Active Request</div>
                                    <p style={{ fontSize: 12.5, color: "#9090aa", margin: "0 0 20px", lineHeight: 1.6 }}>
                                        This resident has no pending or processing request.
                                    </p>
                                </div>
                                <button onClick={handleReset} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#4a4a6a", fontFamily: "'Source Serif 4',serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                                    <RefreshCw size={13} /> Scan Another
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
