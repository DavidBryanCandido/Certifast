// =============================================================
// FILE: client/src/components/ResidentSidebar.jsx
// =============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    Plus,
    FileText,
    QrCode,
    UserCircle,
    LogOut,
    X,
    AlertTriangle,
} from "lucide-react";

if (!document.head.querySelector("[data-resident-sidebar]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-sidebar", "true");
    s.innerText = `
    .rsb-wrap {
        width: 240px;
        flex-shrink: 0;
        background: linear-gradient(180deg, #0e2554 0%, #091a3e 100%);
        min-height: 100vh;
        height: 100vh;
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(201,162,39,0.15);
        z-index: 50;
        overflow: hidden;
        transition: width 0.2s ease;
    }
    .rsb-wrap.collapsed {
        width: 82px;
    }
    .rsb-wrap.collapsed .rsb-brand-text,
    .rsb-wrap.collapsed .rsb-item-label,
    .rsb-wrap.collapsed .rsb-request-label,
    .rsb-wrap.collapsed .rsb-section-label,
    .rsb-wrap.collapsed .rsb-profile-info,
    .rsb-wrap.collapsed .rsb-logout-label {
        display: none;
    }
    .rsb-wrap.collapsed .rsb-brand {
        padding: 14px 0;
        justify-content: center;
        text-align: center;
    }
    .rsb-wrap.collapsed .rsb-brand > div:first-child {
        width: 54px !important;
        height: 54px !important;
    }
    .rsb-wrap.collapsed .rsb-item {
        justify-content: center;
        padding: 10px 0;
    }
    .rsb-wrap.collapsed .rsb-item .rsb-item-label,
    .rsb-wrap.collapsed .rsb-request-btn .rsb-request-label,
    .rsb-wrap.collapsed .rsb-profile-info,
    .rsb-wrap.collapsed .rsb-logout-label,
    .rsb-wrap.collapsed .rsb-section-label,
    .rsb-wrap.collapsed .rsb-brand-text {
        display: none;
    }
    .rsb-wrap.collapsed .rsb-request-btn {
        justify-content: center;
        padding: 10px 0;
        min-width: 0;
        border-left-width: 0;
        border-bottom: 3px solid #c9a227;
        margin: 4px 9px;
        width: calc(100% - 18px);
        border-radius: 6px;
    }
    .rsb-wrap.collapsed .rsb-profile-row {
        justify-content: center;
        padding: 10px 0;
    }
    .rsb-wrap.collapsed .rsb-logout {
        justify-content: center;
        padding: 10px 0;
    }
    .rsb-brand {
        padding: 20px 16px 18px;
        border-bottom: 1px solid rgba(201,162,39,0.15);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        text-align: center;
    }
    .rsb-nav {
        flex: 1;
        padding: 8px 0;
        overflow-y: auto;
    }
    .rsb-section-label {
        font-size: 9px;
        font-weight: 700;
        color: rgba(201,162,39,0.45);
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: 14px 18px 6px;
        font-family: 'Source Serif 4', serif;
    }
    .rsb-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        width: 100%;
        font-size: 13.5px;
        color: rgba(255,255,255,0.6);
        cursor: pointer;
        border: none;
        background: none;
        border-left: 3px solid transparent;
        font-family: 'Source Serif 4', serif;
        text-align: left;
        transition: all 0.15s;
    }
    .rsb-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
    .rsb-item.rsb-active { background: rgba(201,162,39,0.12); color: #fff; border-left-color: #c9a227; font-weight: 600; }
    .rsb-item svg { opacity: 0.55; flex-shrink: 0; transition: opacity 0.15s; }
    .rsb-item.rsb-active svg { opacity: 1; }
    .rsb-item:hover svg { opacity: 0.85; }
    .rsb-request-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        width: 100%;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        border-left: 3px solid #c9a227;
        background: linear-gradient(135deg, rgba(201,162,39,0.18), rgba(201,162,39,0.06));
        color: #f0d060;
        font-family: 'Source Serif 4', serif;
        text-align: left;
        transition: all 0.15s;
        margin: 4px 0;
    }
    .rsb-request-btn:hover { background: rgba(201,162,39,0.25); color: #fff; }
    .rsb-request-btn.rsb-active { background: rgba(201,162,39,0.28); color: #fff; }
    .rsb-request-btn svg { opacity: 1; flex-shrink: 0; }
    .rsb-bottom {
        flex-shrink: 0;
        padding: 10px 0 0;
    }
    .rsb-profile-row {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 12px 18px 14px;
        cursor: pointer;
        border-top: 1px solid rgba(201,162,39,0.12);
        transition: background 0.15s;
    }
    .rsb-profile-row:hover { background: rgba(255,255,255,0.04); }
    .rsb-logout {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 18px 14px;
        width: 100%;
        font-size: 12.5px;
        color: rgba(255,255,255,0.35);
        cursor: pointer;
        border: none;
        background: none;
        border-left: 3px solid transparent;
        font-family: 'Source Serif 4', serif;
        text-align: left;
        transition: all 0.15s;
    }
    .rsb-logout:hover { color: #ff8888; background: rgba(176,32,32,0.08); border-left-color: #b02020; }
    .rsb-logout svg { opacity: 0.45; flex-shrink: 0; }
    .rsb-logout:hover svg { opacity: 1; }

    /* Logout modal */
    .rsb-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    .rsb-modal {
        background: #fff;
        border-radius: 10px;
        padding: 28px 28px 24px;
        width: 100%;
        max-width: 360px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        animation: rsbModalPop 0.18s ease both;
    }
    @keyframes rsbModalPop {
        from { opacity: 0; transform: scale(0.94); }
        to   { opacity: 1; transform: scale(1); }
    }
    .rsb-modal-btn {
        flex: 1;
        padding: 10px;
        border-radius: 5px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Source Serif 4', serif;
        cursor: pointer;
        border: none;
        transition: opacity 0.15s;
    }
    .rsb-modal-btn:hover { opacity: 0.85; }
    `;
    document.head.appendChild(s);
}

