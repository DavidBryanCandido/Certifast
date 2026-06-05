import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Bell,
    BellRing,
    CheckCheck,
    Clock,
    FileText,
    PackageCheck,
    Printer,
    UserCheck,
} from "lucide-react";
import adminRequestService from "../services/adminRequestService";
import residentRecordsService from "../services/residentRecordsService";

const READ_KEY = "certifast_admin_notification_read_ids_v1";
const REFRESH_INTERVAL = 60000;

function readStoredIds() {
    try {
        const raw = localStorage.getItem(READ_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
        return new Set();
    }
}

function persistReadIds(ids) {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids).slice(-300)));
}

function toMs(value) {
    if (!value) return 0;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatTime(value) {
    if (!value) return "Recently";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function normalizeRows(result) {
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result)) return result;
    return [];
}

function requestNotification(row) {
    const status = String(row.status || "pending").toLowerCase();
    if (!["pending", "approved", "ready"].includes(status)) return null;

    const requestId = row.request_id;
    const certType = row.cert_type || "Certificate request";
    const residentName = row.resident_name || "A resident";
    const base = {
        requestId,
        route: `/admin/manage-requests?status=${status}&requestId=${requestId}`,
        time:
            status === "ready"
                ? row.processed_at || row.requested_at
                : row.requested_at,
        kind: status,
    };

    if (status === "pending") {
        return {
            ...base,
            id: `request-pending-${requestId}-${row.requested_at || ""}`,
            title: "New certificate request",
            message: `${residentName} requested ${certType}.`,
            tone: "amber",
        };
    }

    if (status === "approved") {
        return {
            ...base,
            id: `request-approved-${requestId}-${row.processed_at || row.requested_at || ""}`,
            title: "Approved request needs printing",
            message: `${certType} for ${residentName} is approved and waiting to be printed.`,
            tone: "blue",
        };
    }

    return {
        ...base,
        id: `request-ready-${requestId}-${row.processed_at || row.requested_at || ""}`,
        title: "Certificate ready for release",
        message: `${certType} for ${residentName} is ready for pickup.`,
        tone: "green",
    };
}

function residentNotification(row) {
    const residentId = row.resident_id;
    return {
        id: `resident-pending-${residentId}-${row.created_at || ""}`,
        kind: "resident",
        residentId,
        title: "Resident verification pending",
        message: `${row.full_name || "A resident"} is waiting for account verification.`,
        route: "/admin/manage-accounts?tab=residents&residentStatus=pending_verification",
        time: row.created_at,
        tone: "navy",
    };
}

function notificationIcon(kind) {
    if (kind === "resident") return UserCheck;
    if (kind === "ready") return PackageCheck;
    if (kind === "approved") return Printer;
    return FileText;
}

function useAdminNotificationStyles() {
    useEffect(() => {
        if (document.head.querySelector("[data-admin-notifications]")) return;

        const style = document.createElement("style");
        style.setAttribute("data-admin-notifications", "true");
        style.innerText = `
        .anb-wrap {
            position: relative;
            flex-shrink: 0;
            font-family: 'Source Serif 4', serif;
        }
        .anb-button {
            width: 34px;
            height: 34px;
            border: 1px solid #e4dfd4;
            border-radius: 6px;
            background: #fff;
            color: var(--color-primary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            transition: background .15s, border-color .15s, color .15s;
        }
        .anb-button:hover,
        .anb-button.open {
            background: #f8f6f1;
            border-color: #d4cbbd;
            color: #0b1c40;
        }
        .anb-count {
            position: absolute;
            top: -6px;
            right: -6px;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            border-radius: 999px;
            background: #b02020;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border: 2px solid #fff;
        }
        .anb-panel {
            position: absolute;
            top: 42px;
            right: 0;
            width: min(390px, calc(100vw - 32px));
            max-height: min(560px, calc(100vh - 86px));
            background: #fff;
            border: 1px solid #e4dfd4;
            border-radius: 8px;
            box-shadow: 0 18px 44px rgba(14, 37, 84, .18);
            z-index: 350;
            overflow: hidden;
        }
        .anb-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border-bottom: 1px solid #f0ece4;
        }
        .anb-title {
            font-family: 'Playfair Display', serif;
            font-size: 14px;
            font-weight: 700;
            color: var(--color-primary);
        }
        .anb-mark {
            border: none;
            background: transparent;
            color: var(--color-primary);
            font-size: 11px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            padding: 3px 0;
            font-family: 'Source Serif 4', serif;
        }
        .anb-list {
            max-height: 440px;
            overflow-y: auto;
        }
        .anb-item {
            width: 100%;
            border: none;
            border-bottom: 1px solid #f5f0ea;
            background: #fff;
            display: flex;
            gap: 12px;
            padding: 13px 16px;
            text-align: left;
            cursor: pointer;
            font-family: 'Source Serif 4', serif;
            color: inherit;
        }
        .anb-item:last-child {
            border-bottom: none;
        }
        .anb-item:hover {
            background: #fdfaf5;
        }
        .anb-item.unread {
            background: #fbf8ef;
        }
        .anb-item.unread:hover {
            background: #f7f0dc;
        }
        .anb-icon {
            width: 30px;
            height: 30px;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .anb-icon.amber {
            background: #fff3e0;
            color: #b86800;
        }
        .anb-icon.blue {
            background: #e8eef8;
            color: #1a4a8a;
        }
        .anb-icon.green {
            background: #e8f5ee;
            color: #1a7a4a;
        }
        .anb-icon.navy {
            background: #edf1f8;
            color: var(--color-primary);
        }
        .anb-copy {
            min-width: 0;
            flex: 1;
        }
        .anb-item-title {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #1a1a2e;
            font-size: 12.5px;
            font-weight: 800;
            margin-bottom: 3px;
        }
        .anb-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--color-accent);
            flex-shrink: 0;
        }
        .anb-message {
            color: #4a4a6a;
            font-size: 12px;
            line-height: 1.4;
        }
        .anb-time {
            margin-top: 6px;
            color: #9090aa;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .anb-state {
            padding: 28px 16px;
            text-align: center;
            color: #9090aa;
            font-size: 12px;
        }
        @media (max-width: 640px) {
            .anb-panel {
                right: -56px;
            }
        }
        `;
        document.head.appendChild(style);
    }, []);
}

