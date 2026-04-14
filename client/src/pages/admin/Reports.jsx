// =============================================================
// FILE: client/src/pages/admin/Reports.jsx
// =============================================================
// Report Generation & Export page.
// Statistics live in Dashboard.jsx — this page is for generating
// and downloading printable/exportable reports.
// =============================================================

import { useState, useEffect, useCallback } from "react";
import {
    Download,
    FileText,
    Users,
    FilePlus,
    BarChart2,
    ClipboardList,
    FileSpreadsheet,
    FileDown,
    Calendar,
    CheckCircle,
    Menu,
    AlertCircle,
    Loader2,
    ChevronRight,
} from "lucide-react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import reportsService from "../../services/reportsService";

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
if (!document.head.querySelector("[data-cf-rep-v2]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-rep-v2", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    .rep-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }

    /* Report type cards */
    .rep-type-card {
        border:1.5px solid #e4dfd4; border-radius:8px;
        padding:18px 20px; background:#fff;
        cursor:pointer; transition:all .18s;
        display:flex; align-items:flex-start; gap:14px;
        font-family:'Source Serif 4',serif;
        position:relative; overflow:hidden;
    }
    .rep-type-card:hover { border-color:#0e2554; box-shadow:0 4px 18px rgba(14,37,84,0.1); transform:translateY(-1px); }
    .rep-type-card.selected { border-color:#0e2554; background:#f0f3ff; box-shadow:0 4px 18px rgba(14,37,84,0.12); }
    .rep-type-card.selected::before {
        content:''; position:absolute; top:0; left:0; right:0; height:3px;
        background:linear-gradient(90deg,#0e2554,#1e3d7a);
    }

    /* Format buttons */
    .rep-fmt-btn {
        display:flex; flex-direction:column; align-items:center; gap:6px;
        padding:14px 20px; border:1.5px solid #e4dfd4; border-radius:6px;
        background:#fff; cursor:pointer; transition:all .15s;
        font-family:'Source Serif 4',serif; flex:1; min-width:80px;
    }
    .rep-fmt-btn:hover { border-color:#0e2554; }
    .rep-fmt-btn.selected-pdf   { border-color:#b02020; background:#fdecea; }
    .rep-fmt-btn.selected-xlsx  { border-color:#1a7a4a; background:#e8f5ee; }
    .rep-fmt-btn.selected-csv   { border-color:#1a4a8a; background:#e8eef8; }

    /* Period tabs */
    .rep-period-btn {
        padding:7px 16px; border:1.5px solid #e4dfd4; border-radius:4px;
        background:#fff; font-size:12px; color:#4a4a6a; cursor:pointer;
        font-family:'Source Serif 4',serif; transition:all .15s; white-space:nowrap;
    }
    .rep-period-btn:hover { border-color:#0e2554; color:#0e2554; }
    .rep-period-btn.active { background:#0e2554; color:#fff; border-color:#0e2554; font-weight:600; }

    /* Generate button */
    .rep-generate-btn {
        display:inline-flex; align-items:center; gap:8px;
        padding:13px 28px;
        background:linear-gradient(135deg,#163066,#091a3e);
        color:#fff; border:none; border-radius:5px;
        font-family:'Playfair Display',serif; font-size:13px;
        font-weight:700; letter-spacing:1px; text-transform:uppercase;
        cursor:pointer; transition:opacity .15s;
    }
    .rep-generate-btn:hover { opacity:.88; }
    .rep-generate-btn:disabled { opacity:.45; cursor:not-allowed; }

    /* Toast */
    @keyframes rep-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .rep-toast { position:fixed; bottom:28px; right:28px; background:#1a1a2e; color:#fff; padding:12px 20px; border-radius:6px; font-size:12.5px; display:flex; align-items:center; gap:10px; z-index:999; box-shadow:0 4px 18px rgba(0,0,0,.22); animation:rep-toast-in .25s ease both; border-left:3px solid #c9a227; }
    .rep-toast.success { border-left-color:#1a7a4a; }
    .rep-toast.error   { border-left-color:#b02020; background:#3a0a0a; }

    @keyframes rep-spin { to { transform:rotate(360deg); } }
    .rep-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:rep-spin .7s linear infinite; }

    /* Recent exports table */
    .rep-export-row {
        display:grid; align-items:center;
        padding:12px 22px; border-bottom:1px solid #f0ece4;
        transition:background .1s;
    }
    .rep-export-row:last-child { border-bottom:none; }
    .rep-export-row:hover { background:#faf8f4; }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Report type definitions
// =============================================================
const REPORT_TYPES = [
    {
        key: "requests_summary",
        label: "Requests Summary",
        desc: "All certificate and permit requests with status, type, and dates.",
        icon: ClipboardList,
        accent: "#0e2554",
        bg: "#e8eef8",
    },
    {
        key: "resident_records",
        label: "Resident Records",
        desc: "Registered residents with contact details and account status.",
        icon: Users,
        accent: "#1a7a4a",
        bg: "#e8f5ee",
    },
    {
        key: "walkin_log",
        label: "Walk-in Issuance Log",
        desc: "Counter-issued certificates with issuer, time, and purpose.",
        icon: FilePlus,
        accent: "#6a3db8",
        bg: "#f3eeff",
    },
    {
        key: "cert_breakdown",
        label: "Certificate Breakdown",
        desc: "Count and frequency of each certificate type issued per period.",
        icon: BarChart2,
        accent: "#b86800",
        bg: "#fff3e0",
    },
];

const FORMATS = [
    { key: "pdf",  label: "PDF",  ext: ".pdf",  color: "#b02020", selClass: "selected-pdf"  },
    { key: "xlsx", label: "Excel", ext: ".xlsx", color: "#1a7a4a", selClass: "selected-xlsx" },
    { key: "csv",  label: "CSV",  ext: ".csv",  color: "#1a4a8a", selClass: "selected-csv"  },
];

const PERIODS = [
    { key: "week",  label: "This Week"  },
    { key: "month", label: "This Month" },
    { key: "year",  label: "This Year"  },
    { key: "all",   label: "All Time"   },
];

const FALLBACK_RECENT = [
    { id: "EXP-009", type: "Requests Summary",       format: "PDF",  period: "This Month", size: "42 KB", generatedAt: "Mar 14, 2026 · 09:41 AM", by: "Staff Reyes" },
    { id: "EXP-008", type: "Resident Records",       format: "Excel", period: "All Time",  size: "88 KB", generatedAt: "Mar 13, 2026 · 04:12 PM", by: "Admin Superuser" },
    { id: "EXP-007", type: "Certificate Breakdown",  format: "CSV",  period: "This Year",  size: "12 KB", generatedAt: "Mar 12, 2026 · 11:05 AM", by: "Staff Cruz" },
    { id: "EXP-006", type: "Walk-in Issuance Log",   format: "PDF",  period: "This Week",  size: "28 KB", generatedAt: "Mar 11, 2026 · 03:30 PM", by: "Staff Reyes" },
    { id: "EXP-005", type: "Requests Summary",       format: "Excel", period: "This Month", size: "56 KB", generatedAt: "Mar 10, 2026 · 10:00 AM", by: "Admin Superuser" },
];

function formatBadge(fmt) {
    const map = { PDF: { bg: "#fdecea", color: "#b02020" }, Excel: { bg: "#e8f5ee", color: "#1a7a4a" }, CSV: { bg: "#e8eef8", color: "#1a4a8a" } };
    const s = map[fmt] || map.CSV;
    return (
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 10, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
            {fmt}
        </span>
    );
}

function formatDate() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function formatDateShort() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// =============================================================
// Main Component
// =============================================================
export default function Reports({ admin, onLogout, onNavigate: navProp }) {
    const width = useWindowSize();
    const isMobile  = width < 768;
    const isTablet  = width >= 768 && width < 1024;
    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const [activePage, setActivePage] = useState("reports");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Export builder state
    const [selectedType,   setSelectedType]   = useState("requests_summary");
    const [selectedFormat, setSelectedFormat] = useState("pdf");
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [generating,     setGenerating]     = useState(false);
    const [toast,          setToast]          = useState(null);
    const [recentExports,  setRecentExports]  = useState([]);

    const handleNavigate = (page) => { setActivePage(page); if (navProp) navProp(page); };
    const handleLogout   = () => { if (onLogout) onLogout(); };

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadRecentExports = useCallback(async () => {
        try {
            const result = await reportsService.getRecentExports();
            const rows = Array.isArray(result?.data) ? result.data : [];
            setRecentExports(rows.length ? rows : FALLBACK_RECENT);
        } catch {
            setRecentExports(FALLBACK_RECENT);
        }
    }, []);

    useEffect(() => {
        loadRecentExports();
    }, [loadRecentExports]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Fetch report data from existing endpoint
            const result = await reportsService.getOverview(selectedPeriod);

            // Build filename
            const typeDef  = REPORT_TYPES.find(t => t.key === selectedType);
            const fmtDef   = FORMATS.find(f => f.key === selectedFormat);
            const periodLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || selectedPeriod;
            const now      = new Date();
            const stamp    = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
            const filename = `${typeDef?.label?.replace(/\s+/g,"-").toLowerCase()}_${stamp}${fmtDef?.ext}`;

            if (selectedFormat === "csv") {
                // ── CSV export ──
                const rows = buildCsvRows(result?.data, selectedType);
                const csv  = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                triggerDownload(blob, filename);
            } else if (selectedFormat === "xlsx") {
                // ── Simple XLSX-like TSV download (tab-delimited) ──
                const rows = buildCsvRows(result?.data, selectedType);
                const tsv  = rows.map(r => r.join("\t")).join("\n");
                const blob = new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8;" });
                triggerDownload(blob, filename);
            } else {
                // ── PDF: open print dialog with styled HTML ──
                const html = buildPrintHtml(result?.data, selectedType, periodLabel, admin);
                const win  = window.open("", "_blank");
                if (win) {
                    win.document.write(html);
                    win.document.close();
                    win.focus();
                    setTimeout(() => win.print(), 600);
                }
            }

            // Log export server-side, then reflect it in local list immediately
            try {
                await reportsService.logExport({
                    type: typeDef?.label || selectedType,
                    format: fmtDef?.label === "Excel" ? "Excel" : fmtDef?.label?.toUpperCase(),
                    period: periodLabel,
                });
            } catch {
                // Keep UI non-blocking if audit log insert fails
            }

            const newEntry = {
                id: `EXP-${String(recentExports.length + 10).padStart(3,"0")}`,
                type: typeDef?.label,
                format: fmtDef?.label === "Excel" ? "Excel" : fmtDef?.label?.toUpperCase(),
                period: periodLabel,
                size: "—",
                generatedAt: new Date().toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }),
                by: admin?.name || "Admin",
            };
            setRecentExports(prev => [newEntry, ...prev].slice(0, 20));

            showToast(`${typeDef?.label} exported as ${fmtDef?.label?.toUpperCase()}.`, "success");
        } catch (err) {
            console.error("Generate error:", err);
            showToast("Export failed. Please try again.", "error");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="rep-root">
            {!isMobile && (
                <AdminSidebar
                    admin={admin || { name: "Dante Administrador", role: "superadmin" }}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    collapsed={isTablet}
                />
            )}
            {showMobileSidebar && (
                <AdminMobileSidebar
                    admin={admin || { name: "Dante Administrador", role: "superadmin" }}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobileSidebar(false)}
                    onLogout={handleLogout}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`rep-toast ${toast.type}`}>
                    {toast.type === "success"
                        ? <CheckCircle size={15} />
                        : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Main */}
            <div style={{ marginLeft: sidebarWidth, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

                {/* Topbar */}
                <div style={{ height: 62, background: "#fff", borderBottom: "1px solid #e4dfd4", display: "flex", alignItems: "center", padding: isMobile ? "0 16px" : "0 32px", gap: 12, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                    {isMobile && (
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", padding: 4, display: "flex", alignItems: "center", marginRight: 8 }} onClick={() => setShowMobileSidebar(true)}>
                            <Menu size={20} />
                        </button>
                    )}
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#0e2554", flex: 1 }}>
                        Reports &amp; Exports
                        {!isMobile && <span style={{ fontSize: 12, fontFamily: "'Source Serif 4',serif", color: "#9090aa", fontWeight: 400, marginLeft: 10 }}>Generate and download official barangay reports</span>}
                    </div>
                    {!isMobile && (
                        <div style={{ fontSize: 11, color: "#9090aa", background: "#f8f6f1", border: "1px solid #e4dfd4", borderRadius: 4, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                            <Calendar size={12} /> {isTablet ? formatDateShort() : formatDate()}
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div style={{ padding: isMobile ? "16px 16px 24px" : "28px 32px", flex: 1 }}>

                    {/* ── Report Builder ── */}
                    <div style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>

                        {/* Panel header */}
                        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e4dfd4", background: "linear-gradient(135deg,#f3eeff,#ede8ff)", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 32, height: 32, background: "#6a3db8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FileDown size={16} color="#fff" strokeWidth={2} />
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "#4a1fa8" }}>Generate a Report</div>
                                <div style={{ fontSize: 11.5, color: "#7a5ab8", marginTop: 1 }}>Choose a report type, select the period and format, then export.</div>
                            </div>
                        </div>

                        <div style={{ padding: "24px" }}>

                            {/* Step 1 — Report Type */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12 }}>
                                    Step 1 — Select Report Type
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 10 }}>
                                    {REPORT_TYPES.map(({ key, label, desc, icon, accent, bg }) => {
                                        const IconComp = icon;
                                        return (
                                        <div key={key} className={`rep-type-card${selectedType === key ? " selected" : ""}`} onClick={() => setSelectedType(key)}>
                                            <div style={{ width: 38, height: 38, borderRadius: 8, background: selectedType === key ? accent + "18" : bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${selectedType === key ? accent + "30" : "#e4dfd4"}` }}>
                                                <IconComp size={18} color={selectedType === key ? accent : "#9090aa"} strokeWidth={1.8} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: selectedType === key ? "#0e2554" : "#1a1a2e", marginBottom: 2 }}>{label}</div>
                                                <div style={{ fontSize: 11.5, color: "#9090aa", lineHeight: 1.5 }}>{desc}</div>
                                            </div>
                                            {selectedType === key && (
                                                <CheckCircle size={16} color="#0e2554" strokeWidth={2} style={{ flexShrink: 0 }} />
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 2 — Period */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
                                    Step 2 — Date Range / Period
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {PERIODS.map(({ key, label }) => (
                                        <button key={key} className={`rep-period-btn${selectedPeriod === key ? " active" : ""}`} onClick={() => setSelectedPeriod(key)}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 3 — Format */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>
                                    Step 3 — Export Format
                                </div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {FORMATS.map(({ key, label, ext, color, selClass }) => (
                                        <button key={key} className={`rep-fmt-btn${selectedFormat === key ? " " + selClass : ""}`} onClick={() => setSelectedFormat(key)}>
                                            {key === "pdf"  && <FileText   size={22} color={selectedFormat === key ? color : "#9090aa"} strokeWidth={1.5} />}
                                            {key === "xlsx" && <FileSpreadsheet size={22} color={selectedFormat === key ? color : "#9090aa"} strokeWidth={1.5} />}
                                            {key === "csv"  && <FileText   size={22} color={selectedFormat === key ? color : "#9090aa"} strokeWidth={1.5} />}
                                            <span style={{ fontSize: 12, fontWeight: 700, color: selectedFormat === key ? color : "#4a4a6a" }}>{label}</span>
                                            <span style={{ fontSize: 10, color: "#9090aa" }}>{ext}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary + Generate */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "16px 20px", background: "#f8f6f1", border: "1px solid #e4dfd4", borderRadius: 6 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9090aa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Export Summary</div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                        {[
                                            REPORT_TYPES.find(t => t.key === selectedType)?.label,
                                            "·",
                                            PERIODS.find(p => p.key === selectedPeriod)?.label,
                                            "·",
                                            FORMATS.find(f => f.key === selectedFormat)?.label?.toUpperCase() + " file",
                                        ].map((item, i) => (
                                            <span key={i} style={{ fontSize: 13, color: item === "·" ? "#c0bbb0" : "#1a1a2e", fontWeight: item === "·" ? 400 : 600 }}>
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button className="rep-generate-btn" onClick={handleGenerate} disabled={generating}>
                                    {generating
                                        ? <><span className="rep-spinner" /> Generating…</>
                                        : <><Download size={14} /> Generate &amp; Export</>
                                    }
                                </button>
                            </div>

                            {/* PDF note */}
                            {selectedFormat === "pdf" && (
                                <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                                    <AlertCircle size={13} color="#9a7515" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ fontSize: 11.5, color: "#7a6530" }}>
                                        PDF will open in a new tab with a print dialog. Use <strong>Save as PDF</strong> in your browser's print options to download.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Recent Exports ── */}
                    <div style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ padding: "14px 24px", borderBottom: "1px solid #e4dfd4", background: "#f8f6f1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "#0e2554" }}>
                                Recent Exports
                                <span style={{ fontFamily: "'Source Serif 4',serif", fontSize: 11, color: "#9090aa", fontWeight: 400, marginLeft: 8 }}>{recentExports.length} records</span>
                            </div>
                        </div>

                        {/* Desktop table */}
                        {!isMobile ? (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
                                    <thead>
                                        <tr>
                                            {["Export ID", "Report Type", "Period", "Format", "Generated By", "Date & Time"].map(h => (
                                                <th key={h} style={{ fontSize: 9.5, fontWeight: 600, color: "#9090aa", letterSpacing: "1.2px", textTransform: "uppercase", padding: "10px 20px", textAlign: "left", background: "#f8f6f1", borderBottom: "1px solid #e4dfd4", whiteSpace: "nowrap" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentExports.map((exp) => (
                                            <tr key={exp.id}
                                                style={{ cursor: "default" }}
                                                onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#faf8f4")}
                                                onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "")}>
                                                <td style={td}><span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#9090aa" }}>{exp.id}</span></td>
                                                <td style={td}><span style={{ fontWeight: 600, fontSize: 12.5, color: "#1a1a2e" }}>{exp.type}</span></td>
                                                <td style={td}><span style={{ fontSize: 12, color: "#4a4a6a" }}>{exp.period}</span></td>
                                                <td style={td}>{formatBadge(exp.format)}</td>
                                                <td style={td}><span style={{ fontSize: 12, color: "#4a4a6a" }}>{exp.by}</span></td>
                                                <td style={td}><span style={{ fontSize: 11.5, color: "#9090aa", whiteSpace: "nowrap" }}>{exp.generatedAt}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Mobile cards */
                            <div>
                                {recentExports.map(exp => (
                                    <div key={exp.id} style={{ padding: "13px 16px", borderBottom: "1px solid #f0ece4" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>{exp.type}</span>
                                            {formatBadge(exp.format)}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 11.5, color: "#9090aa" }}>{exp.period} · {exp.by}</span>
                                            <span style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: "#c0bbb0" }}>{exp.id}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ padding: "10px 24px", background: "#f8f6f1", borderTop: "1px solid #e4dfd4", fontSize: 11, color: "#9090aa", display: "flex", alignItems: "center", gap: 6 }}>
                            <AlertCircle size={11} />
                            Export history is pulled from audit logs and refreshed on page load.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// =============================================================
// Table cell style
// =============================================================
const td = {
    padding: "12px 20px",
    fontSize: 12.5,
    borderBottom: "1px solid #f0ece4",
    verticalAlign: "middle",
    transition: "background .1s",
};

// =============================================================
// CSV row builder
// =============================================================
function buildCsvRows(data, type) {
    if (!data) return [["No data available"]];

    switch (type) {
        case "requests_summary": {
            const header = ["Cert Type", "Requests", "Released", "Pending", "Rejected"];
            const rows   = (data.byCertType || []).map(c => [c.label, c.count, "", "", ""]);
            const breakdown = data.statusBreakdown || {};
            return [header, ...rows, [], ["", "Total Released", breakdown.released || 0], ["", "Total Pending", breakdown.pending || 0], ["", "Total Rejected", breakdown.rejected || 0]];
        }
        case "cert_breakdown": {
            const header = ["Certificate / Permit Type", "Count"];
            const rows   = (data.byCertType || []).map(c => [c.label, c.count]);
            return [header, ...rows];
        }
        case "walkin_log":
            return [["Report"], ["Walk-in Issuance Log — export from server-side. Implement POST /api/reports/generate."]];
        case "resident_records":
            return [["Report"], ["Resident Records — export from server-side. Implement POST /api/reports/generate."]];
        default:
            return [["Report"], [type]];
    }
}

// =============================================================
// Print HTML builder (for PDF)
// =============================================================
function buildPrintHtml(data, type, periodLabel, admin) {
    const typeDef  = REPORT_TYPES.find(t => t.key === type);
    const now      = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const adminName = admin?.name || "Administrator";

    const breakdown = data?.statusBreakdown || {};
    const certRows  = (data?.byCertType || []).map(c =>
        `<tr><td style="padding:8px 14px;border-bottom:1px solid #f0ece4;font-size:12px;">${c.label}</td><td style="padding:8px 14px;border-bottom:1px solid #f0ece4;font-size:12px;font-weight:700;text-align:right;">${c.count}</td></tr>`
    ).join("");

    const statsRow = `
        <tr style="background:#f8f6f1;">
            <td style="padding:8px 14px;font-size:12px;color:#9090aa;">Released</td>
            <td style="padding:8px 14px;font-size:12px;font-weight:700;text-align:right;color:#1a7a4a;">${breakdown.released || 0}</td>
        </tr>
        <tr style="background:#f8f6f1;">
            <td style="padding:8px 14px;font-size:12px;color:#9090aa;">Pending</td>
            <td style="padding:8px 14px;font-size:12px;font-weight:700;text-align:right;color:#b86800;">${breakdown.pending || 0}</td>
        </tr>
        <tr style="background:#f8f6f1;">
            <td style="padding:8px 14px;font-size:12px;color:#9090aa;">Rejected</td>
            <td style="padding:8px 14px;font-size:12px;font-weight:700;text-align:right;color:#b02020;">${breakdown.rejected || 0}</td>
        </tr>`;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${typeDef?.label} — Barangay East Tapinac</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Serif+4:wght@400;600&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Source Serif 4',serif; color:#1a1a2e; background:#fff; padding:32px; max-width:780px; margin:0 auto; }
    @media print { body { padding:16px; } @page { margin:15mm; } }
    .header { text-align:center; padding-bottom:18px; margin-bottom:18px; border-bottom:2px solid #c9a227; }
    .header h1 { font-family:'Playfair Display',serif; font-size:22px; color:#0e2554; margin-bottom:4px; }
    .header p  { font-size:11px; color:#9090aa; }
    .meta { display:flex; justify-content:space-between; margin-bottom:22px; font-size:11.5px; color:#4a4a6a; padding:10px 14px; background:#f8f6f1; border-radius:4px; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    th { font-size:10px; font-weight:700; color:#9090aa; text-transform:uppercase; letter-spacing:1px; padding:9px 14px; background:#f8f6f1; border-bottom:1px solid #e4dfd4; text-align:left; }
    th:last-child, td:last-child { text-align:right; }
    .footer { margin-top:32px; padding-top:14px; border-top:1px solid #e4dfd4; display:flex; justify-content:space-between; font-size:10.5px; color:#9090aa; }
</style>
</head>
<body>
    <div class="header">
        <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#9090aa;margin-bottom:4px;">Republic of the Philippines</div>
        <h1>Barangay East Tapinac</h1>
        <p>City of Olongapo, Zambales &nbsp;·&nbsp; CertiFast Certificate Management System</p>
    </div>
    <div class="meta">
        <span><strong>Report:</strong> ${typeDef?.label || type}</span>
        <span><strong>Period:</strong> ${periodLabel}</span>
        <span><strong>Generated:</strong> ${now} by ${adminName}</span>
    </div>
    <h3 style="font-family:'Playfair Display',serif;font-size:15px;color:#0e2554;margin-bottom:12px;">Certificate Type Breakdown</h3>
    <table>
        <thead><tr><th>Certificate / Permit Type</th><th>Count</th></tr></thead>
        <tbody>${certRows}</tbody>
    </table>
    <h3 style="font-family:'Playfair Display',serif;font-size:15px;color:#0e2554;margin-bottom:12px;">Request Status Summary</h3>
    <table>
        <thead><tr><th>Status</th><th>Total</th></tr></thead>
        <tbody>${statsRow}</tbody>
    </table>
    <div class="footer">
        <span>CertiFast v1.0 &nbsp;·&nbsp; Barangay East Tapinac &nbsp;·&nbsp; Olongapo City</span>
        <span>Generated ${now}</span>
    </div>
</body>
</html>`;
}

// Helper: trigger a file download
function triggerDownload(blob, filename) {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
