// =============================================================
// FILE: client/src/pages/admin/ResidentRecords.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/residents?search=&status=&sort=&page=&limit=
//     → { residents: [...], total, page, totalPages }
//   - GET /api/residents/:id → full resident profile for drawer
//   - GET /api/residents/:id/requests → request history
//   - GET /api/residents/stats → { total, active, newThisMonth, totalRequests }
//   - All endpoints require adminToken in Authorization header
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
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
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Printer,
    Scissors,
    AlertCircle,
    Menu,
} from "lucide-react";

import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";

// TODO: import { useAdminAuth } from "../../context/AdminAuthContext";
// TODO: import { getResidents, getResidentById } from "../../services/residentService";

// =============================================================
// useWindowSize
// =============================================================
function useWindowSize() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    return width;
}

// =============================================================
// Inject styles once
// =============================================================
if (!document.head.querySelector("[data-cf-rr]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-rr", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes sidebarSlideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes drawerSlideIn  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes drawerSlideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes modalFadeIn    { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }
    .rr-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .rr-nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      font-size:12.5px; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; text-align:left; font-family:'Source Serif 4',serif;
    }
    .rr-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .rr-nav-item.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .rr-nav-item-icon {
      display:flex; align-items:center; justify-content:center; padding:10px 0;
      color:rgba(255,255,255,0.65); cursor:pointer; border-left:3px solid transparent;
      transition:all 0.15s; background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; font-family:'Source Serif 4',serif;
    }
    .rr-nav-item-icon:hover { background:rgba(255,255,255,0.06); }
    .rr-nav-item-icon.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    /* Table rows */
    .rr-res-row {
  display: grid;
  align-items: center;
  padding: 13px 22px;
  border-bottom: 1px solid #f0ece4;
  gap: 16px; /* 👈 adds consistent spacing */
}
    .rr-res-row:last-child { border-bottom:none; }
    .rr-res-row:hover { background:#faf8f4; }
    /* Pagination */
    .rr-pg-btn {
      min-width:32px; height:32px; padding:0 10px;
      border:1.5px solid #e4dfd4; border-radius:4px;
      background:#fff; font-size:12px; color:#4a4a6a;
      cursor:pointer; font-family:'Source Serif 4',serif;
      display:inline-flex; align-items:center; justify-content:center;
      transition:all .15s;
    }
    .rr-pg-btn:hover:not(:disabled) { background:#f8f6f1; border-color:#0e2554; color:#0e2554; }
    .rr-pg-btn.active { background:#0e2554; color:#fff; border-color:#0e2554; font-weight:700; }
    .rr-pg-btn:disabled { opacity:.35; cursor:not-allowed; }
    /* Drawer */
    .rr-drawer {
      position:fixed; top:0; right:0; bottom:0; width:520px;
      background:#fff; z-index:501; display:flex; flex-direction:column;
      box-shadow:-8px 0 32px rgba(0,0,0,.14);
      animation:drawerSlideIn .25s cubic-bezier(.4,0,.2,1) both;
    }
    .rr-drawer-mobile {
      position:fixed; left:0; right:0; bottom:0; max-height:92vh;
      background:#fff; z-index:501; display:flex; flex-direction:column;
      box-shadow:0 -8px 32px rgba(0,0,0,.14); border-radius:16px 16px 0 0;
      animation:drawerSlideUp .25s cubic-bezier(.4,0,.2,1) both;
    }
    .rr-drawer-body { flex:1; overflow-y:auto; padding:20px 24px; }
    .rr-drawer-body::-webkit-scrollbar { width:4px; }
    .rr-drawer-body::-webkit-scrollbar-thumb { background:#e4dfd4; border-radius:4px; }
    /* Drawer tabs */
    .rr-dtab {
      padding:11px 0; margin-right:24px; font-size:12px; font-weight:600;
      color:#9090aa; cursor:pointer; border-bottom:2px solid transparent;
      transition:all .15s; background:none; border-left:none; border-right:none; border-top:none;
      font-family:'Source Serif 4',serif;
    }
    .rr-dtab:hover { color:#1a1a2e; }
    .rr-dtab.active { color:#0e2554; border-bottom-color:#0e2554; }
    /* Profile fields */
    .rr-pf-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px 20px; margin-bottom:20px; }
    .rr-pf-field label { font-size:9.5px; font-weight:600; color:#9090aa; letter-spacing:1px; text-transform:uppercase; display:block; margin-bottom:4px; font-family:'Source Serif 4',serif; }
    .rr-pf-val { font-size:13px; color:#1a1a2e; font-weight:600; font-family:'Source Serif 4',serif; }
    /* History table */
    .rr-hist-table { width:100%; border-collapse:collapse; }
    .rr-hist-table th { font-size:9.5px; font-weight:600; color:#9090aa; letter-spacing:1px; text-transform:uppercase; padding:8px 14px; background:#f8f6f1; border-bottom:1px solid #e4dfd4; text-align:left; }
    .rr-hist-table td { padding:11px 14px; font-size:12px; border-bottom:1px solid #f0ece4; color:#1a1a2e; }
    .rr-hist-table tr:last-child td { border-bottom:none; }
    /* Filter inputs */
    .rr-search-input {
      width:100%; padding:8px 12px 8px 34px; border:1.5px solid #e4dfd4;
      border-radius:4px; font-family:'Source Serif 4',serif; font-size:12.5px;
      color:#1a1a2e; outline:none; transition:border-color .15s; background:#fff;
    }
    .rr-search-input:focus { border-color:#0e2554; }
    .rr-select {
      padding:8px 12px; border:1.5px solid #e4dfd4; border-radius:4px;
      font-family:'Source Serif 4',serif; font-size:12px; color:#1a1a2e;
      background:#fff; outline:none; cursor:pointer;
    }
    .rr-select:focus { border-color:#0e2554; }
    /* View btn */
    .rr-view-btn {
      background:none; border:1px solid #e4dfd4; border-radius:4px;
      padding:5px 12px; font-size:10.5px; color:#0e2554; cursor:pointer;
      font-family:'Source Serif 4',serif; transition:all .15s;
    }
    .rr-view-btn:hover { background:#0e2554; color:#fff; border-color:#0e2554; }
    /* Print card btn */
    .rr-print-card-btn {
      display:inline-flex; align-items:center; gap:7px; padding:10px 18px;
      background:linear-gradient(135deg,#163066,#091a3e); color:#fff; border:none; border-radius:4px;
      font-size:12px; font-weight:700; cursor:pointer; font-family:'Playfair Display',serif;
      letter-spacing:1px; text-transform:uppercase; transition:opacity .15s;
    }
    .rr-print-card-btn:hover { opacity:.88; }

    /* ── Admin-side QR print sheet (hidden on screen, shown on print) ── */
    #rr-qr-print-sheet { display: none; }
    @media print {
        .rr-root { display: none !important; }
        #rr-qr-print-sheet { display: block !important; }
        @page { size: A4 portrait; margin: 10mm; }
        #rr-qr-print-sheet { font-family: 'Source Serif 4', Georgia, serif; }
        .rr-ps-title  { font-size:9pt; color:#666; text-align:center; margin-bottom:4mm; }
        .rr-ps-hint   { font-size:7.5pt; color:#999; text-align:center; margin-bottom:6mm; }
        .rr-ps-grid   { display:grid; grid-template-columns:repeat(3,54mm); grid-template-rows:repeat(2,85.6mm); gap:5mm; justify-content:center; }
        .rr-wc        { width:54mm; height:85.6mm; border:1px dashed #bbb; border-radius:3mm; overflow:hidden; display:flex; flex-direction:column; background:#fff; page-break-inside:avoid; }
        .rr-wc-head   { background:#0e2554; padding:2mm 3mm; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .rr-wc-brand  { font-size:7pt; font-weight:700; color:#fff; font-family:Georgia,serif; line-height:1.2; }
        .rr-wc-sub    { font-size:5pt; color:rgba(201,162,39,0.9); letter-spacing:.4px; text-transform:uppercase; margin-top:.3mm; }
        .rr-wc-gold   { height:1.2mm; background:linear-gradient(90deg,#c9a227,#f0d060,#c9a227); flex-shrink:0; }
        .rr-wc-body   { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5mm 2.5mm 1.5mm; gap:1.8mm; }
        .rr-wc-name   { font-size:7.5pt; font-weight:700; color:#0e2554; text-align:center; line-height:1.2; font-family:Georgia,serif; }
        .rr-wc-id     { font-size:5.5pt; color:#888; text-align:center; }
        .rr-wc-qr     { padding:1.5mm; border:.5px solid #ddd; border-radius:1mm; background:#fff; }
        .rr-wc-addr   { font-size:5pt; color:#888; text-align:center; line-height:1.3; }
        .rr-wc-foot   { background:#f8f6f1; border-top:.5px solid #e4dfd4; padding:1.2mm 2.5mm; font-size:4.8pt; color:#aaa; text-align:center; line-height:1.4; flex-shrink:0; }
        .rr-ps-cut    { font-size:7pt; color:#bbb; text-align:center; margin-top:5mm; padding-top:3mm; border-top:1px dashed #ddd; }
    }
    /* QR Card wallet */
    .rr-wallet-card {
      width:420px; height:265px; border-radius:10px; overflow:hidden;
      position:relative; outline:2px dashed #aaa; outline-offset:4px;
      box-shadow:0 3px 14px rgba(0,0,0,.15); flex-shrink:0; background:#fff;
    }
    .rr-card-front {
      width:100%; height:100%; background:#fff; display:flex; flex-direction:column;
      overflow:hidden; padding:11px 13px; position:relative; border-radius:10px;
    }
    .rr-card-back { width:100%; height:100%; background:#fff; border-radius:10px; }
    /* Logout btn */
    .rr-logout-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); padding:4px; transition:color .15s; display:flex; align-items:center; }
    .rr-logout-btn:hover { color:rgba(255,255,255,.7); }
    /* Mobile resident card */
    .rr-mob-card { padding:14px 16px; border-bottom:1px solid #f0ece4; cursor:pointer; transition:background .1s; }
    .rr-mob-card:hover { background:#faf8f4; }
    .rr-mob-card:last-child { border-bottom:none; }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Mock data
// TODO: Replace with GET /api/residents and GET /api/residents/stats
// =============================================================
const MOCK_RESIDENTS = [
    {
        id: "#RES-0042",
        name: "Maria Reyes Santos",
        addr: "12 Rizal Street, East Tapinac",
        contact: "09171234567",
        date: "Jan 5, 2025",
        requests: 7,
        status: "Active",
        dob: "June 14, 1985",
        civil: "Married",
        nationality: "Filipino",
        email: "maria.santos@email.com",
        qr: "QR-ET-2025-0042",
    },
    {
        id: "#RES-0081",
        name: "Jose Dela Cruz Jr.",
        addr: "45 Magsaysay Ave, East Tapinac",
        contact: "09281234567",
        date: "Feb 12, 2025",
        requests: 4,
        status: "Active",
        dob: "March 3, 1990",
        civil: "Single",
        nationality: "Filipino",
        email: "jdc.jr@email.com",
        qr: "QR-ET-2025-0081",
    },
    {
        id: "#RES-0113",
        name: "Ana Liza Mendoza",
        addr: "8 Aguinaldo St., East Tapinac",
        contact: "09351234567",
        date: "Mar 1, 2025",
        requests: 2,
        status: "Active",
        dob: "Sept 22, 1998",
        civil: "Single",
        nationality: "Filipino",
        email: "ana.mendoza@email.com",
        qr: "QR-ET-2025-0113",
    },
    {
        id: "#RES-0055",
        name: "Roberto Villanueva",
        addr: "99 Burgos Ext., East Tapinac",
        contact: "09191234567",
        date: "Jan 18, 2025",
        requests: 9,
        status: "Active",
        dob: "July 7, 1978",
        civil: "Married",
        nationality: "Filipino",
        email: "rob.villa@email.com",
        qr: "QR-ET-2025-0055",
    },
    {
        id: "#RES-0204",
        name: "Carla Mae Bautista",
        addr: "3 Luna Street, East Tapinac",
        contact: "09451234567",
        date: "Apr 20, 2025",
        requests: 1,
        status: "Active",
        dob: "Nov 30, 2001",
        civil: "Single",
        nationality: "Filipino",
        email: "carla.mb@email.com",
        qr: "QR-ET-2025-0204",
    },
    {
        id: "#RES-0017",
        name: "Fernando Ocampo III",
        addr: "22 Mabini Street, East Tapinac",
        contact: "09261234567",
        date: "Dec 10, 2024",
        requests: 12,
        status: "Active",
        dob: "Feb 14, 1972",
        civil: "Widowed",
        nationality: "Filipino",
        email: "fern.ocampo@email.com",
        qr: "QR-ET-2024-0017",
    },
    {
        id: "#RES-0330",
        name: "Liza Gomez Aquino",
        addr: "67 Del Pilar St., East Tapinac",
        contact: "09111234567",
        date: "Jun 5, 2025",
        requests: 3,
        status: "Active",
        dob: "Aug 19, 1995",
        civil: "Married",
        nationality: "Filipino",
        email: "liza.aquino@email.com",
        qr: "QR-ET-2025-0330",
    },
    {
        id: "#RES-0009",
        name: "Danilo Ramos Pascual",
        addr: "101 Rizal Ave., East Tapinac",
        contact: "09321234567",
        date: "Nov 3, 2024",
        requests: 5,
        status: "Inactive",
        dob: "Jan 1, 1968",
        civil: "Separated",
        nationality: "Filipino",
        email: "danilo.rp@email.com",
        qr: "QR-ET-2024-0009",
    },
    {
        id: "#RES-0412",
        name: "Sheila Marie Torres",
        addr: "15 Quezon Blvd., East Tapinac",
        contact: "09211234567",
        date: "Jul 14, 2025",
        requests: 2,
        status: "Active",
        dob: "May 25, 2000",
        civil: "Single",
        nationality: "Filipino",
        email: "sheila.torres@email.com",
        qr: "QR-ET-2025-0412",
    },
    {
        id: "#RES-0188",
        name: "Benjamin Cruz Lopez",
        addr: "54 Gallagher Street, East Tapinac",
        contact: "09481234567",
        date: "Mar 22, 2025",
        requests: 6,
        status: "Active",
        dob: "Oct 10, 1983",
        civil: "Married",
        nationality: "Filipino",
        email: "ben.cl@email.com",
        qr: "QR-ET-2025-0188",
    },
];

const MOCK_HISTORY = [
    { cert: "Barangay Clearance", date: "Mar 10, 2026", status: "released" },
    {
        cert: "Certificate of Residency",
        date: "Jan 22, 2026",
        status: "released",
    },
    { cert: "Good Moral Certificate", date: "Nov 3, 2025", status: "released" },
    {
        cert: "Certificate of Indigency",
        date: "Sep 14, 2025",
        status: "released",
    },
    { cert: "Barangay Clearance", date: "Jul 8, 2025", status: "released" },
    { cert: "Business Permit", date: "Apr 2, 2025", status: "rejected" },
    {
        cert: "Certificate of Residency",
        date: "Jan 5, 2025",
        status: "released",
    },
];

const HIST_BADGE = {
    released: { bg: "#e8f5ee", color: "#1a7a4a", label: "Released" },
    rejected: { bg: "#fdecea", color: "#b02020", label: "Rejected" },
    pending: { bg: "#fff3e0", color: "#b86800", label: "Pending" },
    approved: { bg: "#e8eef8", color: "#1a4a8a", label: "Approved" },
    ready: { bg: "#e8eef8", color: "#1a4a8a", label: "Ready" },
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25];

function initials(name) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
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
function calcAge(dob) {
    try {
        return 2026 - parseInt(dob.split(", ")[1]);
    } catch {
        return "—";
    }
}

// =============================================================
// WalletCard — one CR80 card used inside the admin print sheet
// =============================================================
function WalletCard({ name, residentId, qrValue }) {
    return (
        <div className="rr-wc">
            <div className="rr-wc-head">
                <div>
                    <div className="rr-wc-brand">CertiFast</div>
                    <div className="rr-wc-sub">Brgy. East Tapinac</div>
                </div>
                <img src="/logo.png" alt="" style={{ width: "6mm", height: "6mm", borderRadius: "50%", objectFit: "cover", opacity: 0.9 }} />
            </div>
            <div className="rr-wc-gold" />
            <div className="rr-wc-body">
                <div className="rr-wc-name">{name}</div>
                <div className="rr-wc-id">ID: {residentId}</div>
                <div className="rr-wc-qr">
                    <QRCodeSVG value={qrValue} size={108} level="H" includeMargin={false} fgColor="#0e2554" bgColor="#ffffff" />
                </div>
                <div className="rr-wc-addr">Olongapo City, Zambales</div>
            </div>
            <div className="rr-wc-foot">Show to staff when claiming certificate.</div>
        </div>
    );
}

// =============================================================
// QRCardModal — previews the resident-side QR card design
// and prints 6 wallet cards on A4 via window.print()
// =============================================================
function QRCardModal({ resident, onClose }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const fn = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", fn);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [onClose]);

    const qrValue = `certifast:resident:${resident.id}`;

    return (
        <>
        {/* ── Modal ── */}
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(9,26,62,.6)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: "#fff", borderRadius: 8, width: "100%", maxWidth: 480, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.22)", animation: "modalFadeIn .2s ease both" }}>

                {/* Header */}
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #e4dfd4", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #0e2554, #163066)" }}>
                    <div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>Resident QR Card</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{resident.name} · {resident.id}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 4, display: "flex" }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ height: 3, background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)" }} />

                {/* Card preview — same design as resident's My QR page */}
                <div style={{ padding: "24px 24px 16px" }}>
                    <div style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 10, overflow: "hidden", marginBottom: 14, maxWidth: 340, margin: "0 auto 14px" }}>
                        {/* Card header */}
                        <div style={{ background: "linear-gradient(135deg, #0e2554, #163066)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>CertiFast</div>
                                <div style={{ fontSize: 8, color: "rgba(201,162,39,0.8)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 1 }}>Barangay East Tapinac</div>
                            </div>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(201,162,39,0.5)", overflow: "hidden" }}>
                                <img src="/logo.png" alt="Seal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        </div>
                        <div style={{ height: 3, background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)" }} />

                        {/* QR + name */}
                        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#0e2554" }}>{resident.name}</div>
                                <div style={{ fontSize: 10, color: "#9090aa", marginTop: 2 }}>ID: <span style={{ fontWeight: 600, color: "#4a4a6a" }}>{resident.id}</span></div>
                            </div>
                            {/* QR with gold corner brackets */}
                            <div style={{ padding: 12, background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", position: "relative" }}>
                                {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
                                    <div key={v+h} style={{ position: "absolute", [v]: 6, [h]: 6, width: 14, height: 14, [`border${v[0].toUpperCase()+v.slice(1)}`]: "2px solid #c9a227", [`border${h[0].toUpperCase()+h.slice(1)}`]: "2px solid #c9a227", borderRadius: v==="top"&&h==="left"?"2px 0 0 0":v==="top"&&h==="right"?"0 2px 0 0":v==="bottom"&&h==="left"?"0 0 0 2px":"0 0 2px 0" }} />
                                ))}
                                <QRCodeSVG value={qrValue} size={160} level="H" includeMargin={false} fgColor="#0e2554" bgColor="#ffffff" />
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "#4a4a6a", fontWeight: 600 }}>Barangay East Tapinac, Olongapo City</div>
                                <div style={{ fontSize: 10, color: "#9090aa", marginTop: 1 }}>City of Olongapo, Zambales</div>
                            </div>
                        </div>
                        <div style={{ background: "#f8f6f1", borderTop: "1px solid #e4dfd4", padding: "8px 16px", display: "flex", alignItems: "center", gap: 5 }}>
                            <AlertCircle size={10} color="#9090aa" />
                            <span style={{ fontSize: 10, color: "#9090aa" }}>This QR is unique to this resident's account.</span>
                        </div>
                    </div>

                    {/* Tip */}
                    <div style={{ background: "#f5edce", border: "1px solid #e0d4a8", borderRadius: 6, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <Scissors size={12} color="#9a7515" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 11.5, color: "#7a6530", lineHeight: 1.6 }}>
                            Clicking <strong>Print</strong> will print <strong>6 wallet-sized cards</strong> on one A4 sheet (CR80, 54 × 85.6 mm). Cut and laminate for the resident.
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "14px 24px", borderTop: "1px solid #e4dfd4", display: "flex", justifyContent: "flex-end", gap: 10, background: "#f8f6f1" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, fontSize: 12.5, cursor: "pointer", fontFamily: "'Source Serif 4',serif", color: "#4a4a6a" }}>
                        Cancel
                    </button>
                    <button
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 22px", background: "linear-gradient(135deg,#163066,#091a3e)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display',serif", letterSpacing: 1 }}
                        onClick={() => window.print()}
                    >
                        <Printer size={13} /> Print 6 Cards
                    </button>
                </div>
            </div>
        </div>

        {/* ── Print sheet — hidden on screen, shown on @media print ── */}
        <div id="rr-qr-print-sheet">
            <div className="rr-ps-title">
                CertiFast · Resident QR Wallet Card · {resident.name} · {resident.id}
            </div>
            <div className="rr-ps-hint">
                ✂ Cut along the dashed borders · Laminate with a 54 × 86 mm pouch (credit card size)
            </div>
            <div className="rr-ps-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <WalletCard key={i} name={resident.name} residentId={resident.id} qrValue={qrValue} />
                ))}
            </div>
            <div className="rr-ps-cut">✂ Standard wallet / ID card size — 54 × 85.6 mm (CR80)</div>
        </div>
        </>
    );
}


// =============================================================
// Resident Drawer
// =============================================================
function ResidentDrawer({ resident, onClose, isMobile, onPrintQR }) {
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        setActiveTab("profile");
        document.body.style.overflow = "hidden";
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", fn);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", fn);
        };
    }, [resident?.id, onClose]);

    if (!resident) return null;

    const isActive = resident.status === "Active";

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(9,26,62,.45)",
                    zIndex: 500,
                }}
                onClick={onClose}
            />

            <div className={isMobile ? "rr-drawer-mobile" : "rr-drawer"}>
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
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #e4dfd4",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "#0e2554",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 16,
                            color: "#fff",
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {initials(resident.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#0e2554",
                            }}
                        >
                            {resident.name}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                marginTop: 3,
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Courier New',monospace",
                                }}
                            >
                                {resident.id}
                            </span>
                            <span
                                style={{
                                    display: "inline-block",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: "2px 9px",
                                    borderRadius: 20,
                                    textTransform: "uppercase",
                                    background: isActive
                                        ? "#e8f5ee"
                                        : "#f0ece4",
                                    color: isActive ? "#1a7a4a" : "#9090aa",
                                }}
                            >
                                {resident.status}
                            </span>
                        </div>
                    </div>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9090aa",
                            padding: 4,
                            transition: "color .15s",
                            flexShrink: 0,
                            display: "flex",
                        }}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #e4dfd4",
                        flexShrink: 0,
                        padding: "0 24px",
                    }}
                >
                    {["profile", "history", "qr"].map((tab) => (
                        <button
                            key={tab}
                            className={`rr-dtab${activeTab === tab ? " active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === "profile"
                                ? "Profile"
                                : tab === "history"
                                  ? "Request History"
                                  : "QR Card"}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="rr-drawer-body">
                    {/* Profile tab */}
                    {activeTab === "profile" && (
                        <>
                            <div className="rr-pf-grid">
                                <div className="rr-pf-field">
                                    <label>Full Name</label>
                                    <div className="rr-pf-val">
                                        {resident.name}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Resident ID</label>
                                    <div
                                        className="rr-pf-val"
                                        style={{
                                            fontFamily:
                                                "'Courier New',monospace",
                                        }}
                                    >
                                        {resident.id}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Date of Birth</label>
                                    <div className="rr-pf-val">
                                        {resident.dob}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Age</label>
                                    <div className="rr-pf-val">
                                        {calcAge(resident.dob)} years old
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Civil Status</label>
                                    <div className="rr-pf-val">
                                        {resident.civil}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Nationality</label>
                                    <div className="rr-pf-val">
                                        {resident.nationality}
                                    </div>
                                </div>
                                <div
                                    className="rr-pf-field"
                                    style={{ gridColumn: "1/-1" }}
                                >
                                    <label>Address</label>
                                    <div className="rr-pf-val">
                                        {resident.addr}, Olongapo City
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Contact Number</label>
                                    <div className="rr-pf-val">
                                        {resident.contact}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Email Address</label>
                                    <div className="rr-pf-val">
                                        {resident.email}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Date Registered</label>
                                    <div className="rr-pf-val">
                                        {resident.date}
                                    </div>
                                </div>
                                <div className="rr-pf-field">
                                    <label>Account Status</label>
                                    <div className="rr-pf-val">
                                        <span
                                            style={{
                                                display: "inline-block",
                                                fontSize: 10,
                                                fontWeight: 600,
                                                padding: "2px 9px",
                                                borderRadius: 20,
                                                textTransform: "uppercase",
                                                background: isActive
                                                    ? "#e8f5ee"
                                                    : "#f0ece4",
                                                color: isActive
                                                    ? "#1a7a4a"
                                                    : "#9090aa",
                                            }}
                                        >
                                            {resident.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <hr
                                style={{
                                    border: "none",
                                    borderTop: "1px solid #e4dfd4",
                                    margin: "16px 0",
                                }}
                            />
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#9090aa",
                                    fontStyle: "italic",
                                }}
                            >
                                Resident information is provided during
                                self-registration. Contact the resident directly
                                for corrections.
                            </div>
                        </>
                    )}

                    {/* History tab */}
                    {activeTab === "history" && (
                        <>
                            <div
                                style={{
                                    marginBottom: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ fontSize: 12, color: "#9090aa" }}>
                                    All certificate and permit requests by this
                                    resident.
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    {MOCK_HISTORY.length} requests
                                </div>
                            </div>
                            {/* TODO: replace MOCK_HISTORY with GET /api/residents/:id/requests */}
                            <table className="rr-hist-table">
                                <thead>
                                    <tr>
                                        <th>Cert Type</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_HISTORY.map((h, i) => {
                                        const b =
                                            HIST_BADGE[h.status] ||
                                            HIST_BADGE.pending;
                                        return (
                                            <tr key={i}>
                                                <td>{h.cert}</td>
                                                <td>{h.date}</td>
                                                <td>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            fontSize: 9,
                                                            fontWeight: 600,
                                                            padding: "2px 8px",
                                                            borderRadius: 20,
                                                            background: b.bg,
                                                            color: b.color,
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                    >
                                                        {b.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* QR tab — resident-side card design */}
                    {activeTab === "qr" && (
                        <>
                            {/* Card preview — matches resident's My QR page */}
                            <div style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                                <div style={{ background: "linear-gradient(135deg, #0e2554, #163066)", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>CertiFast</div>
                                        <div style={{ fontSize: 8, color: "rgba(201,162,39,0.8)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 1 }}>Barangay East Tapinac</div>
                                    </div>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(201,162,39,0.5)", overflow: "hidden" }}>
                                        <img src="/logo.png" alt="Seal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                </div>
                                <div style={{ height: 3, background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)" }} />

                                <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                                    {/* Name + ID */}
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#0e2554" }}>{resident.name}</div>
                                        <div style={{ fontSize: 11, color: "#9090aa", marginTop: 3 }}>
                                            Resident ID: <span style={{ fontWeight: 600, color: "#4a4a6a", fontFamily: "'Courier New',monospace" }}>{resident.id}</span>
                                        </div>
                                    </div>

                                    {/* QR code with gold corner brackets */}
                                    <div style={{ padding: 14, background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", position: "relative" }}>
                                        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
                                            <div key={v+h} style={{ position: "absolute", [v]: 8, [h]: 8, width: 16, height: 16, [`border${v[0].toUpperCase()+v.slice(1)}`]: "2.5px solid #c9a227", [`border${h[0].toUpperCase()+h.slice(1)}`]: "2.5px solid #c9a227", borderRadius: v==="top"&&h==="left"?"3px 0 0 0":v==="top"&&h==="right"?"0 3px 0 0":v==="bottom"&&h==="left"?"0 0 0 3px":"0 0 3px 0" }} />
                                        ))}
                                        <QRCodeSVG
                                            value={`certifast:resident:${resident.id}`}
                                            size={180}
                                            level="H"
                                            includeMargin={false}
                                            fgColor="#0e2554"
                                            bgColor="#ffffff"
                                        />
                                    </div>

                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 11.5, color: "#4a4a6a", fontWeight: 600 }}>Barangay East Tapinac, Olongapo City</div>
                                        <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 2 }}>City of Olongapo, Zambales</div>
                                    </div>
                                </div>

                                <div style={{ background: "#f8f6f1", borderTop: "1px solid #e4dfd4", padding: "10px 18px", display: "flex", alignItems: "center", gap: 6 }}>
                                    <AlertCircle size={11} color="#9090aa" />
                                    <span style={{ fontSize: 11, color: "#9090aa" }}>This QR is permanent and uniquely tied to this resident's account.</span>
                                </div>
                            </div>

                            {/* How to use tip */}
                            <div style={{ background: "#f5edce", border: "1px solid #e0d4a8", borderRadius: 6, padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <Scissors size={13} color="#9a7515" style={{ flexShrink: 0, marginTop: 1 }} />
                                <span style={{ fontSize: 12, color: "#7a6530", lineHeight: 1.65 }}>
                                    <strong>How to use:</strong> Click <em>Print 6 Cards</em> to print a sheet of 6 wallet-sized cards (CR80). Cut along the dashed borders and give to the resident to laminate. They show this card at the barangay office — staff scans it to pull up their latest request instantly.
                                </span>
                            </div>

                            {/* Print button */}
                            <button className="rr-print-card-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => onPrintQR(resident)}>
                                <Printer size={13} /> Print 6 Wallet Cards
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}


// =============================================================
// Main Component
// =============================================================
export default function ResidentRecords({
    admin,
    onLogout,
    onNavigate: navProp,
}) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("residentRecords");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Filter / search state
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortFilter, setSortFilter] = useState("name");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Drawer + modal state
    const [selectedResident, setSelectedResident] = useState(null);
    const [printResident, setPrintResident] = useState(null);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        console.log("Navigate to:", page);
    };
    const handleLogout = () => {
        if (onLogout) onLogout();
    };

    // Filter + sort
    const filtered = MOCK_RESIDENTS.filter((r) => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (![r.name, r.addr, r.id].join(" ").toLowerCase().includes(q))
                return false;
        }
        return true;
    }).sort((a, b) => {
        if (sortFilter === "name") return a.name.localeCompare(b.name);
        if (sortFilter === "date") return new Date(b.date) - new Date(a.date);
        if (sortFilter === "requests") return b.requests - a.requests;
        return 0;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const paginated = filtered.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortFilter, rowsPerPage]);

    // Stat strip values
    const stats = [
        {
            label: "Total Residents",
            value: "1,284",
            sub: "All registered accounts",
            color: "navy",
        },
        {
            label: "Active",
            value: "1,241",
            sub: "With valid QR cards",
            color: "green",
        },
        {
            label: "New This Month",
            value: "38",
            sub: "Registered in March 2026",
            color: "gold",
        },
        {
            label: "Total Requests",
            value: "3,910",
            sub: "Across all residents",
            color: "blue",
        },
    ];
    const statTopColor = {
        navy: "linear-gradient(90deg,#0e2554,#163066)",
        green: "linear-gradient(90deg,#1a7a4a,#2da866)",
        gold: "linear-gradient(90deg,#c9a227,#e8c54a)",
        blue: "linear-gradient(90deg,#1a4a8a,#3a6abf)",
    };

    return (
        <div className="rr-root">
            {!isMobile && (
                <AdminSidebar
                    admin={
                        admin || {
                            name: "Dante Administrador",
                            role: "superadmin",
                        }
                    }
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    collapsed={isTablet}
                />
            )}
            {showMobileSidebar && (
                <AdminMobileSidebar
                    admin={
                        admin || {
                            name: "Dante Administrador",
                            role: "superadmin",
                        }
                    }
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobileSidebar(false)}
                    onLogout={handleLogout}
                />
            )}
            {selectedResident && (
                <ResidentDrawer
                    resident={selectedResident}
                    onClose={() => setSelectedResident(null)}
                    isMobile={isMobile}
                    onPrintQR={(r) => {
                        setPrintResident(r);
                    }}
                />
            )}
            {printResident && (
                <QRCardModal
                    resident={printResident}
                    onClose={() => setPrintResident(null)}
                />
            )}

            {/* Main */}
            <div
                style={{
                    marginLeft: sidebarWidth,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
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
                        padding: isMobile ? "0 16px" : "0 32px",
                        gap: 12,
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
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
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 700,
                            color: "#0e2554",
                            flex: 1,
                        }}
                    >
                        Resident Records
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
                                Registered residents of Barangay East Tapinac
                            </span>
                        )}
                    </div>
                    {!isMobile && (
                        <div
                            style={{
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
                            }}
                        >
                            {isTablet ? formatDateShort() : formatDate()}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div
                    style={{
                        padding: isMobile ? "16px 16px 24px" : "28px 32px",
                        flex: 1,
                    }}
                >
                    {/* Stat strip */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "repeat(2,1fr)"
                                : "repeat(4,1fr)",
                            gap: isMobile ? 10 : 14,
                            marginBottom: isMobile ? 16 : 24,
                        }}
                    >
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 6,
                                    padding: isMobile
                                        ? "14px 16px"
                                        : "18px 22px",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 3,
                                        background: statTopColor[stat.color],
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        fontWeight: 600,
                                        color: "#9090aa",
                                        letterSpacing: "1.2px",
                                        textTransform: "uppercase",
                                        marginBottom: 8,
                                    }}
                                >
                                    {stat.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: isMobile ? 22 : 26,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                        lineHeight: 1,
                                    }}
                                >
                                    {stat.value}
                                </div>
                                {!isMobile && (
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            color: "#9090aa",
                                            marginTop: 5,
                                        }}
                                    >
                                        {stat.sub}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filter bar */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            padding: "14px 20px",
                            marginBottom: 18,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                flex: 1,
                                minWidth: 200,
                            }}
                        >
                            <Search
                                size={14}
                                color="#9090aa"
                                strokeWidth={2}
                                style={{
                                    position: "absolute",
                                    left: 10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <input
                                className="rr-search-input"
                                type="text"
                                placeholder="Search by name, address, or resident ID…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div
                            style={{
                                width: 1,
                                height: 28,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <select
                            className="rr-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select
                            className="rr-select"
                            value={sortFilter}
                            onChange={(e) => setSortFilter(e.target.value)}
                        >
                            <option value="name">Sort: Name A–Z</option>
                            <option value="date">Sort: Newest First</option>
                            <option value="requests">
                                Sort: Most Requests
                            </option>
                        </select>
                        <div
                            style={{
                                width: 1,
                                height: 28,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 11.5,
                                color: "#9090aa",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Showing{" "}
                            <strong>
                                {Math.min(
                                    (currentPage - 1) * rowsPerPage + 1,
                                    filtered.length,
                                )}
                                –
                                {Math.min(
                                    currentPage * rowsPerPage,
                                    filtered.length,
                                )}
                            </strong>{" "}
                            of <strong>{filtered.length}</strong> residents
                        </div>
                    </div>

                    {/* Table card */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            overflow: "hidden",
                        }}
                    >
                        {/* Desktop table header */}
                        {!isMobile && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1.4fr 1.4fr 1fr 1.1fr 0.7fr 0.9fr 0.6fr",
                                    background: "#f8f6f1",
                                    borderBottom: "1px solid #e4dfd4",
                                    padding: "10px 22px",
                                }}
                            >
                                {[
                                    "Resident",
                                    "Address",
                                    "Contact",
                                    "Date Registered",
                                    "Requests",
                                    "Status",
                                    "Action",
                                ].map((h) => (
                                    <div
                                        key={h}
                                        style={{
                                            fontSize: 9.5,
                                            fontWeight: 600,
                                            color: "#9090aa",
                                            letterSpacing: "1.2px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Rows */}
                        <div id="rr-table-body">
                            {filtered.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: 40,
                                        color: "#9090aa",
                                        fontSize: 13,
                                        fontStyle: "italic",
                                    }}
                                >
                                    No residents found matching your search.
                                </div>
                            ) : (
                                paginated.map((r) => {
                                    const isActive = r.status === "Active";
                                    return !isMobile ? (
                                        // Desktop row
                                        <div
                                            key={r.id}
                                            className="rr-res-row"
                                            style={{
                                                gridTemplateColumns:
                                                    "1.4fr 1.4fr 1fr 1.1fr 0.7fr 0.9fr 0.6fr",
                                            }}
                                            onClick={() =>
                                                setSelectedResident(r)
                                            }
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {r.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                        fontSize: 10,
                                                        color: "#9090aa",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {r.id}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    paddingRight: 12,
                                                }}
                                            >
                                                {r.addr}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                }}
                                            >
                                                {r.contact}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                {r.date}
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "#0e2554",
                                                }}
                                            >
                                                {r.requests}
                                            </div>
                                            <div>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        letterSpacing: ".5px",
                                                        padding: "3px 10px",
                                                        borderRadius: 20,
                                                        textTransform:
                                                            "uppercase",
                                                        background: isActive
                                                            ? "#e8f5ee"
                                                            : "#f0ece4",
                                                        color: isActive
                                                            ? "#1a7a4a"
                                                            : "#9090aa",
                                                    }}
                                                >
                                                    {r.status}
                                                </span>
                                            </div>
                                            <div>
                                                <button
                                                    className="rr-view-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedResident(r);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Mobile card
                                        <div
                                            key={r.id}
                                            className="rr-mob-card"
                                            onClick={() =>
                                                setSelectedResident(r)
                                            }
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: 8,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {r.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: "#4a4a6a",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {r.addr}
                                                    </div>
                                                </div>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        padding: "2px 9px",
                                                        borderRadius: 20,
                                                        textTransform:
                                                            "uppercase",
                                                        background: isActive
                                                            ? "#e8f5ee"
                                                            : "#f0ece4",
                                                        color: isActive
                                                            ? "#1a7a4a"
                                                            : "#9090aa",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {r.status}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            "'Courier New',monospace",
                                                        fontSize: 10,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {r.id}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {r.requests} requests
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        {filtered.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 22px",
                                    borderTop: "1px solid #e4dfd4",
                                    background: "#f8f6f1",
                                    flexWrap: "wrap",
                                    gap: 8,
                                }}
                            >
                                <div
                                    style={{ fontSize: 11.5, color: "#9090aa" }}
                                >
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <button
                                        className="rr-pg-btn"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage((p) => p - 1)
                                        }
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === totalPages ||
                                                Math.abs(p - currentPage) <= 1,
                                        )
                                        .reduce((acc, p, i, arr) => {
                                            if (i > 0 && p - arr[i - 1] > 1)
                                                acc.push("...");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, i) =>
                                            p === "..." ? (
                                                <span
                                                    key={`e${i}`}
                                                    style={{
                                                        padding: "0 4px",
                                                        color: "#9090aa",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    className={`rr-pg-btn${currentPage === p ? " active" : ""}`}
                                                    onClick={() =>
                                                        setCurrentPage(p)
                                                    }
                                                >
                                                    {p}
                                                </button>
                                            ),
                                        )}
                                    <button
                                        className="rr-pg-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage((p) => p + 1)
                                        }
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: "#9090aa",
                                        }}
                                    >
                                        Rows per page:
                                    </span>
                                    <select
                                        style={{
                                            padding: "4px 8px",
                                            border: "1.5px solid #e4dfd4",
                                            borderRadius: 4,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fontSize: 11.5,
                                            background: "#fff",
                                            outline: "none",
                                            cursor: "pointer",
                                        }}
                                        value={rowsPerPage}
                                        onChange={(e) =>
                                            setRowsPerPage(
                                                parseInt(e.target.value),
                                            )
                                        }
                                    >
                                        {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Styles
// =============================================================
const sd = {
    sidebar: {
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0e2554 0%,#091a3e 100%)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        borderRight: "1px solid rgba(201,162,39,0.15)",
        transition: "width 0.2s",
    },
    brand: {
        padding: "20px 20px 16px",
        borderBottom: "1px solid rgba(201,162,39,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    brandSeal: {
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1.5px solid rgba(201,162,39,0.5)",
        background: "rgba(201,162,39,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    brandName: {
        fontFamily: "'Playfair Display',serif",
        fontSize: 14,
        fontWeight: 700,
        color: "#fff",
        lineHeight: 1.2,
    },
    brandSub: {
        fontSize: 9,
        color: "rgba(201,162,39,0.7)",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        marginTop: 1,
    },
    goldBar: {
        height: 3,
        background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)",
        flexShrink: 0,
    },
    sectionLabel: {
        fontSize: 9,
        color: "rgba(201,162,39,0.5)",
        letterSpacing: "2px",
        textTransform: "uppercase",
        padding: "18px 20px 8px",
        fontWeight: 600,
    },
    navBadge: {
        marginLeft: "auto",
        background: "#c9a227",
        color: "#091a3e",
        fontSize: 9,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 10,
        fontFamily: "'Courier New',monospace",
    },
    navBadgeSA: {
        marginLeft: "auto",
        background: "rgba(201,162,39,0.25)",
        color: "#c9a227",
        fontSize: 9,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 10,
    },
    superAdminSection: {
        marginTop: "auto",
        borderTop: "1px solid rgba(201,162,39,0.15)",
        paddingTop: 8,
        paddingBottom: 8,
    },
    userRow: {
        padding: "14px 20px",
        borderTop: "1px solid rgba(201,162,39,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(201,162,39,0.15)",
        border: "1.5px solid rgba(201,162,39,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "#c9a227",
        fontWeight: 700,
        flexShrink: 0,
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: {
        fontSize: 11.5,
        color: "#fff",
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    userRole: {
        fontSize: 9.5,
        color: "#c9a227",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginTop: 1,
    },
};
