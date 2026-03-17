// =============================================================
// FILE: client/src/pages/admin/Reports.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/reports/stats?period= → { issuedThisMonth, totalAllTime, feesThisMonth, pending }
//   - GET /api/reports/by-cert-type?period= → [{ label, count, color }]
//   - GET /api/reports/status-breakdown?period= → { released, pending, rejected }
//   - GET /api/reports/monthly-trend → [{ month, requests, released }]
//   - GET /api/reports/daily?days=7 → [{ date, count, status }]
//   - All endpoints require adminToken in Authorization header
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    Download,
    TrendingUp,
    TrendingDown,
    Menu,
    X,
} from "lucide-react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

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
if (!document.head.querySelector("[data-cf-rep]")) {
    const s = document.createElement("style");
    s.setAttribute("data-cf-rep", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
    @keyframes sidebarSlideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    .rep-root { font-family:'Source Serif 4',serif; background:#f8f6f1; color:#1a1a2e; min-height:100vh; display:flex; }
    .rep-nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      font-size:12.5px; color:rgba(255,255,255,0.65); cursor:pointer;
      border-left:3px solid transparent; transition:all 0.15s;
      background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; text-align:left; font-family:'Source Serif 4',serif;
    }
    .rep-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.9); }
    .rep-nav-item.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .rep-nav-item-icon {
      display:flex; align-items:center; justify-content:center; padding:10px 0;
      color:rgba(255,255,255,0.65); cursor:pointer; border-left:3px solid transparent;
      transition:all 0.15s; background:none; border-right:none; border-top:none; border-bottom:none;
      width:100%; font-family:'Source Serif 4',serif;
    }
    .rep-nav-item-icon:hover { background:rgba(255,255,255,0.06); }
    .rep-nav-item-icon.active { background:rgba(201,162,39,0.12); color:#fff; border-left-color:#c9a227; }
    .rep-period-btn {
      padding:6px 14px; border:1.5px solid #e4dfd4; border-radius:4px;
      background:#fff; font-size:11.5px; color:#4a4a6a; cursor:pointer;
      font-family:'Source Serif 4',serif; transition:all .15s;
    }
    .rep-period-btn:hover { border-color:#0e2554; color:#0e2554; }
    .rep-period-btn.active { background:#0e2554; color:#fff; border-color:#0e2554; font-weight:600; }
    .rep-export-btn {
      margin-left:auto; display:inline-flex; align-items:center; gap:7px;
      padding:8px 18px; background:#0e2554; color:#fff; border:none; border-radius:4px;
      font-size:12px; font-weight:600; cursor:pointer; font-family:'Source Serif 4',serif;
      transition:background .15s; white-space:nowrap;
    }
    .rep-export-btn:hover { background:#163066; }
    .rep-summary-table { width:100%; border-collapse:collapse; }
    .rep-summary-table th { font-size:9.5px; font-weight:600; color:#9090aa; letter-spacing:1px; text-transform:uppercase; padding:9px 16px; background:#f8f6f1; border-bottom:1px solid #e4dfd4; text-align:left; }
    .rep-summary-table td { padding:11px 16px; font-size:12.5px; border-bottom:1px solid #f0ece4; color:#1a1a2e; vertical-align:middle; }
    .rep-summary-table tr:last-child td { border-bottom:none; }
    .rep-summary-table tr:hover td { background:#faf8f4; }
    .rep-logout-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35); padding:4px; transition:color .15s; display:flex; align-items:center; }
    .rep-logout-btn:hover { color:rgba(255,255,255,.7); }
    /* Toast */
    @keyframes rep-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .rep-toast { position:fixed; bottom:28px; right:28px; background:#1a1a2e; color:#fff; padding:12px 20px; border-radius:6px; font-size:12.5px; display:flex; align-items:center; gap:10px; z-index:999; box-shadow:0 4px 18px rgba(0,0,0,.22); animation:rep-toast-in .25s ease both; }
    `;
    document.head.appendChild(s);
}

// =============================================================
// Mock data — TODO: replace with API calls
// =============================================================
const CERT_DATA = [
    { label: "Brgy Clearance", count: 72, color: "#0e2554" },
    { label: "Cert of Residency", count: 48, color: "#1a7a4a" },
    { label: "Cert of Indigency", count: 31, color: "#b86800" },
    { label: "Business Permit", count: 14, color: "#1a4a8a" },
    { label: "Good Moral Cert", count: 11, color: "#6a3db8" },
    { label: "Live Birth (Endorse.)", count: 8, color: "#b02020" },
];
const CERT_TOTAL = CERT_DATA.reduce((a, b) => a + b.count, 0);

const STATUS_DATA = [
    { name: "Released", value: 3612, color: "#1a7a4a" },
    { name: "Pending", value: 12, color: "#b86800" },
    { name: "Rejected", value: 286, color: "#b02020" },
];

const MONTHLY_DATA = [
    { month: "Apr", requests: 198, released: 174 },
    { month: "May", requests: 221, released: 195 },
    { month: "Jun", requests: 245, released: 216 },
    { month: "Jul", requests: 189, released: 166 },
    { month: "Aug", requests: 267, released: 235 },
    { month: "Sep", requests: 312, released: 275 },
    { month: "Oct", requests: 278, released: 245 },
    { month: "Nov", requests: 302, released: 266 },
    { month: "Dec", requests: 318, released: 280 },
    { month: "Jan", requests: 271, released: 239 },
    { month: "Feb", requests: 164, released: 144 },
    { month: "Mar", requests: 184, released: 162 },
];

const DAILY_DATA = [
    { date: "Mar 14, 2026", count: 14, status: "pending" },
    { date: "Mar 13, 2026", count: 18, status: "released" },
    { date: "Mar 12, 2026", count: 22, status: "released" },
    { date: "Mar 11, 2026", count: 9, status: "released" },
    { date: "Mar 10, 2026", count: 25, status: "released" },
    { date: "Mar 9, 2026", count: 17, status: "released" },
    { date: "Mar 8, 2026", count: 11, status: "released" },
];

const STATS = [
    {
        label: "Issued This Month",
        value: "184",
        sub: "March 2026",
        delta: "↑ 12% vs last month",
        up: true,
        color: "navy",
    },
    {
        label: "Total Issued (All Time)",
        value: "3,910",
        sub: "Since system launch",
        delta: "↑ 184 this month",
        up: true,
        color: "green",
    },
    {
        label: "Pending Requests",
        value: "12",
        sub: "Awaiting processing",
        delta: "↑ 3 since yesterday",
        up: false,
        color: "amber",
    },
];

const STAT_TOP = {
    navy: "linear-gradient(90deg,#0e2554,#163066)",
    green: "linear-gradient(90deg,#1a7a4a,#2da866)",
    amber: "linear-gradient(90deg,#b86800,#e08c20)",
};

// =============================================================
// Custom tooltip for recharts
// =============================================================
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e4dfd4",
                borderRadius: 5,
                padding: "8px 12px",
                fontFamily: "'Source Serif 4',serif",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            }}
        >
            {label && (
                <div
                    style={{
                        fontWeight: 700,
                        color: "#0e2554",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </div>
            )}
            {payload.map((p, i) => (
                <div
                    key={i}
                    style={{
                        color: p.color,
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: p.color,
                            display: "inline-block",
                        }}
                    />
                    {p.name}: <strong>{p.value.toLocaleString()}</strong>
                </div>
            ))}
        </div>
    );
}

// =============================================================
// Panel wrapper
// =============================================================
function ChartCard({ title, sub, children, noPad = false, headerRight }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e4dfd4",
                borderRadius: 6,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: noPad ? "18px 24px 14px" : "20px 24px 16px",
                    borderBottom: noPad ? "1px solid #e4dfd4" : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0e2554",
                        }}
                    >
                        {title}
                    </div>
                    {sub && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                marginTop: 3,
                            }}
                        >
                            {sub}
                        </div>
                    )}
                </div>
                {headerRight}
            </div>
            {!noPad && <div style={{ padding: "0 24px 24px" }}>{children}</div>}
            {noPad && children}
        </div>
    );
}

// =============================================================
// Main Component
// =============================================================
export default function Reports({ admin, onLogout, onNavigate: navProp }) {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [activePage, setActivePage] = useState("reports");
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [activePeriod, setActivePeriod] = useState("month");
    const [certFilter, setCertFilter] = useState("all");
    const [toast, setToast] = useState(false);

    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const formatDate = () => {
        return new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateShort = () => {
        return new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleNavigate = (page) => {
        setActivePage(page);
        if (navProp) navProp(page);
        console.log("Navigate to:", page);
    };
    const handleLogout = () => {
        if (onLogout) onLogout();
    };

    const showToast = () => {
        setToast(true);
        setTimeout(() => setToast(false), 3000);
    };

    // Sorted cert data for top table
    const sortedCerts = [...CERT_DATA].sort((a, b) => b.count - a.count);

    return (
        <div className="rep-root">
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

            {/* Toast */}
            {toast && (
                <div className="rep-toast">
                    <span style={{ color: "#c9a227" }}>✓</span>
                    Export feature available in the full backend.
                </div>
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
                        Reports &amp; Statistics
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
                                Barangay East Tapinac — certificate and permit
                                activity
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
                    {/* ── Stat strip ── */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "repeat(2,1fr)"
                                : "repeat(3,1fr)",
                            gap: isMobile ? 10 : 14,
                            marginBottom: isMobile ? 16 : 22,
                        }}
                    >
                        {STATS.map((stat) => (
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
                                        background: STAT_TOP[stat.color],
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
                                        fontSize: isMobile ? 22 : 28,
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
                                <div
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        marginTop: 4,
                                        color: stat.up ? "#1a7a4a" : "#b02020",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                    }}
                                >
                                    {stat.up ? (
                                        <TrendingUp
                                            size={11}
                                            strokeWidth={2.5}
                                        />
                                    ) : (
                                        <TrendingDown
                                            size={11}
                                            strokeWidth={2.5}
                                        />
                                    )}
                                    {stat.delta}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Filter bar ── */}
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e4dfd4",
                            borderRadius: 6,
                            padding: "14px 20px",
                            marginBottom: 22,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#4a4a6a",
                                letterSpacing: ".5px",
                                flexShrink: 0,
                            }}
                        >
                            Period:
                        </span>
                        {["week", "month", "year", "all"].map((p) => (
                            <button
                                key={p}
                                className={`rep-period-btn${activePeriod === p ? " active" : ""}`}
                                onClick={() => setActivePeriod(p)}
                            >
                                {p === "week"
                                    ? "This Week"
                                    : p === "month"
                                      ? "This Month"
                                      : p === "year"
                                        ? "This Year"
                                        : "All Time"}
                            </button>
                        ))}
                        <div
                            style={{
                                width: 1,
                                height: 24,
                                background: "#e4dfd4",
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#4a4a6a",
                                flexShrink: 0,
                            }}
                        >
                            Cert Type:
                        </span>
                        <select
                            style={{
                                padding: "6px 12px",
                                border: "1.5px solid #e4dfd4",
                                borderRadius: 4,
                                fontFamily: "'Source Serif 4',serif",
                                fontSize: 11.5,
                                background: "#fff",
                                outline: "none",
                                cursor: "pointer",
                                color: "#1a1a2e",
                            }}
                            value={certFilter}
                            onChange={(e) => setCertFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            {CERT_DATA.map((c) => (
                                <option key={c.label} value={c.label}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        {/* TODO: wire export to GET /api/reports/export?format=csv&period= */}
                        <button className="rep-export-btn" onClick={showToast}>
                            <Download size={13} /> Export PDF / CSV
                        </button>
                    </div>

                    {/* ── Row 1: Bar + Donut ── */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                            gap: 18,
                            marginBottom: 18,
                        }}
                    >
                        {/* Bar: Requests by Cert Type */}
                        <ChartCard
                            title="Requests by Certificate Type"
                            sub="Total requests per document type for the selected period"
                        >
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={CERT_DATA}
                                    margin={{
                                        top: 4,
                                        right: 8,
                                        left: -16,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="#f0ece4"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{
                                            fontSize: 10,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fill: "#9090aa",
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 10,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fill: "#9090aa",
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        content={<ChartTooltip />}
                                        cursor={{ fill: "rgba(14,37,84,.04)" }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name="Requests"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {CERT_DATA.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.color + "cc"}
                                                stroke={entry.color}
                                                strokeWidth={1.5}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Donut: Status Breakdown */}
                        <ChartCard
                            title="Request Status"
                            sub="Processing outcome breakdown"
                        >
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={STATUS_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="62%"
                                        outerRadius="85%"
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {STATUS_DATA.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.color}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length)
                                                return null;
                                            const total = STATUS_DATA.reduce(
                                                (a, b) => a + b.value,
                                                0,
                                            );
                                            const p = payload[0];
                                            return (
                                                <div
                                                    style={{
                                                        background: "#fff",
                                                        border: "1px solid #e4dfd4",
                                                        borderRadius: 5,
                                                        padding: "8px 12px",
                                                        fontSize: 12,
                                                        fontFamily:
                                                            "'Source Serif 4',serif",
                                                    }}
                                                >
                                                    <strong
                                                        style={{
                                                            color: p.payload
                                                                .color,
                                                        }}
                                                    >
                                                        {p.name}
                                                    </strong>
                                                    : {p.value.toLocaleString()}{" "}
                                                    (
                                                    {Math.round(
                                                        (p.value / total) * 100,
                                                    )}
                                                    %)
                                                </div>
                                            );
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                    marginTop: 12,
                                }}
                            >
                                {STATUS_DATA.map((item) => (
                                    <div
                                        key={item.name}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    background: item.color,
                                                    display: "inline-block",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                }}
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                            }}
                                        >
                                            {item.value.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    </div>

                    {/* ── Row 2: Line chart ── */}
                    <div style={{ marginBottom: 18 }}>
                        <ChartCard
                            title="Monthly Request Trend"
                            sub="Number of certificate and permit requests over the past 12 months"
                            headerRight={
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#9090aa",
                                        background: "#f8f6f1",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 4,
                                        padding: "4px 10px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Apr 2025 – Mar 2026
                                </div>
                            }
                        >
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart
                                    data={MONTHLY_DATA}
                                    margin={{
                                        top: 8,
                                        right: 8,
                                        left: -16,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="#f0ece4"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{
                                            fontSize: 11,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fill: "#9090aa",
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fill: "#9090aa",
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend
                                        wrapperStyle={{
                                            fontSize: 11,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            paddingTop: 12,
                                        }}
                                        iconSize={12}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="requests"
                                        name="Requests"
                                        stroke="#0e2554"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#0e2554" }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="released"
                                        name="Released"
                                        stroke="#1a7a4a"
                                        strokeWidth={1.5}
                                        strokeDasharray="5 4"
                                        dot={{ r: 3, fill: "#1a7a4a" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* ── Row 3: Two summary tables ── */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                            gap: 18,
                        }}
                    >
                        {/* Top Requested */}
                        <ChartCard
                            title="Top Requested This Month"
                            sub="Ranked by volume — March 2026"
                            noPad
                        >
                            <table className="rep-summary-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Certificate / Permit</th>
                                        <th>Count</th>
                                        <th>Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCerts.map((cert, i) => {
                                        const pct = Math.round(
                                            (cert.count / CERT_TOTAL) * 100,
                                        );
                                        return (
                                            <tr key={cert.label}>
                                                <td>
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Playfair Display',serif",
                                                            fontSize: 16,
                                                            fontWeight: 700,
                                                            color: "#0e2554",
                                                        }}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            fontSize: 12.5,
                                                            fontWeight: 600,
                                                            color: "#1a1a2e",
                                                        }}
                                                    >
                                                        {cert.label}
                                                    </div>
                                                    <div
                                                        style={{
                                                            height: 6,
                                                            background: "#eee",
                                                            borderRadius: 3,
                                                            overflow: "hidden",
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: "100%",
                                                                borderRadius: 3,
                                                                background:
                                                                    cert.color,
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        fontFamily:
                                                            "'Playfair Display',serif",
                                                        fontSize: 15,
                                                        fontWeight: 700,
                                                        color: "#0e2554",
                                                    }}
                                                >
                                                    {cert.count}
                                                </td>
                                                <td
                                                    style={{
                                                        fontSize: 11.5,
                                                        color: "#9090aa",
                                                    }}
                                                >
                                                    {pct}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </ChartCard>

                        {/* Last 7 Days */}
                        <ChartCard
                            title="Last 7 Days"
                            sub="Daily request count"
                            noPad
                        >
                            <table className="rep-summary-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Requests</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAILY_DATA.map((day, i) => (
                                        <tr key={i}>
                                            <td
                                                style={{
                                                    fontSize: 12,
                                                    color: "#4a4a6a",
                                                }}
                                            >
                                                {day.date}
                                            </td>
                                            <td
                                                style={{
                                                    fontFamily:
                                                        "'Playfair Display',serif",
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: "#0e2554",
                                                }}
                                            >
                                                {day.count}
                                            </td>
                                            <td>
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
                                                        background:
                                                            day.status ===
                                                            "pending"
                                                                ? "#fff3e0"
                                                                : "#f0f0f0",
                                                        color:
                                                            day.status ===
                                                            "pending"
                                                                ? "#b86800"
                                                                : "#666",
                                                    }}
                                                >
                                                    {day.status === "pending"
                                                        ? "In Progress"
                                                        : "Completed"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ChartCard>
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
