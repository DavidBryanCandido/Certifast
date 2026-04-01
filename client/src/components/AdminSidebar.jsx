import { useEffect } from "react";
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
    X,
} from "lucide-react";

let injected = false;
function useAdminSidebarStyles() {
    useEffect(() => {
        if (injected) return;
        injected = true;

        const style = document.createElement("style");
        style.setAttribute("data-admin-sidebar", "true");
        style.innerText = `
        @keyframes sidebarSlideIn {
            from { transform: translateX(-100%); }
            to   { transform: translateX(0); }
        }

        .admin-nav-item,
        .cf-nav-item,
        .mr-nav-item,
        .rep-nav-item,
        .lg-nav-item,
        .wi-nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            font-size: 12.5px;
            color: rgba(255, 255, 255, 0.65);
            cursor: pointer;
            border-left: 3px solid transparent;
            transition: all 0.15s;
            text-decoration: none;
            background: none;
            border-right: none;
            border-top: none;
            border-bottom: none;
            width: 100%;
            text-align: left;
            font-family: 'Source Serif 4', serif;
        }
        .admin-nav-item:hover,
        .cf-nav-item:hover,
        .mr-nav-item:hover,
        .rep-nav-item:hover,
        .lg-nav-item:hover,
        .wi-nav-item:hover {
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.9);
        }
        .admin-nav-item.active,
        .cf-nav-item.active,
        .mr-nav-item.active,
        .rep-nav-item.active,
        .lg-nav-item.active,
        .wi-nav-item.active {
            background: rgba(201, 162, 39, 0.12);
            color: #fff;
            border-left-color: #c9a227;
        }
        .admin-nav-item.active svg,
        .cf-nav-item.active svg,
        .mr-nav-item.active svg,
        .rep-nav-item.active svg,
        .lg-nav-item.active svg,
        .wi-nav-item.active svg {
            opacity: 1 !important;
        }
        .admin-nav-item-icon,
        .cf-nav-item-icon,
        .mr-nav-item-icon,
        .rep-nav-item-icon,
        .lg-nav-item-icon,
        .wi-nav-item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 0;
            font-size: 12.5px;
            color: rgba(255, 255, 255, 0.65);
            cursor: pointer;
            border-left: 3px solid transparent;
            transition: all 0.15s;
            background: none;
            border-right: none;
            border-top: none;
            border-bottom: none;
            width: 100%;
            font-family: 'Source Serif 4', serif;
        }
        .admin-nav-item-icon:hover,
        .cf-nav-item-icon:hover,
        .mr-nav-item-icon:hover,
        .rep-nav-item-icon:hover,
        .lg-nav-item-icon:hover,
        .wi-nav-item-icon:hover {
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.9);
        }
        .admin-nav-item-icon.active,
        .cf-nav-item-icon.active,
        .mr-nav-item-icon.active,
        .rep-nav-item-icon.active,
        .lg-nav-item-icon.active,
        .wi-nav-item-icon.active {
            background: rgba(201, 162, 39, 0.12);
            color: #fff;
            border-left-color: #c9a227;
        }
        .admin-logout-btn,
        .cf-logout-btn,
        .mr-logout-btn,
        .rep-logout-btn,
        .lg-logout-btn,
        .wi-logout-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.35);
            padding: 4px;
            transition: color 0.15s;
            display: flex;
            align-items: center;
        }
        .admin-logout-btn:hover,
        .cf-logout-btn:hover,
        .mr-logout-btn:hover,
        .rep-logout-btn:hover,
        .lg-logout-btn:hover,
        .wi-logout-btn:hover {
            color: rgba(255, 255, 255, 0.7);
        }
        `;
        document.head.appendChild(style);
    }, []);
}

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

