// =============================================================
// FILE: client/src/pages/admin/ManageAccounts.jsx
// =============================================================

import { useEffect, useState, useRef, useCallback } from "react";
import {
    UserCog,
    UserPlus,
    Search,
    MoreVertical,
    X,
    Eye,
    EyeOff,
    Shield,
    Users,
    CheckCircle,
    XCircle,
    Menu,
    Edit2,
    KeyRound,
    Trash2,
    AlertTriangle,
    User,
} from "lucide-react";
import {
    AdminSidebar,
    AdminMobileSidebar,
} from "../../components/AdminSidebar";
import accountService from "../../services/accountService";
import axios from "axios";
import authService from "../../services/authService";

const API = "http://localhost:5000/api";
function adminHeaders() {
    return {
        headers: { Authorization: `Bearer ${authService.getAdminToken()}` },
    };
}

// ─── Styles ──────────────────────────────────────────────────
let maStylesInjected = false;
function useMAStyles() {
    useEffect(() => {
        if (maStylesInjected) return;
        maStylesInjected = true;
        const el = document.createElement("style");
        el.setAttribute("data-manage-accounts", "true");
        el.innerText = `
        .ma-table-row {
            display: grid;
            grid-template-columns: 2fr 1.2fr 100px 110px 130px 48px;
            align-items: center;
            padding: 13px 24px;
            border-bottom: 1px solid #f0ece4;
            transition: background 0.12s;
            font-family: 'Source Serif 4', serif;
        }
        .ma-table-row:hover { background: #faf8f4; }
        .ma-table-row:last-child { border-bottom: none; }
        .ma-table-header {
            display: grid;
            grid-template-columns: 2fr 1.2fr 100px 110px 130px 48px;
            align-items: center;
            padding: 9px 24px;
            background: #f8f6f1;
            border-bottom: 1px solid #e4dfd4;
        }
        .ma-res-row {
            display: grid;
            grid-template-columns: 2fr 1.6fr 110px 130px 48px;
            align-items: center;
            padding: 13px 24px;
            border-bottom: 1px solid #f0ece4;
            transition: background 0.12s;
            font-family: 'Source Serif 4', serif;
        }
        .ma-res-row:hover { background: #faf8f4; }
        .ma-res-row:last-child { border-bottom: none; }
        .ma-res-header {
            display: grid;
            grid-template-columns: 2fr 1.6fr 110px 130px 48px;
            align-items: center;
            padding: 9px 24px;
            background: #f8f6f1;
            border-bottom: 1px solid #e4dfd4;
        }
        .ma-col-label { font-size: 9.5px; font-weight: 600; color: #9090aa; letter-spacing: 1px; text-transform: uppercase; font-family: 'Source Serif 4', serif; }
        .ma-menu-btn { background: none; border: none; cursor: pointer; color: #9090aa; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.12s; }
        .ma-menu-btn:hover { background: #f0ece4; color: #0e2554; }
        .ma-dropdown { position: absolute; right: 0; top: 32px; background: #fff; border: 1px solid #e4dfd4; border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 50; min-width: 160px; overflow: hidden; }
        .ma-dropdown-item { display: flex; align-items: center; gap: 9px; padding: 10px 14px; font-size: 12.5px; color: #1a1a2e; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-family: 'Source Serif 4', serif; transition: background 0.1s; }
        .ma-dropdown-item:hover { background: #f8f6f1; }
        .ma-dropdown-item.danger { color: #b02020; }
        .ma-dropdown-item.danger:hover { background: #fdecea; }
        .ma-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e4dfd4; border-radius: 4px; font-family: 'Source Serif 4', serif; font-size: 13px; color: #1a1a2e; background: #f8f6f1; outline: none; transition: border-color 0.15s, background 0.15s; box-sizing: border-box; }
        .ma-input:focus { border-color: #0e2554; background: #f0f3ff; }
        .ma-input::placeholder { color: #9090aa; font-size: 12.5px; }
        .ma-select { width: 100%; padding: 10px 14px; border: 1.5px solid #e4dfd4; border-radius: 4px; font-family: 'Source Serif 4', serif; font-size: 13px; color: #1a1a2e; background: #f8f6f1; outline: none; cursor: pointer; appearance: none; transition: border-color 0.15s; }
        .ma-select:focus { border-color: #0e2554; }
        .ma-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 22px; background: linear-gradient(135deg, #163066, #091a3e); color: #fff; border: none; border-radius: 4px; font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: opacity 0.15s; }
        .ma-btn-primary:hover { opacity: 0.88; }
        .ma-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ma-btn-secondary { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; background: none; color: #4a4a6a; border: 1px solid #e4dfd4; border-radius: 4px; font-family: 'Source Serif 4', serif; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .ma-btn-secondary:hover { border-color: #0e2554; color: #0e2554; }
        .ma-modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(9,26,62,0.55); display: flex; align-items: center; justify-content: center; padding: 16px; }
        .ma-modal { background: #fff; border-radius: 8px; width: 100%; max-width: 480px; box-shadow: 0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(201,162,39,0.15); overflow: hidden; animation: maModalIn 0.2s ease both; }
        @keyframes maModalIn { from { opacity: 0; transform: scale(0.97) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .ma-modal-header { padding: 16px 24px; background: linear-gradient(135deg, #163066, #091a3e); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(201,162,39,0.2); }
        .ma-modal-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #fff; }
        .ma-modal-close { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.6); transition: background 0.15s; }
        .ma-modal-close:hover { background: rgba(255,255,255,0.18); }
        .ma-modal-body { padding: 24px; }
        .ma-modal-footer { padding: 14px 24px; border-top: 1px solid #e4dfd4; background: #f8f6f1; display: flex; justify-content: flex-end; gap: 8px; }
        .ma-field { margin-bottom: 16px; }
        .ma-field label { display: block; font-size: 10.5px; font-weight: 600; color: #4a4a6a; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 7px; font-family: 'Source Serif 4', serif; }
        .ma-field label .req { color: #b02020; margin-left: 2px; }
        .ma-input-wrap { position: relative; }
        .ma-eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; opacity: 0.4; padding: 2px; display: flex; align-items: center; }
        .ma-search-wrap { position: relative; }
        .ma-badge-active   { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; background: #e8f5ee; color: #1a7a4a; border-radius: 20px; padding: 3px 10px; font-weight: 700; font-family: 'Source Serif 4', serif; }
        .ma-badge-inactive { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; background: #f0ece4; color: #9090aa; border-radius: 20px; padding: 3px 10px; font-weight: 700; font-family: 'Source Serif 4', serif; }
        .ma-badge-pending  { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; background: #fff3e0; color: #b86800; border-radius: 20px; padding: 3px 10px; font-weight: 700; font-family: 'Source Serif 4', serif; }
        .ma-badge-admin { font-size: 10px; background: rgba(201,162,39,0.15); color: #9a7515; border: 1px solid rgba(201,162,39,0.35); border-radius: 10px; padding: 2px 9px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
        .ma-badge-staff { font-size: 10px; background: rgba(14,37,84,0.08); color: #163066; border: 1px solid rgba(14,37,84,0.2); border-radius: 10px; padding: 2px 9px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
        .ma-badge-resident { font-size: 10px; background: rgba(26,122,74,0.08); color: #1a7a4a; border: 1px solid rgba(26,122,74,0.2); border-radius: 10px; padding: 2px 9px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
        .ma-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #0e2554; color: #fff; padding: 11px 20px; border-radius: 6px; font-size: 13px; font-family: 'Source Serif 4', serif; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 300; display: flex; align-items: center; gap: 8px; animation: maToastIn 0.2s ease both; border-left: 3px solid #c9a227; }
        .ma-toast.success { border-left-color: #1a7a4a; }
        .ma-toast.error   { border-left-color: #b02020; background: #3a0a0a; }
        @keyframes maToastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .ma-tab { padding: 8px 18px; border-radius: 20px; font-size: 12.5px; font-weight: 600; border: 1.5px solid #e4dfd4; background: #fff; color: #4a4a6a; cursor: pointer; transition: all 0.15s; font-family: 'Source Serif 4', serif; display: inline-flex; align-items: center; gap: 7px; }
        .ma-tab:hover { border-color: #0e2554; color: #0e2554; }
        .ma-tab.active { background: #0e2554; border-color: #0e2554; color: #fff; }
        .ma-tab-count { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 10px; background: rgba(255,255,255,0.18); }
        .ma-tab:not(.active) .ma-tab-count { background: #f0ece4; color: #666; }
        @media (max-width: 767px) {
            .ma-table-row, .ma-table-header { grid-template-columns: 1fr auto; }
            .ma-table-row > *:not(:first-child):not(:last-child) { display: none; }
            .ma-res-row, .ma-res-header { grid-template-columns: 1fr auto; }
            .ma-res-row > *:not(:first-child):not(:last-child) { display: none; }
        }
        `;
        document.head.appendChild(el);
    }, []);
}

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
function initials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}
const AVATAR_COLORS = [
    ["#0e2554", "#c9a227"],
    ["#163066", "#f0d060"],
    ["#1a7a4a", "#e8f5ee"],
    ["#6a3db8", "#ede8ff"],
    ["#b86800", "#fdf4d7"],
];
function avatarColor(name = "") {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
    const IconComp = icon;
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e4dfd4",
                borderRadius: 6,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: accent + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <IconComp size={18} color={accent} />
            </div>
            <div>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#0e2554",
                        fontFamily: "'Playfair Display',serif",
                        lineHeight: 1,
                    }}
                >
                    {value}
                </div>
                <div
                    style={{
                        fontSize: 10.5,
                        color: "#9090aa",
                        marginTop: 3,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily: "'Source Serif 4',serif",
                    }}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}

