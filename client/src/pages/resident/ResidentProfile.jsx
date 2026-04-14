// =============================================================
// FILE: client/src/pages/resident/ResidentProfile.jsx
// =============================================================

import { useState, useEffect } from "react";
import {
    User, Edit3, Check, X, AlertCircle,
} from "lucide-react";
import residentProfileService from "../../services/residentProfileService";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";

if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .rh-topbar { background:linear-gradient(135deg,#0e2554 0%,#163066 100%); border-bottom:1px solid rgba(201,162,39,0.2); position:sticky; top:0; z-index:100; }
    .rh-topbar-inner { padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    @keyframes rhFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .rh-fadein { animation:rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
}

const CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated", "Annulled"];

const PUROKS_FALLBACK = [
    { purok_id: 1,  name: "Purok 1"  }, { purok_id: 2,  name: "Purok 2"  },
    { purok_id: 3,  name: "Purok 3"  }, { purok_id: 4,  name: "Purok 4"  },
    { purok_id: 5,  name: "Purok 5"  }, { purok_id: 6,  name: "Purok 6"  },
    { purok_id: 7,  name: "Purok 7"  }, { purok_id: 8,  name: "Purok 8"  },
    { purok_id: 9,  name: "Purok 9"  }, { purok_id: 10, name: "Purok 10" },
    { purok_id: 11, name: "Purok 11" }, { purok_id: 12, name: "Purok 12" },
];

const STREETS_FALLBACK = [
    { street_id: 1,  name: "1st Street"  }, { street_id: 2,  name: "2nd Street"  },
    { street_id: 3,  name: "3rd Street"  }, { street_id: 4,  name: "4th Street"  },
    { street_id: 5,  name: "5th Street"  }, { street_id: 6,  name: "6th Street"  },
    { street_id: 7,  name: "7th Street"  }, { street_id: 8,  name: "8th Street"  },
    { street_id: 9,  name: "9th Street"  }, { street_id: 10, name: "10th Street" },
    { street_id: 11, name: "11th Street" }, { street_id: 12, name: "12th Street" },
    { street_id: 13, name: "13th Street" }, { street_id: 14, name: "14th Street" },
    { street_id: 15, name: "15th Street" },
    { street_id: 16, name: "Aguinaldo Street"        },
    { street_id: 17, name: "Ambrosio Padilla Street" },
    { street_id: 18, name: "Burgos Street"           },
    { street_id: 19, name: "Del Pilar Street"        },
    { street_id: 20, name: "Gallagher Street"        },
    { street_id: 21, name: "Luna Street"             },
    { street_id: 22, name: "Mabini Street"           },
    { street_id: 23, name: "Rizal Street"            },
];

function fmtDate(str) {
    if (!str) return "—";
    const dateOnly = String(str).slice(0, 10);
    const [y, m, d] = dateOnly.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

function calcAge(dob) {
    if (!dob) return "—";
    const dateOnly = String(dob).slice(0, 10);
    const [y, m, d] = dateOnly.split("-").map(Number);
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
    return age;
}

export default function ResidentProfile({ resident, onLogout }) {
    const [width, setWidth]     = useState(window.innerWidth);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving]   = useState(false);
    const [saved, setSaved]     = useState(false);
    const [error, setError]     = useState("");

    // Address options
    const [puroks,  setPuroks]  = useState(PUROKS_FALLBACK);
    const [streets, setStreets] = useState(STREETS_FALLBACK);

    // Editable form fields
    const [form, setForm] = useState({
        date_of_birth:  "",
        civil_status:   "",
        contact_number: "",
        house_number:   "",
        purok_id:       "",
        street_id:      "",
        street_other:   "",
    });

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    // Load purok/street options from API (fallback to hardcoded)
    useEffect(() => {
        fetch("/api/address-options")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.puroks?.length)  setPuroks(data.puroks);
                if (data?.streets?.length) setStreets(data.streets);
            })
            .catch(() => {});
    }, []);

    const formFromProfile = (p) => ({
        date_of_birth:  p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : "",
        civil_status:   p.civil_status || CIVIL_STATUSES[0],
        contact_number: p.contact_number || "",
        house_number:   p.house_number || "",
        purok_id:       p.purok_id ? String(p.purok_id) : "",
        street_id:      p.street_other ? "other"
                      : p.street_id   ? String(p.street_id)
                      : "",
        street_other:   p.street_other || "",
    });

    // Load profile
    useEffect(() => {
        let mounted = true;

        const applyProfile = (nextProfile) => {
            if (!mounted || !nextProfile) return;
            setProfile(nextProfile);
            setForm(formFromProfile(nextProfile));
        };

        const loadProfile = async ({ silent = false } = {}) => {
            if (!silent) setError("");
            try {
                const data = await residentProfileService.getProfile();
                applyProfile(data?.profile || data);
            } catch (err) {
                if (!mounted) return;
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    onLogout?.(); return;
                }
                if (!silent) {
                    setError(err?.response?.data?.message || "Failed to load profile. Please refresh and try again.");
                }
            }
        };

        loadProfile();

        const intervalId = setInterval(() => {
            if (!document.hidden && !editing && !saving) loadProfile({ silent: true });
        }, 10000);

        return () => { mounted = false; clearInterval(intervalId); };
    }, [editing, onLogout, saving]);

    async function handleSave() {
        if (!form.contact_number.trim()) { setError("Contact number is required."); return; }
        if (!form.street_id) { setError("Please select your street."); return; }
        if (form.street_id === "other" && !form.street_other.trim()) {
            setError("Please specify your street name."); return;
        }
        setSaving(true);
        setError("");
        try {
            const payload = {
                date_of_birth:  form.date_of_birth || null,
                civil_status:   form.civil_status  || null,
                contact_number: form.contact_number,
                house_number:   form.house_number  || null,
                purok_id:       form.purok_id      || null,
                street_id:      form.street_id !== "other" ? (form.street_id || null) : null,
                street_other:   form.street_id === "other" ? form.street_other : null,
            };

            const data = await residentProfileService.updateProfile(payload);
            const updatedProfile = data?.profile || data;
            setProfile(updatedProfile);
            setForm(formFromProfile(updatedProfile));
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setEditing(false);
        setError("");
        if (profile) setForm(formFromProfile(profile));
    }

    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const name     = profile?.full_name || resident?.full_name || resident?.name || "Resident";
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    // Display address (view mode)
    const displayAddress = profile ? (() => {
        const parts = [];
        if (profile.house_number) parts.push(profile.house_number);
        if (profile.purok_name)   parts.push(profile.purok_name);
        else if (profile.purok_id) {
            const p = puroks.find(p => String(p.purok_id) === String(profile.purok_id));
            if (p) parts.push(p.name);
        }
        const street = profile.street_other
            ? profile.street_other
            : profile.street_name || (() => {
                const s = streets.find(s => String(s.street_id) === String(profile.street_id));
                return s?.name || "";
            })();
        if (street) parts.push(street);
        parts.push("Barangay East Tapinac", "Olongapo City");
        return parts.filter(Boolean).join(", ");
    })() : "—";

    const inp = { className: "rp-input" };

    return (
        <div className="rh-root" style={{ display: "flex", minHeight: "100vh" }}>
            {!isMobile && (
                <ResidentSidebar active="profile" resident={resident} onLogout={onLogout} />
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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

                <ResidentTopbar resident={resident} onLogout={onLogout} isMobile={isMobile} />

                <div style={{
                    width: "100%", boxSizing: "border-box",
                    padding: isMobile ? "16px 14px 80px" : isTablet ? "20px 18px 30px" : "28px 24px 40px",
                }}>
                    {/* Page heading */}
                    <div className="rh-fadein" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
                        <div>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#0e2554", margin: "0 0 3px" }}>My Profile</h1>
                            <p style={{ fontSize: 12.5, color: "#9090aa", margin: 0 }}>Your personal information used for certificate requests</p>
                        </div>
                        {!editing && profile && (
                            <button onClick={() => setEditing(true)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#fff", border: "1.5px solid #e4dfd4", borderRadius: 4, color: "#0e2554", fontFamily: "'Source Serif 4',serif", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                                <Edit3 size={13} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {saved && (
                        <div style={{ background: "#e8f5ee", border: "1px solid #a8d8bc", borderRadius: 6, padding: "11px 14px", color: "#1a7a4a", fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                            <Check size={14} /> Profile updated successfully.
                        </div>
                    )}

                    {error && (
                        <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 6, padding: "11px 14px", color: "#b02020", fontSize: 12.5, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}

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
                            {/* Avatar banner */}
                            <div className="rh-fadein" style={{ background: "linear-gradient(135deg, #0e2554, #163066)", borderRadius: 8, padding: "20px 24px", marginBottom: 14, display: "flex", alignItems: "center", gap: 18 }}>
                                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,162,39,0.15)", border: "2px solid rgba(201,162,39,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#c9a227", flexShrink: 0 }}>
                                    {initials}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? 17 : 20, fontWeight: 700, color: "#fff" }}>{profile.full_name}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                                        {profile.resident_id ? `RES-${String(profile.resident_id).padStart(4, "0")}` : "—"} · Registered {fmtDate(profile.created_at)}
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: profile.status === "active" ? "#e8f5ee" : "#f0ece4", color: profile.status === "active" ? "#1a7a4a" : "#9090aa", flexShrink: 0, textTransform: "uppercase" }}>
                                    {profile.status}
                                </span>
                            </div>

                            {/* Profile fields */}
                            <div className="rh-fadein" style={{ background: "#fff", border: "1px solid #e4dfd4", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
                                <div style={{ padding: "13px 20px", background: "#f8f6f1", borderBottom: "1px solid #e4dfd4", display: "flex", alignItems: "center", gap: 8 }}>
                                    <User size={13} color="#0e2554" />
                                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: "#0e2554" }}>Personal Information</span>
                                </div>

                                <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 1fr", gap: "18px 32px" }}>

                                    {/* Full Name */}
                                    <div>
                                        <label className="rp-field-label">Full Name</label>
                                        {editing ? <div className="rp-readonly">{profile.full_name}</div> : <div className="rp-field-value">{profile.full_name}</div>}
                                        {editing && <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 4 }}>Name cannot be changed after registration.</div>}
                                    </div>

                                    {/* Resident ID */}
                                    <div>
                                        <label className="rp-field-label">Resident ID</label>
                                        <div className={editing ? "rp-readonly" : "rp-field-value"} style={{ fontFamily: "'Courier New', monospace" }}>
                                            {profile.resident_id ? `RES-${String(profile.resident_id).padStart(4, "0")}` : "—"}
                                        </div>
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
                                            : <div className="rp-field-value">{profile.civil_status || "—"}</div>}
                                    </div>

                                    {/* Nationality */}
                                    <div>
                                        <label className="rp-field-label">Nationality</label>
                                        <div className={editing ? "rp-readonly" : "rp-field-value"}>{profile.nationality || "—"}</div>
                                    </div>

                                    {/* ── ADDRESS — full row with dropdowns in edit mode ── */}
                                    <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                                        <label className="rp-field-label">
                                            Address <span style={{ color: "#b02020" }}>*</span>
                                        </label>

                                        {editing ? (
                                            <div style={{ background: "#f8f6f1", border: "1px solid #e4dfd4", borderRadius: 7, padding: "14px 16px" }}>
                                                {/* Row 1: House No / Purok / Street */}
                                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                                                    {/* House No */}
                                                    <div>
                                                        <label className="rp-field-label">House / Unit No. <span style={{ color: "#b02020" }}>*</span></label>
                                                        <input
                                                            {...inp}
                                                            placeholder="e.g. 12-B"
                                                            value={form.house_number}
                                                            onChange={(e) => setForm((f) => ({ ...f, house_number: e.target.value }))}
                                                        />
                                                    </div>
                                                    {/* Purok dropdown */}
                                                    <div>
                                                        <label className="rp-field-label">Purok</label>
                                                        <select className="rp-select" value={form.purok_id} onChange={(e) => setForm((f) => ({ ...f, purok_id: e.target.value }))}>
                                                            <option value="">Select…</option>
                                                            {puroks.map(p => <option key={p.purok_id} value={p.purok_id}>{p.name}</option>)}
                                                        </select>
                                                    </div>
                                                    {/* Street dropdown */}
                                                    <div>
                                                        <label className="rp-field-label">Street <span style={{ color: "#b02020" }}>*</span></label>
                                                        <select className="rp-select" value={form.street_id} onChange={(e) => setForm((f) => ({ ...f, street_id: e.target.value }))}>
                                                            <option value="">Select street…</option>
                                                            {streets.map(s => <option key={s.street_id} value={s.street_id}>{s.name}</option>)}
                                                            <option value="other">Other / Not listed</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Street other text input */}
                                                {form.street_id === "other" && (
                                                    <div style={{ marginBottom: 10 }}>
                                                        <label className="rp-field-label">Specify Street <span style={{ color: "#b02020" }}>*</span></label>
                                                        <input
                                                            {...inp}
                                                            placeholder="Enter your street name"
                                                            value={form.street_other}
                                                            onChange={(e) => setForm((f) => ({ ...f, street_other: e.target.value }))}
                                                        />
                                                    </div>
                                                )}

                                                {/* Locked fields */}
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                                    <div>
                                                        <label className="rp-field-label">Barangay</label>
                                                        <div className="rp-readonly">East Tapinac</div>
                                                    </div>
                                                    <div>
                                                        <label className="rp-field-label">City</label>
                                                        <div className="rp-readonly">Olongapo City</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="rp-field-value">{displayAddress}</div>
                                                <div style={{ fontSize: 11, color: "#9090aa", marginTop: 3 }}>Barangay East Tapinac, Olongapo City (Barangay is fixed)</div>
                                            </>
                                        )}
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <label className="rp-field-label">Contact Number <span style={{ color: "#b02020" }}>*</span></label>
                                        {editing
                                            ? <input {...inp} type="tel" placeholder="09XXXXXXXXX" maxLength={11} value={form.contact_number} onChange={(e) => setForm((f) => ({ ...f, contact_number: e.target.value }))} />
                                            : <div className="rp-field-value">{profile.contact_number || "—"}</div>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="rp-field-label">Email Address</label>
                                        <div className={editing ? "rp-readonly" : "rp-field-value"}>{profile.email}</div>
                                        {editing && <div style={{ fontSize: 10.5, color: "#9090aa", marginTop: 4 }}>Email cannot be changed after registration.</div>}
                                    </div>

                                    {/* Date Registered */}
                                    <div>
                                        <label className="rp-field-label">Date Registered</label>
                                        <div className={editing ? "rp-readonly" : "rp-field-value"}>{fmtDate(profile.created_at)}</div>
                                    </div>

                                    {/* Account Status */}
                                    <div>
                                        <label className="rp-field-label">Account Status</label>
                                        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", background: profile.status === "active" ? "#e8f5ee" : "#f0ece4", color: profile.status === "active" ? "#1a7a4a" : "#9090aa" }}>
                                            {profile.status}
                                        </span>
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

                {isMobile && <ResidentBottomNav active="profile" />}
            </div>
        </div>
    );
}
