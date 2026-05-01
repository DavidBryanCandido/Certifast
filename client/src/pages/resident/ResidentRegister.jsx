// =============================================================
// FILE: client/src/pages/resident/ResidentRegister.jsx
// =============================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    MapPin,
    Phone,
    Hash,
    ChevronLeft,
    ChevronRight,
    Check,
    Upload,
    X,
    AlertCircle,
    CalendarClock,
    CalendarDays,
} from "lucide-react";
import authService from "../../services/authService";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Address data ─────────────────────────────────────────────
// Fallback lists — used while API loads or on fetch failure.
const PUROKS_FALLBACK = [
    { purok_id: 1, name: "Purok 1" },
    { purok_id: 2, name: "Purok 2" },
    { purok_id: 3, name: "Purok 3" },
    { purok_id: 4, name: "Purok 4" },
    { purok_id: 5, name: "Purok 5" },
    { purok_id: 6, name: "Purok 6" },
    { purok_id: 7, name: "Purok 7" },
    { purok_id: 8, name: "Purok 8" },
    { purok_id: 9, name: "Purok 9" },
    { purok_id: 10, name: "Purok 10" },
    { purok_id: 11, name: "Purok 11" },
    { purok_id: 12, name: "Purok 12" },
];
const STREETS_FALLBACK = [
    { street_id: 1, name: "1st Street" },
    { street_id: 2, name: "2nd Street" },
    { street_id: 3, name: "3rd Street" },
    { street_id: 4, name: "4th Street" },
    { street_id: 5, name: "5th Street" },
    { street_id: 6, name: "6th Street" },
    { street_id: 7, name: "7th Street" },
    { street_id: 8, name: "8th Street" },
    { street_id: 9, name: "9th Street" },
    { street_id: 10, name: "10th Street" },
    { street_id: 11, name: "11th Street" },
    { street_id: 12, name: "12th Street" },
    { street_id: 13, name: "13th Street" },
    { street_id: 14, name: "14th Street" },
    { street_id: 15, name: "15th Street" },
    { street_id: 16, name: "Aguinaldo Street" },
    { street_id: 17, name: "Ambrosio Padilla Street" },
    { street_id: 18, name: "Burgos Street" },
    { street_id: 19, name: "Del Pilar Street" },
    { street_id: 20, name: "Gallagher Street" },
    { street_id: 21, name: "Luna Street" },
    { street_id: 22, name: "Mabini Street" },
    { street_id: 23, name: "Rizal Street" },
];
const ID_TYPES = [
    "Barangay ID",
    "Voter's ID",
    "PhilSys National ID",
    "Driver's License",
    "Passport",
    "School ID",
    "Postal ID",
    "Other valid ID",
];
const MAX_ID_IMAGE_BYTES = 2 * 1024 * 1024;

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result || "");
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = dataUrl;
    });
}

async function optimizeResidentIdImage(file) {
    if (file.size <= MAX_ID_IMAGE_BYTES) return file;

    const dataUrl = await fileToDataUrl(file);
    const img = await loadImageFromDataUrl(dataUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    let width = img.width;
    let height = img.height;
    const maxDimension = 2000;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    let quality = 0.96;
    let bestBlob = null;

    for (let i = 0; i < 8; i += 1) {
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality),
        );
        if (!blob) continue;
        bestBlob = blob;
        if (blob.size <= MAX_ID_IMAGE_BYTES) {
            return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
            });
        }

        quality = Math.max(0.84, quality - 0.04);
        width = Math.max(1, Math.round(width * 0.92));
        height = Math.max(1, Math.round(height * 0.92));
    }

    if (!bestBlob) return file;
    return new File([bestBlob], file.name.replace(/\.\w+$/, ".jpg"), {
        type: "image/jpeg",
    });
}

