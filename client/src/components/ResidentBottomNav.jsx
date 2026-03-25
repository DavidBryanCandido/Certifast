// =============================================================
// FILE: client/src/components/ResidentBottomNav.jsx
// =============================================================
// Shared bottom navigation for all resident pages.
// Import and use at the bottom of each resident page.
//
// Usage:
//   import ResidentBottomNav from "../../components/ResidentBottomNav";
//   <ResidentBottomNav active="home" />        // in ResidentHome
//   <ResidentBottomNav active="request" />     // in SubmitRequest
//   <ResidentBottomNav active="history" />     // in MyRequests
//   <ResidentBottomNav active="qr" />          // in MyQRCode
//   <ResidentBottomNav active="profile" />     // in ResidentProfile
//
// All resident page <main> content areas MUST have:
//   paddingBottom: 76px   (or use class rbn-page-padding)
// so content isn't hidden behind the fixed nav.
// =============================================================

import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, FileText, QrCode, UserCircle } from "lucide-react";

// ── Inject styles once ────────────────────────────────────────
if (!document.head.querySelector("[data-rbn-nav]")) {
    const s = document.createElement("style");
    s.setAttribute("data-rbn-nav", "true");
    s.innerText = `
    .rbn-bar {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        background: #fff;
        border-top: 1px solid #e4dfd4;
        display: flex;
        align-items: flex-end;
        z-index: 200;
        box-shadow: 0 -2px 16px rgba(0,0,0,0.10);
        padding-bottom: env(safe-area-inset-bottom, 0px);
    }

    /* Regular nav item */
    .rbn-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 10px 6px 10px;
        background: none;
        border: none;
        cursor: pointer;
        font-family: 'Source Serif 4', serif;
        font-size: 9.5px;
        font-weight: 600;
        color: #9090aa;
        transition: color 0.15s;
        letter-spacing: 0.3px;
        -webkit-tap-highlight-color: transparent;
    }
    .rbn-item:hover { color: #0e2554; }
    .rbn-item.active { color: #0e2554; }
    .rbn-item svg { opacity: 0.45; transition: opacity 0.15s; }
    .rbn-item:hover svg,
    .rbn-item.active svg { opacity: 1; }

    /* Active tab indicator */
    .rbn-item.active::before {
        display: none;
    }
    .rbn-active-dot {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: #0e2554;
        margin-top: 2px;
    }
    .rbn-dot-placeholder {
        width: 4px; height: 4px;
        margin-top: 2px;
    }

    /* Center FAB — New Request */
    .rbn-fab-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 0 6px 10px;
        cursor: pointer;
        background: none;
        border: none;
        font-family: 'Source Serif 4', serif;
        font-size: 9.5px;
        font-weight: 600;
        color: #9090aa;
        transition: color 0.15s;
        letter-spacing: 0.3px;
        position: relative;
        -webkit-tap-highlight-color: transparent;
    }
    .rbn-fab-wrap:hover .rbn-fab { opacity: 0.88; transform: translateY(-10px) scale(1.05); }
    .rbn-fab-wrap.active .rbn-fab { background: linear-gradient(135deg, #163066, #091a3e); }
    .rbn-fab-wrap.active { color: #0e2554; }

    .rbn-fab-bg {
        width: 62px; height: 62px;
        border-radius: 50%;
        background: #ffffff;
        border: 1px solid #e4dfd4;
        box-shadow: 0 2px 18px rgba(0,0,0,0.16);
        opacity: 1;
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 0;
    }
    .rbn-fab {
        width: 52px; height: 52px;
        background: linear-gradient(135deg, #c9a227, #9a7515);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 18px rgba(201,162,39,0.45), 0 2px 6px rgba(0,0,0,0.15);
        transform: translateY(-12px);
        transition: all 0.2s ease;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
    }

    /* Subtle active line on top of bar */
    .rbn-top-line {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #0e2554, transparent);
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 0;
    }
    .rbn-item.active .rbn-top-line { opacity: 1; }

    /* Center FAB layer priority */
    .rbn-fab-wrap { z-index: 2; }
    .rbn-fab-bg { z-index: 1; }
    .rbn-fab { z-index: 3; }

    /* Page padding utility (safe bottom space) */
    .rbn-page-padding { padding-bottom: 0 !important; }

    /* Only apply extra bottom safe padding on mobile width where fixed nav is active */
    @media (max-width: 768px) {
        .rh-root { padding-bottom: 98px !important; }
        .rbn-page-padding { padding-bottom: 82px !important; }
    }

    @media (min-width: 769px) {
        .rh-root { padding-bottom: 0 !important; }
        .rbn-page-padding { padding-bottom: 0 !important; }
    }
    `;
    document.head.appendChild(s);
}

const NAV_ITEMS = [
    { key: "home", icon: Home, label: "Home", path: "/resident/home" },
    {
        key: "history",
        icon: FileText,
        label: "Requests",
        path: "/resident/my-requests",
    },
    {
        key: "request",
        icon: Plus,
        label: "New Request",
        path: "/resident/submit-request",
        isFab: true,
    },
    { key: "qr", icon: QrCode, label: "My QR", path: "/resident/my-qr" },
    {
        key: "profile",
        icon: UserCircle,
        label: "Profile",
        path: "/resident/profile",
    },
];

export default function ResidentBottomNav({ active: activeProp }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Derive active from prop or URL
    const activeKey =
        activeProp ||
        (() => {
            const p = location.pathname;
            if (p === "/resident/home") return "home";
            if (p === "/resident/my-requests") return "history";
            if (p === "/resident/submit-request") return "request";
            if (p === "/resident/my-qr") return "qr";
            if (p === "/resident/profile") return "profile";
            return "home";
        })();

    return (
        <div
            className="rbn-bar"
            role="navigation"
            aria-label="Resident navigation"
        >
            {NAV_ITEMS.map(({ key, icon: Icon, label, path, isFab }) => {
                const isActive = activeKey === key;

                if (isFab) {
                    return (
                        <button
                            key={key}
                            className={`rbn-fab-wrap${isActive ? " active" : ""}`}
                            onClick={() => navigate(path)}
                            aria-label={label}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <div className="rbn-fab-bg" />
                            <div className="rbn-fab">
                                <Icon
                                    size={24}
                                    color="#fff"
                                    strokeWidth={2.5}
                                />
                            </div>
                            <span style={{ marginTop: -2 }}>{label}</span>
                        </button>
                    );
                }

                return (
                    <button
                        key={key}
                        className={`rbn-item${isActive ? " active" : ""}`}
                        onClick={() => navigate(path)}
                        aria-label={label}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <div className="rbn-top-line" />
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{label}</span>
                        {isActive ? (
                            <div className="rbn-active-dot" />
                        ) : (
                            <div className="rbn-dot-placeholder" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
