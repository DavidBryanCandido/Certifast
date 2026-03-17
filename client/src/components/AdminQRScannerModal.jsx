import { useEffect, useState } from "react";
import { QrCode, X, Check, FileOutput } from "lucide-react";

export default function AdminQRScannerModal({ onClose, onNavigate, isMobile }) {
    const [scanResult, setScanResult] = useState(null);

    const SCAN_DATA = {
        free: {
            reqId: "#REQ-0145",
            name: "Ricardo Mendoza",
            certType: "Certificate of Indigency",
            hasFee: false,
        },
        fee: {
            reqId: "#REQ-0144",
            name: "Felicidad Torres",
            certType: "Barangay Clearance",
            hasFee: true,
        },
    };

    useEffect(() => {
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", fn);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const qr = {
        overlay: {
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            padding: 20,
            zIndex: 210,
        },
        modal: {
            width: 420,
            borderRadius: 10,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            overflow: "hidden",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e4dfd4",
            background: "#0e2554",
        },
        headerTitle: {
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
        },
        headerSub: {
            margin: 0,
            fontSize: 11,
            color: "rgba(255,255,255,0.72)",
        },
        closeBtn: {
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: 6,
            borderRadius: 6,
        },
        scanBox: {
            position: "relative",
            width: 240,
            height: 240,
            margin: "0 auto 18px",
            borderRadius: 12,
            background: "rgba(14, 37, 84, 0.05)",
            border: "1px solid rgba(201,162,39,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        },
        scanLine: {
            position: "absolute",
            left: 16,
            right: 16,
            top: 20,
            height: 4,
            background: "rgba(201,162,39,0.55)",
            borderRadius: 999,
            animation: "scanline 2s linear infinite",
        },
        scanningLabel: {
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(0,0,0,0.5)",
        },
    };

    return (
        <div
            style={{
                ...qr.overlay,
                alignItems: isMobile ? "flex-end" : "center",
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    ...qr.modal,
                    width: isMobile ? "100%" : 420,
                    borderRadius: isMobile ? "16px 16px 0 0" : 10,
                    maxHeight: isMobile ? "92vh" : "auto",
                    overflowY: "auto",
                }}
            >
                <div style={qr.header}>
                    <div>
                        <p style={qr.headerTitle}>Scan QR Code</p>
                        <p style={qr.headerSub}>
                            Scan resident QR or certificate QR to release
                        </p>
                    </div>
                    <button style={qr.closeBtn} onClick={onClose}>
                        <X size={14} color="#fff" strokeWidth={2.5} />
                    </button>
                </div>
                {!scanResult ? (
                    <div style={{ padding: "24px", textAlign: "center" }}>
                        <div style={qr.scanBox}>
                            {[
                                ["top", "left"],
                                ["top", "right"],
                                ["bottom", "left"],
                                ["bottom", "right"],
                            ].map(([v, h]) => (
                                <div
                                    key={v + h}
                                    style={{
                                        position: "absolute",
                                        [v]: 12,
                                        [h]: 12,
                                        width: 28,
                                        height: 28,
                                        [`border${v.charAt(0).toUpperCase() + v.slice(1)}`]:
                                            "3px solid #c9a227",
                                        [`border${h.charAt(0).toUpperCase() + h.slice(1)}`]:
                                            "3px solid #c9a227",
                                        borderRadius:
                                            v === "top" && h === "left"
                                                ? "2px 0 0 0"
                                                : v === "top" && h === "right"
                                                  ? "0 2px 0 0"
                                                  : v === "bottom" &&
                                                      h === "left"
                                                    ? "0 0 0 2px"
                                                    : "0 0 2px 0",
                                    }}
                                />
                            ))}
                            <div style={qr.scanLine} />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <QrCode
                                    size={64}
                                    color="rgba(201,162,39,0.3)"
                                    strokeWidth={1}
                                />
                            </div>
                            <div style={qr.scanningLabel}>Scanning…</div>
                        </div>
                        <p
                            style={{
                                fontSize: 12,
                                color: "#9090aa",
                                marginBottom: 20,
                            }}
                        >
                            Point camera at resident QR card or printed
                            certificate QR
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "center",
                                marginBottom: 6,
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                style={{
                                    padding: "9px 16px",
                                    borderRadius: 5,
                                    fontFamily: "'Source Serif 4', serif",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "opacity 0.15s",
                                    background: "#e8f5ee",
                                    color: "#1a7a4a",
                                    border: "1.5px solid #a8d8bc",
                                }}
                                onClick={() => setScanResult(SCAN_DATA.free)}
                            >
                                Simulate — No Fee
                            </button>
                            <button
                                style={{
                                    padding: "9px 16px",
                                    borderRadius: 5,
                                    fontFamily: "'Source Serif 4', serif",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "opacity 0.15s",
                                    background: "#e8eef8",
                                    color: "#1a4a8a",
                                    border: "1.5px solid #b8cce8",
                                }}
                                onClick={() => setScanResult(SCAN_DATA.fee)}
                            >
                                Simulate — With Fee
                            </button>
                        </div>
                        <div style={{ fontSize: 10, color: "#c0bbb0" }}>
                            (Wireframe only — replace with real camera in dev)
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: "0 24px 24px" }}>
                        <div
                            style={{
                                borderRadius: 6,
                                padding: "14px 16px",
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                                marginBottom: 16,
                                background: "#edfdf5",
                                border: "1.5px solid #6ee7b7",
                            }}
                        >
                            <Check
                                size={18}
                                color="#1a7a4a"
                                strokeWidth={2}
                                style={{ flexShrink: 0, marginTop: 1 }}
                            />
                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        fontFamily: "'Playfair Display',serif",
                                        color: "#1a5c38",
                                    }}
                                >
                                    QR Verified — {scanResult.reqId}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11.5,
                                        marginTop: 3,
                                        lineHeight: 1.6,
                                        color: "#2a7a4a",
                                    }}
                                >
                                    <strong>{scanResult.name}</strong> ·{" "}
                                    {scanResult.certType}
                                    <br />
                                    {scanResult.hasFee ? (
                                        <span
                                            style={{
                                                color: "#b86800",
                                                fontWeight: 700,
                                            }}
                                        >
                                            ⚠ Fee required — collect before
                                            release
                                        </span>
                                    ) : (
                                        <span
                                            style={{
                                                color: "#1a7a4a",
                                                fontWeight: 700,
                                            }}
                                        >
                                            ✓ No fee — ready to release directly
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            style={{
                                width: "100%",
                                padding: 11,
                                background: "#1a7a4a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 5,
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                            }}
                            onClick={() => {
                                onClose();
                                onNavigate("manageRequests");
                            }}
                        >
                            <FileOutput size={14} /> Open in Manage Requests
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