// ─── Styles ───────────────────────────────────────────────────
if (!document.head.querySelector("[data-certifast-reg-v4]")) {
    const s = document.createElement("style");
    s.setAttribute("data-certifast-reg-v4", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    @keyframes regSpin  { to { transform: rotate(360deg); } }
    @keyframes regFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes regPop   { from { opacity:0; transform:scale(.93); } to { opacity:1; transform:scale(1); } }

    .reg-root {
      min-height: 100vh;
      background:
        radial-gradient(ellipse 80% 60% at 15% 15%, rgba(201,162,39,.10) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 85% 85%, rgba(22,48,102,.60) 0%, transparent 60%),
        linear-gradient(145deg, #091a3e 0%, #0e2554 50%, #091a3e 100%);
      display: flex; justify-content: center;
      font-family: 'Source Serif 4', serif;
      position: relative;
    }
    .reg-root::before {
      content:''; position:fixed; inset:0;
      background-image:
        linear-gradient(rgba(201,162,39,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(201,162,39,.04) 1px, transparent 1px);
      background-size:40px 40px; pointer-events:none;
    }
    .reg-card {
      width:100%; max-width:720px;
      background:#fff; border-radius:10px; overflow:hidden;
      box-shadow: 0 28px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(201,162,39,.18);
      animation: regFadeUp 0.4s ease both;
    }
    /* Step indicator */
    .reg-step-wrap { display:flex; align-items:center; margin-bottom:24px; }
    .reg-step-dot { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; transition:all .2s; }
    .reg-step-dot.done   { background:#1a7a4a; color:#fff; }
    .reg-step-dot.active { background:#0e2554; color:#fff; box-shadow:0 0 0 4px rgba(14,37,84,0.15); }
    .reg-step-dot.idle   { background:#e4dfd4; color:#9090aa; }
    .reg-step-line { flex:1; height:2px; background:#e4dfd4; transition:background .2s; margin:0 6px 20px; }
    .reg-step-line.done { background:#1a7a4a; }
    /* Inputs */
    .reg-input {
      width:100%; padding:11px 14px 11px 40px;
      border:1.5px solid #ddd8cc; border-radius:6px;
      font-family:'Source Serif 4',serif; font-size:13.5px;
      color:#1a1a2e; background:#f9f7f2; outline:none;
      transition:border-color .15s, background .15s; box-sizing:border-box;
    }
    .reg-input:focus { border-color:#0e2554; background:#f0f3ff; }
    .reg-input::placeholder { color:#b0b0c8; }
    .reg-input-bare {
      width:100%; padding:11px 14px;
      border:1.5px solid #ddd8cc; border-radius:6px;
      font-family:'Source Serif 4',serif; font-size:13.5px;
      color:#1a1a2e; background:#f9f7f2; outline:none;
      transition:border-color .15s, background .15s; box-sizing:border-box;
    }
    .reg-input-bare:focus { border-color:#0e2554; background:#f0f3ff; }
    .reg-input-bare::placeholder { color:#b0b0c8; }
    .reg-input-locked {
      width:100%; padding:11px 14px 11px 40px;
      border:1.5px solid #e8e4dc; border-radius:6px;
      font-family:'Source Serif 4',serif; font-size:clamp(10.5px, 1.8vw, 13.5px);
      color:#9090aa; background:#f2f0eb; outline:none;
      box-sizing:border-box; cursor:not-allowed; white-space:nowrap;
    }
    .reg-select {
      width:100%; padding:11px 34px 11px 14px;
      border:1.5px solid #ddd8cc; border-radius:6px;
      font-family:'Source Serif 4',serif; font-size:13.5px;
      color:#1a1a2e; background:#f9f7f2; outline:none; cursor:pointer;
      appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239090aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 12px center;
      transition:border-color .15s; box-sizing:border-box;
    }
    .reg-select:focus { border-color:#0e2554; background:#f0f3ff; }
    /* Buttons */
    .reg-btn-primary {
      display:inline-flex; align-items:center; gap:7px; padding:12px 24px;
      background:linear-gradient(135deg,#163066,#091a3e);
      color:#fff; border:none; border-radius:5px;
      font-family:'Playfair Display',serif; font-size:13px;
      font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
      cursor:pointer; transition:opacity .15s;
    }
    .reg-btn-primary:hover { opacity:.88; }
    .reg-btn-primary:disabled { opacity:.45; cursor:default; }
    .reg-btn-ghost {
      display:inline-flex; align-items:center; gap:7px; padding:12px 20px;
      background:#fff; color:#4a4a6a; border:1.5px solid #ddd8cc; border-radius:5px;
      font-family:'Source Serif 4',serif; font-size:13px;
      font-weight:600; cursor:pointer; transition:all .15s;
    }
    .reg-btn-ghost:hover { border-color:#0e2554; color:#0e2554; }
    /* Upload zone */
    .reg-upload-zone {
      border:2px dashed #c9d8e8; border-radius:8px;
      padding:28px 16px; text-align:center;
      cursor:pointer; transition:all .2s; background:#f8faff;
    }
    .reg-upload-zone:hover { border-color:#0e2554; background:#f0f3ff; }
    .reg-upload-zone.has-file { border-color:#1a7a4a; background:#f0faf4; border-style:solid; }
    /* Checkbox */
    .reg-checkbox {
      width:17px; height:17px; border:2px solid #c9a227;
      border-radius:3px; background:#fff; flex-shrink:0;
      margin-top:2px; display:flex; align-items:center;
      justify-content:center; transition:all .15s; cursor:pointer;
    }
    .reg-checkbox.checked { background:#0e2554; border-color:#0e2554; }
    /* Label */
    .reg-label {
      font-size:10.5px; font-weight:700; color:#4a4a6a;
      text-transform:uppercase; letter-spacing:1px;
      margin-bottom:7px; display:block;
      font-family:'Source Serif 4',serif;
    }
    .reg-spinner {
      width:14px; height:14px;
      border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
      border-radius:50%; animation:regSpin .7s linear infinite; display:inline-block;
    }
    .reg-fadein { animation: regFadeUp 0.3s ease both; }
    .reg-pop    { animation: regPop 0.35s cubic-bezier(.34,1.56,.64,1) both; }
    `;
    document.head.appendChild(s);
}

// ─── Helpers ──────────────────────────────────────────────────
function FieldGroup({ label, required, children, mb, style }) {
    return (
        <div style={{ marginBottom: mb ?? 14, ...style }}>
            <label className="reg-label">
                {label}
                {required && (
                    <span style={{ color: "#b02020", marginLeft: 2 }}>*</span>
                )}
            </label>
            {children}
        </div>
    );
}

function IconWrap({ icon, children }) {
    const IconComp = icon;
    return (
        <div style={{ position: "relative" }}>
            <span
                style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.35,
                    pointerEvents: "none",
                    display: "flex",
                    zIndex: 1,
                }}
            >
                <IconComp size={15} color="#0e2554" strokeWidth={2} />
            </span>
            {children}
        </div>
    );
}

function StepIndicator({ step }) {
    const steps = ["Your Info", "ID Verification", "Set Password"];
    return (
        <div className="reg-step-wrap">
            {steps.map((label, i) => {
                const n = i + 1,
                    isDone = step > n,
                    isActive = step === n;
                return (
                    <div
                        key={n}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flex: i < steps.length - 1 ? "1" : "0",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 5,
                                flexShrink: 0,
                            }}
                        >
                            <div
                                className={`reg-step-dot ${isDone ? "done" : isActive ? "active" : "idle"}`}
                            >
                                {isDone ? (
                                    <Check size={14} strokeWidth={2.5} />
                                ) : (
                                    n
                                )}
                            </div>
                            <span
                                style={{
                                    fontSize: 10,
                                    color: isActive
                                        ? "#0e2554"
                                        : isDone
                                          ? "#1a7a4a"
                                          : "#9090aa",
                                    fontWeight: isActive || isDone ? 700 : 400,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`reg-step-line${isDone ? " done" : ""}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────
export default function ResidentRegister({ onSuccess }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    const isMobile = width < 640;

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Step 1 — personal info + address
    // Address options — loaded from DB via API, fallback to hardcoded
    const [puroks, setPuroks] = useState(PUROKS_FALLBACK);
    const [streets, setStreets] = useState(STREETS_FALLBACK);

    useEffect(() => {
        async function loadAddressOptions() {
            try {
                const res = await fetch(`${API}/auth/address-options`);
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.puroks) && data.puroks.length)
                    setPuroks(data.puroks);
                if (Array.isArray(data.streets) && data.streets.length)
                    setStreets(data.streets);
            } catch {
                // silently keep fallback data
            }
        }
        loadAddressOptions();
    }, []);

    const [form, setForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        house_no: "",
        purok_id: "",
        street_id: "",
        street_other: "",
        date_of_birth: "",
        civil_status: "",
        nationality: "Filipino",
    });
    // Step 2 — ID verification
    const [idType, setIdType] = useState("");
    const [idFile, setIdFile] = useState(null);
    const [idPreview, setIdPreview] = useState(null);
    // Step 3 — password
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [declared, setDeclared] = useState(false);

    const set = (k, v) => {
        setError("");
        setForm((p) => ({ ...p, [k]: v }));
    };

    const fullName = [form.first_name, form.middle_name, form.last_name]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");

    const selectedStreet = streets.find(
        (s) => String(s.street_id) === String(form.street_id),
    );
    const resolvedStreet =
        form.street_id === "other"
            ? form.street_other.trim()
            : (selectedStreet?.name ?? "");
    const selectedPurok = puroks.find(
        (p) => String(p.purok_id) === String(form.purok_id),
    );

    const handleFilePick = async (e) => {
        const rawFile = e.target.files?.[0];
        const file = rawFile || null;
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload a JPG or PNG image.");
            return;
        }
        try {
            const optimizedFile = await optimizeResidentIdImage(file);
            if (optimizedFile.size > MAX_ID_IMAGE_BYTES) {
                setError(
                    "Image is still too large after optimization. Please use a smaller or lower-resolution photo.",
                );
                return;
            }
            setError("");
            setIdFile(optimizedFile);
            setIdPreview(URL.createObjectURL(optimizedFile));
        } catch {
            setError("Failed to process image. Please try another file.");
        }
    };
    const removeFile = () => {
        setIdFile(null);
        setIdPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validateStep = () => {
        if (step === 1) {
            if (!form.first_name.trim()) return "First name is required.";
            if (!form.last_name.trim()) return "Last name is required.";
            if (
                !form.email.trim() ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
            )
                return "A valid email address is required.";
            if (!form.contact_number.trim())
                return "Contact number is required.";
            if (!form.date_of_birth) return "Date of birth is required.";
            if (!form.civil_status) return "Civil status is required.";
            if (!form.house_no.trim())
                return "House / Unit number is required.";

            if (!form.street_id) return "Please select your street.";
            if (form.street_id === "other" && !form.street_other.trim())
                return "Please specify your street name.";
        }
        if (step === 2) {
            if (!idType) return "Please select your ID type.";
            if (!idFile) return "Please upload a photo of your valid ID.";
        }
        if (step === 3) {
            if (!password) return "Password is required.";
            if (password.length < 8)
                return "Password must be at least 8 characters.";
            if (!/[A-Z]/.test(password))
                return "Include at least one uppercase letter.";
            if (!/[0-9]/.test(password)) return "Include at least one number.";
            if (password !== confirm) return "Passwords do not match.";
            if (!declared) return "Please confirm your residency declaration.";
        }
        return null;
    };

    const handleNext = () => {
        const err = validateStep();
        if (err) {
            setError(err);
            return;
        }
        setError("");
        setStep((s) => s + 1);
    };
    const handleBack = () => {
        setError("");
        setStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        const err = validateStep();
        if (err) {
            setError(err);
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const purokName = selectedPurok?.name ?? "";
            const address_house = `${form.house_no}, ${purokName}`.trim();
            const address_street =
                `${resolvedStreet}, Barangay East Tapinac, Olongapo City`.trim();
            // Build FormData so the ID image can be sent as multipart
            const payload = new FormData();
            payload.append("first_name", form.first_name.trim());
            payload.append("last_name", form.last_name.trim());
            if (form.middle_name.trim())
                payload.append("middle_name", form.middle_name.trim());
            payload.append("full_name", fullName);
            payload.append("email", form.email.trim());
            payload.append("password", password);
            payload.append("contact_number", form.contact_number.trim());
            payload.append("house_number", form.house_no.trim());
            payload.append("address_house", address_house);
            payload.append("address_street", address_street);
            payload.append("address", address_street);
            if (form.date_of_birth)
                payload.append("date_of_birth", form.date_of_birth);
            if (form.civil_status)
                payload.append("civil_status", form.civil_status);
            if (form.nationality)
                payload.append("nationality", form.nationality);
            if (form.purok_id) payload.append("purok_id", form.purok_id);
            if (form.street_id && form.street_id !== "other") {
                payload.append("street_id", form.street_id);
            }
            if (form.street_id === "other" && form.street_other.trim()) {
                payload.append("street_other", form.street_other.trim());
            }
            if (idType) payload.append("id_type", idType);
            if (idFile) payload.append("id_image", idFile); // ← image file

            await authService.residentRegister(payload);
            setSuccess(true);
            if (onSuccess) setTimeout(onSuccess, 3000);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Registration failed. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const pwChecks = [
        { label: "8+ characters", ok: password.length >= 8 },
        { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
        { label: "Number", ok: /[0-9]/.test(password) },
        {
            label: "Passwords match",
            ok: password.length > 0 && password === confirm,
        },
    ];

    // ── Success screen ────────────────────────────────────────
    if (success) {
        return (
            <div
                className="reg-root"
                style={{ alignItems: "center", padding: "28px 16px" }}
            >
                <div className="reg-card reg-pop" style={{ maxWidth: 600 }}>
                    <div
                        style={{
                            height: 4,
                            background:
                                "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)",
                        }}
                    />
                    <div style={{ padding: "48px 36px", textAlign: "center" }}>
                        <div
                            style={{
                                width: 68,
                                height: 68,
                                borderRadius: "50%",
                                background: "#e8f5ee",
                                border: "2px solid #1a7a4a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}
                        >
                            <Check
                                size={30}
                                color="#1a7a4a"
                                strokeWidth={2.5}
                            />
                        </div>
                        <p
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 22,
                                fontWeight: 700,
                                color: "#0e2554",
                                margin: "0 0 10px",
                            }}
                        >
                            Account Submitted!
                        </p>
                        <p
                            style={{
                                fontSize: 13.5,
                                color: "#4a4a6a",
                                lineHeight: 1.7,
                                margin: "0 0 20px",
                            }}
                        >
                            Your registration has been received. Barangay staff
                            will review your submitted ID photo.
                        </p>
                        <div
                            style={{
                                background: "#fff7e6",
                                border: "1px solid #f5d78e",
                                borderRadius: 7,
                                padding: "14px 18px",
                                marginBottom: 28,
                                textAlign: "left",
                                display: "flex",
                                gap: 12,
                            }}
                        >
                            <AlertCircle
                                size={17}
                                color="#b86800"
                                style={{ flexShrink: 0, marginTop: 2 }}
                            />
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#7a4800",
                                    lineHeight: 1.7,
                                }}
                            >
                                <strong>
                                    Please come back in 1–3 business days
                                </strong>{" "}
                                to log in once your account has been verified
                                and approved by the barangay.
                            </div>
                        </div>
                        <button
                            className="reg-btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                            onClick={() => navigate("/resident/login")}
                        >
                            Go to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── STEP 1: Your Information ──────────────────────────────
    const Step1 = (
        <div className="reg-fadein">
            {/* Name row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 14,
                }}
            >
                <FieldGroup label="First Name" required mb={0}>
                    <IconWrap icon={User}>
                        <input
                            className="reg-input"
                            type="text"
                            value={form.first_name}
                            onChange={(e) => set("first_name", e.target.value)}
                            placeholder="e.g. Juan"
                            autoComplete="given-name"
                        />
                    </IconWrap>
                </FieldGroup>
                <FieldGroup label="Middle Name" mb={0}>
                    <IconWrap icon={User}>
                        <input
                            className="reg-input"
                            type="text"
                            value={form.middle_name}
                            onChange={(e) => set("middle_name", e.target.value)}
                            placeholder="Optional"
                            autoComplete="additional-name"
                        />
                    </IconWrap>
                </FieldGroup>
                <FieldGroup label="Last Name" required mb={0}>
                    <IconWrap icon={User}>
                        <input
                            className="reg-input"
                            type="text"
                            value={form.last_name}
                            onChange={(e) => set("last_name", e.target.value)}
                            placeholder="e.g. Dela Cruz"
                            autoComplete="family-name"
                        />
                    </IconWrap>
                </FieldGroup>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                }}
            >
                <FieldGroup label="Email Address" required mb={0}>
                    <IconWrap icon={Mail}>
                        <input
                            className="reg-input"
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="your@email.com"
                            autoComplete="email"
                        />
                    </IconWrap>
                </FieldGroup>
                <FieldGroup label="Contact Number" required mb={0}>
                    <IconWrap icon={Phone}>
                        <input
                            className="reg-input"
                            type="tel"
                            value={form.contact_number}
                            onChange={(e) =>
                                set("contact_number", e.target.value)
                            }
                            placeholder="09XX-XXX-XXXX"
                        />
                    </IconWrap>
                </FieldGroup>
                <FieldGroup label="Date of Birth" required mb={0}>
                    <div style={{ position: "relative" }}>
                        <span
                            style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                opacity: 0.35,
                                pointerEvents: "none",
                                display: "flex",
                                zIndex: 1,
                            }}
                        >
                            <CalendarDays
                                size={15}
                                color="#0e2554"
                                strokeWidth={2}
                            />
                        </span>
                        <input
                            className="reg-input"
                            type="date"
                            value={form.date_of_birth}
                            onChange={(e) =>
                                set("date_of_birth", e.target.value)
                            }
                            max={new Date().toISOString().split("T")[0]}
                            style={{ paddingLeft: 40 }}
                        />
                    </div>
                </FieldGroup>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 12,
                }}
            >
                <FieldGroup label="Civil Status" required>
                    <select
                        className="reg-select"
                        value={form.civil_status}
                        onChange={(e) => set("civil_status", e.target.value)}
                    >
                        <option value="">Select…</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Annulled">Annulled</option>
                    </select>
                </FieldGroup>
                <FieldGroup label="Nationality" required>
                    <select
                        className="reg-select"
                        value={form.nationality}
                        onChange={(e) => set("nationality", e.target.value)}
                    >
                        <option value="Filipino">Filipino</option>
                        <option value="American">American</option>
                        <option value="Australian">Australian</option>
                        <option value="British">British</option>
                        <option value="Canadian">Canadian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="German">German</option>
                        <option value="Indian">Indian</option>
                        <option value="Indonesian">Indonesian</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Malaysian">Malaysian</option>
                        <option value="Other">Other</option>
                    </select>
                </FieldGroup>
            </div>

            {/* Address block */}
            <label className="reg-label">
                Home Address — Barangay East Tapinac only
            </label>
            <div
                style={{
                    background: "#f8f6f1",
                    border: "1px solid #e4dfd4",
                    borderRadius: 7,
                    padding: "14px 16px",
                }}
            >
                {/* Row 1 — House / Purok / Street */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                        gap: 10,
                        marginBottom: 10,
                    }}
                >
                    <FieldGroup label="House / Unit No." required mb={0}>
                        <IconWrap icon={Hash}>
                            <input
                                className="reg-input"
                                type="text"
                                value={form.house_no}
                                onChange={(e) =>
                                    set("house_no", e.target.value)
                                }
                                placeholder="e.g. 12-B"
                            />
                        </IconWrap>
                    </FieldGroup>
                    <FieldGroup label="Purok" mb={0}>
                        <select
                            className="reg-select"
                            value={form.purok_id}
                            onChange={(e) => set("purok_id", e.target.value)}
                        >
                            <option value="">Select…</option>
                            {puroks.map((p) => (
                                <option key={p.purok_id} value={p.purok_id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </FieldGroup>
                    <FieldGroup label="Street" required mb={0}>
                        <select
                            className="reg-select"
                            value={form.street_id}
                            onChange={(e) => set("street_id", e.target.value)}
                        >
                            <option value="">Select street…</option>
                            {streets.map((s) => (
                                <option key={s.street_id} value={s.street_id}>
                                    {s.name}
                                </option>
                            ))}
                            <option value="other">Other / Not listed</option>
                        </select>
                    </FieldGroup>
                </div>

                {form.street_id === "other" && (
                    <FieldGroup
                        label="Specify Street"
                        required
                        mb={0}
                        style={{ marginBottom: 10 }}
                    >
                        <input
                            className="reg-input-bare"
                            type="text"
                            value={form.street_other}
                            onChange={(e) =>
                                set("street_other", e.target.value)
                            }
                            placeholder="Enter your street name"
                        />
                    </FieldGroup>
                )}

                {/* Row 2 — Barangay / City (locked, shown below for context) */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        marginTop: form.street_id === "other" ? 0 : 10,
                    }}
                >
                    <div>
                        <label className="reg-label">Barangay</label>
                        <IconWrap icon={MapPin}>
                            <input
                                className="reg-input-locked"
                                value="East Tapinac"
                                readOnly
                            />
                        </IconWrap>
                    </div>
                    <div>
                        <label className="reg-label">City</label>
                        <IconWrap icon={MapPin}>
                            <input
                                className="reg-input-locked"
                                value="Olongapo City"
                                readOnly
                            />
                        </IconWrap>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── STEP 2: ID Verification ───────────────────────────────
    const Step2 = (
        <div
            className="reg-fadein"
            style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr",
                gap: 0,
                alignItems: "stretch",
            }}
        >
            {/* LEFT — upload inputs */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingRight: 18,
                }}
            >
                <FieldGroup label="ID Type" required>
                    <select
                        className="reg-select"
                        value={idType}
                        onChange={(e) => {
                            setIdType(e.target.value);
                            setError("");
                        }}
                    >
                        <option value="">Select ID type…</option>
                        {ID_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </FieldGroup>

                <FieldGroup
                    label="Upload ID Photo"
                    required
                    mb={0}
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFilePick}
                    />
                    {!idFile ? (
                        <div
                            className="reg-upload-zone"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    background: "#e8eef8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <Upload
                                    size={20}
                                    color="#1a4a8a"
                                    strokeWidth={2}
                                />
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#1a1a2e",
                                    marginBottom: 3,
                                }}
                            >
                                Tap to upload
                            </div>
                            <div style={{ fontSize: 11.5, color: "#9090aa" }}>
                                JPG or PNG · Max 2 MB
                            </div>
                        </div>
                    ) : (
                        <div
                            className="reg-upload-zone has-file"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                padding: "16px 14px",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <img
                                    src={idPreview}
                                    alt="ID preview"
                                    style={{
                                        width: 72,
                                        height: 50,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                        border: "1px solid #a8d8bc",
                                        flexShrink: 0,
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            color: "#1a7a4a",
                                            marginBottom: 2,
                                        }}
                                    >
                                        ✓ Uploaded
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#4a4a6a",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {idFile.name}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#1a4a8a",
                                        }}
                                    >
                                        Tap to change photo
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile();
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#b02020",
                                        padding: 4,
                                        flexShrink: 0,
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </FieldGroup>
            </div>

            {/* DIVIDER */}
            {!isMobile && (
                <div
                    style={{ width: 1, background: "#e4dfd4", margin: "0 0" }}
                />
            )}

            {/* RIGHT — notice + guidelines */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    paddingLeft: 18,
                }}
            >
                {/* Verification notice */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#fff7e0,#fff3d0)",
                        border: "1.5px solid #e8c84a",
                        borderRadius: 8,
                        padding: "14px 16px",
                    }}
                >
                    <div
                        style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#7a4800",
                            marginBottom: 6,
                        }}
                    >
                        Account Verification Required
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            color: "#8a5800",
                            lineHeight: 1.65,
                            marginBottom: 10,
                        }}
                    >
                        Upload a valid ID so barangay staff can confirm your
                        residency. Review takes{" "}
                        <strong>1–3 business days</strong>.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "rgba(184,104,0,0.1)",
                            borderRadius: 5,
                            padding: "8px 10px",
                        }}
                    >
                        <CalendarClock
                            size={15}
                            color="#b86800"
                            strokeWidth={2}
                            style={{ flexShrink: 0 }}
                        />
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#7a4800",
                            }}
                        >
                            Come back in 1–3 business days to log in after
                            approval.
                        </span>
                    </div>
                </div>

                {/* Photo guidelines */}
                <div
                    style={{
                        background: "#f8f6f1",
                        border: "1px solid #e4dfd4",
                        borderRadius: 6,
                        padding: "12px 14px",
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#9090aa",
                            textTransform: "uppercase",
                            letterSpacing: 1.2,
                            marginBottom: 9,
                        }}
                    >
                        Photo Guidelines
                    </div>
                    {[
                        "ID must be clearly visible and not blurry",
                        "All four corners must be in frame",
                        "Your name and photo must be readable",
                        "Do not cover any part of the ID",
                    ].map((tip, i, arr) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: i < arr.length - 1 ? 6 : 0,
                                alignItems: "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: "#0e2554",
                                    flexShrink: 0,
                                    marginTop: 5,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 11.5,
                                    color: "#4a4a6a",
                                    lineHeight: 1.5,
                                }}
                            >
                                {tip}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── STEP 3: Set Password ──────────────────────────────────
    const Step3 = (
        <div className="reg-fadein">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 12,
                    marginBottom: 6,
                }}
            >
                <FieldGroup label="Password" required>
                    <div style={{ position: "relative" }}>
                        <span
                            style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                opacity: 0.35,
                                display: "flex",
                                zIndex: 1,
                            }}
                        >
                            <Lock size={15} color="#0e2554" strokeWidth={2} />
                        </span>
                        <input
                            className="reg-input"
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            placeholder="Min. 8 chars"
                            style={{ paddingRight: 38 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => !p)}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                opacity: 0.4,
                                display: "flex",
                                padding: 2,
                            }}
                            tabIndex={-1}
                        >
                            {showPw ? (
                                <EyeOff size={15} color="#333" />
                            ) : (
                                <Eye size={15} color="#333" />
                            )}
                        </button>
                    </div>
                </FieldGroup>
                <FieldGroup label="Confirm Password" required>
                    <div style={{ position: "relative" }}>
                        <span
                            style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                opacity: 0.35,
                                display: "flex",
                                zIndex: 1,
                            }}
                        >
                            <Lock size={15} color="#0e2554" strokeWidth={2} />
                        </span>
                        <input
                            className="reg-input"
                            type={showCf ? "text" : "password"}
                            value={confirm}
                            onChange={(e) => {
                                setConfirm(e.target.value);
                                setError("");
                            }}
                            placeholder="Re-enter"
                            style={{ paddingRight: 38 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCf((p) => !p)}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                opacity: 0.4,
                                display: "flex",
                                padding: 2,
                            }}
                            tabIndex={-1}
                        >
                            {showCf ? (
                                <EyeOff size={15} color="#333" />
                            ) : (
                                <Eye size={15} color="#333" />
                            )}
                        </button>
                    </div>
                </FieldGroup>
            </div>

            {/* Strength dots */}
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 20,
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
                                transition: "color .2s",
                            }}
                        >
                            {r.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Declaration */}
            <div
                style={{
                    background: "#f8f6f1",
                    border: "1px solid #e4dfd4",
                    borderRadius: 7,
                    padding: "13px 16px",
                    marginBottom: 18,
                }}
            >
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 11,
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                    onClick={() => setDeclared((d) => !d)}
                >
                    <div
                        className={`reg-checkbox ${declared ? "checked" : ""}`}
                    >
                        {declared && (
                            <Check size={11} color="#fff" strokeWidth={3} />
                        )}
                    </div>
                    <p
                        style={{
                            fontSize: 12.5,
                            color: "#4a4a6a",
                            lineHeight: 1.65,
                            margin: 0,
                        }}
                    >
                        I certify that I am a{" "}
                        <strong>
                            bona fide resident of Barangay East Tapinac,
                            Olongapo City
                        </strong>{" "}
                        and that all information I provided is true and
                        accurate. I understand that false information may result
                        in account denial.
                    </p>
                </label>
            </div>

            {/* Summary */}
            <div
                style={{
                    background: "#edf1fa",
                    border: "1px solid rgba(14,37,84,.15)",
                    borderRadius: 7,
                    padding: "12px 16px",
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#0e2554",
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        marginBottom: 10,
                    }}
                >
                    Registration Summary
                </div>
                {[
                    { label: "Name", value: fullName },
                    {
                        label: "Birthdate",
                        value: form.date_of_birth
                            ? new Date(
                                  form.date_of_birth + "T00:00:00",
                              ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "—",
                    },
                    { label: "Email", value: form.email },
                    {
                        label: "Address",
                        value: `${form.house_no}, ${selectedPurok?.name ?? ""}, ${resolvedStreet}`,
                    },
                    { label: "Civil Status", value: form.civil_status },
                    { label: "Nationality", value: form.nationality },
                    { label: "ID Type", value: idType },
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        style={{ display: "flex", gap: 12, marginBottom: 5 }}
                    >
                        <div
                            style={{
                                width: 58,
                                fontSize: 11,
                                color: "#9090aa",
                                fontWeight: 600,
                                flexShrink: 0,
                            }}
                        >
                            {label}
                        </div>
                        <div
                            style={{
                                fontSize: 12.5,
                                color: "#1a1a2e",
                                wordBreak: "break-word",
                            }}
                        >
                            {value || "—"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const stepContent = [Step1, Step2, Step3][step - 1];

    // ── Main render ───────────────────────────────────────────
    return (
        <div
            className="reg-root"
            style={{
                alignItems: isMobile ? "flex-start" : "center",
                padding: isMobile ? "20px 12px 36px" : "32px 16px",
            }}
        >
            <div className="reg-card">
                {/* Gold top bar */}
                <div
                    style={{
                        height: 4,
                        background:
                            "linear-gradient(90deg,#c9a227,#f0d060,#c9a227)",
                    }}
                />

                {/* Header — prominent, centered */}
                <div
                    style={{
                        background:
                            "linear-gradient(180deg,#0e2554 0%,#163066 100%)",
                        padding: "22px 32px 20px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            border: "2.5px solid rgba(201,162,39,0.6)",
                            background: "rgba(201,162,39,0.08)",
                            overflow: "hidden",
                            margin: "0 auto 14px",
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="Barangay Seal"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            fontSize: 9.5,
                            letterSpacing: "2.5px",
                            textTransform: "uppercase",
                            color: "rgba(201,162,39,0.7)",
                            marginBottom: 4,
                        }}
                    >
                        Republic of the Philippines
                    </div>
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#fff",
                            lineHeight: 1.2,
                            marginBottom: 3,
                        }}
                    >
                        Barangay East Tapinac
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.55)",
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                        }}
                    >
                        CertiFast · Resident Registration
                    </div>
                </div>

                {/* Body */}
                <div
                    style={{
                        padding: isMobile ? "20px 18px 24px" : "26px 32px 28px",
                    }}
                >
                    <StepIndicator step={step} />

                    {/* Step title */}
                    <div style={{ marginBottom: 18 }}>
                        <div
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#0e2554",
                                marginBottom: 3,
                            }}
                        >
                            {step === 1 && "Your Information"}
                            {step === 2 && "Verify Your Residency"}
                            {step === 3 && "Create Your Password"}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#9090aa" }}>
                            {step === 1 &&
                                "Personal details and home address within East Tapinac."}
                            {step === 2 &&
                                "Upload a valid ID so barangay staff can confirm your residency."}
                            {step === 3 &&
                                "Almost done — set a secure password for your account."}
                        </div>
                    </div>

                    {stepContent}

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: "#fdecea",
                                border: "1px solid #f5c6c6",
                                borderRadius: 5,
                                padding: "10px 14px",
                                marginTop: 14,
                                marginBottom: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <AlertCircle
                                size={14}
                                color="#b02020"
                                style={{ flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 13, color: "#b02020" }}>
                                {error}
                            </span>
                        </div>
                    )}

                    {/* Nav buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            marginTop: 22,
                        }}
                    >
                        {step > 1 ? (
                            <button
                                className="reg-btn-ghost"
                                onClick={handleBack}
                            >
                                <ChevronLeft size={14} /> Back
                            </button>
                        ) : (
                            <div />
                        )}
                        {step < 3 ? (
                            <button
                                className="reg-btn-primary"
                                onClick={handleNext}
                            >
                                Continue <ChevronRight size={14} />
                            </button>
                        ) : (
                            <button
                                className="reg-btn-primary"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="reg-spinner" />{" "}
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <Check size={13} /> Submit Registration
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer — high-contrast sign-in prompt */}
                <div
                    style={{
                        background: "#0e2554",
                        borderTop: "1px solid rgba(201,162,39,0.2)",
                        padding: "14px 32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                    }}
                >
                    <span
                        style={{
                            fontSize: 13.5,
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "'Source Serif 4',serif",
                        }}
                    >
                        Already have an account?
                    </span>
                    <button
                        type="button"
                        onClick={() => navigate("/resident/login")}
                        style={{
                            background: "rgba(201,162,39,0.18)",
                            border: "1.5px solid rgba(201,162,39,0.55)",
                            borderRadius: 5,
                            padding: "7px 18px",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#f0d060",
                            cursor: "pointer",
                            fontFamily: "'Source Serif 4',serif",
                            transition: "background .15s",
                        }}
                    >
                        Sign in →
                    </button>
                </div>
            </div>
        </div>
    );
}
