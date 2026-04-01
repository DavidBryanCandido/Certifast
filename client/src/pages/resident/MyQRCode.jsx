// =============================================================
// FILE: client/src/pages/resident/MyQRCode.jsx
// =============================================================

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // Fixed: Added for PDF rendering
import { useNavigate } from "react-router-dom";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
    FileText,
    AlertCircle,
    Printer,
    Scissors,
    Download,
} from "lucide-react";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";

// ─── Helper: format resident ID as RES-XXXX ───────────────────
function formatResidentId(raw) {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return String(raw);
    return `RES-${String(num).padStart(4, "0")}`;
}

// ─── Helper: last name for filename ──────────────────────────
function getLastName(fullName) {
    const parts = String(fullName || "Resident")
        .trim()
        .split(/\s+/);
    return parts[parts.length - 1];
}

// ─── Screen styles ────────────────────────────────────────────
if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    @keyframes rhFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .rh-fadein { animation:rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
}

// ─── Print styles ─────────────────────────────────────────────
if (!document.head.querySelector("[data-qr-print]")) {
    const s = document.createElement("style");
    s.setAttribute("data-qr-print", "true");
    s.innerText = `
    #qr-print-sheet {
        position: fixed;
        left: -9999px;
        top: -9999px;
        width: 54mm;
        pointer-events: none;
        visibility: hidden;
    }

    @media print {
        html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .rh-root,
        #root,
        body > *:not(#qr-print-sheet) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        #qr-print-sheet {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            min-height: 100vh !important;
            padding: 15mm 0 !important;
            pointer-events: auto !important;
            visibility: visible !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            overflow: visible !important;
            background: transparent !important;
        }

        #qr-print-sheet,
        #qr-print-sheet * {
            visibility: visible !important;
            opacity: 1 !important;
        }

        .ps-title { font-size: 9pt; color: #666; text-align: center; margin-bottom: 3mm; }
        .ps-hint  { font-size: 7.5pt; color: #999; text-align: center; margin-bottom: 10mm; }

        .wc {
            width: 54mm; height: 85.6mm;
            border: 1px dashed #bbb; border-radius: 3mm;
            overflow: hidden; display: flex; flex-direction: column;
            background: #fff;
            margin: 0 auto 10mm !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        @page { size: A4 portrait; margin: 15mm; }

        #qr-print-sheet { font-family: 'Source Serif 4', Georgia, serif; }

        .ps-title { font-size: 9pt; color: #666; text-align: center; margin-bottom: 3mm; }
        .ps-hint  { font-size: 7.5pt; color: #999; text-align: center; margin-bottom: 10mm; }

        .wc {
            width: 54mm; height: 85.6mm;
            border: 1px dashed #bbb; border-radius: 3mm;
            overflow: hidden; display: flex; flex-direction: column;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .wc-head {
            background: #0e2554 !important;
            padding: 2mm 3mm; display: flex; align-items: center;
            justify-content: space-between; flex-shrink: 0;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .wc-brand { font-size: 7pt; font-weight: 700; color: #fff !important; font-family: Georgia, serif; line-height: 1.2; }
        .wc-sub   { font-size: 5pt; color: #c9a227 !important; letter-spacing: 0.4px; text-transform: uppercase; margin-top: 0.3mm; }
        .wc-gold  {
            height: 1.2mm;
            background: linear-gradient(90deg,#c9a227,#f0d060,#c9a227) !important;
            flex-shrink: 0;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .wc-body {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 2.5mm 2.5mm 1.5mm; gap: 1.8mm;
        }
        .wc-name { font-size: 7.5pt; font-weight: 700; color: #0e2554 !important; text-align: center; line-height: 1.2; font-family: Georgia, serif; }
        .wc-id   { font-size: 5.5pt; color: #888 !important; text-align: center; font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
        .wc-qr   { padding: 1.5mm; border: 0.5px solid #ddd; border-radius: 1mm; background: #fff !important; }
        .wc-addr { font-size: 5pt; color: #888 !important; text-align: center; line-height: 1.3; }
        .wc-foot {
            background: #f8f6f1 !important; border-top: 0.5px solid #e4dfd4;
            padding: 1.2mm 2.5mm; font-size: 4.8pt; color: #aaa !important;
            text-align: center; line-height: 1.4; flex-shrink: 0;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .ps-cut {
            font-size: 7pt; color: #bbb; text-align: center;
            margin-top: 8mm; padding-top: 4mm;
            border-top: 1px dashed #ddd; width: 80mm;
        }
    }
    `;
    document.head.appendChild(s);
}

