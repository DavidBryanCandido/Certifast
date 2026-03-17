// =============================================================
// FILE: client/src/pages/admin/AdminLogin.jsx
// =============================================================
// TODO (Backend Dev):
//   - Connect handleSubmit to POST /api/auth/admin/login
//   - Expected request body: { username, password }
//     (field is "Username / Employee ID" — not email)
//   - Expected response: { token, admin: { id, name, role } }
//   - Store JWT token in localStorage as "adminToken"
//   - Store admin info in AdminAuthContext
//   - On success: navigate to /admin/dashboard
//   - On failure: show error message from response (e.g. "Invalid credentials")
//   - Role check: if role === "superadmin" → full access
//                 if role === "admin" → restricted (no ManageAccounts, Settings)
//   - All login activity should be logged server-side (activity_logs table)
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    User,
    Lock,
    Shield,
    X,
    TriangleAlert,
    KeyRound,
} from "lucide-react";
import authService from "../../services/authService";

// TODO: Import your auth context when ready
// import { useAdminAuth } from "../../context/AdminAuthContext";

// TODO: Import your auth service when ready
// import { adminLogin } from "../../services/authService";

// =============================================================
// useWindowSize hook
// =============================================================
function useWindowSize() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
}

// =============================================================
// Inject global styles once
// =============================================================
if (!document.head.querySelector("[data-certifast-login]")) {
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-certifast-login", "true");
    styleTag.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .cf-root {
      min-height: 100vh;
      background:
        radial-gradient(ellipse 80% 60% at 15% 15%, rgba(201,162,39,.10) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 85% 85%, rgba(22,48,102,.60) 0%, transparent 60%),
        linear-gradient(145deg, #091a3e 0%, #0e2554 50%, #091a3e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Source Serif 4', serif;
      position: relative;
      padding: 24px 16px;
    }
    .cf-root::before {
      content: '';
      position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(201,162,39,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(201,162,39,.04) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .cf-bracket {
      position: fixed;
      width: 48px; height: 48px;
      border-color: rgba(201,162,39,.25);
      border-style: solid;
      border-width: 0;
    }
    .cf-tl { top: 24px; left: 24px;  border-top-width: 2px; border-left-width: 2px; }
    .cf-tr { top: 24px; right: 24px; border-top-width: 2px; border-right-width: 2px; }
    .cf-bl { bottom: 24px; left: 24px;  border-bottom-width: 2px; border-left-width: 2px; }
    .cf-br { bottom: 24px; right: 24px; border-bottom-width: 2px; border-right-width: 2px; }
    .cf-card { animation: fadeUp 0.4s ease both; }
    .cf-modal { animation: modalIn 0.25s ease both; }
    .cf-input {
      width: 100%;
      padding: 11px 14px 11px 40px;
      border: 1.5px solid #ddd8cc;
      border-radius: 4px;
      font-family: 'Source Serif 4', serif;
      font-size: 13.5px;
      color: #1a1a2e;
      background: #f9f7f2;
      outline: none;
      transition: border-color .18s, background .18s;
      box-sizing: border-box;
    }
    .cf-input:focus {
      border-color: #0e2554;
      background: #f0f3ff;
    }
    .cf-input::placeholder { color: #9090aa; font-size: 13px; }
    .cf-input:-webkit-autofill,
    .cf-input:-webkit-autofill:hover,
    .cf-input:-webkit-autofill:focus,
    .cf-input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #f9f7f2 inset !important;
      -webkit-text-fill-color: #1a1a2e !important;
      caret-color: #1a1a2e;
      transition: background-color 9999s ease-in-out 0s;
    }
    .cf-btn-login {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #163066 0%, #091a3e 100%);
      color: #ffffff;
      border: none;
      border-radius: 4px;
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: opacity .18s;
    }
    .cf-btn-login::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent 30%, rgba(201,162,39,.18) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform .45s ease;
    }
    .cf-btn-login:hover::after { transform: translateX(100%); }
    .cf-btn-login:hover { opacity: .92; }
    .cf-btn-login:disabled { opacity: .65; cursor: not-allowed; }
    .cf-modal-got-it {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #c9a227 0%, #9a7515 100%);
      color: #0e2554;
      border: none;
      border-radius: 4px;
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity .18s;
      margin-top: 6px;
    }
    .cf-modal-got-it:hover { opacity: .88; }
  `;
    document.head.appendChild(styleTag);
}

// =============================================================
// Forgot Password Modal
// =============================================================
function ForgotPasswordModal({ onClose }) {
    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div style={m.overlay} onClick={handleOverlayClick}>
            <div className="cf-modal" style={m.modal}>
                {/* Modal header */}
                <div style={m.header}>
                    <div style={m.headerLeft}>
                        <div style={m.iconWrap}>
                            <KeyRound
                                size={18}
                                color="#c9a227"
                                strokeWidth={2}
                            />
                        </div>
                        <div>
                            <p style={m.headerTitle}>Password Reset</p>
                            <p style={m.headerSub}>
                                Follow the steps below to reset your password
                            </p>
                        </div>
                    </div>
                    <button
                        style={m.closeBtn}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X
                            size={16}
                            color="rgba(255,255,255,0.7)"
                            strokeWidth={2}
                        />
                    </button>
                </div>

                {/* Modal body */}
                <div style={m.body}>
                    <p style={m.bodyText}>
                        To request a password reset, send an email to{" "}
                        {/* TODO: Replace with the actual barangay IT/admin email address */}
                        <a
                            href="mailto:it-admin@easttapinac.gov.ph"
                            style={m.emailLink}
                        >
                            [it-admin@easttapinac.gov.ph]
                        </a>{" "}
                        using your registered barangay email account.
                    </p>

                    {/* Email format box */}
                    <div style={m.formatBox}>
                        <p style={m.formatLabel}>EMAIL FORMAT</p>
                        <p style={m.formatRow}>
                            <span style={m.formatKey}>Subject: </span>
                            <span style={m.formatVal}>
                                Password Reset Request — CertiFast
                            </span>
                        </p>
                        <p style={m.formatRow}>
                            <span style={m.formatKey}>Employee ID: </span>
                            <span style={m.formatValHighlight}>
                                [your employee ID]
                            </span>
                        </p>
                        <p style={m.formatRow}>
                            <span style={m.formatKey}>Full Name: </span>
                            <span style={m.formatValHighlight}>
                                [lastname, firstname, middle initial]
                            </span>
                        </p>
                        <p style={m.formatRow}>
                            <span style={m.formatKey}>Reason: </span>
                            <span style={m.formatValHighlight}>
                                [state your reason]
                            </span>
                        </p>
                    </div>

                    {/* Warning box */}
                    <div style={m.warningBox}>
                        <TriangleAlert
                            size={14}
                            color="#7a6530"
                            strokeWidth={2}
                            style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <p style={m.warningText}>
                            Attach a screenshot of the issue you are
                            experiencing to help process your request faster.
                        </p>
                    </div>

                    <p style={m.bodyText}>
                        Once verified, you will receive an email with your new
                        temporary credentials. Only emails sent from registered
                        barangay accounts will be processed. Otherwise, proceed
                        to the{" "}
                        <strong style={{ color: "#0e2554" }}>
                            Barangay Office
                        </strong>{" "}
                        in person.
                    </p>

                    <button
                        onClick={onClose}
                        style={{
                            width: "100%",
                            padding: "13px",
                            background:
                                "linear-gradient(135deg, #c9a227 0%, #9a7515 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            marginTop: "6px",
                        }}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// Main Component
// =============================================================
export default function AdminLogin() {
    const navigate = useNavigate();
    const width = useWindowSize();
    const isMobile = width < 520;

    // TODO: Uncomment when AdminAuthContext is ready
    // const { login } = useAdminAuth();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleChange = (e) => {
        setError("");
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.username || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.adminLogin({
                username: formData.username,
                password: formData.password,
            });

            if (response?.token) {
                localStorage.setItem("certifast_admin_token", response.token);
                localStorage.setItem(
                    "certifast_admin_auth",
                    JSON.stringify({ token: response.token, admin: response.data }),
                );
            }

            navigate("/admin/dashboard");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Invalid credentials. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cf-root">
            {/* Corner brackets */}
            {!isMobile && (
                <>
                    <div className="cf-bracket cf-tl" />
                    <div className="cf-bracket cf-tr" />
                    <div className="cf-bracket cf-bl" />
                    <div className="cf-bracket cf-br" />
                </>
            )}

            {/* Forgot password modal */}
            {showForgotModal && (
                <ForgotPasswordModal
                    onClose={() => setShowForgotModal(false)}
                />
            )}

            {/* ── Card ── */}
            <div
                className="cf-card"
                style={{ ...s.card, width: isMobile ? "100%" : "440px" }}
            >
                <div style={s.barTop} />

                {/* Card header */}
                <div style={s.cardHeader}>
                    <div style={s.sealWrap}>
                        {/* TODO: Replace Shield icon with actual barangay seal */}
                        {/* <img src="/logo.png" alt="Barangay Seal" style={{ width: 86, height: 86, borderRadius: "50%", objectFit: "cover" }} /> */}
                        <Shield
                            size={36}
                            color="rgba(201,162,39,0.6)"
                            strokeWidth={1.2}
                        />
                    </div>
                    <p style={s.republicLabel}>Republic of the Philippines</p>
                    <p style={s.barangayName}>Barangay East Tapinac</p>
                    <p style={s.cityName}>City of Olongapo</p>
                </div>

                {/* Card body */}
                <div
                    style={{
                        ...s.cardBody,
                        padding: isMobile ? "24px 24px 28px" : "30px 44px 34px",
                    }}
                >
                    <div style={s.systemBadge}>
                        <span style={s.systemBadgeText}>
                            CertiFast &nbsp;·&nbsp; Admin Portal
                        </span>
                    </div>

                    <p style={s.formHeading}>Official Sign In</p>
                    <p style={s.formSubheading}>
                        Authorized barangay personnel only
                    </p>

                    {error && (
                        <div style={s.errorBox}>
                            <span style={s.errorText}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={s.field}>
                            <label style={s.fieldLabel} htmlFor="username">
                                Username / Employee ID
                            </label>
                            <div style={s.inputWrap}>
                                <span style={s.inputIcon}>
                                    <User
                                        size={15}
                                        color="#0e2554"
                                        strokeWidth={2}
                                    />
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="off"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="e.g. etapinac.staff01"
                                    className="cf-input"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={s.field}>
                            <label style={s.fieldLabel} htmlFor="password">
                                Password
                            </label>
                            <div style={s.inputWrap}>
                                <span style={s.inputIcon}>
                                    <Lock
                                        size={15}
                                        color="#0e2554"
                                        strokeWidth={2}
                                    />
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="cf-input"
                                    style={{ paddingRight: "42px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    style={s.eyeBtn}
                                    tabIndex={-1}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            size={15}
                                            color="#333"
                                            strokeWidth={2}
                                        />
                                    ) : (
                                        <Eye
                                            size={15}
                                            color="#333"
                                            strokeWidth={2}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password */}
                        <div style={s.forgotRow}>
                            <button
                                type="button"
                                style={s.forgotBtn}
                                onClick={() => setShowForgotModal(true)}
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="cf-btn-login"
                        >
                            {isLoading ? (
                                <span style={s.loadingRow}>
                                    <span style={s.spinner} />
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Security notice */}
                    <div style={s.securityNotice}>
                        <Shield
                            size={14}
                            color="#7a6530"
                            strokeWidth={2}
                            style={{ flexShrink: 0, marginTop: 1 }}
                        />
                        <p style={s.securityText}>
                            This portal is restricted to authorized Barangay
                            East Tapinac personnel. All login activity is logged
                            and monitored.
                        </p>
                    </div>
                </div>

                {/* Card footer */}
                <div style={s.cardFooter}>
                    <p style={s.cardFooterText}>
                        CertiFast v1.0 &nbsp;·&nbsp; Barangay East Tapinac
                        &nbsp;·&nbsp; © 2026
                    </p>
                </div>

                <div style={s.barBottom} />
            </div>
        </div>
    );
}

// =============================================================
// Login card styles
// =============================================================
const s = {
    card: {
        position: "relative",
        background: "#ffffff",
        borderRadius: "6px",
        boxShadow:
            "0 32px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(201,162,39,.20)",
        overflow: "hidden",
    },
    barTop: {
        height: "5px",
        background:
            "linear-gradient(90deg, #9a7515, #c9a227, #f0d060, #c9a227, #9a7515)",
    },
    barBottom: {
        height: "4px",
        background:
            "linear-gradient(90deg, #9a7515, #c9a227, #f0d060, #c9a227, #9a7515)",
    },
    cardHeader: {
        background:
            "linear-gradient(160deg, #163066 0%, #0e2554 60%, #091a3e 100%)",
        padding: "36px 44px 30px",
        textAlign: "center",
        position: "relative",
    },
    sealWrap: {
        width: "92px",
        height: "92px",
        margin: "0 auto 18px",
        borderRadius: "50%",
        border: "2.5px solid rgba(201,162,39,.55)",
        background: "rgba(201,162,39,.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    republicLabel: {
        fontSize: "10.5px",
        color: "#c9a227",
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        fontWeight: 600,
        marginBottom: "5px",
        fontFamily: "'Source Serif 4', serif",
    },
    barangayName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: "20px",
        color: "#ffffff",
        fontWeight: 700,
        letterSpacing: ".5px",
        margin: 0,
    },
    cityName: {
        fontSize: "11px",
        color: "rgba(255,255,255,.50)",
        letterSpacing: "1px",
        marginTop: "3px",
        fontFamily: "'Source Serif 4', serif",
    },
    cardBody: { background: "#ffffff" },
    systemBadge: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "26px",
        paddingBottom: "22px",
        borderBottom: "1px solid #ddd8cc",
    },
    systemBadgeText: {
        display: "inline-block",
        background: "#f5edce",
        border: "1px solid #d8c48a",
        borderRadius: "3px",
        padding: "5px 18px",
        fontSize: "10.5px",
        color: "#7a6530",
        letterSpacing: "2px",
        textTransform: "uppercase",
        fontWeight: 600,
        fontFamily: "'Source Serif 4', serif",
    },
    formHeading: {
        fontFamily: "'Playfair Display', serif",
        fontSize: "17px",
        color: "#0e2554",
        fontWeight: 700,
        marginBottom: "4px",
    },
    formSubheading: {
        fontSize: "11.5px",
        color: "#9090aa",
        marginBottom: "24px",
        fontFamily: "'Source Serif 4', serif",
    },
    errorBox: {
        background: "rgba(220,53,53,0.07)",
        border: "1px solid rgba(220,53,53,0.25)",
        borderRadius: "4px",
        padding: "9px 14px",
        marginBottom: "16px",
    },
    errorText: {
        fontSize: "12px",
        color: "#c0392b",
        fontFamily: "'Source Serif 4', serif",
    },
    field: { marginBottom: "18px" },
    fieldLabel: {
        display: "block",
        fontSize: "10.5px",
        fontWeight: 600,
        color: "#4a4a6a",
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        marginBottom: "7px",
        fontFamily: "'Source Serif 4', serif",
    },
    inputWrap: { position: "relative" },
    inputIcon: {
        position: "absolute",
        left: "13px",
        top: "50%",
        transform: "translateY(-50%)",
        opacity: 0.35,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
    },
    eyeBtn: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        opacity: 0.4,
        display: "flex",
        alignItems: "center",
    },
    forgotRow: { textAlign: "right", marginTop: "6px", marginBottom: "22px" },
    forgotBtn: {
        background: "none",
        border: "none",
        fontSize: "11.5px",
        color: "#163066",
        textDecoration: "underline",
        cursor: "pointer",
        fontFamily: "'Source Serif 4', serif",
        padding: 0,
    },
    loadingRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
    },
    spinner: {
        width: "14px",
        height: "14px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
    },
    securityNotice: {
        display: "flex",
        alignItems: "flex-start",
        gap: "9px",
        marginTop: "20px",
        padding: "11px 14px",
        background: "#f5edce",
        border: "1px solid #e0d4a8",
        borderRadius: "4px",
    },
    securityText: {
        fontSize: "10.5px",
        color: "#7a6530",
        lineHeight: 1.55,
        fontFamily: "'Source Serif 4', serif",
        margin: 0,
    },
    cardFooter: {
        background: "#f9f7f2",
        borderTop: "1px solid #ddd8cc",
        padding: "11px 44px",
        textAlign: "center",
    },
    cardFooterText: {
        fontSize: "10px",
        color: "#9090aa",
        letterSpacing: ".5px",
        fontFamily: "'Source Serif 4', serif",
        margin: 0,
    },
};

// =============================================================
// Forgot password modal styles
// =============================================================
const m = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(6,14,36,0.75)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
    },
    modal: {
        background: "#ffffff",
        borderRadius: "8px",
        width: "100%",
        maxWidth: "460px",
        boxShadow:
            "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,162,39,0.2)",
        overflow: "hidden",
    },
    header: {
        background: "linear-gradient(135deg, #163066 0%, #0e2554 100%)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(201,162,39,0.25)",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    iconWrap: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "rgba(201,162,39,0.12)",
        border: "1px solid rgba(201,162,39,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    headerTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: "15px",
        fontWeight: 700,
        color: "#ffffff",
        margin: 0,
    },
    headerSub: {
        fontSize: "11px",
        color: "rgba(255,255,255,0.5)",
        margin: "2px 0 0",
        fontFamily: "'Source Serif 4', serif",
    },
    closeBtn: {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "50%",
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s",
    },
    body: {
        padding: "22px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    bodyText: {
        fontSize: "13px",
        color: "#4a4a6a",
        lineHeight: 1.65,
        fontFamily: "'Source Serif 4', serif",
        margin: 0,
    },
    emailLink: {
        color: "#0e2554",
        fontWeight: 600,
        textDecoration: "underline",
        textUnderlineOffset: "2px",
    },
    formatBox: {
        background: "#f9f7f2",
        border: "1px solid #ddd8cc",
        borderLeft: "3px solid #c9a227",
        borderRadius: "4px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    formatLabel: {
        fontSize: "9.5px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: "#c9a227",
        marginBottom: "4px",
        fontFamily: "'Source Serif 4', serif",
    },
    formatRow: {
        fontSize: "12.5px",
        color: "#4a4a6a",
        fontFamily: "'Source Serif 4', serif",
        margin: 0,
        lineHeight: 1.5,
    },
    formatKey: {
        fontWeight: 600,
        color: "#1a1a2e",
    },
    formatVal: {
        color: "#4a4a6a",
    },
    formatValHighlight: {
        color: "#163066",
        fontStyle: "italic",
    },
    warningBox: {
        background: "#fdf4d7",
        border: "1px solid #e0d4a8",
        borderRadius: "4px",
        padding: "10px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
    },
    warningText: {
        fontSize: "12px",
        color: "#7a6530",
        lineHeight: 1.55,
        fontFamily: "'Source Serif 4', serif",
        margin: 0,
    },
};