// ─── Password / Account Form Modal (staff + admin) ────────────
function AccountModal({ mode, account, onClose, onSave }) {
    const isEdit = mode === "edit";
    const isPassword = mode === "password";

    const [form, setForm] = useState({
        full_name: account?.full_name || "",
        username: account?.username || "",
        role: account?.role || "staff",
        password: "",
        confirm_password: "",
    });
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");

    const set = (k, v) => {
        setError("");
        setForm((p) => ({ ...p, [k]: v }));
    };

    const validate = () => {
        if (isPassword) {
            if (!form.password) return "Password is required.";
            if (form.password.length < 8)
                return "Password must be at least 8 characters.";
            if (form.password !== form.confirm_password)
                return "Passwords do not match.";
            return null;
        }
        if (!form.full_name.trim()) return "Full name is required.";
        if (!form.username.trim()) return "Username is required.";
        if (!isEdit && !form.password) return "Password is required.";
        if (!isEdit && form.password.length < 8)
            return "At least 8 characters.";
        if (!isEdit && form.password !== form.confirm_password)
            return "Passwords do not match.";
        return null;
    };

    const handleSubmit = () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        onSave(form);
    };

    const title = isPassword
        ? "Reset Password"
        : isEdit
          ? "Edit Account"
          : "Create Account";
    const IconComp = isPassword ? KeyRound : isEdit ? Edit2 : UserPlus;

    return (
        <div
            className="ma-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="ma-modal">
                <div className="ma-modal-header">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "rgba(201,162,39,0.12)",
                                border: "1px solid rgba(201,162,39,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IconComp size={15} color="#c9a227" />
                        </div>
                        <div>
                            <div className="ma-modal-title">{title}</div>
                            {account && (
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "rgba(255,255,255,0.5)",
                                        marginTop: 1,
                                    }}
                                >
                                    {account.full_name}
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="ma-modal-close" onClick={onClose}>
                        <X size={14} />
                    </button>
                </div>

                <div className="ma-modal-body">
                    {error && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 4,
                                padding: "9px 14px",
                                marginBottom: 16,
                                fontSize: 12.5,
                                color: "#b02020",
                                fontFamily: "'Source Serif 4',serif",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {isPassword ? (
                        <>
                            <div className="ma-field">
                                <label>
                                    New Password <span className="req">*</span>
                                </label>
                                <div className="ma-input-wrap">
                                    <input
                                        className="ma-input"
                                        type={showPw ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) =>
                                            set("password", e.target.value)
                                        }
                                        placeholder="Minimum 8 characters"
                                        style={{ paddingRight: 36 }}
                                    />
                                    <button
                                        className="ma-eye-btn"
                                        onClick={() => setShowPw(!showPw)}
                                    >
                                        {showPw ? (
                                            <EyeOff size={14} />
                                        ) : (
                                            <Eye size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="ma-field">
                                <label>
                                    Confirm Password{" "}
                                    <span className="req">*</span>
                                </label>
                                <div className="ma-input-wrap">
                                    <input
                                        className="ma-input"
                                        type={showConfirm ? "text" : "password"}
                                        value={form.confirm_password}
                                        onChange={(e) =>
                                            set(
                                                "confirm_password",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Re-enter password"
                                        style={{ paddingRight: 36 }}
                                    />
                                    <button
                                        className="ma-eye-btn"
                                        onClick={() =>
                                            setShowConfirm(!showConfirm)
                                        }
                                    >
                                        {showConfirm ? (
                                            <EyeOff size={14} />
                                        ) : (
                                            <Eye size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "#f5edce",
                                    border: "1px solid #e0d4a8",
                                    borderRadius: 4,
                                    padding: "9px 14px",
                                    fontSize: 11.5,
                                    color: "#7a6530",
                                    fontFamily: "'Source Serif 4',serif",
                                }}
                            >
                                The account holder will be prompted to change
                                this password on next login.
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="ma-field">
                                <label>
                                    Full Name <span className="req">*</span>
                                </label>
                                <input
                                    className="ma-input"
                                    type="text"
                                    value={form.full_name}
                                    onChange={(e) =>
                                        set("full_name", e.target.value)
                                    }
                                    placeholder="e.g. Juan Dela Cruz"
                                />
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 14,
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "10.5px",
                                            fontWeight: 600,
                                            color: "#4a4a6a",
                                            letterSpacing: "1.2px",
                                            textTransform: "uppercase",
                                            marginBottom: 7,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                        }}
                                    >
                                        Username{" "}
                                        <span style={{ color: "#b02020" }}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        className="ma-input"
                                        type="text"
                                        value={form.username}
                                        onChange={(e) =>
                                            set("username", e.target.value)
                                        }
                                        placeholder="e.g. j.delacruz"
                                    />
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "10.5px",
                                            fontWeight: 600,
                                            color: "#4a4a6a",
                                            letterSpacing: "1.2px",
                                            textTransform: "uppercase",
                                            marginBottom: 7,
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                        }}
                                    >
                                        Role{" "}
                                        <span style={{ color: "#b02020" }}>
                                            *
                                        </span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <select
                                            className="ma-select"
                                            value={form.role}
                                            onChange={(e) =>
                                                set("role", e.target.value)
                                            }
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                opacity: 0.5,
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
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!isEdit && (
                                <>
                                    <div className="ma-field">
                                        <label>
                                            Password{" "}
                                            <span className="req">*</span>
                                        </label>
                                        <div className="ma-input-wrap">
                                            <input
                                                className="ma-input"
                                                type={
                                                    showPw ? "text" : "password"
                                                }
                                                value={form.password}
                                                onChange={(e) =>
                                                    set(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Minimum 8 characters"
                                                style={{ paddingRight: 36 }}
                                            />
                                            <button
                                                className="ma-eye-btn"
                                                onClick={() =>
                                                    setShowPw(!showPw)
                                                }
                                            >
                                                {showPw ? (
                                                    <EyeOff size={14} />
                                                ) : (
                                                    <Eye size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="ma-field"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <label>
                                            Confirm Password{" "}
                                            <span className="req">*</span>
                                        </label>
                                        <div className="ma-input-wrap">
                                            <input
                                                className="ma-input"
                                                type={
                                                    showConfirm
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={form.confirm_password}
                                                onChange={(e) =>
                                                    set(
                                                        "confirm_password",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Re-enter password"
                                                style={{ paddingRight: 36 }}
                                            />
                                            <button
                                                className="ma-eye-btn"
                                                onClick={() =>
                                                    setShowConfirm(!showConfirm)
                                                }
                                            >
                                                {showConfirm ? (
                                                    <EyeOff size={14} />
                                                ) : (
                                                    <Eye size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="ma-modal-footer">
                    <button className="ma-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="ma-btn-primary" onClick={handleSubmit}>
                        {isPassword
                            ? "Reset Password"
                            : isEdit
                              ? "Save Changes"
                              : "Create Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Resident Password Modal ──────────────────────────────────
function ResidentPasswordModal({ resident, onClose, onSave }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password) {
            setError("Password is required.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSave(password);
        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to reset password.",
            );
        } finally {
            setLoading(false);
        }
    };

    const pwChecks = [
        { label: "8+ characters", ok: password.length >= 8 },
        {
            label: "Passwords match",
            ok: password.length > 0 && password === confirm,
        },
    ];

    return (
        <div
            className="ma-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="ma-modal">
                <div className="ma-modal-header">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "rgba(201,162,39,0.12)",
                                border: "1px solid rgba(201,162,39,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <KeyRound size={15} color="#c9a227" />
                        </div>
                        <div>
                            <div className="ma-modal-title">
                                Reset Resident Password
                            </div>
                            {resident && (
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "rgba(255,255,255,0.5)",
                                        marginTop: 1,
                                    }}
                                >
                                    {resident.full_name}
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="ma-modal-close" onClick={onClose}>
                        <X size={14} />
                    </button>
                </div>

                <div className="ma-modal-body">
                    {error && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 4,
                                padding: "9px 14px",
                                marginBottom: 16,
                                fontSize: 12.5,
                                color: "#b02020",
                                fontFamily: "'Source Serif 4',serif",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {resident && (
                        <div
                            style={{
                                background: "#f8f6f1",
                                border: "1px solid #e4dfd4",
                                borderRadius: 6,
                                padding: "12px 14px",
                                marginBottom: 18,
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: "#0e2554",
                                    color: "#c9a227",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {initials(resident.full_name)}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#1a1a2e",
                                    }}
                                >
                                    {resident.full_name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#9090aa",
                                        marginTop: 1,
                                    }}
                                >
                                    {resident.email}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="ma-field">
                        <label>
                            New Password <span className="req">*</span>
                        </label>
                        <div className="ma-input-wrap">
                            <input
                                className="ma-input"
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError("");
                                }}
                                placeholder="Minimum 8 characters"
                                style={{ paddingRight: 36 }}
                            />
                            <button
                                className="ma-eye-btn"
                                onClick={() => setShowPw(!showPw)}
                            >
                                {showPw ? (
                                    <EyeOff size={14} />
                                ) : (
                                    <Eye size={14} />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="ma-field" style={{ marginBottom: 12 }}>
                        <label>
                            Confirm Password <span className="req">*</span>
                        </label>
                        <div className="ma-input-wrap">
                            <input
                                className="ma-input"
                                type={showConfirm ? "text" : "password"}
                                value={confirm}
                                onChange={(e) => {
                                    setConfirm(e.target.value);
                                    setError("");
                                }}
                                placeholder="Re-enter password"
                                style={{ paddingRight: 36 }}
                            />
                            <button
                                className="ma-eye-btn"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? (
                                    <EyeOff size={14} />
                                ) : (
                                    <Eye size={14} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Strength indicators */}
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            marginBottom: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        {pwChecks.map((r) => (
                            <div
                                key={r.label}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <div
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background: r.ok ? "#1a7a4a" : "#ddd",
                                        transition: "background .2s",
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: r.ok ? "#1a7a4a" : "#9090aa",
                                    }}
                                >
                                    {r.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            background: "#f5edce",
                            border: "1px solid #e0d4a8",
                            borderRadius: 4,
                            padding: "9px 14px",
                            fontSize: 11.5,
                            color: "#7a6530",
                            fontFamily: "'Source Serif 4',serif",
                        }}
                    >
                        The resident will need to use this password to log in.
                        They should change it after logging in.
                    </div>
                </div>

                <div className="ma-modal-footer">
                    <button className="ma-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="ma-btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Saving…" : "Reset Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Delete/Deactivate Modal ──────────────────────────
function ConfirmModal({
    account,
    onClose,
    onConfirm,
    title = "Deactivate Account",
    message,
    confirmLabel = "Deactivate",
}) {
    return (
        <div
            className="ma-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="ma-modal" style={{ maxWidth: 420 }}>
                <div
                    className="ma-modal-header"
                    style={{
                        background: "linear-gradient(135deg,#3a0a0a,#b02020)",
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
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <AlertTriangle size={15} color="#fff" />
                        </div>
                        <div className="ma-modal-title">{title}</div>
                    </div>
                    <button className="ma-modal-close" onClick={onClose}>
                        <X size={14} />
                    </button>
                </div>
                <div className="ma-modal-body">
                    <p
                        style={{
                            fontSize: 13.5,
                            color: "#1a1a2e",
                            fontFamily: "'Source Serif 4',serif",
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        {message || (
                            <>
                                Are you sure you want to deactivate{" "}
                                <strong>{account?.full_name}</strong>'s account?
                                They will no longer be able to log in.
                            </>
                        )}
                    </p>
                    <div
                        style={{
                            background: "#fdecea",
                            border: "1px solid #f5c6c6",
                            borderRadius: 4,
                            padding: "10px 14px",
                            marginTop: 14,
                            fontSize: 12,
                            color: "#b02020",
                            fontFamily: "'Source Serif 4',serif",
                        }}
                    >
                        This action can be reversed by activating the account
                        again.
                    </div>
                </div>
                <div className="ma-modal-footer">
                    <button className="ma-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "10px 22px",
                            background:
                                "linear-gradient(135deg,#b02020,#7a0a0a)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }}
                    >
                        <Trash2 size={13} /> {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Row Dropdown Menu (staff/admin) ─────────────────────────
function RowMenu({
    account,
    isSuperAdmin,
    onEdit,
    onPassword,
    onToggle,
    onDelete,
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button className="ma-menu-btn" onClick={() => setOpen(!open)}>
                <MoreVertical size={15} />
            </button>
            {open && (
                <div className="ma-dropdown">
                    {isSuperAdmin && (
                        <button
                            className="ma-dropdown-item"
                            onClick={() => {
                                onEdit();
                                setOpen(false);
                            }}
                        >
                            <Edit2 size={13} /> Edit Account
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button
                            className="ma-dropdown-item"
                            onClick={() => {
                                onPassword();
                                setOpen(false);
                            }}
                        >
                            <KeyRound size={13} /> Reset Password
                        </button>
                    )}
                    <div
                        style={{
                            borderTop: "1px solid #f0ece4",
                            margin: "4px 0",
                        }}
                    />
                    {isSuperAdmin && (
                        <button
                            className="ma-dropdown-item"
                            onClick={() => {
                                onToggle();
                                setOpen(false);
                            }}
                            style={{
                                color:
                                    account.status === "active"
                                        ? "#b86800"
                                        : "#1a7a4a",
                            }}
                        >
                            {account.status === "active" ? (
                                <>
                                    <XCircle size={13} /> Deactivate
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={13} /> Activate
                                </>
                            )}
                        </button>
                    )}
                    {isSuperAdmin && account.status === "inactive" && (
                        <button
                            className="ma-dropdown-item danger"
                            onClick={() => {
                                onDelete();
                                setOpen(false);
                            }}
                        >
                            <Trash2 size={13} /> Remove
                        </button>
                    )}
                    {!isSuperAdmin && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9090aa",
                                padding: "8px 12px",
                                lineHeight: 1.4,
                            }}
                        >
                            View-only: only Superadmin can modify staff/admin
                            accounts.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Resident Row Dropdown ────────────────────────────────────
function ResidentRowMenu({ resident, onPassword, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const isActive = String(resident.status || "").toLowerCase() === "active";
    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button className="ma-menu-btn" onClick={() => setOpen(!open)}>
                <MoreVertical size={15} />
            </button>
            {open && (
                <div className="ma-dropdown">
                    <button
                        className="ma-dropdown-item"
                        onClick={() => {
                            onPassword();
                            setOpen(false);
                        }}
                    >
                        <KeyRound size={13} /> Reset Password
                    </button>
                    <div
                        style={{
                            borderTop: "1px solid #f0ece4",
                            margin: "4px 0",
                        }}
                    />
                    <button
                        className="ma-dropdown-item"
                        onClick={() => {
                            onToggle();
                            setOpen(false);
                        }}
                        style={{ color: isActive ? "#b86800" : "#1a7a4a" }}
                    >
                        {isActive ? (
                            <>
                                <XCircle size={13} /> Deactivate
                            </>
                        ) : (
                            <>
                                <CheckCircle size={13} /> Activate
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────
export default function ManageAccounts({ admin, onNavigate, onLogout }) {
    useMAStyles();

    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const sidebarWidth = isMobile ? 0 : isTablet ? 60 : 240;

    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [activePage, setActivePage] = useState("manageAccounts");

    const role = String(admin?.role || "")
        .trim()
        .toLowerCase();
    const isSuperAdmin = role === "admin" || role === "superadmin";

    // ── Which tab is active ──
    const [activeTab, setActiveTab] = useState(
        isSuperAdmin ? "staff" : "residents",
    ); // "staff" | "residents"

    const handleNavigate = (key) => {
        setActivePage(key);
        if (onNavigate) onNavigate(key);
    };

    // ── Staff / Admin accounts ──
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Resident accounts ──
    const [resRows, setResRows] = useState([]);
    const [resLoading, setResLoading] = useState(false);
    const [resError, setResError] = useState("");

    // ── Filters ──
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [resSearch, setResSearch] = useState("");
    const [resStatusFilter, setResStatusFilter] = useState("");

    // ── Modals ──
    const [modal, setModal] = useState(null); // { mode, account }
    const [resModal, setResModal] = useState(null); // { mode: 'password'|'deactivate', resident }

    // ── Toast ──
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Load staff/admin accounts ──
    const loadAccounts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await accountService.getAccounts();
            setRows(Array.isArray(result?.data) ? result.data : []);
        } catch (err) {
            if (err?.response?.status === 401) {
                onLogout?.();
                return;
            }
            if (err?.response?.status === 403) {
                setRows([]);
                setError(
                    "Access denied. Staff cannot review staff/admin accounts.",
                );
                return;
            }
            setRows([]);
            setError(
                err?.response?.data?.message || "Failed to load accounts.",
            );
        } finally {
            setLoading(false);
        }
    }, [onLogout]);

    // ── Load resident accounts ──
    const loadResidents = useCallback(async () => {
        setResLoading(true);
        setResError("");
        try {
            const res = await axios.get(
                `${API}/admin/residents`,
                adminHeaders(),
            );
            const data = Array.isArray(res.data?.data)
                ? res.data.data
                : Array.isArray(res.data)
                  ? res.data
                  : [];
            setResRows(data);
        } catch (err) {
            if (err?.response?.status === 401) {
                onLogout?.();
                return;
            }
            if (err?.response?.status === 403) {
                setResRows([]);
                setResError("Access denied. Please contact superadmin.");
                return;
            }
            setResRows([]);
            setResError(
                err?.response?.data?.message ||
                    "Failed to load resident accounts.",
            );
        } finally {
            setResLoading(false);
        }
    }, [onLogout]);

    useEffect(() => {
        if (isSuperAdmin) loadAccounts();
    }, [loadAccounts, isSuperAdmin]);

    useEffect(() => {
        loadResidents();
    }, [loadResidents]);

    // ── Filtered staff rows ──
    const filtered = rows.filter((r) => {
        const q = search.toLowerCase();
        return (
            (!q ||
                r.full_name.toLowerCase().includes(q) ||
                r.username.toLowerCase().includes(q)) &&
            (!roleFilter || r.role === roleFilter) &&
            (!statusFilter || r.status === statusFilter)
        );
    });

    // ── Filtered resident rows ──
    const filteredRes = resRows.filter((r) => {
        const q = resSearch.toLowerCase();
        const st = String(r.status || "").toLowerCase();
        return (
            (!q ||
                r.full_name.toLowerCase().includes(q) ||
                (r.email || "").toLowerCase().includes(q)) &&
            (!resStatusFilter || st === resStatusFilter)
        );
    });

    // ── Stats ──
    const totalAccounts = rows.length;
    const activeCount = rows.filter((r) => r.status === "active").length;
    const adminCount = rows.filter((r) => r.role === "admin").length;
    const staffCount = rows.filter((r) => r.role === "staff").length;
    const totalResidents = resRows.length;

    // ── Staff save handler ──
    const handleSave = async (form) => {
        if (!isSuperAdmin) {
            showToast(
                "Only superadmin can create or edit staff/admin accounts.",
                "error",
            );
            return;
        }
        try {
            if (modal.mode === "create") {
                await accountService.createAccount({
                    full_name: form.full_name,
                    username: form.username,
                    role: form.role,
                    password: form.password,
                });
                showToast(`Account for ${form.full_name} created.`);
            } else if (modal.mode === "edit") {
                await accountService.updateAccount(modal.account.admin_id, {
                    full_name: form.full_name,
                    username: form.username,
                    role: form.role,
                    status: modal.account.status,
                });
                showToast("Account updated.");
            } else if (modal.mode === "password") {
                await accountService.resetPassword(
                    modal.account.admin_id,
                    form.password,
                );
                showToast(`Password reset for ${modal.account.full_name}.`);
            }
            setModal(null);
            await loadAccounts();
        } catch (err) {
            showToast(
                err?.response?.data?.message || "Action failed.",
                "error",
            );
        }
    };

    const handleToggleStatus = async (account) => {
        const next = account.status === "active" ? "inactive" : "active";
        try {
            await accountService.updateAccount(account.admin_id, {
                full_name: account.full_name,
                username: account.username,
                role: account.role,
                status: next,
            });
            showToast(`${account.full_name} is now ${next}.`);
            await loadAccounts();
        } catch (err) {
            showToast(
                err?.response?.data?.message || "Failed to update.",
                "error",
            );
        }
    };

    const handleDelete = async () => {
        try {
            await accountService.deactivateAccount(modal.account.admin_id);
            showToast("Account deactivated.");
            setModal(null);
            await loadAccounts();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed.", "error");
        }
    };

    // ── Resident handlers ──
    const handleResidentPassword = async (password) => {
        await axios.put(
            `${API}/admin/residents/${resModal.resident.resident_id}/password`,
            { new_password: password },
            adminHeaders(),
        );
        showToast(`Password reset for ${resModal.resident.full_name}.`);
        setResModal(null);
    };

    const handleResidentToggle = async (resident) => {
        const isActive =
            String(resident.status || "").toLowerCase() === "active";
        const next = isActive ? "inactive" : "active";
        try {
            await axios.put(
                `${API}/admin/residents/${resident.resident_id}/status`,
                { status: next },
                adminHeaders(),
            );
            showToast(`${resident.full_name} is now ${next}.`);
            await loadResidents();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed.", "error");
        }
    };

    // ── Status badge helper for residents ──
    const resBadge = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "active")
            return (
                <span className="ma-badge-active">
                    <CheckCircle size={10} /> Active
                </span>
            );
        if (s === "inactive")
            return (
                <span className="ma-badge-inactive">
                    <XCircle size={10} /> Inactive
                </span>
            );
        if (s === "pending_verification")
            return <span className="ma-badge-pending">Pending Review</span>;
        return <span className="ma-badge-inactive">{status}</span>;
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8f6f1",
                fontFamily: "'Source Serif 4',serif",
            }}
        >
            {!isMobile && (
                <AdminSidebar
                    admin={admin}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onLogout={onLogout}
                    collapsed={isTablet}
                />
            )}
            {isMobile && showMobileSidebar && (
                <AdminMobileSidebar
                    admin={admin}
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    onClose={() => setShowMobileSidebar(false)}
                    onLogout={onLogout}
                />
            )}

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
                        Manage Accounts
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
                                {isSuperAdmin
                                    ? "Full admin controls"
                                    : "Staff mode: Resident account access only"}
                            </span>
                        )}
                    </div>
                    {activeTab === "staff" && isSuperAdmin && (
                        <button
                            className="ma-btn-primary"
                            onClick={() =>
                                setModal({ mode: "create", account: null })
                            }
                        >
                            <UserPlus size={14} /> New Account
                        </button>
                    )}
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: isMobile ? "16px" : "28px 32px",
                        flex: 1,
                    }}
                >
                    {!isSuperAdmin && (
                        <div
                            style={{
                                background: "#fff8eb",
                                border: "1px solid #f4d3aa",
                                color: "#a65f0f",
                                borderRadius: 6,
                                padding: "14px 16px",
                                marginBottom: 18,
                                fontSize: 13,
                            }}
                        >
                            <strong>Staff Mode:</strong> you can view and manage
                            resident accounts only. Staff/admin account creation
                            or edits are restricted to superadmins.
                        </div>
                    )}
                    {/* Stats */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "1fr 1fr"
                                : "repeat(5,1fr)",
                            gap: 14,
                            marginBottom: 24,
                        }}
                    >
                        <StatCard
                            icon={Users}
                            label="Staff Accounts"
                            value={totalAccounts}
                            accent="#0e2554"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Active Staff"
                            value={activeCount}
                            accent="#1a7a4a"
                        />
                        {isSuperAdmin && (
                            <StatCard
                                icon={Shield}
                                label="Admin"
                                value={adminCount}
                                accent="#c9a227"
                            />
                        )}
                        <StatCard
                            icon={UserCog}
                            label="Staff"
                            value={staffCount}
                            accent="#163066"
                        />
                        <StatCard
                            icon={User}
                            label="Residents"
                            value={totalResidents}
                            accent="#6a3db8"
                        />
                    </div>

                    {/* Tab toggle */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                        {isSuperAdmin && (
                            <button
                                className={`ma-tab${activeTab === "staff" ? " active" : ""}`}
                                onClick={() => setActiveTab("staff")}
                            >
                                <UserCog size={14} /> Staff &amp; Admin
                                <span className="ma-tab-count">
                                    {rows.length}
                                </span>
                            </button>
                        )}
                        <button
                            className={`ma-tab${activeTab === "residents" ? " active" : ""}`}
                            onClick={() => setActiveTab("residents")}
                        >
                            <User size={14} /> Residents
                            <span className="ma-tab-count">
                                {resRows.length}
                            </span>
                        </button>
                    </div>

                    {/* ══ STAFF ACCOUNTS PANEL ══ */}
                    {isSuperAdmin && activeTab === "staff" && (
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e4dfd4",
                                borderRadius: 6,
                                overflow: "hidden",
                            }}
                        >
                            {error && (
                                <div
                                    style={{
                                        padding: "10px 24px",
                                        background: "#fdecea",
                                        borderBottom: "1px solid #f5c6c6",
                                        color: "#b02020",
                                        fontSize: 12,
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* Panel header */}
                            <div
                                style={{
                                    padding: "14px 24px",
                                    borderBottom: "1px solid #e4dfd4",
                                    background: "#f8f6f1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    Staff Accounts
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fontSize: 11,
                                            color: "#9090aa",
                                            fontWeight: 400,
                                            marginLeft: 8,
                                        }}
                                    >
                                        {filtered.length} accounts
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        className="ma-search-wrap"
                                        style={{ position: "relative" }}
                                    >
                                        <Search
                                            size={13}
                                            style={{
                                                position: "absolute",
                                                left: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                opacity: 0.4,
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <input
                                            className="ma-input"
                                            style={{
                                                paddingLeft: 34,
                                                width: 200,
                                                fontSize: 12.5,
                                            }}
                                            placeholder="Search name or username…"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div style={{ position: "relative" }}>
                                        <select
                                            className="ma-select"
                                            style={{
                                                width: 120,
                                                fontSize: 12.5,
                                                padding: "10px 28px 10px 12px",
                                            }}
                                            value={roleFilter}
                                            onChange={(e) =>
                                                setRoleFilter(e.target.value)
                                            }
                                        >
                                            <option value="">All Roles</option>
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                        </select>
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 10,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                opacity: 0.5,
                                            }}
                                        >
                                            <svg
                                                width="11"
                                                height="11"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{ position: "relative" }}>
                                        <select
                                            className="ma-select"
                                            style={{
                                                width: 120,
                                                fontSize: 12.5,
                                                padding: "10px 28px 10px 12px",
                                            }}
                                            value={statusFilter}
                                            onChange={(e) =>
                                                setStatusFilter(e.target.value)
                                            }
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="inactive">
                                                Inactive
                                            </option>
                                        </select>
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 10,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                opacity: 0.5,
                                            }}
                                        >
                                            <svg
                                                width="11"
                                                height="11"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                    {(search || roleFilter || statusFilter) && (
                                        <button
                                            className="ma-btn-secondary"
                                            style={{
                                                padding: "9px 14px",
                                                fontSize: 11.5,
                                            }}
                                            onClick={() => {
                                                setSearch("");
                                                setRoleFilter("");
                                                setStatusFilter("");
                                            }}
                                        >
                                            <X size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table header */}
                            <div className="ma-table-header">
                                {[
                                    "Account",
                                    "Username",
                                    "Role",
                                    "Status",
                                    "Created",
                                    "Action",
                                ].map((h) => (
                                    <span key={h} className="ma-col-label">
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {/* Rows */}
                            {loading ? (
                                <div
                                    style={{
                                        padding: "40px 24px",
                                        textAlign: "center",
                                        color: "#9090aa",
                                        fontSize: 13,
                                    }}
                                >
                                    Loading accounts…
                                </div>
                            ) : filtered.length === 0 ? (
                                <div
                                    style={{
                                        padding: "40px 24px",
                                        textAlign: "center",
                                        color: "#9090aa",
                                        fontSize: 13,
                                        fontStyle: "italic",
                                    }}
                                >
                                    No accounts match your filters.
                                </div>
                            ) : (
                                filtered.map((row) => {
                                    const [bg, fg] = avatarColor(row.full_name);
                                    return (
                                        <div
                                            key={row.admin_id}
                                            className="ma-table-row"
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
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: "50%",
                                                        background: bg,
                                                        color: fg,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {initials(row.full_name)}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: "#1a1a2e",
                                                        }}
                                                    >
                                                        {row.full_name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10.5,
                                                            color: "#9090aa",
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        Last login:{" "}
                                                        {formatDate(
                                                            row.last_login,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12.5,
                                                    color: "#4a4a6a",
                                                    fontFamily:
                                                        "'Courier New',monospace",
                                                }}
                                            >
                                                {row.username}
                                            </div>
                                            <div>
                                                <span
                                                    className={
                                                        row.role === "admin"
                                                            ? "ma-badge-admin"
                                                            : "ma-badge-staff"
                                                    }
                                                >
                                                    {row.role}
                                                </span>
                                            </div>
                                            <div>
                                                <span
                                                    className={
                                                        row.status === "active"
                                                            ? "ma-badge-active"
                                                            : "ma-badge-inactive"
                                                    }
                                                >
                                                    {row.status === "active" ? (
                                                        <CheckCircle
                                                            size={10}
                                                        />
                                                    ) : (
                                                        <XCircle size={10} />
                                                    )}
                                                    {row.status === "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                {formatDate(row.created_at)}
                                            </div>
                                            <RowMenu
                                                account={row}
                                                isSuperAdmin={isSuperAdmin}
                                                onEdit={() =>
                                                    setModal({
                                                        mode: "edit",
                                                        account: row,
                                                    })
                                                }
                                                onPassword={() =>
                                                    setModal({
                                                        mode: "password",
                                                        account: row,
                                                    })
                                                }
                                                onToggle={() =>
                                                    handleToggleStatus(row)
                                                }
                                                onDelete={() =>
                                                    setModal({
                                                        mode: "delete",
                                                        account: row,
                                                    })
                                                }
                                            />
                                        </div>
                                    );
                                })
                            )}

                            <div
                                style={{
                                    padding: "10px 24px",
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
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                Only Admin accounts can access Logs, Manage
                                Accounts, and System Settings.
                            </div>
                        </div>
                    )}

                    {/* ══ RESIDENT ACCOUNTS PANEL ══ */}
                    {activeTab === "residents" && (
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e4dfd4",
                                borderRadius: 6,
                                overflow: "hidden",
                            }}
                        >
                            {resError && (
                                <div
                                    style={{
                                        padding: "10px 24px",
                                        background: "#fdecea",
                                        borderBottom: "1px solid #f5c6c6",
                                        color: "#b02020",
                                        fontSize: 12,
                                    }}
                                >
                                    {resError}
                                </div>
                            )}

                            {/* Panel header */}
                            <div
                                style={{
                                    padding: "14px 24px",
                                    borderBottom: "1px solid #e4dfd4",
                                    background: "#f8f6f1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#0e2554",
                                    }}
                                >
                                    Resident Accounts
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fontSize: 11,
                                            color: "#9090aa",
                                            fontWeight: 400,
                                            marginLeft: 8,
                                        }}
                                    >
                                        {filteredRes.length} residents
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ position: "relative" }}>
                                        <Search
                                            size={13}
                                            style={{
                                                position: "absolute",
                                                left: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                opacity: 0.4,
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <input
                                            className="ma-input"
                                            style={{
                                                paddingLeft: 34,
                                                width: 220,
                                                fontSize: 12.5,
                                            }}
                                            placeholder="Search name or email…"
                                            value={resSearch}
                                            onChange={(e) =>
                                                setResSearch(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div style={{ position: "relative" }}>
                                        <select
                                            className="ma-select"
                                            style={{
                                                width: 150,
                                                fontSize: 12.5,
                                                padding: "10px 28px 10px 12px",
                                            }}
                                            value={resStatusFilter}
                                            onChange={(e) =>
                                                setResStatusFilter(
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="inactive">
                                                Inactive
                                            </option>
                                            <option value="pending_verification">
                                                Pending Review
                                            </option>
                                        </select>
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 10,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none",
                                                opacity: 0.5,
                                            }}
                                        >
                                            <svg
                                                width="11"
                                                height="11"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                    {(resSearch || resStatusFilter) && (
                                        <button
                                            className="ma-btn-secondary"
                                            style={{
                                                padding: "9px 14px",
                                                fontSize: 11.5,
                                            }}
                                            onClick={() => {
                                                setResSearch("");
                                                setResStatusFilter("");
                                            }}
                                        >
                                            <X size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table header */}
                            <div className="ma-res-header">
                                {[
                                    "Resident",
                                    "Contact / Email",
                                    "Status",
                                    "Registered",
                                    "Action",
                                ].map((h) => (
                                    <span key={h} className="ma-col-label">
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {/* Rows */}
                            {resLoading ? (
                                <div
                                    style={{
                                        padding: "40px 24px",
                                        textAlign: "center",
                                        color: "#9090aa",
                                        fontSize: 13,
                                    }}
                                >
                                    Loading residents…
                                </div>
                            ) : filteredRes.length === 0 ? (
                                <div
                                    style={{
                                        padding: "40px 24px",
                                        textAlign: "center",
                                        color: "#9090aa",
                                        fontSize: 13,
                                        fontStyle: "italic",
                                    }}
                                >
                                    {resRows.length === 0
                                        ? "No resident accounts found."
                                        : "No residents match your filters."}
                                </div>
                            ) : (
                                filteredRes.map((res) => {
                                    const [bg, fg] = avatarColor(res.full_name);
                                    const resId = res.resident_id
                                        ? `RES-${String(res.resident_id).padStart(4, "0")}`
                                        : "—";
                                    return (
                                        <div
                                            key={res.resident_id}
                                            className="ma-res-row"
                                        >
                                            {/* Name + avatar */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: "50%",
                                                        background: bg,
                                                        color: fg,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {initials(res.full_name)}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: "#1a1a2e",
                                                        }}
                                                    >
                                                        {res.full_name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10.5,
                                                            color: "#9090aa",
                                                            marginTop: 1,
                                                            fontFamily:
                                                                "'Courier New',monospace",
                                                        }}
                                                    >
                                                        {resId}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Contact / Email */}
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 12.5,
                                                        color: "#4a4a6a",
                                                    }}
                                                >
                                                    {res.email || "—"}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#9090aa",
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    {res.contact_number || "—"}
                                                </div>
                                            </div>
                                            {/* Status */}
                                            <div>{resBadge(res.status)}</div>
                                            {/* Registered */}
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#9090aa",
                                                }}
                                            >
                                                {formatDate(res.created_at)}
                                            </div>
                                            {/* Actions */}
                                            <ResidentRowMenu
                                                resident={res}
                                                onPassword={() =>
                                                    setResModal({
                                                        mode: "password",
                                                        resident: res,
                                                    })
                                                }
                                                onToggle={() =>
                                                    handleResidentToggle(res)
                                                }
                                            />
                                        </div>
                                    );
                                })
                            )}

                            <div
                                style={{
                                    padding: "10px 24px",
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
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                Resident accounts are created through
                                self-registration. Password resets and status
                                changes can be made here.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Staff / Admin Modals */}
            {(modal?.mode === "create" ||
                modal?.mode === "edit" ||
                modal?.mode === "password") && (
                <AccountModal
                    mode={modal.mode}
                    account={modal.account}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
            {modal?.mode === "delete" && (
                <ConfirmModal
                    account={modal.account}
                    onClose={() => setModal(null)}
                    onConfirm={handleDelete}
                />
            )}

            {/* Resident Modals */}
            {resModal?.mode === "password" && (
                <ResidentPasswordModal
                    resident={resModal.resident}
                    onClose={() => setResModal(null)}
                    onSave={handleResidentPassword}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`ma-toast ${toast.type}`}>
                    <CheckCircle size={14} /> {toast.msg}
                </div>
            )}
        </div>
    );
}
