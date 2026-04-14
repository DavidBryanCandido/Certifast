// =============================================================
// FILE: client/src/pages/resident/ResidentLogin.jsx
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import authService from "../../services/authService";

// ─── Inject styles (shared with admin login theme) ────────────
if (!document.head.querySelector("[data-certifast-resident]")) {
    const s = document.createElement("style");
    s.setAttribute("data-certifast-resident", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    @keyframes rSpinKf { to { transform: rotate(360deg); } }
    @keyframes rFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .r-root {
      min-height: 100vh;
      background:
        radial-gradient(ellipse 80% 60% at 15% 15%, rgba(201,162,39,.10) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 85% 85%, rgba(22,48,102,.60) 0%, transparent 60%),
        linear-gradient(145deg, #091a3e 0%, #0e2554 50%, #091a3e 100%);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Source Serif 4', serif;
      position: relative; padding: 24px 16px;
    }
    .r-root::before {
      content: ''; position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(201,162,39,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(201,162,39,.04) 1px, transparent 1px);
      background-size: 40px 40px; pointer-events: none;
    }
    .r-bracket { position: fixed; width: 48px; height: 48px; border-color: rgba(201,162,39,.25); border-style: solid; border-width: 0; }
    .r-tl { top: 24px; left: 24px;   border-top-width: 2px; border-left-width: 2px; }
    .r-tr { top: 24px; right: 24px;  border-top-width: 2px; border-right-width: 2px; }
    .r-bl { bottom: 24px; left: 24px;  border-bottom-width: 2px; border-left-width: 2px; }
    .r-br { bottom: 24px; right: 24px; border-bottom-width: 2px; border-right-width: 2px; }
    .r-card { animation: rFadeUp 0.4s ease both; }
    .r-input {
      width: 100%; padding: 11px 14px 11px 40px;
      border: 1.5px solid #ddd8cc; border-radius: 4px;
      font-family: 'Source Serif 4', serif; font-size: 13.5px;
      color: #1a1a2e; background: #f9f7f2; outline: none;
      transition: border-color .18s, background .18s; box-sizing: border-box;
    }
    .r-input:focus { border-color: #0e2554; background: #f0f3ff; }
    .r-input::placeholder { color: #9090aa; font-size: 13px; }
    .r-input:-webkit-autofill,
    .r-input:-webkit-autofill:hover,
    .r-input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #f9f7f2 inset !important;
      -webkit-text-fill-color: #1a1a2e !important;
      transition: background-color 9999s ease-in-out 0s;
    }
    .r-btn {
      width: 100%; padding: 13px;
      background: linear-gradient(135deg, #163066 0%, #091a3e 100%);
      color: #fff; border: none; border-radius: 4px;
      font-family: 'Playfair Display', serif; font-size: 14px;
      font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      cursor: pointer; position: relative; overflow: hidden; transition: opacity .18s;
    }
    .r-btn::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent 30%, rgba(201,162,39,.18) 50%, transparent 70%);
      transform: translateX(-100%); transition: transform .45s ease;
    }
    .r-btn:hover::after { transform: translateX(100%); }
    .r-btn:hover { opacity: .92; }
    .r-btn:disabled { opacity: .65; cursor: not-allowed; }
    .r-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
      border-radius: 50%; animation: rSpinKf .7s linear infinite; display: inline-block;
    }
    `;
    document.head.appendChild(s);
}

export default function ResidentLogin({ onLogin }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const isMobile = width < 520;

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setError("");
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        setIsLoading(true);
        try {
            const result = await authService.residentLogin({
                email: form.email,
                password: form.password,
            });
            if (result?.token) {
                localStorage.setItem("certifast_resident_token", result.token);
                localStorage.setItem(
                    "certifast_resident_auth",
                    JSON.stringify({
                        token: result.token,
                        resident: result.resident || result.data,
                    }),
                );
            }
            if (onLogin) onLogin(result);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Invalid email or password. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="r-root">
            {!isMobile && (
                <>
                    <div className="r-bracket r-tl" />
                    <div className="r-bracket r-tr" />
                    <div className="r-bracket r-bl" />
                    <div className="r-bracket r-br" />
                </>
            )}

            <div
                className="r-card"
                style={{
                    width: isMobile ? "100%" : "440px",
                    background: "#fff",
                    borderRadius: 8,
                    overflow: "hidden",
                    boxShadow:
                        "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,162,39,0.15)",
                }}
            >
                {/* Gold top bar */}
                <div
                    style={{
                        height: 3,
                        background:
                            "linear-gradient(90deg, #c9a227, #f0d060, #c9a227)",
                    }}
                />

                {/* Card header */}
                <div
                    style={{
                        background:
                            "linear-gradient(180deg, rgb(14, 37, 84) 0%, rgb(22, 48, 102) 100%)",
                        padding: "28px 44px 20px",
                        textAlign: "center",
                        borderBottom: "1px solid #ede8df",
                    }}
                >
                    <div
                        style={{
                            width: 86,
                            height: 86,
                            borderRadius: "50%",
                            border: "2.5px solid rgba(201,162,39,0.4)",
                            background: "rgba(201,162,39,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 14px",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="Barangay Seal"
                            style={{
                                width: 82,
                                height: 82,
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                    <p
                        style={{
                            fontSize: 9.5,
                            letterSpacing: "2.5px",
                            textTransform: "uppercase",
                            color: "rgba(201,162,39,0.7)",
                            fontFamily: "'Source Serif 4', serif",
                            margin: "0 0 4px",
                        }}
                    >
                        Republic of the Philippines
                    </p>
                    <p
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#fff",
                            fontFamily: "'Playfair Display', serif",
                            margin: "0 0 3px",
                        }}
                    >
                        Barangay East Tapinac
                    </p>
                    <p
                        style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.55)",
                            fontFamily: "'Source Serif 4', serif",
                            margin: 0,
                        }}
                    >
                        City of Olongapo
                    </p>
                </div>

                {/* Card body */}
                <div
                    style={{
                        padding: isMobile ? "24px 24px 28px" : "30px 44px 34px",
                    }}
                >
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "rgba(201,162,39,0.08)",
                            border: "1px solid rgba(201,162,39,0.25)",
                            borderRadius: 20,
                            padding: "4px 14px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                color: "#9a7515",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                fontFamily: "'Source Serif 4', serif",
                            }}
                        >
                            CertiFast &nbsp;·&nbsp; Resident Portal
                        </span>
                    </div>
                    </div>

                    <p
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#0e2554",
                            fontFamily: "'Playfair Display', serif",
                            margin: "0 0 4px",
                        }}
                    >
                        Welcome Back
                    </p>
                    <p
                        style={{
                            fontSize: 12.5,
                            color: "#9090aa",
                            fontFamily: "'Source Serif 4', serif",
                            margin: "0 0 22px",
                        }}
                    >
                        Sign in to request barangay certificates
                    </p>

                    {error && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 4,
                                padding: "10px 14px",
                                marginBottom: 18,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#b02020"
                                strokeWidth="2"
                                style={{ flexShrink: 0 }}
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span
                                style={{
                                    fontSize: 12.5,
                                    color: "#b02020",
                                    fontFamily: "'Source Serif 4', serif",
                                }}
                            >
                                {error}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: 18 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "10.5px",
                                    fontWeight: 600,
                                    color: "#4a4a6a",
                                    letterSpacing: "1.2px",
                                    textTransform: "uppercase",
                                    marginBottom: 7,
                                    fontFamily: "'Source Serif 4', serif",
                                }}
                            >
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 13,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        opacity: 0.35,
                                        pointerEvents: "none",
                                        display: "flex",
                                    }}
                                >
                                    <Mail
                                        size={15}
                                        color="#0e2554"
                                        strokeWidth={2}
                                    />
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    className="r-input"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 8 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "10.5px",
                                    fontWeight: 600,
                                    color: "#4a4a6a",
                                    letterSpacing: "1.2px",
                                    textTransform: "uppercase",
                                    marginBottom: 7,
                                    fontFamily: "'Source Serif 4', serif",
                                }}
                            >
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 13,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        opacity: 0.35,
                                        pointerEvents: "none",
                                        display: "flex",
                                    }}
                                >
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
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="r-input"
                                    style={{ paddingRight: 42 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 2,
                                        opacity: 0.4,
                                        display: "flex",
                                    }}
                                    tabIndex={-1}
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

                        {/* Forgot password link */}
                        <div style={{ textAlign: "right", marginBottom: 22 }}>
                            <span
                                style={{
                                    fontSize: 11.5,
                                    color: "#9090aa",
                                    fontFamily: "'Source Serif 4', serif",
                                }}
                            >
                                Forgot password? Visit the{" "}
                                <strong style={{ color: "#0e2554" }}>
                                    Barangay Office
                                </strong>
                                .
                            </span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="r-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 10,
                                    }}
                                >
                                    <span className="r-spinner" /> Signing in…
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Security notice */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 9,
                            marginTop: 20,
                            padding: "11px 14px",
                            background: "#f5edce",
                            border: "1px solid #e0d4a8",
                            borderRadius: 4,
                        }}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9a7515"
                            strokeWidth="2"
                            style={{ flexShrink: 0, marginTop: 1 }}
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <p
                            style={{
                                fontSize: "10.5px",
                                color: "#7a6530",
                                lineHeight: 1.55,
                                fontFamily: "'Source Serif 4', serif",
                                margin: 0,
                            }}
                        >
                            This portal is for registered residents of Barangay
                            East Tapinac only. Your information is kept secure
                            and confidential.
                        </p>
                    </div>
                </div>

                {/* Card footer — high contrast */}
                <div
                    style={{
                        background: "#0e2554",
                        borderTop: "1px solid rgba(201,162,39,0.2)",
                        padding: isMobile ? "12px 20px" : "14px 44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: isMobile ? 8 : 14,
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            fontSize: isMobile ? 11.5 : 13.5,
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "'Source Serif 4', serif",
                        }}
                    >
                        Don't have an account?
                    </span>
                    <button
                        type="button"
                        onClick={() => navigate("/resident/register")}
                        style={{
                            background: "rgba(201,162,39,0.18)",
                            border: "1.5px solid rgba(201,162,39,0.55)",
                            borderRadius: 5,
                            padding: isMobile ? "5px 12px" : "7px 18px",
                            fontSize: isMobile ? 11.5 : 13.5,
                            fontWeight: 700,
                            color: "#f0d060",
                            cursor: "pointer",
                            fontFamily: "'Source Serif 4', serif",
                        }}
                    >
                        Register here →
                    </button>
                </div>
            </div>
        </div>
    );
}
