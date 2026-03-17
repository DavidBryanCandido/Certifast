// =============================================================
// FILE: client/src/pages/resident/ResidentRegister.jsx
// =============================================================
// TODO (Backend Dev):
//   - Connect handleSubmit to POST /api/auth/resident/register
//   - Expected request body: { full_name, email, password, address, contact_number }
//   - Expected response: { message } or { token, resident }
//   - On success: navigate to /resident/login with success message
//   - On failure: show error from response
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Phone } from "lucide-react";
import authService from "../../services/authService";

// ─── Inject styles (reuses resident theme) ───────────────────
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

// ─── Field component ──────────────────────────────────────────
function Field({ label, icon: Icon, children }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "#4a4a6a", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 7, fontFamily: "'Source Serif 4', serif" }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none", display: "flex" }}>
                    <Icon size={15} color="#0e2554" strokeWidth={2} />
                </span>
                {children}
            </div>
        </div>
    );
}

export default function ResidentRegister({ onSuccess }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const isMobile = width < 520;

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        contact_number: "",
        address: "",
        password: "",
        confirm_password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const set = (k, v) => { setError(""); setForm((p) => ({ ...p, [k]: v })); };

    const validate = () => {
        if (!form.full_name.trim()) return "Full name is required.";
        if (!form.email.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
        if (!form.address.trim()) return "Address is required.";
        if (!form.password) return "Password is required.";
        if (form.password.length < 8) return "Password must be at least 8 characters.";
        if (form.password !== form.confirm_password) return "Passwords do not match.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setIsLoading(true);
        try {
            await authService.residentRegister({
                full_name: form.full_name,
                email: form.email,
                password: form.password,
                address: form.address,
                contact_number: form.contact_number,
            });
            setSuccess(true);
            if (onSuccess) setTimeout(onSuccess, 2000);
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Success screen ──
    if (success) {
        return (
            <div className="r-root">
                <div className="r-card" style={{ width: isMobile ? "100%" : "440px", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,162,39,0.15)" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg, #c9a227, #f0d060, #c9a227)" }} />
                    <div style={{ padding: "48px 44px", textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e8f5ee", border: "2px solid #1a7a4a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <p style={{ fontSize: 22, fontWeight: 700, color: "#0e2554", fontFamily: "'Playfair Display', serif", margin: "0 0 8px" }}>Registration Successful!</p>
                        <p style={{ fontSize: 13, color: "#4a4a6a", fontFamily: "'Source Serif 4', serif", lineHeight: 1.65, margin: "0 0 28px" }}>
                            Your account has been created. You can now sign in to access the Resident Portal.
                        </p>
                        <button className="r-btn" onClick={() => navigate("/resident/login")}>
                            Go to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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

            <div className="r-card" style={{ width: isMobile ? "100%" : "480px", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,162,39,0.15)" }}>
                {/* Gold top bar */}
                <div style={{ height: 3, background: "linear-gradient(90deg, #c9a227, #f0d060, #c9a227)" }} />

                {/* Card header */}
                <div style={{ background: "linear-gradient(180deg, #f8f6f1 0%, #fff 100%)", padding: "24px 44px 18px", textAlign: "center", borderBottom: "1px solid #ede8df" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(201,162,39,0.4)", background: "rgba(201,162,39,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", overflow: "hidden" }}>
                        <img src="/logo.png" alt="Barangay Seal" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }} />
                    </div>
                    <p style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "#9090aa", fontFamily: "'Source Serif 4', serif", margin: "0 0 3px" }}>Republic of the Philippines</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#0e2554", fontFamily: "'Playfair Display', serif", margin: "0 0 2px" }}>Barangay East Tapinac</p>
                    <p style={{ fontSize: 10.5, color: "#7a7a9a", fontFamily: "'Source Serif 4', serif", margin: 0 }}>City of Olongapo</p>
                </div>

                {/* Card body */}
                <div style={{ padding: isMobile ? "22px 24px 26px" : "26px 44px 30px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: "#9a7515", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Source Serif 4', serif" }}>
                            CertiFast &nbsp;·&nbsp; Resident Registration
                        </span>
                    </div>

                    <p style={{ fontSize: 19, fontWeight: 700, color: "#0e2554", fontFamily: "'Playfair Display', serif", margin: "0 0 3px" }}>Create Your Account</p>
                    <p style={{ fontSize: 12.5, color: "#9090aa", fontFamily: "'Source Serif 4', serif", margin: "0 0 20px" }}>Register to request barangay certificates online</p>

                    {error && (
                        <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 4, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b02020" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span style={{ fontSize: 12.5, color: "#b02020", fontFamily: "'Source Serif 4', serif" }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Field label="Full Name *" icon={User}>
                            <input className="r-input" type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. Juan Dela Cruz" autoComplete="name" />
                        </Field>

                        <Field label="Email Address *" icon={Mail}>
                            <input className="r-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" autoComplete="email" />
                        </Field>

                        <Field label="Contact Number" icon={Phone}>
                            <input className="r-input" type="tel" value={form.contact_number} onChange={(e) => set("contact_number", e.target.value)} placeholder="e.g. 09XX-XXX-XXXX" autoComplete="tel" />
                        </Field>

                        <Field label="Home Address *" icon={MapPin}>
                            <input className="r-input" type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, Purok, Barangay East Tapinac" autoComplete="street-address" />
                        </Field>

                        {/* Password row */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "#4a4a6a", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 7, fontFamily: "'Source Serif 4', serif" }}>Password *</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none", display: "flex" }}>
                                        <Lock size={15} color="#0e2554" strokeWidth={2} />
                                    </span>
                                    <input className="r-input" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 characters" style={{ paddingRight: 38 }} />
                                    <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.4, display: "flex", padding: 2 }} tabIndex={-1}>
                                        {showPassword ? <EyeOff size={14} color="#333" /> : <Eye size={14} color="#333" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "#4a4a6a", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 7, fontFamily: "'Source Serif 4', serif" }}>Confirm Password *</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none", display: "flex" }}>
                                        <Lock size={15} color="#0e2554" strokeWidth={2} />
                                    </span>
                                    <input className="r-input" type={showConfirm ? "text" : "password"} value={form.confirm_password} onChange={(e) => set("confirm_password", e.target.value)} placeholder="Re-enter password" style={{ paddingRight: 38 }} />
                                    <button type="button" onClick={() => setShowConfirm((p) => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", opacity: 0.4, display: "flex", padding: 2 }} tabIndex={-1}>
                                        {showConfirm ? <EyeOff size={14} color="#333" /> : <Eye size={14} color="#333" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Terms notice */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 20, padding: "10px 13px", background: "#f5edce", border: "1px solid #e0d4a8", borderRadius: 4 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a7515" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <p style={{ fontSize: 11, color: "#7a6530", lineHeight: 1.55, fontFamily: "'Source Serif 4', serif", margin: 0 }}>
                                By registering, you confirm that you are a resident of Barangay East Tapinac and agree that your information will be used for certificate issuance purposes only.
                            </p>
                        </div>

                        <button type="submit" className="r-btn" disabled={isLoading}>
                            {isLoading
                                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="r-spinner" /> Creating account…</span>
                                : "Create Account"
                            }
                        </button>
                    </form>
                </div>

                {/* Card footer */}
                <div style={{ background: "#f9f7f2", borderTop: "1px solid #ddd8cc", padding: "13px 44px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <p style={{ fontSize: 10, color: "#9090aa", letterSpacing: ".5px", fontFamily: "'Source Serif 4', serif", margin: 0 }}>Already have an account?</p>
                    <button type="button" onClick={() => navigate("/resident/login")} style={{ background: "none", border: "none", fontSize: 11, fontWeight: 600, color: "#0e2554", cursor: "pointer", fontFamily: "'Source Serif 4', serif", textDecoration: "underline", textUnderlineOffset: 2, padding: 0 }}>
                        Sign in here
                    </button>
                </div>
            </div>
        </div>
    );
}
