// =============================================================
// FILE: client/src/pages/resident/ResidentNotifications.jsx
// =============================================================
// Resident notification list page used by the topbar "View all notifications" action.
// =============================================================

import { useEffect, useState } from "react";
import { Bell, Check, Clock } from "lucide-react";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";
import residentNotificationService from "../../services/residentNotificationService";

if (!document.head.querySelector("[data-resident-notifications]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-notifications", "true");
    s.innerText = `
    .rn-root {
        min-height: 100vh;
        background: #f4f2ed;
        font-family: 'Source Serif 4', serif;
    }
    .rn-main {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 26px 22px 26px;
        box-sizing: border-box;
    }
    .rn-panel {
        width: 100%;
        background: #fff;
        border: 1px solid #e4dfd4;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
    }
    .rn-item {
        display: flex;
        gap: 16px;
        padding: 22px 24px;
        border-bottom: 1px solid #f0ece4;
        align-items: flex-start;
    }
    .rn-item:last-child {
        border-bottom: none;
    }
    .rn-item.unread {
        background: #f8f6ff;
    }
    .rn-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #9090aa;
    }
    .rn-title {
        font-family: 'Playfair Display', serif;
        font-size: 14px;
        font-weight: 700;
        color: #0e2554;
        margin-bottom: 6px;
    }
    .rn-message {
        font-size: 13px;
        color: #4a4a6a;
        line-height: 1.5;
    }
    .rn-empty {
        padding: 44px 22px;
        text-align: center;
        color: #9090aa;
        font-size: 14px;
    }
    .rn-empty strong {
        display: block;
        margin-bottom: 8px;
        color: #1a1a2e;
        font-size: 15px;
    }
    .rn-action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #0e2554;
        font-size: 12px;
        font-weight: 700;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
    }
    .rn-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c9a227;
        flex-shrink: 0;
    }
    @media (max-width: 1024px) {
        .rn-main {
            padding: 26px 22px 102px;
        }
    }
    @media (max-width: 640px) {
        .rn-main {
            padding: 26px 22px 108px;
        }
    }
    `;
    document.head.appendChild(s);
}

function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function NotificationIcon({ type }) {
    const normalized = String(type || "").toLowerCase();
    if (normalized.includes("ready") || normalized.includes("released")) {
        return <Check size={18} color="#1a7a4a" />;
    }
    if (normalized.includes("approved")) {
        return <Bell size={18} color="#0e2554" />;
    }
    return <Clock size={18} color="#9090aa" />;
}

export default function ResidentNotifications({ resident, onLogout }) {
    const [width, setWidth] = useState(window.innerWidth);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const result =
                    await residentNotificationService.getNotifications(50);
                const list = Array.isArray(result?.data) ? result.data : [];
                if (mounted) {
                    setNotifications(list);
                    setError("");
                }
            } catch (err) {
                if (mounted) {
                    setNotifications([]);
                    setError(
                        err?.response?.data?.message ||
                            "Unable to load notifications at this time.",
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const markRead = async (notificationId) => {
        try {
            await residentNotificationService.markRead(notificationId);
            setNotifications((prev) =>
                prev.map((item) =>
                    item.notification_id === notificationId
                        ? { ...item, is_read: true }
                        : item,
                ),
            );
        } catch {
            // ignore errors silently
        }
    };

    return (
        <div
            className="rn-root"
            style={{ display: "flex", minHeight: "100vh" }}
        >
            {!isMobile && (
                <ResidentSidebar
                    active="notifications"
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
                    pageTitle="Notifications"
                />
                <main
                    className="rn-main"
                    style={{
                        paddingBottom: isMobile ? "108px" : "26px",
                    }}
                >
                    <div className="rn-panel">
                        {loading ? (
                            <div className="rn-empty">
                                Loading notifications…
                            </div>
                        ) : error ? (
                            <div className="rn-empty">{error}</div>
                        ) : notifications.length === 0 ? (
                            <div className="rn-empty">
                                <strong>No notifications yet</strong>
                                You’ll receive updates here once your request
                                status changes.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.notification_id}
                                    className={`rn-item${notif.is_read ? "" : " unread"}`}
                                >
                                    <div className="rn-dot" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="rn-title">
                                            {notif.title || "Notification"}
                                        </div>
                                        {notif.message && (
                                            <div className="rn-message">
                                                {notif.message}
                                            </div>
                                        )}
                                        <div className="rn-meta">
                                            <span>
                                                {formatTime(notif.created_at)}
                                            </span>
                                            {!notif.is_read && (
                                                <button
                                                    type="button"
                                                    className="rn-action"
                                                    onClick={() =>
                                                        markRead(
                                                            notif.notification_id,
                                                        )
                                                    }
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
                {isMobile && <ResidentBottomNav />}
            </div>
        </div>
    );
}