const NAV_ITEMS = [
    { key: "home", icon: Home, label: "Home", path: "/resident/home" },
    {
        key: "history",
        icon: FileText,
        label: "My Requests",
        path: "/resident/my-requests",
    },
    { key: "qr", icon: QrCode, label: "My QR Code", path: "/resident/my-qr" },
];

export default function ResidentSidebar({ active, resident, onLogout }) {
    const [collapsed, setCollapsed] = useState(
        window.innerWidth < 1100 && window.innerWidth >= 640,
    );

    useEffect(() => {
        const fn = () =>
            setCollapsed(window.innerWidth < 1100 && window.innerWidth >= 640);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const name = resident?.full_name || resident?.name || "Resident";
    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        onLogout?.();
    };

    return (
        <>
            <div className={`rsb-wrap${collapsed ? " collapsed" : ""}`}>
                {/* Brand — centered, bigger logo */}
                <div className="rsb-brand">
                    <div
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            border: "2.5px solid rgba(201,162,39,0.6)",
                            overflow: "hidden",
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src="https://fyihciqyaugzhqeezxci.supabase.co/storage/v1/object/public/certifast-uploads/branding/logo.png"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/logo.png";
                            }}
                            alt="Seal"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                    <div className="rsb-brand-text">
                        <div
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#fff",
                                lineHeight: 1.3,
                            }}
                        >
                            CertiFast
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "rgba(201,162,39,0.75)",
                                letterSpacing: "0.5px",
                                marginTop: 4,
                            }}
                        >
                            Barangay East Tapinac
                        </div>
                        <div
                            style={{
                                fontSize: 10.5,
                                color: "rgba(255,255,255,0.35)",
                                letterSpacing: "0.5px",
                                marginTop: 3,
                            }}
                        >
                            Resident Portal
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <div className="rsb-nav">
                    <div className="rsb-section-label">Menu</div>
                    {NAV_ITEMS.map(({ key, icon: Icon, label, path }) => (
                        <button
                            key={key}
                            className={`rsb-item${active === key ? " rsb-active" : ""}`}
                            onClick={() => navigate(path)}
                        >
                            <Icon
                                size={16}
                                strokeWidth={active === key ? 2.5 : 2}
                            />
                            <span className="rsb-item-label">{label}</span>
                        </button>
                    ))}
                    <div
                        className="rsb-section-label"
                        style={{ paddingTop: 16 }}
                    >
                        Actions
                    </div>
                    <button
                        className={`rsb-request-btn${active === "request" ? " rsb-active" : ""}`}
                        onClick={() => navigate("/resident/submit-request")}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        <span className="rsb-request-label">New Request</span>
                    </button>
                </div>

                {/* Bottom — resident info + logout */}
                <div className="rsb-bottom">
                    <div
                        className="rsb-profile-row"
                        onClick={() => navigate("/resident/profile")}
                    >
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: "rgba(201,162,39,0.15)",
                                border: "1.5px solid rgba(201,162,39,0.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#c9a227",
                                flexShrink: 0,
                            }}
                        >
                            {initials}
                        </div>
                        <div
                            className="rsb-profile-info"
                            style={{ flex: 1, minWidth: 0 }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,0.8)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {name}
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "rgba(255,255,255,0.45)",
                                    marginTop: 1,
                                }}
                            >
                                View Profile
                            </div>
                        </div>
                        <UserCircle size={14} color="rgba(255,255,255,0.2)" />
                    </div>
                    <button
                        className="rsb-logout"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <LogOut size={15} strokeWidth={2} />
                        <span className="rsb-logout-label">Log Out</span>
                    </button>
                </div>
            </div>

            {/* Logout confirmation modal */}
            {showLogoutModal && (
                <div
                    className="rsb-modal-overlay"
                    onClick={() => setShowLogoutModal(false)}
                >
                    <div
                        className="rsb-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 16,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#fff3e0",
                                    border: "1.5px solid #f0b84a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <AlertTriangle
                                    size={18}
                                    color="#b86800"
                                    strokeWidth={2}
                                />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    Log Out
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#9090aa",
                                        marginTop: 2,
                                    }}
                                >
                                    CertiFast · Resident Portal
                                </div>
                            </div>
                        </div>
                        <p
                            style={{
                                fontSize: 13.5,
                                color: "#4a4a6a",
                                lineHeight: 1.6,
                                marginBottom: 22,
                            }}
                        >
                            Are you sure you want to log out of your account?
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                className="rsb-modal-btn"
                                style={{
                                    background: "#f8f6f1",
                                    color: "#4a4a6a",
                                    border: "1px solid #e4dfd4",
                                }}
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="rsb-modal-btn"
                                style={{ background: "#0e2554", color: "#fff" }}
                                onClick={handleLogoutConfirm}
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