function initials(name) {
    return (name || "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function AdminSidebar({
    admin,
    activePage,
    onNavigate,
    onLogout,
    collapsed = false,
    badgeCounts = {},
}) {
    useAdminSidebarStyles();

    const isAdmin = admin?.role === "admin";

    const navItems = [
        { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { key: "walkIn", label: "Walk-in Issuance", Icon: FilePlus },
        {
            key: "manageRequests",
            label: "Manage Requests",
            Icon: FileText,
            badge: badgeCounts.manageRequests,
        },
        { key: "residentRecords", label: "Resident Records", Icon: Users },
        { key: "reports", label: "Reports & Exports", Icon: BarChart2 },
    ];

    const saItems = [
        { key: "logs", label: "Logs & Audit Trail", Icon: ScrollText },
        { key: "manageAccounts", label: "Manage Accounts", Icon: UserCog },
        { key: "settings", label: "System Settings", Icon: Settings },
    ];

    const navBtn = ({ item }) =>
        collapsed ? (
            <button
                key={item.key}
                className={`admin-nav-item-icon cf-nav-item-icon mr-nav-item-icon rep-nav-item-icon lg-nav-item-icon wi-nav-item-icon${
                    activePage === item.key ? " active" : ""
                }`}
                onClick={() => onNavigate(item.key)}
                title={item.label}
            >
                <item.Icon size={18} opacity={0.7} />
            </button>
        ) : (
            <button
                key={item.key}
                className={`admin-nav-item cf-nav-item mr-nav-item rep-nav-item lg-nav-item wi-nav-item${
                    activePage === item.key ? " active" : ""
                }`}
                onClick={() => onNavigate(item.key)}
            >
                <item.Icon size={15} opacity={0.7} />
                {item.label}
                {item.badge && <span style={sd.navBadge}>{item.badge}</span>}
            </button>
        );

    return (
        <aside style={{ ...sd.sidebar, width: collapsed ? 60 : 240 }}>
            <div
                style={{
                    ...sd.brand,
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "18px 0" : "20px 20px 16px",
                }}
            >
                <div style={sd.brandSeal}>
                    <img
                        src="/logo.png"
                        alt="Barangay Seal"
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                </div>
                {!collapsed && (
                    <div>
                        <div style={sd.brandName}>CertiFast</div>
                        <div style={sd.brandSub}>East Tapinac</div>
                    </div>
                )}
            </div>
            <div style={sd.goldBar} />
            {!collapsed && <div style={sd.sectionLabel}>Main Menu</div>}
            {navItems.map((item) => navBtn({ item }))}
            <div style={{ flex: 1 }} />
            {isAdmin && (
                <div style={sd.superAdminSection}>
                    {!collapsed && (
                        <div style={{ ...sd.sectionLabel, paddingTop: 10 }}>
                            Admin
                        </div>
                    )}
                    {saItems.map((item) => navBtn({ item }))}
                </div>
            )}
            <div
                style={{
                    ...sd.userRow,
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "14px 0" : "14px 20px",
                }}
            >
                <div style={sd.userAvatar}>{initials(admin?.name || "DA")}</div>
                {!collapsed && (
                    <>
                        <div style={sd.userInfo}>
                            <div style={sd.userName}>
                                {admin?.name || "Dante Administrador"}
                            </div>
                            <div style={sd.userRole}>
                                {admin?.role || "Admin"}
                            </div>
                        </div>
                        <button
                            className="admin-logout-btn cf-logout-btn mr-logout-btn rep-logout-btn lg-logout-btn wi-logout-btn"
                            onClick={onLogout}
                        >
                            <LogOut size={14} />
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}

export function AdminMobileSidebar({
    admin,
    activePage,
    onNavigate,
    onClose,
    onLogout,
    badgeCounts = {},
}) {
    useAdminSidebarStyles();

    const isAdmin = admin?.role === "admin";

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const navItems = [
        { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { key: "walkIn", label: "Walk-in Issuance", Icon: FilePlus },
        {
            key: "manageRequests",
            label: "Manage Requests",
            Icon: FileText,
            badge: badgeCounts.manageRequests,
        },
        { key: "residentRecords", label: "Resident Records", Icon: Users },
        { key: "reports", label: "Reports & Exports", Icon: BarChart2 },
    ];
    const saItems = [
        { key: "logs", label: "Logs & Audit Trail", Icon: ScrollText },
        { key: "manageAccounts", label: "Manage Accounts", Icon: UserCog },
        { key: "settings", label: "System Settings", Icon: Settings },
    ];

    const navBtn = ({ item }) => (
        <button
            key={item.key}
            className={`admin-nav-item cf-nav-item mr-nav-item rep-nav-item lg-nav-item wi-nav-item${
                activePage === item.key ? " active" : ""
            }`}
            onClick={() => {
                onNavigate(item.key);
                onClose();
            }}
        >
            <item.Icon size={15} opacity={0.7} />
            {item.label}
        </button>
    );

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 200,
                display: "flex",
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                }}
                onClick={onClose}
            />
            <aside
                style={{
                    ...sd.sidebar,
                    width: 260,
                    position: "relative",
                    animation: "sidebarSlideIn 0.22s ease both",
                    zIndex: 1,
                }}
            >
                <div style={{ ...sd.brand, justifyContent: "space-between" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div style={sd.brandSeal}>
                            <img
                                src="/logo.png"
                                alt="Barangay Seal"
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                        <div>
                            <div style={sd.brandName}>CertiFast</div>
                            <div style={sd.brandSub}>East Tapinac</div>
                        </div>
                    </div>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.5)",
                            padding: 4,
                        }}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div style={sd.goldBar} />
                <div style={sd.sectionLabel}>Main Menu</div>
                {navItems.map((item) => navBtn({ item }))}
                <div style={{ flex: 1 }} />
                {isAdmin && (
                    <div style={sd.superAdminSection}>
                        <div style={{ ...sd.sectionLabel, paddingTop: 10 }}>
                            Admin
                        </div>
                        {saItems.map((item) => navBtn({ item }))}
                    </div>
                )}
                <div style={sd.userRow}>
                    <div style={sd.userAvatar}>
                        {initials(admin?.name || "DA")}
                    </div>
                    <div style={sd.userInfo}>
                        <div style={sd.userName}>
                            {admin?.name || "Dante Administrador"}
                        </div>
                        <div style={sd.userRole}>{admin?.role || "Admin"}</div>
                    </div>
                    <button
                        className="admin-logout-btn cf-logout-btn mr-logout-btn rep-logout-btn lg-logout-btn wi-logout-btn"
                        onClick={() => {
                            onLogout();
                            onClose();
                        }}
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </aside>
        </div>
    );
}
