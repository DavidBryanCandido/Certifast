// =============================================================
// FILE: client/src/pages/admin/Settings.jsx
// =============================================================

import { useState, useRef, useEffect } from "react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import { Menu, X } from "lucide-react";

// ─── Injected styles (mirrors HTML stylesheet) ───────────────
let stylesInjected = false;
function useSettingsStyles() {
    useEffect(() => {
        if (stylesInjected) return;
        stylesInjected = true;
        const el = document.createElement("style");
        el.setAttribute("data-settings", "true");
        el.innerText = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');

        .st-body { font-family: 'Source Serif 4', serif; }

        /* TABS */
        .st-tabs { display:flex; gap:0; border-bottom:2px solid #e4dfd4; margin-bottom:28px; }
        .st-tab-btn {
            padding:10px 24px;
            font-family:'Source Serif 4',serif;
            font-size:13px; font-weight:600;
            color:#9090aa; background:none; border:none;
            border-bottom:2px solid transparent; margin-bottom:-2px;
            cursor:pointer; display:flex; align-items:center; gap:8px;
            transition:all .15s;
        }
        .st-tab-btn:hover { color:#0e2554; }
        .st-tab-btn.active { color:#0e2554; border-bottom-color:#0e2554; }
        .st-tab-btn svg { opacity:.6; }
        .st-tab-btn.active svg { opacity:1; }

        /* PANELS */
        .st-panel { background:#fff; border:1px solid #e4dfd4; border-radius:6px; overflow:hidden; margin-bottom:20px; }
        .st-panel-header {
            padding:16px 24px; border-bottom:1px solid #e4dfd4;
            display:flex; align-items:center; justify-content:space-between;
            background:#f8f6f1;
        }
        .st-panel-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:#0e2554; }
        .st-panel-desc  { font-size:11px; color:#9090aa; margin-top:2px; }
        .st-panel-body  { padding:24px; }

        /* FORM */
        .st-form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .st-form-grid-1 { display:grid; grid-template-columns:1fr; gap:18px; }
        .st-field { display:flex; flex-direction:column; gap:6px; }
        .st-field label { font-size:10.5px; font-weight:600; color:#4a4a6a; letter-spacing:1.2px; text-transform:uppercase; }
        .st-field label .req { color:#b02020; margin-left:2px; }
        .st-field input, .st-field textarea, .st-field select {
            width:100%; padding:10px 14px;
            border:1.5px solid #e4dfd4; border-radius:4px;
            font-family:'Source Serif 4',serif; font-size:13px; color:#1a1a2e;
            background:#f8f6f1; outline:none;
            transition:border-color .15s, background .15s;
        }
        .st-field input:focus, .st-field textarea:focus, .st-field select:focus {
            border-color:#0e2554; background:#f0f3ff;
        }
        .st-field textarea { resize:vertical; min-height:80px; line-height:1.6; }
        .st-field .hint { font-size:10.5px; color:#9090aa; line-height:1.5; }

        /* SAVE BAR */
        .st-save-bar {
            display:flex; align-items:center; justify-content:space-between;
            padding:14px 24px; background:#f5edce; border-top:1px solid #e0d4a8;
        }
        .st-save-bar p { font-size:11.5px; color:#7a6530; }
        .st-btn-save {
            display:inline-flex; align-items:center; gap:8px;
            padding:9px 24px;
            background:linear-gradient(135deg,#163066,#091a3e);
            color:#fff; border:none; border-radius:4px;
            font-family:'Playfair Display',serif; font-size:12px; font-weight:700;
            letter-spacing:1.5px; text-transform:uppercase; cursor:pointer;
        }
        .st-btn-cancel {
            display:inline-flex; align-items:center; gap:8px;
            padding:9px 20px; background:none; color:#4a4a6a;
            border:1px solid #e4dfd4; border-radius:4px;
            font-family:'Source Serif 4',serif; font-size:12px; cursor:pointer; margin-right:8px;
        }

        /* LOGO UPLOAD */
        .st-logo-preview {
            width:100px; height:100px; border-radius:50%;
            border:2px solid #e4dfd4; background:#f8f6f1;
            display:flex; align-items:center; justify-content:center;
            overflow:hidden; flex-shrink:0; position:relative;
        }
        .st-logo-preview img { width:96px; height:96px; border-radius:50%; object-fit:cover; }
        .st-upload-btn {
            display:inline-flex; align-items:center; gap:8px; padding:8px 18px;
            background:#0e2554; color:#fff; border:none; border-radius:4px;
            font-family:'Source Serif 4',serif; font-size:12px; font-weight:600;
            cursor:pointer;
        }
        .st-upload-btn-secondary {
            display:inline-flex; align-items:center; gap:8px; padding:8px 18px;
            background:none; color:#b02020; border:1px solid rgba(176,32,32,.3);
            border-radius:4px; font-family:'Source Serif 4',serif;
            font-size:12px; font-weight:600; cursor:pointer; margin-left:8px;
        }

        /* E-SIGNATURE */
        .st-esig-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:22px; padding-top:22px; border-top:1px dashed #e4dfd4; }
        .st-esig-block { display:flex; flex-direction:column; gap:8px; }
        .st-esig-label { font-size:10.5px; font-weight:600; color:#4a4a6a; letter-spacing:1.2px; text-transform:uppercase; }
        .st-esig-sublabel { font-size:10px; color:#9090aa; margin-top:-4px; }
        .st-esig-wrap {
            border:1.5px dashed #e4dfd4; border-radius:4px; background:#fafaf8;
            height:110px; display:flex; flex-direction:column;
            align-items:center; justify-content:center; gap:6px;
            position:relative; overflow:hidden; cursor:crosshair;
        }
        .st-esig-wrap.has-sig { border-style:solid; border-color:#0e2554; background:#fff; cursor:default; }
        .st-esig-wrap img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:8px; }
        .st-esig-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .st-esig-btn {
            display:inline-flex; align-items:center; gap:5px; padding:5px 12px;
            font-family:'Source Serif 4',serif; font-size:11px; font-weight:600;
            border-radius:3px; cursor:pointer; transition:all .15s;
        }
        .st-esig-btn.draw   { background:#0e2554; color:#fff; border:none; }
        .st-esig-btn.upload { background:none; color:#0e2554; border:1.5px solid #0e2554; }
        .st-esig-btn.clear  { background:none; color:#b02020; border:1.5px solid rgba(176,32,32,.3); }
        .st-esig-status { display:inline-flex; align-items:center; gap:5px; font-size:10px; padding:3px 10px; border-radius:20px; font-weight:600; margin-left:6px; }
        .st-esig-status.set    { background:#e8f5ee; color:#1a7a4a; }
        .st-esig-status.notset { background:#f0f0f0; color:#9090aa; }

        /* DRAW MODAL */
        .st-modal-overlay { display:none; position:fixed; inset:0; background:rgba(9,26,62,.6); z-index:200; align-items:center; justify-content:center; }
        .st-modal-overlay.open { display:flex; }
        .st-modal { background:#fff; border-radius:8px; box-shadow:0 20px 60px rgba(0,0,0,.3); width:520px; overflow:hidden; }
        .st-modal-header { padding:16px 24px; background:#0e2554; display:flex; align-items:center; justify-content:space-between; }
        .st-modal-title { font-family:'Playfair Display',serif; font-size:15px; color:#fff; font-weight:700; }
        .st-modal-close { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.6); }
        .st-modal-body { padding:20px 24px; }
        .st-modal-canvas { width:100%; height:180px; border:1.5px solid #e4dfd4; border-radius:4px; background:#fff; cursor:crosshair; display:block; touch-action:none; }
        .st-modal-hint { font-size:10.5px; color:#9090aa; text-align:center; margin-top:6px; }
        .st-modal-footer { padding:14px 24px; border-top:1px solid #e4dfd4; display:flex; justify-content:space-between; align-items:center; background:#f8f6f1; }

        /* CERT TYPES TABLE */
        .st-cert-row { display:grid; grid-template-columns:minmax(0,1fr) 90px 100px 100px; align-items:center; padding:12px 22px; border-bottom:1px solid #f0ece4; }
        .st-cert-row:last-child { border-bottom:none; }
        .st-cert-name { font-size:12.5px; font-weight:600; }
        .st-cert-desc { font-size:10.5px; color:#9090aa; margin-top:1px; }
        .st-badge-active   { font-size:10.5px; background:#e8f5ee; color:#1a7a4a; border-radius:10px; padding:2px 10px; font-weight:700; display:inline-block; width:fit-content; }
        .st-badge-inactive { font-size:10.5px; background:#f0ece4; color:#9090aa; border-radius:10px; padding:2px 10px; font-weight:700; display:inline-block; width:fit-content; }
        .st-toggle-btn { background:none; border:1px solid #e4dfd4; border-radius:4px; padding:5px 14px; font-size:10.5px; cursor:pointer; font-family:inherit; color:#9090aa; }

        /* CERT CHIP SELECTOR */
        .st-cert-chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:22px; }
        .st-cert-chip { padding:7px 16px; border-radius:20px; font-size:11.5px; font-weight:600; cursor:pointer; border:1.5px solid #e4dfd4; color:#4a4a6a; background:#fff; transition:all .15s; }
        .st-cert-chip:hover { border-color:#0e2554; color:#0e2554; }
        .st-cert-chip.active { background:#0e2554; color:#fff; border-color:#0e2554; }


        @media (max-width:767px) {
            .st-form-grid-2  { grid-template-columns:1fr; }
            .st-esig-grid    { grid-template-columns:1fr; }
            .st-cert-row     { grid-template-columns:1fr auto; gap:8px; }
            .st-cert-row > span:first-of-type, .st-cert-row > span:last-of-type { grid-column: auto; }
            .st-modal { width:95vw; }
        }
        `;
        document.head.appendChild(el);
    }, []);
}

// ─── Cert types initial data ──────────────────────────────────
const INITIAL_CERT_TYPES = [
    {
        id: 1,
        name: "Barangay Clearance",
        desc: "Certifies good standing for general purposes",
        fee: true,
        active: true,
    },
    {
        id: 2,
        name: "Certificate of Residency",
        desc: "Certifies bona fide residency in the barangay",
        fee: false,
        active: true,
    },
    {
        id: 3,
        name: "Certificate of Indigency",
        desc: "For indigent families in the barangay",
        fee: false,
        active: true,
    },
    {
        id: 4,
        name: "Business Permit",
        desc: "Authorizes business operation in the barangay",
        fee: true,
        active: true,
    },
    {
        id: 5,
        name: "Good Moral Certificate",
        desc: "Certifies good moral character in the community",
        fee: false,
        active: true,
    },
    {
        id: 6,
        name: "Cert. of Live Birth (Endorsement)",
        desc: "Endorsement for late birth registration",
        fee: false,
        active: true,
    },
];

// ─── Signature Block Sub-component ───────────────────────────
function SigBlock({ id, label, sublabel, sig, onSet, onClear, onDraw }) {
    const fileRef = useRef();
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onSet(ev.target.result);
        reader.readAsDataURL(file);
    };
    return (
        <div className="st-esig-block">
            <div className="st-esig-label">
                {label}
                <span className={`st-esig-status ${sig ? "set" : "notset"}`}>
                    {sig ? "✓ Signature Set" : "● Not Set"}
                </span>
            </div>
            <div className="st-esig-sublabel">{sublabel}</div>
            <div className={`st-esig-wrap ${sig ? "has-sig" : ""}`}>
                {!sig && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            pointerEvents: "none",
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ccc"
                            strokeWidth="1.5"
                        >
                            <path d="M12 19l7-7 3 3-7 7-3-3z" />
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        </svg>
                        <span style={{ fontSize: 10, color: "#9090aa" }}>
                            No signature yet
                        </span>
                    </div>
                )}
                {sig && <img src={sig} alt="signature" />}
            </div>
            <div className="st-esig-actions">
                <button className="st-esig-btn draw" onClick={() => onDraw(id)}>
                    <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    </svg>
                    Draw Signature
                </button>
                <button
                    className="st-esig-btn upload"
                    onClick={() => fileRef.current.click()}
                >
                    <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    Upload Image
                </button>
                {sig && (
                    <button className="st-esig-btn clear" onClick={onClear}>
                        Clear
                    </button>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleFile}
                />
            </div>
            <div style={{ fontSize: 10, color: "#9090aa" }}>
                Accepted: PNG/JPG with transparent background recommended.
            </div>
        </div>
    );
}

// ─── Draw Signature Modal ─────────────────────────────────────
function DrawModal({ open, onClose, onSave }) {
    const canvasRef = useRef();
    const drawing = useRef(false);
    const last = useRef([0, 0]);
    const [color, setColor] = useState("#0e2554");
    const [thickness, setThickness] = useState(2);

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return [(cx - rect.left) * sx, (cy - rect.top) * sy];
    };

    const clearCanvas = () => {
        const c = canvasRef.current;
        if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
    };

    const handleSave = () => {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        onSave(dataUrl);
        onClose();
    };

    useEffect(() => {
        if (!open) return;
        clearCanvas();
    }, [open]);

    const startDraw = (e) => {
        e.preventDefault();
        drawing.current = true;
        last.current = getPos(e, canvasRef.current);
    };
    const draw = (e) => {
        e.preventDefault();
        if (!drawing.current) return;
        const ctx = canvasRef.current.getContext("2d");
        const [x, y] = getPos(e, canvasRef.current);
        ctx.beginPath();
        ctx.moveTo(last.current[0], last.current[1]);
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        last.current = [x, y];
    };
    const stopDraw = () => {
        drawing.current = false;
    };

    if (!open) return null;

    return (
        <div className="st-modal-overlay open">
            <div className="st-modal">
                <div className="st-modal-header">
                    <div className="st-modal-title">Draw Your Signature</div>
                    <button className="st-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="st-modal-body">
                    <canvas
                        ref={canvasRef}
                        className="st-modal-canvas"
                        width={472}
                        height={180}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                    />
                    <div className="st-modal-hint">
                        Draw your signature above using your mouse or stylus.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 14,
                            alignItems: "center",
                        }}
                    >
                        <label
                            style={{
                                fontSize: 11,
                                color: "#4a4a6a",
                                fontWeight: 600,
                            }}
                        >
                            Ink Color:
                        </label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{
                                width: 32,
                                height: 28,
                                border: "1px solid #e4dfd4",
                                borderRadius: 3,
                                cursor: "pointer",
                                padding: 2,
                            }}
                        />
                        <label
                            style={{
                                fontSize: 11,
                                color: "#4a4a6a",
                                fontWeight: 600,
                                marginLeft: 8,
                            }}
                        >
                            Thickness:
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            style={{ width: 80 }}
                        />
                        <button
                            onClick={clearCanvas}
                            style={{
                                marginLeft: "auto",
                                padding: "5px 14px",
                                background: "none",
                                border: "1.5px solid rgba(176,32,32,.3)",
                                color: "#b02020",
                                borderRadius: 3,
                                fontFamily: "inherit",
                                fontSize: 11,
                                cursor: "pointer",
                            }}
                        >
                            Clear Canvas
                        </button>
                    </div>
                </div>
                <div className="st-modal-footer">
                    <span style={{ fontSize: 11, color: "#9090aa" }}>
                        This will be saved as an image on your documents.
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: "8px 18px",
                                background: "none",
                                border: "1px solid #e4dfd4",
                                borderRadius: 4,
                                fontFamily: "inherit",
                                fontSize: 12,
                                cursor: "pointer",
                                color: "#4a4a6a",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: "8px 22px",
                                background:
                                    "linear-gradient(135deg,#163066,#091a3e)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1,
                                cursor: "pointer",
                            }}
                        >
                            Use Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────
export default function Settings({ admin, onNavigate, onLogout }) {
    useSettingsStyles();

    // layout
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;
    const [showMobile, setShowMobile] = useState(false);
    const [activePage, setActivePage] = useState("settings");

    const handleNavigate = (key) => {
        setActivePage(key);
        if (onNavigate) onNavigate(key);
    };

    // tabs
    const [activeTab, setActiveTab] = useState("branding");

    // branding – logos
    const [brgyLogo, setBrgyLogo] = useState(null);
    const [cityLogo, setCityLogo] = useState(null);
    const brgyFileRef = useRef();
    const cityFileRef = useRef();

    const handleLogoUpload = (e, setter) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setter(ev.target.result);
        reader.readAsDataURL(file);
    };

    // branding – barangay info
    const [brgyInfo, setBrgyInfo] = useState({
        name: "Barangay East Tapinac",
        city: "City of Olongapo",
        address: "54 - 14th Street corner Gallagher Street, Olongapo City",
        contact: "(047) 123-4567",
        email: "brgy.easttapinac@olongapo.gov.ph",
    });

    // branding – footer
    const [footer, setFooter] = useState({
        tagline: "Serbisyo Para sa Lahat ng Mamamayan",
        address: "54 - 14th Street corner Gallagher Street, Olongapo City",
        contact: "(047) 123-4567 | brgy.easttapinac@olongapo.gov.ph",
    });

    // branding – officials / e-signatures
    const [officials, setOfficials] = useState({
        captainName: "Hon. Dante L. Hondo",
        captainTitle: "Punong Barangay",
        secondaryName: "",
        secondaryTitle: "",
    });
    const [sig1, setSig1] = useState(null);
    const [sig2, setSig2] = useState(null);
    const [drawModal, setDrawModal] = useState({ open: false, target: null });

    // cert types
    const [certTypes, setCertTypes] = useState(INITIAL_CERT_TYPES);
    const toggleCert = (id) => {
        setCertTypes((prev) =>
            prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
        );
    };

    // cert template editor

    return (
        <div
            className="st-body"
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8f6f1",
            }}
        >
            {/* Sidebar */}
            {!isMobile && (
                <AdminSidebar
                    admin={admin}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={onLogout}
                    collapsed={isTablet}
                />
            )}
            {isMobile && showMobile && (
                <AdminMobileSidebar
                    admin={admin}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobile(false)}
                    onLogout={onLogout}
                />
            )}

            {/* Main */}
            <div
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Topbar */}
                <div
                    style={{
                        height: 62,
                        background: "#fff",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 32px",
                        gap: 16,
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        boxShadow: "0 1px 6px rgba(0,0,0,.06)",
                    }}
                >
                    {isMobile && (
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#4a4a6a",
                                padding: 4,
                            }}
                            onClick={() => setShowMobile(true)}
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 700,
                            color: "#0e2554",
                            flex: 1,
                        }}
                    >
                        System Settings
                        {!isMobile && (
                            <span
                                style={{
                                    fontSize: 12,
                                    fontFamily: "'Source Serif 4',serif",
                                    color: "#9090aa",
                                    fontWeight: 400,
                                    marginLeft: 10,
                                }}
                            >
                                Admin only · Barangay configuration
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: isMobile ? "16px" : "28px 32px",
                        flex: 1,
                    }}
                >
                    {/* TABS */}
                    <div className="st-tabs">
                        <button
                            className={`st-tab-btn${activeTab === "branding" ? " active" : ""}`}
                            onClick={() => setActiveTab("branding")}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
                            </svg>
                            Barangay Branding
                        </button>
                        <button
                            className={`st-tab-btn${activeTab === "templates" ? " active" : ""}`}
                            onClick={() => setActiveTab("templates")}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Certificate Templates
                        </button>
                    </div>

                    {/* ══ TAB: BRANDING ══ */}
                    {activeTab === "branding" && (
                        <>
                            {/* SEALS & LOGOS */}
                            <div className="st-panel">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Seals &amp; Logos
                                        </div>
                                        <div className="st-panel-desc">
                                            Both seals appear on all generated
                                            certificates — barangay seal on
                                            top-left, city seal on top-right.
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: isMobile
                                            ? "1fr"
                                            : "1fr 1fr",
                                        borderBottom: "1px solid #e4dfd4",
                                    }}
                                >
                                    {/* Barangay Seal */}
                                    <div
                                        style={{
                                            padding: 24,
                                            borderRight: isMobile
                                                ? "none"
                                                : "1px solid #e4dfd4",
                                            borderBottom: isMobile
                                                ? "1px solid #e4dfd4"
                                                : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: 600,
                                                color: "#4a4a6a",
                                                letterSpacing: "1.2px",
                                                textTransform: "uppercase",
                                                marginBottom: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    background: "#0e2554",
                                                    borderRadius: 2,
                                                }}
                                            />
                                            Barangay Seal — Top Left
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 24,
                                            }}
                                        >
                                            <div className="st-logo-preview">
                                                {brgyLogo ? (
                                                    <img
                                                        src={brgyLogo}
                                                        alt="Barangay Seal"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            color: "#9090aa",
                                                        }}
                                                    >
                                                        <svg
                                                            width="28"
                                                            height="28"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ccc"
                                                            strokeWidth="1.5"
                                                        >
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                            />
                                                            <circle
                                                                cx="8.5"
                                                                cy="8.5"
                                                                r="1.5"
                                                            />
                                                            <polyline points="21 15 16 10 5 21" />
                                                        </svg>
                                                        <span
                                                            style={{
                                                                fontSize: 9,
                                                                letterSpacing: 1,
                                                                textTransform:
                                                                    "uppercase",
                                                            }}
                                                        >
                                                            No Seal
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#1a1a2e",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Barangay Seal
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "11.5px",
                                                        color: "#9090aa",
                                                        lineHeight: 1.6,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    Appears on login page,
                                                    sidebar, and top-left of all
                                                    certificates.
                                                    <br />
                                                    PNG/JPG/SVG · 300×300px ·
                                                    Max 2MB
                                                </p>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="st-upload-btn"
                                                        onClick={() =>
                                                            brgyFileRef.current.click()
                                                        }
                                                    >
                                                        <svg
                                                            width="13"
                                                            height="13"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <polyline points="16 16 12 12 8 16" />
                                                            <line
                                                                x1="12"
                                                                y1="12"
                                                                x2="12"
                                                                y2="21"
                                                            />
                                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                                        </svg>
                                                        Upload
                                                    </button>
                                                    {brgyLogo && (
                                                        <button
                                                            className="st-upload-btn-secondary"
                                                            onClick={() =>
                                                                setBrgyLogo(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={brgyFileRef}
                                                        type="file"
                                                        accept="image/*"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onChange={(e) =>
                                                            handleLogoUpload(
                                                                e,
                                                                setBrgyLogo,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* City Seal */}
                                    <div style={{ padding: 24 }}>
                                        <div
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: 600,
                                                color: "#4a4a6a",
                                                letterSpacing: "1.2px",
                                                textTransform: "uppercase",
                                                marginBottom: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    background: "#c9a227",
                                                    borderRadius: 2,
                                                }}
                                            />
                                            City / Municipal Seal — Top Right
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 24,
                                            }}
                                        >
                                            <div
                                                className="st-logo-preview"
                                                style={{
                                                    borderStyle: cityLogo
                                                        ? "solid"
                                                        : "dashed",
                                                }}
                                            >
                                                {cityLogo ? (
                                                    <img
                                                        src={cityLogo}
                                                        alt="City Seal"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            color: "#9090aa",
                                                        }}
                                                    >
                                                        <svg
                                                            width="28"
                                                            height="28"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ccc"
                                                            strokeWidth="1.5"
                                                        >
                                                            <rect
                                                                x="3"
                                                                y="3"
                                                                width="18"
                                                                height="18"
                                                                rx="2"
                                                            />
                                                            <circle
                                                                cx="8.5"
                                                                cy="8.5"
                                                                r="1.5"
                                                            />
                                                            <polyline points="21 15 16 10 5 21" />
                                                        </svg>
                                                        <span
                                                            style={{
                                                                fontSize: 9,
                                                                letterSpacing: 1,
                                                                textTransform:
                                                                    "uppercase",
                                                            }}
                                                        >
                                                            No Seal
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#1a1a2e",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    City / Municipal Seal
                                                </h4>
                                                <p
                                                    style={{
                                                        fontSize: "11.5px",
                                                        color: "#9090aa",
                                                        lineHeight: 1.6,
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    Appears on top-right of all
                                                    generated certificates and
                                                    permits.
                                                    <br />
                                                    PNG/JPG/SVG · 300×300px ·
                                                    Max 2MB
                                                </p>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        className="st-upload-btn"
                                                        onClick={() =>
                                                            cityFileRef.current.click()
                                                        }
                                                    >
                                                        <svg
                                                            width="13"
                                                            height="13"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <polyline points="16 16 12 12 8 16" />
                                                            <line
                                                                x1="12"
                                                                y1="12"
                                                                x2="12"
                                                                y2="21"
                                                            />
                                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                                        </svg>
                                                        Upload
                                                    </button>
                                                    {cityLogo && (
                                                        <button
                                                            className="st-upload-btn-secondary"
                                                            onClick={() =>
                                                                setCityLogo(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={cityFileRef}
                                                        type="file"
                                                        accept="image/*"
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        onChange={(e) =>
                                                            handleLogoUpload(
                                                                e,
                                                                setCityLogo,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Certificate Layout Preview */}
                                <div
                                    style={{
                                        padding: "20px 24px",
                                        background: "#f8f6f1",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9090aa",
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            fontWeight: 600,
                                            marginBottom: 12,
                                        }}
                                    >
                                        Certificate Layout Preview
                                    </div>
                                    <div
                                        style={{
                                            background: "#fff",
                                            border: "1px solid #e4dfd4",
                                            borderRadius: 4,
                                            overflow: "hidden",
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            style={{
                                                padding: "18px 28px 14px",
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "72px 1fr 72px",
                                                alignItems: "center",
                                                gap: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 68,
                                                    height: 68,
                                                    borderRadius: "50%",
                                                    border: "1.5px solid #e4dfd4",
                                                    overflow: "hidden",
                                                    background: "#f8f6f1",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {brgyLogo ? (
                                                    <img
                                                        src={brgyLogo}
                                                        style={{
                                                            width: 66,
                                                            height: 66,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#ccc"
                                                        strokeWidth="1.5"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="3"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                        />
                                                        <circle
                                                            cx="8.5"
                                                            cy="8.5"
                                                            r="1.5"
                                                        />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div
                                                style={{ textAlign: "center" }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 8,
                                                        color: "#9090aa",
                                                        letterSpacing: 2,
                                                        textTransform:
                                                            "uppercase",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Republic of the Philippines
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Playfair Display',serif",
                                                        fontSize: 14,
                                                        fontWeight: 700,
                                                        color: "#0e2554",
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {brgyInfo.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        color: "#4a4a6a",
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    {brgyInfo.city}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        color: "#4a4a6a",
                                                        letterSpacing: 1,
                                                        textTransform:
                                                            "uppercase",
                                                        marginTop: 5,
                                                    }}
                                                >
                                                    Office of the Punong
                                                    Barangay
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    width: 68,
                                                    height: 68,
                                                    borderRadius: "50%",
                                                    border: "1.5px dashed #e4dfd4",
                                                    overflow: "hidden",
                                                    background: "#f8f6f1",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                    marginLeft: "auto",
                                                }}
                                            >
                                                {cityLogo ? (
                                                    <img
                                                        src={cityLogo}
                                                        style={{
                                                            width: 66,
                                                            height: 66,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#ccc"
                                                        strokeWidth="1.5"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="3"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                        />
                                                        <circle
                                                            cx="8.5"
                                                            cy="8.5"
                                                            r="1.5"
                                                        />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                height: 3,
                                                background: "#c0392b",
                                            }}
                                        />
                                        <div
                                            style={{
                                                height: 2,
                                                background: "#c9a227",
                                            }}
                                        />
                                        <div
                                            style={{
                                                padding: "20px 32px",
                                                minHeight: 60,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    color: "#ccc",
                                                    fontSize: 11,
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                — Certificate content goes here
                                                —
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                height: 2,
                                                background: "#c9a227",
                                            }}
                                        />
                                        <div
                                            style={{
                                                height: 3,
                                                background: "#c0392b",
                                            }}
                                        />
                                        <div
                                            style={{
                                                padding: "10px 24px 14px",
                                                textAlign: "center",
                                                background: "#fff",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 13,
                                                    fontStyle: "italic",
                                                    color: "#1a1a2e",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                "{footer.tagline}"
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                {footer.address}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: "#9090aa",
                                                    marginTop: 1,
                                                }}
                                            >
                                                {footer.contact}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9090aa",
                                            marginTop: 8,
                                            textAlign: "center",
                                        }}
                                    >
                                        This header and footer appear on every
                                        generated certificate and permit.
                                    </div>
                                </div>
                            </div>

                            {/* BARANGAY INFO */}
                            <div className="st-panel">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Barangay Information
                                        </div>
                                        <div className="st-panel-desc">
                                            Displayed on certificates, permits,
                                            and system headers.
                                        </div>
                                    </div>
                                </div>
                                <div className="st-panel-body">
                                    <div
                                        className="st-form-grid-2"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                Barangay Name{" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={brgyInfo.name}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                City / Municipality{" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={brgyInfo.city}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        city: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="st-form-grid-1"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                Full Address{" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={brgyInfo.address}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="st-form-grid-2">
                                        <div className="st-field">
                                            <label>Contact Number</label>
                                            <input
                                                type="text"
                                                value={brgyInfo.contact}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        contact: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>Email Address</label>
                                            <input
                                                type="text"
                                                value={brgyInfo.email}
                                                onChange={(e) =>
                                                    setBrgyInfo({
                                                        ...brgyInfo,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="st-save-bar">
                                    <p>
                                        <strong>Note:</strong> Changes will
                                        reflect on all new certificates
                                        immediately.
                                    </p>
                                    <div>
                                        <button className="st-btn-cancel">
                                            Cancel
                                        </button>
                                        <button className="st-btn-save">
                                            <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save Branding
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CERTIFICATE FOOTER */}
                            <div className="st-panel">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Certificate Footer
                                        </div>
                                        <div className="st-panel-desc">
                                            Tagline and contact info shown at
                                            the bottom of every certificate and
                                            permit.
                                        </div>
                                    </div>
                                </div>
                                <div className="st-panel-body">
                                    <div
                                        className="st-form-grid-1"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                Barangay Tagline / Motto
                                            </label>
                                            <input
                                                type="text"
                                                value={footer.tagline}
                                                onChange={(e) =>
                                                    setFooter({
                                                        ...footer,
                                                        tagline: e.target.value,
                                                    })
                                                }
                                                placeholder='e.g. "Serbisyo Para sa Lahat"'
                                            />
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: "#9090aa",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Displayed in italic inside
                                                quotation marks at the bottom of
                                                the certificate.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="st-form-grid-2">
                                        <div className="st-field">
                                            <label>Footer Address Line</label>
                                            <input
                                                type="text"
                                                value={footer.address}
                                                onChange={(e) =>
                                                    setFooter({
                                                        ...footer,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                Footer Contact / Email
                                            </label>
                                            <input
                                                type="text"
                                                value={footer.contact}
                                                onChange={(e) =>
                                                    setFooter({
                                                        ...footer,
                                                        contact: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="st-save-bar">
                                    <p>
                                        <strong>Note:</strong> Footer updates
                                        appear on newly generated certificates
                                        only.
                                    </p>
                                    <div>
                                        <button className="st-btn-cancel">
                                            Cancel
                                        </button>
                                        <button className="st-btn-save">
                                            <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save Footer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SIGNATORY OFFICIALS */}
                            <div className="st-panel">
                                <div className="st-panel-header">
                                    <div>
                                        <div className="st-panel-title">
                                            Signatory Officials
                                        </div>
                                        <div className="st-panel-desc">
                                            Names that appear on the signature
                                            block of all issued documents.
                                        </div>
                                    </div>
                                </div>
                                <div className="st-panel-body">
                                    <div
                                        className="st-form-grid-2"
                                        style={{ marginBottom: 18 }}
                                    >
                                        <div className="st-field">
                                            <label>
                                                Punong Barangay (Captain){" "}
                                                <span className="req">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.captainName}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        captainName:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>Captain's Title</label>
                                            <input
                                                type="text"
                                                value={officials.captainTitle}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        captainTitle:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="st-form-grid-2">
                                        <div className="st-field">
                                            <label>
                                                Secondary Signatory (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.secondaryName}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        secondaryName:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Barangay Secretary"
                                            />
                                        </div>
                                        <div className="st-field">
                                            <label>
                                                Secondary Signatory Title
                                            </label>
                                            <input
                                                type="text"
                                                value={officials.secondaryTitle}
                                                onChange={(e) =>
                                                    setOfficials({
                                                        ...officials,
                                                        secondaryTitle:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Barangay Secretary"
                                            />
                                        </div>
                                    </div>

                                    {/* E-Signatures */}
                                    <div className="st-esig-grid">
                                        <SigBlock
                                            id="esig1"
                                            label="E-Signature — Punong Barangay"
                                            sublabel="Appears above the captain's name on all certificates."
                                            sig={sig1}
                                            onSet={setSig1}
                                            onClear={() => setSig1(null)}
                                            onDraw={(id) =>
                                                setDrawModal({
                                                    open: true,
                                                    target: id,
                                                })
                                            }
                                        />
                                        <SigBlock
                                            id="esig2"
                                            label="E-Signature — Secondary (Optional)"
                                            sublabel="Only shown if a secondary signatory is set above."
                                            sig={sig2}
                                            onSet={setSig2}
                                            onClear={() => setSig2(null)}
                                            onDraw={(id) =>
                                                setDrawModal({
                                                    open: true,
                                                    target: id,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="st-save-bar">
                                    <p>
                                        <strong>Note:</strong> Signatory names
                                        and e-signatures appear on the signature
                                        block of all documents.
                                    </p>
                                    <div>
                                        <button className="st-btn-cancel">
                                            Cancel
                                        </button>
                                        <button className="st-btn-save">
                                            <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save Officials
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ══ TAB: TEMPLATES ══ */}
                    {activeTab === "templates" && (
                        <>
                            {/* CERT TYPES TABLE */}
                            <div
                                className="st-panel"
                                style={{
                                    marginBottom: 20,
                                    borderColor: "#d4c8f0",
                                }}
                            >
                                <div
                                    className="st-panel-header"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,#f3eeff,#ede8ff)",
                                        borderBottomColor: "#d4c8f0",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 28,
                                                height: 28,
                                                background: "#6a3db8",
                                                borderRadius: 5,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="2"
                                            >
                                                <rect
                                                    x="3"
                                                    y="11"
                                                    width="18"
                                                    height="11"
                                                    rx="2"
                                                />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div
                                                className="st-panel-title"
                                                style={{
                                                    color: "#4a1fa8",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                Certificate &amp; Permit Types
                                                <span
                                                    style={{
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        background:
                                                            "rgba(201,162,39,.2)",
                                                        color: "#c9a227",
                                                        border: "1px solid rgba(201,162,39,.35)",
                                                        borderRadius: 10,
                                                        padding: "1px 8px",
                                                        letterSpacing: 1,
                                                    }}
                                                >
                                                    ADMIN ONLY
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#7a5ab8",
                                                    marginTop: 2,
                                                }}
                                            >
                                                Templates are hardcoded. Enable
                                                or disable types to control what
                                                staff can issue.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    {/* Table header */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "minmax(0,1fr) 90px 100px 100px",
                                            background: "#f8f6f1",
                                            borderBottom: "1px solid #e4dfd4",
                                            padding: "9px 22px",
                                        }}
                                    >
                                        {[
                                            "Certificate / Permit Name",
                                            "Fee",
                                            "Status",
                                            "Action",
                                        ].map((h) => (
                                            <span
                                                key={h}
                                                style={{
                                                    fontSize: "9.5px",
                                                    fontWeight: 600,
                                                    color: "#9090aa",
                                                    letterSpacing: 1,
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                    {certTypes.map((ct) => (
                                        <div
                                            key={ct.id}
                                            className="st-cert-row"
                                            style={{
                                                opacity: ct.active ? 1 : 0.55,
                                            }}
                                        >
                                            <div>
                                                <div className="st-cert-name">
                                                    {ct.name}
                                                </div>
                                                <div className="st-cert-desc">
                                                    {ct.desc}
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: ct.fee
                                                        ? "#b86800"
                                                        : "#9090aa",
                                                    fontWeight: ct.fee
                                                        ? 600
                                                        : 400,
                                                }}
                                            >
                                                {ct.fee ? "₱ Fee" : "No fee"}
                                            </span>
                                            <span
                                                className={
                                                    ct.active
                                                        ? "st-badge-active"
                                                        : "st-badge-inactive"
                                                }
                                            >
                                                {ct.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                            <button
                                                className="st-toggle-btn"
                                                style={{
                                                    color: ct.active
                                                        ? "#9090aa"
                                                        : "#1a7a4a",
                                                }}
                                                onClick={() =>
                                                    toggleCert(ct.id)
                                                }
                                            >
                                                {ct.active
                                                    ? "Disable"
                                                    : "Enable"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        padding: "10px 22px",
                                        background: "#f8f6f1",
                                        borderTop: "1px solid #e4dfd4",
                                        fontSize: 11,
                                        color: "#9090aa",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line
                                            x1="12"
                                            y1="16"
                                            x2="12.01"
                                            y2="16"
                                        />
                                    </svg>
                                    Disabling a type hides it from the staff
                                    cert picker. Templates are managed in the
                                    backend source code.
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Draw Signature Modal */}
            <DrawModal
                open={drawModal.open}
                onClose={() => setDrawModal({ open: false, target: null })}
                onSave={(dataUrl) => {
                    if (drawModal.target === "esig1") setSig1(dataUrl);
                    if (drawModal.target === "esig2") setSig2(dataUrl);
                }}
            />
        </div>
    );
}