export default function AdminNotificationsBell({
    admin,
    onNavigate,
    onLogout,
}) {
    useAdminNotificationStyles();
    const wrapperRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [readIds, setReadIds] = useState(readStoredIds);

    const role = String(admin?.role || "").toLowerCase();
    const canReviewResidents = role === "admin" || role === "superadmin";

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const requestPromise = adminRequestService.getRequests();
            const residentPromise = canReviewResidents
                ? residentRecordsService.getResidents({
                      status: "pending_verification",
                      sort: "date",
                      limit: 8,
                  })
                : Promise.resolve({ data: [] });

            const [requestResult, residentResult] = await Promise.all([
                requestPromise,
                residentPromise,
            ]);

            const requestItems = normalizeRows(requestResult)
                .map(requestNotification)
                .filter(Boolean);
            const residentItems = normalizeRows(residentResult).map(
                residentNotification,
            );

            setItems(
                [...requestItems, ...residentItems]
                    .map((item) => ({ ...item, sortMs: toMs(item.time) }))
                    .sort((a, b) => b.sortMs - a.sortMs)
                    .slice(0, 20),
            );
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                onLogout?.();
                return;
            }
            setError("Unable to load admin notifications.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [canReviewResidents, onLogout]);

    useEffect(() => {
        loadNotifications();
        const timer = window.setInterval(loadNotifications, REFRESH_INTERVAL);
        return () => window.clearInterval(timer);
    }, [loadNotifications]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    const unreadCount = useMemo(
        () => items.filter((item) => !readIds.has(item.id)).length,
        [items, readIds],
    );

    const markRead = (id) => {
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            persistReadIds(next);
            return next;
        });
    };

    const markAllRead = () => {
        setReadIds((prev) => {
            const next = new Set(prev);
            items.forEach((item) => next.add(item.id));
            persistReadIds(next);
            return next;
        });
    };

    const openItem = (item) => {
        markRead(item.id);
        setOpen(false);
        if (onNavigate) {
            onNavigate(item.route);
        } else {
            window.location.assign(item.route);
        }
    };

    return (
        <div className="anb-wrap" ref={wrapperRef}>
            <button
                type="button"
                className={`anb-button${open ? " open" : ""}`}
                aria-label="Admin notifications"
                title="Admin notifications"
                onClick={() => setOpen((value) => !value)}
            >
                {unreadCount > 0 ? <BellRing size={17} /> : <Bell size={17} />}
                {unreadCount > 0 && (
                    <span className="anb-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="anb-panel">
                    <div className="anb-head">
                        <div>
                            <div className="anb-title">Admin Notifications</div>
                            <div className="anb-time" style={{ marginTop: 2 }}>
                                {unreadCount > 0
                                    ? `${unreadCount} needs attention`
                                    : "All caught up"}
                            </div>
                        </div>
                        {items.length > 0 && (
                            <button
                                type="button"
                                className="anb-mark"
                                onClick={markAllRead}
                            >
                                <CheckCheck size={13} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="anb-list">
                        {loading && items.length === 0 ? (
                            <div className="anb-state">
                                Loading notifications...
                            </div>
                        ) : error ? (
                            <div className="anb-state">{error}</div>
                        ) : items.length === 0 ? (
                            <div className="anb-state">
                                No pending admin alerts right now.
                            </div>
                        ) : (
                            items.map((item) => {
                                const Icon = notificationIcon(item.kind);
                                const unread = !readIds.has(item.id);
                                return (
                                    <button
                                        type="button"
                                        key={item.id}
                                        className={`anb-item${unread ? " unread" : ""}`}
                                        onClick={() => openItem(item)}
                                    >
                                        <span
                                            className={`anb-icon ${item.tone}`}
                                        >
                                            <Icon size={15} />
                                        </span>
                                        <span className="anb-copy">
                                            <span className="anb-item-title">
                                                {unread && (
                                                    <span className="anb-dot" />
                                                )}
                                                {item.title}
                                            </span>
                                            <span className="anb-message">
                                                {item.message}
                                            </span>
                                            <span className="anb-time">
                                                <Clock size={11} />
                                                {formatTime(item.time)}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
