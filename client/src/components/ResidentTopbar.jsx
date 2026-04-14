// =============================================================
// FILE: client/src/components/ResidentTopbar.jsx
// =============================================================
// Shared topbar for all resident pages.
// Includes: brand (mobile), page greeting (desktop), notifications bell, logout.
//
// Usage:
//   import ResidentTopbar from "../../components/ResidentTopbar";
//   <ResidentTopbar resident={resident} onLogout={onLogout} isMobile={isMobile} />
// =============================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, X, Check, CheckCheck } from "lucide-react";
import residentNotificationService from "../services/residentNotificationService";

if (!document.head.querySelector("[data-resident-topbar]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-topbar", "true");
    s.innerText = `
    .rtb-wrap {
        background: linear-gradient(135deg, #0e2554 0%, #163066 100%);
        border-bottom: 1px solid rgba(201,162,39,0.2);
        position: sticky;
        top: 0;
        z-index: 100;
        flex-shrink: 0;
    }
    .rtb-inner {
        padding: 0 24px;
        height: 60px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .rtb-gold-line {
        height: 2px;
        background: linear-gradient(90deg, #c9a227, #f0d060, #c9a227);
    }

    /* Notification bell */
    .rtb-bell-btn {
        position: relative;
        width: 36px; height: 36px;
        border-radius: 8px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background 0.15s;
        flex-shrink: 0;
    }
    .rtb-bell-btn:hover { background: rgba(255,255,255,0.14); }
    .rtb-badge {
        position: absolute;
        top: -4px; right: -4px;
        min-width: 16px; height: 16px;
        background: #c9a227;
        color: #091a3e;
        font-size: 9px;
        font-weight: 800;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        padding: 0 4px;
        font-family: 'Source Serif 4', serif;
        border: 1.5px solid #0e2554;
    }

    /* Notification dropdown */
    .rtb-notif-panel {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: min(340px, calc(100vw - 32px));
        max-width: calc(100vw - 32px);
        background: #fff;
        border: 1px solid #e4dfd4;
        border-radius: 10px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        z-index: 500;
        animation: rtbNotifPop 0.18s ease both;
        overflow: hidden;
    }
    @media (max-width: 640px) {
        .rtb-notif-panel {
            position: fixed;
            top: 68px;
            right: 16px;
            left: 16px;
            width: auto;
            max-width: calc(100vw - 32px);
            border-radius: 14px;
        }
    }
    @keyframes rtbNotifPop {
        from { opacity: 0; transform: translateY(-8px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .rtb-notif-item {
        display: flex;
        gap: 10px;
        padding: 12px 16px;
        border-bottom: 1px solid #f5f2ee;
        cursor: pointer;
        transition: background 0.1s;
        align-items: flex-start;
    }
    .rtb-notif-item:last-child { border-bottom: none; }
    .rtb-notif-item:hover { background: #faf8f4; }
    .rtb-notif-item.unread { background: #f8f6ff; }
    .rtb-notif-item.unread:hover { background: #f0ecff; }
    `;
    document.head.appendChild(s);
}

