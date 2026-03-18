// =============================================================
// FILE: client/src/pages/resident/ResidentProfile.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET  /api/resident/profile → full profile object
//   - PUT  /api/resident/profile → update editable fields
//     body: { date_of_birth, civil_status, contact_number, address_house, address_street }
//   - email and full_name are read-only (set at registration)
//   - All endpoints require residentToken in Authorization header
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home, Plus, FileText, QrCode, LogOut,
    User, Phone, MapPin, Calendar, Edit3,
    Check, X, AlertCircle, Mail, Shield,
} from "lucide-react";

// ─── Reuse shared styles ──────────────────────────────────────
if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .rh-topbar { background:linear-gradient(135deg,#0e2554 0%,#163066 100%); border-bottom:1px solid rgba(201,162,39,0.2); position:sticky; top:0; z-index:100; }
    .rh-topbar-inner { max-width:1000px; margin:0 auto; padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    .rh-bottom-nav { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #e4dfd4; display:flex; z-index:100; box-shadow:0 -2px 12px rgba(0,0,0,0.08); }
    .rh-nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; background:none; border:none; cursor:pointer; font-family:'Source Serif 4',serif; font-size:9.5px; color:#9090aa; transition:color 0.15s; }
    .rh-nav-btn.active { color:#0e2554; }
    .rh-nav-btn svg { opacity:0.5; }
    .rh-nav-btn.active svg { opacity:1; }
    @keyframes rhFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .rh-fadein { animation:rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
}

// ─── Mock profile (replace with GET /api/resident/profile) ───
const MOCK_PROFILE = {
    full_name:      "Maria Reyes Santos",
    email:          "maria.santos@email.com",
    resident_id:    "RES-0042",
    date_of_birth:  "1985-06-14",
    civil_status:   "Married",
    nationality:    "Filipino",
    contact_number: "09171234567",
    address_house:  "12",
    address_street: "Rizal Street",
    registered_at:  "2025-01-05",
    status:         "Active",
};

const CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated", "Annulled"];

function fmtDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function calcAge(dob) {
    if (!dob) return "—";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
    return age;
}

export default function ResidentProfile({ resident, onLogout }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    const [activeNav]       = useState("profile");

    const [profile, setProfile]   = useState(null);
    const [editing, setEditing]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const [saved, setSaved]       = useState(false);
    const [error, setError]       = useState("");

    // Editable form fields
    const [form, setForm] = useState({
        date_of_birth:  "",
        civil_status:   "",
        contact_number: "",
        address_house:  "",
        address_street: "",
    });

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    // Load profile
    useEffect(() => {
        // TODO: replace with GET /api/resident/profile
        setTimeout(() => {
            setProfile(MOCK_PROFILE);
            setForm({
                date_of_birth:  MOCK_PROFILE.date_of_birth,
                civil_status:   MOCK_PROFILE.civil_status,
                contact_number: MOCK_PROFILE.contact_number,
                address_house:  MOCK_PROFILE.address_house,
                address_street: MOCK_PROFILE.address_street,
            });
        }, 300);
    }, []);

    async function handleSave() {
        if (!form.contact_number.trim()) { setError("Contact number is required."); return; }
        if (!form.address_street.trim()) { setError("Street address is required."); return; }
        setSaving(true);
        setError("");
        try {
            // TODO: PUT /api/resident/profile  body: form
            await new Promise((r) => setTimeout(r, 700));
            setProfile((p) => ({ ...p, ...form }));
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setEditing(false);
        setError("");
        if (profile) {
            setForm({
                date_of_birth:  profile.date_of_birth,
                civil_status:   profile.civil_status,
                contact_number: profile.contact_number,
                address_house:  profile.address_house,
                address_street: profile.address_street,
            });
        }
    }

    const isMobile  = width < 768;
    const name      = profile?.full_name || resident?.full_name || resident?.name || "Resident";
    const firstName = name.split(" ")[0];
    const initials  = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const fullAddress = profile
        ? `${profile.address_house} ${profile.address_street}, Barangay East Tapinac, Olongapo City`
        : "—";

    const inp = { className: "rp-input" };

    return (
        <div className="rh-root">
            <style>{`
                .rp-input {
                    width:100%; padding:9px 12px; border:1.5px solid #e4dfd4; border-radius:5px;
                    font-family:'Source Serif 4',serif; font-size:13px; background:#fff;
                    outline:none; color:#1a1a2e; transition:border-color .15s; box-sizing:border-box;
                }
                .rp-input:focus { border-color:#0e2554; }
                .rp-select {
                    width:100%; padding:9px 12px; border:1.5px solid #e4dfd4; border-radius:5px;
                    font-family:'Source Serif 4',serif; font-size:13px; background:#fff;
                    outline:none; color:#1a1a2e; cursor:pointer; box-sizing:border-box;
                    appearance:none;
                    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239090aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat:no-repeat; background-position:right 12px center; padding-right:34px;
                }
                .rp-select:focus { border-color:#0e2554; }
                .rp-field-label { font-size:10px; font-weight:700; color:#9090aa; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; display:block; }
                .rp-field-value { font-size:13px; color:#1a1a2e; font-weight:600; line-height:1.4; }
                .rp-readonly    { font-size:13px; color:#1a1a2e; font-weight:600; padding:9px 12px; background:#f8f6f1; border:1.5px solid #e4dfd4; border-radius:5px; }
            `}</style>

            {/* ── TOPBAR ── */}
            <div className="rh-topbar">
                <div className="rh-topbar-inner">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid rgba(201,162,39,0.5)", overflow: "hidden", flexShrink: 0 }}>
                            <img src="/logo.png" alt="Seal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>CertiFast</div>
                            <div style={{ fontSize: 9, color: "rgba(201,162,39,0.7)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Resident Portal</div>
                        </div>
                    </div>
                    {!isMobile && (
                        <button onClick={() => navigate("/resident/home")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "rgba(255,255,255,0.7)", fontFamily: "'Source Serif 4',serif", fontSize: 12, cursor: "pointer" }}>
                            <Home size={13} /> Home
                        </button>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,162,39,0.15)", border: "1.5px solid rgba(201,162,39,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c9a227", flexShrink: 0 }}>
                            {initials}
                        </div>
                        {!isMobile && (
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{name}</div>
                                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Resident</div>
                            </div>
                        )}
                        <button onClick={onLogout} title="Log out" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontFamily: "'Source Serif 4',serif" }}>
                            <LogOut size={13} />
                            {!isMobile && "Logout"}
                        </button>
                    </div>
                </div>
                <div style={{ height: 2, background: "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)" }} />
            </div>

            {/* ── CONTENT ── */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: isMobile ? "20px 16px 80px" : "28px 24px 40px" }}>

                {/* Page heading */}
                <div className="rh-fadein" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#0e2554", margin: "0 0 3px" }}>My Profile</h1>
                        <p style={{ fontSize: 12.5, color: "#9090aa", margin: 0 }}>Your personal information used for certificate requests</p>
                    </div>
                    {!editing && profile && (
                        <button
                            onClick={() => setEditing(true)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#0e2554", fontFamily: "'Source Serif 4',serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                            <Edit3 size={13} /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Saved toast */}
                {saved && (
                    <div style={{ background: "#e8f5ee", border: "1px solid #a8d8bc", borderRadius: 6, padding: "11px 14px", color: "#1a7a4a", fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                        <Check size={14} /> Profile updated successfully.
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 6, padding: "11px 14px", color: "#b02020", fontSize: 12.5, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                        <AlertCircle size={13} /> {error}
                    </div>
                )}

                {/* Loading */}
                {!profile && (
                    <div style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, padding: "32px 24px" }}>
                        {[1,2,3,4].map((i) => (
                            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 80, height: 10, background: "#f0ece4", borderRadius: 4 }} />
                                <div style={{ width: "60%", height: 10, background: "#f5f2ee", borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>
                )}

                        {profile && (
                            <>
                                {/* ── Avatar + identity banner ── */}
                                <div className="rh-fadein" style={{ background: "linear-gradient(135deg, #0e2554, #163066)", borderRadius: 8, padding: "20px 24px", marginBottom: 14, display: "flex", alignItems: "center", gap: 18 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,162,39,0.15)", border: "2px solid rgba(201,162,39,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#c9a227", flexShrink: 0 }}>
                                        {initials}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "#fff" }}>{profile.full_name}</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                                            {profile.resident_id} · Registered {fmtDate(profile.registered_at)}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: profile.status === "Active" ? "#e8f5ee" : "#f0ece4", color: profile.status === "Active" ? "#1a7a4a" : "#9090aa", flexShrink: 0 }}>
                                        {profile.status}
                                    </span>
                                </div>

                                {/* ── Profile fields — 2-column matching ResidentRecords screenshot ── */}
                                <div className="rh-fadein" style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
                                    <div style={{ padding: "13px 20px", background: "#f8f6f1", borderBottom: "1px solid #e4dfd4", display: "flex", alignItems: "center", gap: 8 }}>
                                        <User size={13} color="#0e2554" />
                                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: "#0e2554" }}>Personal Information</span>
                                    </div>

                                    <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "18px 32px" }}>

                                        {/* Full Name */}
                                        <div>
                                            <label className="rp-field-label">Full Name</label>
                                            {editing ? <div className="rp-readonly">{profile.full_name}</div> : <div className="rp-field-value">{profile.full_name}</div>}
                                            {editing && <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 4 }}>Name cannot be changed after registration.</div>}
                                        </div>

                                        {/* Resident ID */}
                                        <div>
                                            <label className="rp-field-label">Resident ID</label>
                                            <div className={editing ? "rp-readonly" : "rp-field-value"} style={{ fontFamily: "'Courier New', monospace" }}>{profile.resident_id}</div>
                                        </div>

                                        {/* Date of Birth */}
                                        <div>
                                            <label className="rp-field-label">Date of Birth</label>
                                            {editing
                                                ? <input {...inp} type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} max={new Date().toISOString().split("T")[0]} />
                                                : <div className="rp-field-value">{fmtDate(profile.date_of_birth)}</div>}
                                        </div>

                                        {/* Age */}
                                        <div>
                                            <label className="rp-field-label">Age</label>
                                            <div className={editing ? "rp-readonly" : "rp-field-value"}>
                                                {calcAge(editing ? form.date_of_birth : profile.date_of_birth)} years old
                                            </div>
                                        </div>

                                        {/* Civil Status */}
                                        <div>
                                            <label className="rp-field-label">Civil Status</label>
                                            {editing
                                                ? <select className="rp-select" value={form.civil_status} onChange={(e) => setForm((f) => ({ ...f, civil_status: e.target.value }))}>
                                                    {CIVIL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                  </select>
                                                : <div className="rp-field-value">{profile.civil_status}</div>}
                                        </div>

                                        {/* Nationality */}
                                        <div>
                                            <label className="rp-field-label">Nationality</label>
                                            <div className={editing ? "rp-readonly" : "rp-field-value"}>{profile.nationality}</div>
                                        </div>

                                        {/* Address — full row */}
                                        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                            <label className="rp-field-label">Address <span style={{ color: "#b02020" }}>*</span></label>
                                            {editing ? (
                                                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8 }}>
                                                    <input {...inp} placeholder="House No." value={form.address_house} onChange={(e) => setForm((f) => ({ ...f, address_house: e.target.value }))} />
                                                    <input {...inp} placeholder="Street name" value={form.address_street} onChange={(e) => setForm((f) => ({ ...f, address_street: e.target.value }))} />
                                                </div>
                                            ) : (
                                                <div className="rp-field-value">{fullAddress}</div>
                                            )}
                                            {!editing && <div style={{ fontSize: 11, color: "#9090aa", marginTop: 3 }}>Barangay East Tapinac, Olongapo City (Barangay is fixed)</div>}
                                        </div>

                                        {/* Contact Number */}
                                        <div>
                                            <label className="rp-field-label">Contact Number <span style={{ color: "#b02020" }}>*</span></label>
                                            {editing
                                                ? <input {...inp} type="tel" placeholder="09XXXXXXXXX" maxLength={11} value={form.contact_number} onChange={(e) => setForm((f) => ({ ...f, contact_number: e.target.value }))} />
                                                : <div className="rp-field-value">{profile.contact_number}</div>}
                                        </div>

                                        {/* Email Address */}
                                        <div>
                                            <label className="rp-field-label">Email Address</label>
                                            <div className={editing ? "rp-readonly" : "rp-field-value"}>{profile.email}</div>
                                            {editing && <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 4 }}>Email cannot be changed after registration.</div>}
                                        </div>

                                        {/* Date Registered */}
                                        <div>
                                            <label className="rp-field-label">Date Registered</label>
                                            <div className={editing ? "rp-readonly" : "rp-field-value"}>{fmtDate(profile.registered_at)}</div>
                                        </div>

                                        {/* Account Status */}
                                        <div>
                                            <label className="rp-field-label">Account Status</label>
                                            <div>
                                                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", background: profile.status === "Active" ? "#e8f5ee" : "#f0ece4", color: profile.status === "Active" ? "#1a7a4a" : "#9090aa" }}>
                                                    {profile.status}
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Edit action buttons */}
                                    {editing && (
                                        <div style={{ padding: "14px 24px", borderTop: "1px solid #e4dfd4", background: "#f8f6f1", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                            <button onClick={handleCancel} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#4a4a6a", fontFamily: "'Source Serif 4',serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                                                <X size={13} /> Cancel
                                            </button>
                                            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 22px", background: "linear-gradient(135deg, #163066, #091a3e)", color: "#fff", border: "none", borderRadius: 4, fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
                                                {saving ? "Saving…" : <><Check size={13} /> Save Changes</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Info note */}
                                <div className="rh-fadein" style={{ background: "#f5edce", border: "1px solid #e0d4a8", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <AlertCircle size={13} color="#9a7515" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 12, color: "#7a6530", lineHeight: 1.65 }}>
                                        Resident information is provided during self-registration. Name, email, and resident ID cannot be changed here — contact the barangay office for corrections.
                                    </span>
                                </div>
                            </>
                        )}
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            {isMobile && (
                <div className="rh-bottom-nav">
                    {[
                        { key: "home",    icon: Home,     label: "Home",    path: "/resident/home"           },
                        { key: "request", icon: Plus,     label: "Request", path: "/resident/submit-request" },
                        { key: "history", icon: FileText, label: "History", path: "/resident/my-requests"    },
                        { key: "qr",      icon: QrCode,   label: "My QR",   path: "/resident/my-qr"          },
                    ].map(({ key, icon: Icon, label, path }) => (
                        <button key={key} className={`rh-nav-btn${activeNav === key ? " active" : ""}`} onClick={() => navigate(path)}>
                            <Icon size={20} strokeWidth={1.8} />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
