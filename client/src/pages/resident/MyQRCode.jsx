// =============================================================
// FILE: client/src/pages/resident/MyQRCode.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/resident/profile → { resident_id, full_name, address, ... }
//   - resident_id is what gets encoded into the QR
//   - All endpoints require residentToken in Authorization header
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
    Home, Plus, FileText, QrCode,
    LogOut, AlertCircle, Printer, Scissors,
} from "lucide-react";

// ─── Screen styles ────────────────────────────────────────────
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
    /* Hide print sheet on screen */
    #qr-print-sheet { display: none; }

    @media print {
        /* Hide the app shell, keep only the print sheet visible.
           Both .rh-root and #qr-print-sheet are siblings inside #root,
           so we hide .rh-root specifically — NOT body > * which would
           also hide #root and everything inside it. */
        .rh-root { display: none !important; }
        #qr-print-sheet { display: block !important; }

        @page { size: A4 portrait; margin: 10mm; }

        #qr-print-sheet {
            font-family: 'Source Serif 4', Georgia, serif;
        }
        .ps-title {
            font-size: 9pt;
            color: #666;
            text-align: center;
            margin-bottom: 4mm;
        }
        .ps-hint {
            font-size: 7.5pt;
            color: #999;
            text-align: center;
            margin-bottom: 6mm;
        }

        /* 3 columns × 2 rows = 6 cards per A4 */
        .ps-grid {
            display: grid;
            grid-template-columns: repeat(3, 54mm);
            grid-template-rows: repeat(2, 85.6mm);
            gap: 5mm;
            justify-content: center;
        }

        /* CR80 wallet card: 54mm × 85.6mm */
        .wc {
            width: 54mm;
            height: 85.6mm;
            border: 1px dashed #bbb;
            border-radius: 3mm;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: #fff;
            page-break-inside: avoid;
        }
        .wc-head {
            background: #0e2554;
            padding: 2mm 3mm;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }
        .wc-brand { font-size: 7pt; font-weight: 700; color: #fff; font-family: Georgia, serif; line-height: 1.2; }
        .wc-sub   { font-size: 5pt; color: rgba(201,162,39,0.9); letter-spacing: 0.4px; text-transform: uppercase; margin-top: 0.3mm; }
        .wc-gold  { height: 1.2mm; background: linear-gradient(90deg,#c9a227,#f0d060,#c9a227); flex-shrink:0; }
        .wc-body  {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 2.5mm 2.5mm 1.5mm; gap: 1.8mm;
        }
        .wc-name { font-size: 7.5pt; font-weight: 700; color: #0e2554; text-align: center; line-height: 1.2; font-family: Georgia, serif; }
        .wc-id   { font-size: 5.5pt; color: #888; text-align: center; }
        .wc-qr   { padding: 1.5mm; border: 0.5px solid #ddd; border-radius: 1mm; background: #fff; }
        .wc-addr { font-size: 5pt; color: #888; text-align: center; line-height: 1.3; }
        .wc-foot {
            background: #f8f6f1; border-top: 0.5px solid #e4dfd4;
            padding: 1.2mm 2.5mm; font-size: 4.8pt; color: #aaa;
            text-align: center; line-height: 1.4; flex-shrink: 0;
        }
        .ps-cut {
            font-size: 7pt; color: #bbb; text-align: center;
            margin-top: 5mm; padding-top: 3mm;
            border-top: 1px dashed #ddd;
        }
    }
    `;
    document.head.appendChild(s);
}

// ─── Single wallet card (used inside the print sheet) ────────
function WalletCard({ name, residentId, qrValue }) {
    return (
        <div className="wc">
            <div className="wc-head">
                <div>
                    <div className="wc-brand">CertiFast</div>
                    <div className="wc-sub">Brgy. East Tapinac</div>
                </div>
                <img src="/logo.png" alt="" style={{ width: "6mm", height: "6mm", borderRadius: "50%", objectFit: "cover", opacity: 0.9 }} />
            </div>
            <div className="wc-gold" />
            <div className="wc-body">
                <div className="wc-name">{name}</div>
                <div className="wc-id">ID: {residentId}</div>
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

// ─── Main Component ───────────────────────────────────────────
export default function MyQRCode({ resident, onLogout }) {
    const navigate              = useNavigate();
    const [width, setWidth]     = useState(window.innerWidth);
    const [activeNav]           = useState("qr");

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const isMobile   = width < 768;
    const name       = resident?.full_name || resident?.name || "Resident";
    const firstName  = name.split(" ")[0];
    const residentId = resident?.resident_id || resident?.id || "RESIDENT_ID_MISSING";
    const qrValue    = `certifast:resident:${residentId}`;
    const qrSize     = isMobile ? 200 : 240;

    return (
        <>
        <div className="rh-root">

            {/* ── TOPBAR ── */}
            <div className="rh-topbar">
                <div className="rh-topbar-inner">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(201,162,39,0.5)", overflow: "hidden", flexShrink: 0 }}>
                            <img src="/logo.png" alt="Seal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>CertiFast</div>
                            <div style={{ fontSize: 9, color: "rgba(201,162,39,0.7)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Resident Portal</div>
                        </div>
                    </div>

                    {!isMobile && (
                        <button onClick={() => navigate("/resident/home")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "rgba(255,255,255,0.7)", fontFamily: "'Source Serif 4', serif", fontSize: 12, cursor: "pointer" }}>
                            <Home size={13} /> Home
                        </button>
                    )}

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
            <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "28px 16px 80px" : "32px 24px" }}>

                <div className="rh-fadein" style={{ textAlign: "center", marginBottom: 24 }}>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#0e2554", margin: "0 0 6px" }}>My QR Code</h1>
                    <p style={{ fontSize: 12.5, color: "#9090aa", margin: 0 }}>Show this to barangay staff when claiming your certificate</p>
                </div>

                {/* ── 2-column grid on desktop ── */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, alignItems: "start" }}>

                    {/* ── LEFT: QR card + print ── */}
                    <div>
                        {/* QR Card */}
                        <div className="rh-fadein" style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                            <div style={{ background: "linear-gradient(135deg, #0e2554, #163066)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>CertiFast</div>
                                    <div style={{ fontSize: 9, color: "rgba(201,162,39,0.8)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 1 }}>Barangay East Tapinac</div>
                                </div>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(201,162,39,0.5)", overflow: "hidden" }}>
                                    <img src="/logo.png" alt="Seal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            </div>
                            <div style={{ height: 3, background: "linear-gradient(90deg, #c9a227, #f0d060, #c9a227)" }} />
                            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#0e2554" }}>{name}</div>
                                    <div style={{ fontSize: 11, color: "#9090aa", marginTop: 3 }}>
                                        Resident ID: <span style={{ fontWeight: 600, color: "#4a4a6a" }}>{residentId}</span>
                                    </div>
                                </div>
                                <div style={{ padding: 14, background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", position: "relative" }}>
                                    {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
                                        <div key={v+h} style={{ position: "absolute", [v]: 8, [h]: 8, width: 18, height: 18, [`border${v[0].toUpperCase()+v.slice(1)}`]: "2.5px solid #c9a227", [`border${h[0].toUpperCase()+h.slice(1)}`]: "2.5px solid #c9a227", borderRadius: v==="top"&&h==="left"?"3px 0 0 0":v==="top"&&h==="right"?"0 3px 0 0":v==="bottom"&&h==="left"?"0 0 0 3px":"0 0 3px 0" }} />
                                    ))}
                                    <QRCodeSVG value={qrValue} size={qrSize} level="H" includeMargin={false} fgColor="#0e2554" bgColor="#ffffff" />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 11.5, color: "#4a4a6a", fontWeight: 600 }}>Barangay East Tapinac, Olongapo City</div>
                                    <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 2 }}>City of Olongapo, Zambales</div>
                                </div>
                            </div>
                            <div style={{ background: "#f8f6f1", borderTop: "1px solid #e4dfd4", padding: "10px 20px", display: "flex", alignItems: "center", gap: 6 }}>
                                <AlertCircle size={11} color="#9090aa" />
                                <span style={{ fontSize: 11, color: "#9090aa" }}>This QR is unique to your account. Do not share it with others.</span>
                            </div>
                        </div>

                        {/* Print CTA */}
                        <div className="rh-fadein" style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(14,37,84,0.06)", border: "1px solid rgba(14,37,84,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Printer size={18} color="#0e2554" strokeWidth={1.8} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0e2554", marginBottom: 2 }}>Print as Wallet Card</div>
                                <div style={{ fontSize: 11.5, color: "#9090aa", lineHeight: 1.5 }}>6 cards on one A4 sheet · Cut and laminate</div>
                            </div>
                            <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "linear-gradient(135deg, #163066, #091a3e)", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>
                                <Printer size={13} /> Print
                            </button>
                        </div>

                        {/* Laminate tip */}
                        <div className="rh-fadein" style={{ background: "#f5edce", border: "1px solid #e0d4a8", borderRadius: 8, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <Scissors size={13} color="#9a7515" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ fontSize: 12, color: "#7a6530", lineHeight: 1.65 }}>
                                <strong>Tip:</strong> Laminate with a standard <strong>54 × 86 mm</strong> pouch — same size as a credit card.
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: How to use + What to Bring + actions ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                        {/* How to use */}
                        <div className="rh-fadein" style={{ background: "#f8f6f1", border: "1px solid #e4dfd4", borderRadius: 8, padding: "14px 16px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>How to use</div>
                            {[
                                { n: "1", text: "Submit a certificate request online through this portal." },
                                { n: "2", text: "Wait for processing — usually 1–3 business days." },
                                { n: "3", text: "Visit the Barangay East Tapinac office and show this QR code to the staff." },
                                { n: "4", text: "Staff will scan it to pull up your request instantly." },
                                { n: "5", text: "Pay the fee (if required) and receive your certificate." },
                            ].map(({ n, text }) => (
                                <div key={n} style={{ display: "flex", gap: 10, marginBottom: n === "5" ? 0 : 8, alignItems: "flex-start" }}>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0e2554", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{n}</div>
                                    <span style={{ fontSize: 12, color: "#4a4a6a", lineHeight: 1.55 }}>{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* What to Bring */}
                        <div className="rh-fadein" style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", background: "#f8f6f1", borderBottom: "1px solid #e4dfd4" }}>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#0e2554" }}>What to Bring</div>
                            </div>
                            <div style={{ padding: "8px 0" }}>
                                {[
                                    { text: "This QR code — on screen or as a printed wallet card", required: true  },
                                    { text: "Valid government-issued ID (PhilSys, driver's license, passport)", required: true  },
                                    { text: "Request ID / reference number (from submission confirmation)", required: true  },
                                    { text: "Fee payment — for Barangay Clearance, Business Permit, and similar", required: false },
                                ].map(({ text, required }, i, arr) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f5f2ee" : "none" }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: required ? "#0e2554" : "#c9a227", flexShrink: 0, marginTop: 5 }} />
                                        <span style={{ fontSize: 12, color: "#1a1a2e", lineHeight: 1.55 }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: "8px 16px", background: "#f8f6f1", borderTop: "1px solid #e4dfd4", display: "flex", gap: 14 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#9090aa" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0e2554" }} /> Required
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#9090aa" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a227" }} /> If applicable
                                </span>
                            </div>
                        </div>

                        {/* Bottom action buttons */}
                        <div className="rh-fadein" style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => navigate("/resident/my-requests")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#4a4a6a", fontFamily: "'Source Serif 4', serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                                <FileText size={13} /> My Requests
                            </button>
                            <button onClick={() => navigate("/resident/submit-request")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", background: "linear-gradient(135deg, #163066, #091a3e)", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Playfair Display', serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                                <Plus size={13} /> New Request
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile bottom nav */}
            {isMobile && (
                <div className="rh-bottom-nav">
                    {[
                        { key: "home",    icon: Home,     label: "Home",    path: "/resident/home"           },
                        { key: "request", icon: Plus,     label: "Request", path: "/resident/submit-request" },
                        { key: "history", icon: FileText, label: "History", path: "/resident/my-requests"    },
                        { key: "qr",      icon: QrCode,   label: "My QR",   path: "/resident/my-qr"          },
                    ].map(({ key, icon: Icon, label, path }) => (
                        <button key={key} className={`rh-nav-btn${activeNav === key ? " active" : ""}`} onClick={() => navigate(path)}>
                            <Icon size={20} strokeWidth={1.8} />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* ══════════════════════════════════════════════════════
            PRINT SHEET — hidden on screen, visible only when printing.
            Renders 6 wallet-sized cards (CR80) in a 3×2 grid on A4.
        ══════════════════════════════════════════════════════ */}
        <div id="qr-print-sheet">
            <div className="ps-title">
                CertiFast · Resident QR Wallet Card · Barangay East Tapinac, City of Olongapo
            </div>
            <div className="ps-hint">
                ✂ Cut along the dashed borders · Laminate with a 54 × 86 mm pouch (credit card size)
            </div>

            <div className="ps-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <WalletCard key={i} name={name} residentId={residentId} qrValue={qrValue} />
                ))}
            </div>

            <div className="ps-cut">
                ✂ Standard wallet / ID card size — 54 × 85.6 mm (CR80)
            </div>
        </div>
        </>
    );
}