const NOTIF_COLORS = {
    request_approved: { bg: "#e8eef8", color: "#1a4a8a", dot: "#1a4a8a" },
    request_ready: { bg: "#e8f5ee", color: "#1a7a4a", dot: "#1a7a4a" },
    request_rejected: { bg: "#fdecea", color: "#b02020", dot: "#b02020" },
    request_released: { bg: "#e8f5ee", color: "#1a7a4a", dot: "#c9a227" },
    default: { bg: "#f8f6f1", color: "#4a4a6a", dot: "#9090aa" },
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function ResidentTopbar({
    resident,
    onLogout,
    isMobile,
    pageTitle,
}) {
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const name = resident?.full_name || resident?.name || "Resident";
    const firstName = name.split(" ")[0];

    // Close panel on outside click
    useEffect(() => {
        if (!showNotif) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showNotif]);

    // Fetch unread count on mount
    useEffect(() => {
        residentNotificationService
            .getUnreadCount()
            .then((data) => setUnreadCount(data?.count || 0))
            .catch(() => {});
    }, []);

    const openNotifications = async () => {
        setShowNotif((v) => !v);
        if (!showNotif && notifications.length === 0) {
            setLoading(true);
            try {
                const data =
                    await residentNotificationService.getNotifications();
                setNotifications(Array.isArray(data?.data) ? data.data : []);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        }
    };

    const markAllRead = async () => {
        try {
            await residentNotificationService.markAllRead();
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true })),
            );
        } catch {
            // Ignore transient failures; UI can retry on next interaction.
        }
    };

    const markRead = async (id) => {
        try {
            await residentNotificationService.markRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notification_id === id ? { ...n, is_read: true } : n,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // Ignore transient failures; item state is refreshed on next fetch.
        }
    };

    return (
        <div className="rtb-wrap">
            <div className="rtb-inner">
                {/* Mobile brand */}
                {isMobile && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                border: "1.5px solid rgba(201,162,39,0.5)",
                                overflow: "hidden",
                                flexShrink: 0,
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
                        <div>
                            <div
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#fff",
                                    lineHeight: 1.2,
                                }}
                            >
                                CertiFast
                            </div>
                            <div
                                style={{
                                    fontSize: 9,
                                    color: "rgba(201,162,39,0.7)",
                                    letterSpacing: "1.5px",
                                    textTransform: "uppercase",
                                }}
                            >
                                Resident Portal
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop greeting */}
                {!isMobile && (
                    <div
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#fff",
                            flex: 1,
                        }}
                    >
                        {pageTitle || `Good day, ${firstName}`}
                    </div>
                )}

                {/* Notifications bell */}
                <div style={{ position: "relative" }} ref={panelRef}>
                    <button
                        className="rtb-bell-btn"
                        onClick={openNotifications}
                        title="Notifications"
                    >
                        <Bell size={17} color="#fff" strokeWidth={2} />
                        {unreadCount > 0 && (
                            <div className="rtb-badge">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </div>
                        )}
                    </button>

                    {/* Notification dropdown panel */}
                    {showNotif && (
                        <div className="rtb-notif-panel">
                            {/* Header */}
                            <div
                                style={{
                                    padding: "12px 16px",
                                    borderBottom: "1px solid #e4dfd4",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "#f8f6f1",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                marginLeft: 8,
                                                padding: "2px 8px",
                                                borderRadius: 10,
                                                background: "#0e2554",
                                                color: "#fff",
                                            }}
                                        >
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 6,
                                        alignItems: "center",
                                    }}
                                >
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            title="Mark all as read"
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "#0e2554",
                                                fontSize: 11,
                                                fontFamily:
                                                    "'Source Serif 4', serif",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <CheckCheck size={13} /> All read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowNotif(false)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#9090aa",
                                            display: "flex",
                                        }}
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div style={{ maxHeight: 340, overflowY: "auto" }}>
                                {loading ? (
                                    <div
                                        style={{
                                            padding: 24,
                                            textAlign: "center",
                                            color: "#9090aa",
                                            fontSize: 12,
                                        }}
                                    >
                                        Loading…
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div
                                        style={{
                                            padding: "32px 16px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Bell
                                            size={28}
                                            color="#e4dfd4"
                                            strokeWidth={1.5}
                                            style={{ marginBottom: 8 }}
                                        />
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#9090aa",
                                            }}
                                        >
                                            No notifications yet
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11.5,
                                                color: "#c0bbb0",
                                                marginTop: 4,
                                            }}
                                        >
                                            You'll be notified when your request
                                            status changes
                                        </div>
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const cfg =
                                            NOTIF_COLORS[n.type] ||
                                            NOTIF_COLORS.default;
                                        return (
                                            <div
                                                key={n.notification_id}
                                                className={`rtb-notif-item${!n.is_read ? " unread" : ""}`}
                                                onClick={() => {
                                                    markRead(n.notification_id);
                                                    navigate(
                                                        "/resident/my-requests",
                                                    );
                                                    setShowNotif(false);
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        background: !n.is_read
                                                            ? cfg.dot
                                                            : "#e4dfd4",
                                                        flexShrink: 0,
                                                        marginTop: 5,
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight:
                                                                n.is_read
                                                                    ? 400
                                                                    : 600,
                                                            color: "#1a1a2e",
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {n.title}
                                                    </div>
                                                    {n.message && (
                                                        <div
                                                            style={{
                                                                fontSize: 11.5,
                                                                color: "#9090aa",
                                                                marginTop: 2,
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {n.message}
                                                        </div>
                                                    )}
                                                    <div
                                                        style={{
                                                            fontSize: 10.5,
                                                            color: "#c0bbb0",
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        {timeAgo(n.created_at)}
                                                    </div>
                                                </div>
                                                {!n.is_read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markRead(
                                                                n.notification_id,
                                                            );
                                                        }}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: "#9090aa",
                                                            flexShrink: 0,
                                                            padding: 2,
                                                        }}
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div
                                    style={{
                                        padding: "10px 16px",
                                        borderTop: "1px solid #e4dfd4",
                                        background: "#f8f6f1",
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            navigate("/resident/notifications");
                                            setShowNotif(false);
                                        }}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#0e2554",
                                            fontSize: 12,
                                            fontFamily:
                                                "'Source Serif 4', serif",
                                            fontWeight: 600,
                                            width: "100%",
                                            textAlign: "center",
                                        }}
                                    >
                                        View all notifications →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile logout */}
                {isMobile && (
                    <button
                        onClick={onLogout}
                        title="Log out"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 12px",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 5,
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                            fontFamily: "'Source Serif 4', serif",
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        <LogOut size={14} strokeWidth={2} />
                        Log Out
                    </button>
                )}
            </div>
            <div className="rtb-gold-line" />
        </div>
    );
}