function WalletCard({ name, formattedId, qrValue, logoSrc }) {
    return (
        <div className="wc">
            <div className="wc-head">
                <div>
                    <div className="wc-brand">CertiFast</div>
                    <div className="wc-sub">Brgy. East Tapinac</div>
                </div>
                {/* logoSrc is a preloaded base64 data URL — guaranteed present during print */}
                {logoSrc && (
                    <img
                        src={logoSrc}
                        alt=""
                        style={{
                            width: "6mm",
                            height: "6mm",
                            borderRadius: "50%",
                            objectFit: "cover",
                            opacity: 0.9,
                        }}
                    />
                )}
            </div>
            <div className="wc-gold" />
            <div className="wc-body">
                <div className="wc-name">{name}</div>
                <div className="wc-id">{formattedId}</div>
                <div className="wc-qr">
                    <QRCodeSVG
                        value={qrValue}
                        size={108}
                        level="H"
                        includeMargin={false}
                        fgColor="#0e2554"
                        bgColor="#ffffff"
                    />
                </div>
                <div className="wc-addr">Olongapo City, Zambales</div>
            </div>
            <div className="wc-foot">
                Show to staff when claiming your certificate.
            </div>
        </div>
    );
}

export default function MyQRCode({ resident, onLogout }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    const [downloading, setDownloading] = useState(false);
    const [showPrintSheet, setShowPrintSheet] = useState(false);
    const [logoSrc, setLogoSrc] = useState("");
    const qrCanvasRef = useRef(null);

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    // Preload logo as base64 data URL on mount so it's ready before print dialog opens
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const c = document.createElement("canvas");
            c.width = img.width;
            c.height = img.height;
            c.getContext("2d").drawImage(img, 0, 0);
            setLogoSrc(c.toDataURL("image/png"));
        };
        img.onerror = () => setLogoSrc("/logo.png"); // fallback to path if canvas fails
        img.src = "/logo.png";
    }, []);

    const isMobile = width < 768;
    const name = resident?.full_name || resident?.name || "Resident";
    const rawId = resident?.resident_id || resident?.id || 0;
    const formattedId = formatResidentId(rawId);
    const qrValue = `certifast:resident:${rawId}`;
    const qrSize = isMobile ? 200 : 240;

    const downloadCard = async () => {
        setDownloading(true);
        try {
            // ── CR80 wallet card at 300 DPI ──────────────────────────────
            // Physical size: 54 × 85.6 mm  (standard ID/credit card, ISO 7810 ID-1)
            // 300 DPI → 1 mm = 300/25.4 ≈ 11.811 px
            // W = 54  × 11.811 = 637.8 → 638 px
            // H = 85.6 × 11.811 = 1011.0 → 1011 px
            // When printed at exactly 54 × 85.6 mm it will be sharp at 300 DPI.
            const W = 638,
                H = 1011,
                R = 32;

            const canvas = document.createElement("canvas");
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext("2d");

            // ── 1. Clip to rounded rect — all drawing stays inside clean corners ──
            ctx.beginPath();
            ctx.roundRect(0, 0, W, H, R);
            ctx.clip();

            // White base
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, W, H);

            // ── Header (scaled: 110 × 638/540 ≈ 130) ──
            ctx.fillStyle = "#0e2554";
            ctx.fillRect(0, 0, W, 130);

            // Gold accent line (scaled: 10 → 12)
            const grad = ctx.createLinearGradient(0, 0, W, 0);
            grad.addColorStop(0, "#c9a227");
            grad.addColorStop(0.5, "#f0d060");
            grad.addColorStop(1, "#c9a227");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 130, W, 12);

            // Brand name (scaled: 38 → 45)
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 45px Georgia, serif";
            ctx.textAlign = "left";
            ctx.fillText("CertiFast", 33, 76);

            // Brand sub (scaled: 18 → 21)
            ctx.fillStyle = "rgba(201,162,39,0.9)";
            ctx.font = "21px Georgia, serif";
            ctx.fillText("BRGY. EAST TAPINAC", 33, 108);

            // Logo — circle avatar top-right (scaled proportionally)
            try {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(W - 65, 65, 33, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, W - 98, 32, 66, 66);
                        ctx.restore();
                        resolve();
                    };
                    img.onerror = resolve;
                    img.src = "/logo.png";
                    setTimeout(resolve, 800);
                });
            } catch {}

            // ── Name with word-wrap (scaled: 34 → 40, lineH 42 → 50, nameY 188 → 222) ──
            ctx.textAlign = "center";
            ctx.fillStyle = "#0e2554";
            ctx.font = "bold 40px Georgia, serif";

            const maxW = W - 70;
            const words = name.split(" ");
            const lines = [];
            let cur = "";
            for (const w of words) {
                const test = cur ? `${cur} ${w}` : w;
                if (ctx.measureText(test).width > maxW && cur) {
                    lines.push(cur);
                    cur = w;
                } else {
                    cur = test;
                }
            }
            if (cur) lines.push(cur);

            const lineH = 50;
            const nameY = 222;
            lines.forEach((ln, i) =>
                ctx.fillText(ln, W / 2, nameY + i * lineH),
            );
            const belowName = nameY + lines.length * lineH;

            // ── Resident ID RES-XXXX (scaled: 21 → 25) ──
            ctx.fillStyle = "#888888";
            ctx.font = "25px 'Courier New', monospace";
            ctx.fillText(formattedId, W / 2, belowName + 40);

            // ── QR code (scaled: 300 → 355) ──
            const qrCanvas = qrCanvasRef.current?.querySelector("canvas");
            const qrDrawSize = 355;
            const qrX = (W - qrDrawSize) / 2;
            const qrY = belowName + 85;

            if (qrCanvas) {
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#e4dfd4";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(
                    qrX - 16,
                    qrY - 16,
                    qrDrawSize + 32,
                    qrDrawSize + 32,
                    14,
                );
                ctx.fill();
                ctx.stroke();
                ctx.drawImage(qrCanvas, qrX, qrY, qrDrawSize, qrDrawSize);
            }

            // ── Address (scaled: 20 → 24) ──
            const addrY = qrY + qrDrawSize + 42;
            ctx.fillStyle = "#888888";
            ctx.font = "24px Georgia, serif";
            ctx.fillText("Olongapo City, Zambales", W / 2, addrY);

            // ── Footer pinned to card bottom (scaled: 96 → 114) ──
            const footerH = 114;
            const footerY = H - footerH;
            ctx.fillStyle = "#f8f6f1";
            ctx.fillRect(0, footerY, W, footerH);
            ctx.fillStyle = "#e4dfd4";
            ctx.fillRect(0, footerY, W, 1);
            ctx.fillStyle = "#aaaaaa";
            ctx.font = "21px Georgia, serif";
            ctx.fillText(
                "Show to staff when claiming your certificate.",
                W / 2,
                footerY + 50,
            );

            // ── Outer border stroke (inside clip, corners always clean) ──
            ctx.strokeStyle = "#ddd8cc";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(1.5, 1.5, W - 3, H - 3, R);
            ctx.stroke();

            // ── Trigger download ──
            const lastName = getLastName(name);
            const link = document.createElement("a");
            link.download = `${lastName} Resident Card.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("PNG download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <div
                className="rh-root"
                style={{ display: "flex", minHeight: "100vh" }}
            >
                {!isMobile && (
                    <ResidentSidebar
                        active="qr"
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
                        pageTitle="My QR Code"
                    />

                    <div
                        ref={qrCanvasRef}
                        style={{
                            position: "fixed",
                            left: -9999,
                            top: -9999,
                            pointerEvents: "none",
                            visibility: "hidden",
                        }}
                    >
                        <QRCodeCanvas
                            value={qrValue}
                            size={300}
                            level="H"
                            includeMargin={false}
                            fgColor="#0e2554"
                            bgColor="#ffffff"
                        />
                    </div>

                    <div
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: isMobile ? "28px 16px 80px" : "32px 24px",
                        }}
                    >
                        <div
                            className="rh-fadein"
                            style={{ textAlign: "center", marginBottom: 24 }}
                        >
                            <h1
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: isMobile ? 20 : 22,
                                    fontWeight: 700,
                                    color: "#0e2554",
                                    margin: "0 0 6px",
                                }}
                            >
                                My QR Code
                            </h1>
                            <p
                                style={{
                                    fontSize: 12.5,
                                    color: "#9090aa",
                                    margin: 0,
                                }}
                            >
                                Show this to barangay staff when claiming your
                                certificate
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: isMobile
                                    ? "1fr"
                                    : "1fr 1fr",
                                gap: 16,
                                alignItems: "start",
                            }}
                        >
                            {/* LEFT: QR Card (Original Design) */}
                            <div>
                                <div
                                    className="rh-fadein"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        marginBottom: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #0e2554, #163066)",
                                            padding: "14px 20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display', serif",
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#fff",
                                                }}
                                            >
                                                CertiFast
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: "rgba(201,162,39,0.8)",
                                                    letterSpacing: "1.5px",
                                                    textTransform: "uppercase",
                                                    marginTop: 1,
                                                }}
                                            >
                                                Barangay East Tapinac
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                border: "1.5px solid rgba(201,162,39,0.5)",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <img
                                                src="/logo.png"
                                                alt="Seal"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            height: 3,
                                            background:
                                                "linear-gradient(90deg, #c9a227, #f0d060, #c9a227)",
                                        }}
                                    />
                                    <div
                                        style={{
                                            padding: "24px 20px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 16,
                                        }}
                                    >
                                        <div style={{ textAlign: "center" }}>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display', serif",
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: "#0e2554",
                                                }}
                                            >
                                                {name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9090aa",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Resident ID:{" "}
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Courier New', monospace",
                                                        fontWeight: 700,
                                                        color: "#0e2554",
                                                        fontSize: 12.5,
                                                        letterSpacing: "0.5px",
                                                    }}
                                                >
                                                    {formattedId}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                padding: 14,
                                                background: "#fff",
                                                border: "1.5px solid #e4dfd4",
                                                borderRadius: 10,
                                                boxShadow:
                                                    "0 4px 20px rgba(0,0,0,0.06)",
                                                position: "relative",
                                            }}
                                        >
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
                                                        [v]: 8,
                                                        [h]: 8,
                                                        width: 18,
                                                        height: 18,
                                                        [`border${v[0].toUpperCase() + v.slice(1)}`]:
                                                            "2.5px solid #c9a227",
                                                        [`border${h[0].toUpperCase() + h.slice(1)}`]:
                                                            "2.5px solid #c9a227",
                                                        borderRadius:
                                                            v === "top" &&
                                                            h === "left"
                                                                ? "3px 0 0 0"
                                                                : v === "top" &&
                                                                    h ===
                                                                        "right"
                                                                  ? "0 3px 0 0"
                                                                  : v ===
                                                                          "bottom" &&
                                                                      h ===
                                                                          "left"
                                                                    ? "0 0 0 3px"
                                                                    : "0 0 3px 0",
                                                    }}
                                                />
                                            ))}
                                            <QRCodeSVG
                                                value={qrValue}
                                                size={qrSize}
                                                level="H"
                                                includeMargin={false}
                                                fgColor="#0e2554"
                                                bgColor="#ffffff"
                                            />
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Barangay East Tapinac, Olongapo
                                                City
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10.5,
                                                    color: "#9090aa",
                                                    marginTop: 2,
                                                }}
                                            >
                                                City of Olongapo, Zambales
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            background: "#f8f6f1",
                                            borderTop: "1px solid #e4dfd4",
                                            padding: "10px 20px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        <AlertCircle
                                            size={11}
                                            color="#9090aa"
                                        />
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "#9090aa",
                                            }}
                                        >
                                            This QR is unique to your account.
                                            Do not share it with others.
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="rh-fadein"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        padding: "14px 16px",
                                        marginBottom: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: "rgba(26,122,74,0.08)",
                                            border: "1px solid rgba(26,122,74,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Download
                                            size={18}
                                            color="#1a7a4a"
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                                marginBottom: 2,
                                            }}
                                        >
                                            Download as PNG
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11.5,
                                                color: "#9090aa",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            Save to your phone · Use offline ·
                                            No printing needed
                                        </div>
                                    </div>
                                    <button
                                        onClick={downloadCard}
                                        disabled={downloading}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 7,
                                            padding: "9px 16px",
                                            background:
                                                "linear-gradient(135deg, #1a7a4a, #0f5234)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 4,
                                            fontFamily:
                                                "'Playfair Display', serif",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            cursor: downloading
                                                ? "default"
                                                : "pointer",
                                            opacity: downloading ? 0.6 : 1,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Download size={13} />{" "}
                                        {downloading ? "Saving…" : "Save PNG"}
                                    </button>
                                </div>

                                <div
                                    className="rh-fadein"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        padding: "14px 16px",
                                        marginBottom: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: "rgba(14,37,84,0.06)",
                                            border: "1px solid rgba(14,37,84,0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Printer
                                            size={18}
                                            color="#0e2554"
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                                marginBottom: 2,
                                            }}
                                        >
                                            Print as Wallet Card
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11.5,
                                                color: "#9090aa",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            1 card on A4 · Cut and laminate for
                                            a physical copy
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowPrintSheet(true);
                                            window.requestAnimationFrame(() => {
                                                window.print();
                                                setTimeout(() => {
                                                    setShowPrintSheet(false);
                                                }, 1000);
                                            });
                                        }}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 7,
                                            padding: "9px 16px",
                                            background:
                                                "linear-gradient(135deg, #163066, #091a3e)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 4,
                                            fontFamily:
                                                "'Playfair Display', serif",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            cursor: "pointer",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Printer size={13} /> Print
                                    </button>
                                </div>

                                <div
                                    className="rh-fadein"
                                    style={{
                                        background: "#f5edce",
                                        border: "1px solid #e0d4a8",
                                        borderRadius: 8,
                                        padding: "12px 14px",
                                        display: "flex",
                                        gap: 10,
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <Scissors
                                        size={13}
                                        color="#9a7515"
                                        style={{ flexShrink: 0, marginTop: 2 }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#7a6530",
                                            lineHeight: 1.65,
                                        }}
                                    >
                                        <strong>Tip:</strong> Laminate with a
                                        standard <strong>54 × 86 mm</strong>{" "}
                                        pouch — same size as a credit card. Or
                                        just save the PNG to your phone's home
                                        screen.
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Guidelines (Original Design) */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                }}
                            >
                                <div
                                    className="rh-fadein"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "13px 18px",
                                            background: "#f8f6f1",
                                            borderBottom: "1px solid #e4dfd4",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Playfair Display', serif",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                            }}
                                        >
                                            How to Use Your QR Code
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "16px 18px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 14,
                                        }}
                                    >
                                        {/* Original step mapping logic kept here */}
                                        {[
                                            {
                                                n: "1",
                                                t: "Submit a Request",
                                                s: "Use this portal to submit a certificate request online.",
                                            },
                                            {
                                                n: "2",
                                                t: "Wait for Processing",
                                                s: "Barangay staff will process it in 1–3 business days.",
                                            },
                                            {
                                                n: "3",
                                                t: "Visit the Office",
                                                s: "Go to the Barangay East Tapinac office when it's ready.",
                                            },
                                            {
                                                n: "4",
                                                t: "Show Your QR Code",
                                                s: "Show this QR code on screen or as a printed/saved card.",
                                            },
                                            {
                                                n: "5",
                                                t: "Receive Your Certificate",
                                                s: "Staff will scan it, verify, and hand you your document.",
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.n}
                                                style={{
                                                    display: "flex",
                                                    gap: 12,
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: "50%",
                                                        background: "#0e2554",
                                                        color: "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    {item.n}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: "#1a1a2e",
                                                            marginBottom: 2,
                                                        }}
                                                    >
                                                        {item.t}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#6a6a8a",
                                                            lineHeight: 1.55,
                                                        }}
                                                    >
                                                        {item.s}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    className="rh-fadein"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "12px 16px",
                                            background: "#f8f6f1",
                                            borderBottom: "1px solid #e4dfd4",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Playfair Display', serif",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                            }}
                                        >
                                            What to Bring
                                        </div>
                                    </div>
                                    <div style={{ padding: "8px 0" }}>
                                        {[
                                            {
                                                t: "This QR code — on screen, saved PNG, or printed wallet card",
                                                r: true,
                                            },
                                            {
                                                t: "Valid government-issued ID (PhilSys, driver's license, passport)",
                                                r: true,
                                            },
                                            {
                                                t: "Request ID / reference number (from submission confirmation)",
                                                r: true,
                                            },
                                            {
                                                t: "Fee payment — for Barangay Clearance, Business Permit, and similar",
                                                r: false,
                                            },
                                        ].map((item, i, arr) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 10,
                                                    padding: "9px 16px",
                                                    borderBottom:
                                                        i < arr.length - 1
                                                            ? "1px solid #f5f2ee"
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: item.r
                                                            ? "#0e2554"
                                                            : "#c9a227",
                                                        flexShrink: 0,
                                                        marginTop: 5,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#1a1a2e",
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {item.t}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="rh-fadein">
                                    <button
                                        onClick={() =>
                                            navigate("/resident/my-requests")
                                        }
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 7,
                                            padding: "12px",
                                            background: "#fff",
                                            border: "1.5px solid #e4dfd4",
                                            borderRadius: 4,
                                            color: "#4a4a6a",
                                            fontFamily:
                                                "'Source Serif 4', serif",
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <FileText size={13} /> View My Requests
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {isMobile && <ResidentBottomNav active="qr" />}
                </div>
            </div>

            {/* FIXED: Wrapped print sheet in createPortal so it is NOT hidden when #root is hidden */}
            {showPrintSheet &&
                createPortal(
                    <div id="qr-print-sheet">
                        <div className="ps-title">
                            CertiFast · Resident QR Wallet Card · Barangay East
                            Tapinac, City of Olongapo
                        </div>
                        <div className="ps-hint">
                            ✂ Cut along the dashed border · Laminate with a 54 ×
                            86 mm pouch (credit card size)
                        </div>
                        <WalletCard
                            name={name}
                            formattedId={formattedId}
                            qrValue={qrValue}
                            logoSrc={logoSrc}
                        />
                        <div className="ps-cut">
                            ✂ Standard wallet / ID card size — 54 × 85.6 mm
                            (CR80)
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
