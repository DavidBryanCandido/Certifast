// =============================================================
// FILE: client/src/pages/resident/SubmitRequest.jsx
// =============================================================
// TODO (Backend Dev):
//   - GET /api/certificates/templates → ALL_CERTS list
//   - POST /api/resident/requests
//     body: { certType, purpose, extraFields, notes, source: 'resident', status: 'pending' }
//     response: { request_id, status, requested_at }
//   - All endpoints require residentToken in Authorization header
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Home,
    Plus,
    QrCode,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Check,
    AlertCircle,
    Scroll,
    BadgeCheck,
    Users,
    Briefcase,
    Heart,
    Baby,
    Building2,
    Shield,
    ClipboardList,
    FileCheck,
    UserCircle,
} from "lucide-react";
import residentProfileService from "../../services/residentProfileService";
import requestService from "../../services/requestService";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";

// ─── Styles ───────────────────────────────────────────────────
if (!document.head.querySelector("[data-resident-sr]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-sr", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .sr-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .sr-topbar { background:linear-gradient(135deg,#0e2554 0%,#163066 100%); border-bottom:1px solid rgba(201,162,39,0.2); position:sticky; top:0; z-index:100; }
    .sr-topbar-inner { max-width:860px; margin:0 auto; padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    .sr-gold-line { height:2px; background:linear-gradient(90deg,#c9a227,#f0d060,#c9a227); }
    .sr-step-wrap { display:flex; align-items:center; gap:0; margin-bottom:28px; }
    .sr-step-dot { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; transition:all .2s; }
    .sr-step-dot.done   { background:#1a7a4a; color:#fff; }
    .sr-step-dot.active { background:#0e2554; color:#fff; }
    .sr-step-dot.idle   { background:#e4dfd4; color:#9090aa; }
    .sr-step-line { flex:1; height:2px; background:#e4dfd4; transition:background .2s; }
    .sr-step-line.done  { background:#1a7a4a; }
    .sr-cert-card { display:flex; align-items:center; gap:14px; padding:14px 16px; border:1.5px solid #e4dfd4; border-radius:8px; cursor:pointer; background:#fff; transition:all .15s; font-family:'Source Serif 4',serif; }
    .sr-cert-card:hover { border-color:#0e2554; background:#f8f6f1; transform:translateY(-1px); box-shadow:0 4px 14px rgba(14,37,84,0.08); }
    .sr-cert-card.selected { border-color:#0e2554; background:#edf1fa; box-shadow:0 4px 14px rgba(14,37,84,0.12); }
    .sr-input { width:100%; padding:10px 12px; border:1.5px solid #e4dfd4; border-radius:5px; font-family:'Source Serif 4',serif; font-size:13px; background:#fff; outline:none; color:#1a1a2e; transition:border-color .15s; box-sizing:border-box; }
    .sr-input:focus { border-color:#0e2554; }
    .sr-select { width:100%; padding:10px 12px; border:1.5px solid #e4dfd4; border-radius:5px; font-family:'Source Serif 4',serif; font-size:13px; background:#fff; outline:none; color:#1a1a2e; cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239090aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:34px; transition:border-color .15s; box-sizing:border-box; }
    .sr-select:focus { border-color:#0e2554; }
    .sr-textarea { width:100%; padding:10px 12px; border:1.5px solid #e4dfd4; border-radius:5px; font-family:'Source Serif 4',serif; font-size:13px; background:#fff; outline:none; color:#1a1a2e; transition:border-color .15s; resize:vertical; min-height:80px; box-sizing:border-box; }
    .sr-textarea:focus { border-color:#0e2554; }
    .sr-label { font-size:10px; font-weight:700; color:#4a4a6a; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block; }
    .sr-readonly { padding:10px 12px; background:#f8f6f1; border:1.5px solid #e4dfd4; border-radius:5px; font-size:13px; color:#4a4a6a; font-family:'Source Serif 4',serif; }
    .sr-btn-primary { display:inline-flex; align-items:center; gap:7px; padding:11px 22px; background:linear-gradient(135deg,#163066,#091a3e); color:#fff; border:none; border-radius:4px; font-family:'Playfair Display',serif; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:opacity .15s; }
    .sr-btn-primary:hover { opacity:.88; }
    .sr-btn-primary:disabled { opacity:.45; cursor:default; }
    .sr-btn-ghost { display:inline-flex; align-items:center; gap:7px; padding:11px 22px; background:#fff; color:#4a4a6a; border:1.5px solid #e4dfd4; border-radius:4px; font-family:'Source Serif 4',serif; font-size:12.5px; font-weight:600; cursor:pointer; transition:all .15s; }
    .sr-btn-ghost:hover { border-color:#0e2554; color:#0e2554; }
    @keyframes sr-fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .sr-fadein { animation: sr-fadein 0.3s ease both; }
    @keyframes sr-pop { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
    .sr-pop { animation: sr-pop 0.35s cubic-bezier(.34,1.56,.64,1) both; }
    `;
    document.head.appendChild(s);
}

// ─── Certificate list ─────────────────────────────────────────
const ALL_CERTS = [
    {
        name: "Barangay Clearance",
        hasFee: true,
        icon: Shield,
        desc: "General official purposes. Certifies holder is a resident in good standing.",
    },
    {
        name: "Certificate of Residency",
        hasFee: false,
        icon: Home,
        desc: "Certifies that the individual is a bona fide resident of Barangay East Tapinac.",
    },
    {
        name: "Certificate of Indigency",
        hasFee: false,
        icon: Heart,
        desc: "Certifies that the individual belongs to an indigent family in the barangay.",
    },
    {
        name: "Business Permit",
        hasFee: true,
        icon: Briefcase,
        desc: "Authorizes the holder to operate a business within Barangay East Tapinac.",
    },
    {
        name: "Good Moral Certificate",
        hasFee: false,
        icon: BadgeCheck,
        desc: "Certifies that the individual is of good moral character in the community.",
    },
    {
        name: "Certificate of Live Birth (Endorsement)",
        hasFee: false,
        icon: Baby,
        desc: "Endorsement for late registration of live birth at the civil registry.",
    },
    {
        name: "Certificate of Cohabitation",
        hasFee: false,
        icon: Users,
        desc: "Certifies that two individuals are cohabiting as a couple within the barangay.",
    },
    {
        name: "Certificate of No Business",
        hasFee: false,
        icon: Building2,
        desc: "Certifies that the individual has no registered business in the barangay.",
    },
    {
        name: "Certificate of Guardianship",
        hasFee: false,
        icon: ClipboardList,
        desc: "Certifies guardianship relationship for use in official transactions.",
    },
    {
        name: "Barangay Business Clearance (Renewal)",
        hasFee: true,
        icon: FileCheck,
        desc: "Renewal of existing barangay business clearance for the current year.",
    },
];

const COMMON_PURPOSES = [
    "Employment",
    "School Requirement",
    "Loan Application",
    "Travel Requirements",
    "Medical Assistance",
    "College Application",
    "Government Transaction",
    "Legal Purpose",
    "Others",
];

// ─── Cert-specific extra fields config ───────────────────────
// Each entry defines the additional fields required for that certificate.
// These populate the body of the generated certificate document.
const CERT_EXTRA_FIELDS = {
    "Business Permit": [
        {
            key: "businessName",
            label: "Business / Trade Name",
            placeholder: "e.g. Santos General Store",
            required: true,
        },
        {
            key: "businessAddress",
            label: "Business Address",
            placeholder: "Street, Barangay, City",
            required: true,
        },
        {
            key: "businessType",
            label: "Type of Business",
            placeholder: "e.g. Sari-sari store, Wi-Fi installation, Food stall",
            required: true,
        },
        {
            key: "businessArea",
            label: "Coverage / Area (optional)",
            placeholder: "e.g. 30 meters, 50 sqm",
            required: false,
        },
    ],
    "Barangay Business Clearance (Renewal)": [
        {
            key: "businessName",
            label: "Registered Business Name",
            placeholder: "e.g. Santos General Store",
            required: true,
        },
        {
            key: "businessAddress",
            label: "Business Address",
            placeholder: "Street, Barangay, City",
            required: true,
        },
    ],
    "Certificate of Cohabitation": [
        {
            key: "partnerName",
            label: "Partner's Full Name",
            placeholder: "Full legal name of partner",
            required: true,
        },
    ],
    "Certificate of Guardianship": [
        {
            key: "wardName",
            label: "Ward's Full Name",
            placeholder: "Full legal name of the ward",
            required: true,
        },
        {
            key: "relationship",
            label: "Relationship to Ward",
            placeholder: "e.g. Uncle, Aunt, Grandparent",
            required: true,
        },
    ],
    "Certificate of Live Birth (Endorsement)": [
        {
            key: "childName",
            label: "Child's Full Name",
            placeholder: "Full name of the child",
            required: true,
        },
        {
            key: "childDOB",
            label: "Child's Date of Birth",
            placeholder: "",
            required: true,
            type: "date",
        },
        {
            key: "fatherName",
            label: "Father's Full Name",
            placeholder: "Leave blank if unknown",
            required: false,
        },
        {
            key: "motherName",
            label: "Mother's Full Name",
            placeholder: "Mother's full maiden name",
            required: false,
        },
    ],
    "Good Moral Certificate": [
        {
            key: "requestingInstitution",
            label: "Requesting School / Employer (optional)",
            placeholder: "e.g. Olongapo City College",
            required: false,
        },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────
function FieldGroup({ label, children, required }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label className="sr-label">
                {label}
                {required && (
                    <span style={{ color: "#b02020", marginLeft: 2 }}>*</span>
                )}
            </label>
            {children}
        </div>
    );
}

function StepIndicator({ step }) {
    const steps = ["Choose Certificate", "Request Details", "Confirmation"];
    return (
        <div className="sr-step-wrap">
            {steps.map((label, i) => {
                const n = i + 1;
                const isDone = step > n,
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
                                className={`sr-step-dot ${isDone ? "done" : isActive ? "active" : "idle"}`}
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
                                    letterSpacing: 0.5,
                                }}
                            >
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`sr-step-line${isDone ? " done" : ""}`}
                                style={{ margin: "0 8px", marginBottom: 20 }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function fmtDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

// ─── Main Component ───────────────────────────────────────────
export default function SubmitRequest({ resident, onLogout }) {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    // Profile (pre-filled from resident profile API)
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState("");

    // Wizard state
    const [step, setStep] = useState(1);
    const [selectedCert, setSelectedCert] = useState(null);
    const [purpose, setPurpose] = useState("");
    const [customPurpose, setCustomPurpose] = useState("");
    const [extraFields, setExtraFields] = useState({});
    const [notes, setNotes] = useState("");

    // Submission
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    // Load resident profile to pre-fill
    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            setProfileLoading(true);
            setProfileError("");

            try {
                const data = await residentProfileService.getProfile();
                const profileData = data?.profile || data;

                if (mounted) {
                    setProfile(profileData || null);
                }
            } catch (err) {
                if (!mounted) return;

                if (
                    err?.response?.status === 401 ||
                    err?.response?.status === 403
                ) {
                    onLogout?.();
                    return;
                }

                setProfile(null);
                setProfileError(
                    err?.response?.data?.message ||
                        "Unable to load your profile right now. You can still continue, but please check your profile details first.",
                );
            } finally {
                if (mounted) setProfileLoading(false);
            }
        }

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [onLogout]);

    const isMobile = width < 768;
    const name =
        profile?.full_name ||
        resident?.full_name ||
        resident?.name ||
        "Resident";
    const firstName = name.split(" ")[0];
    const finalPurpose = purpose === "Others" ? customPurpose : purpose;
    const certExtra = selectedCert
        ? CERT_EXTRA_FIELDS[selectedCert.name] || []
        : [];
    const fullAddress = profile
        ? [
              profile.address_house,
              profile.address_street,
              "Barangay East Tapinac",
              "Olongapo City",
          ]
              .filter((part) => String(part || "").trim())
              .join(", ")
        : "—";

    function setExtra(key, val) {
        setExtraFields((prev) => ({ ...prev, [key]: val }));
    }

    // Reset extra fields when cert changes
    useEffect(() => {
        setExtraFields({});
    }, [selectedCert]);

    function handleNext() {
        if (step === 1 && !selectedCert) return;
        if (step === 2) {
            if (!finalPurpose.trim()) {
                setError("Please state the purpose of your request.");
                return;
            }
            // Validate required extra fields
            for (const field of certExtra) {
                if (field.required && !extraFields[field.key]?.trim()) {
                    setError(
                        `Please fill in: ${field.label.replace(" (optional)", "")}`,
                    );
                    return;
                }
            }
            setError("");
        }
        setStep((s) => s + 1);
    }

    function handleBack() {
        setError("");
        setStep((s) => s - 1);
    }

    async function handleSubmit() {
        setSubmitting(true);
        setError("");
        try {
            const data = await requestService.createRequest({
                certType: selectedCert.name,
                purpose: finalPurpose,
                extraFields,
                notes,
                source: "resident",
            });

            const created = data?.request || data;
            setSuccess({ request_id: created?.request_id || "—" });
        } catch (err) {
            if (
                err?.response?.status === 401 ||
                err?.response?.status === 403
            ) {
                onLogout?.();
                return;
            }
            setError(
                err?.response?.data?.message ||
                    "Failed to submit. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handleReset() {
        setStep(1);
        setSelectedCert(null);
        setPurpose("");
        setCustomPurpose("");
        setExtraFields({});
        setNotes("");
        setError("");
        setSuccess(null);
    }

    function formatRequestId(raw) {
        const num = Number(raw);
        if (!Number.isFinite(num)) return String(raw || "");
        return `REQ-${String(num).padStart(4, "0")}`;
    }

    // ─── Topbar ───────────────────────────────────────────────
    const Topbar = (
        <ResidentTopbar
            resident={resident}
            onLogout={onLogout}
            isMobile={isMobile}
            pageTitle="New Request"
        />
    );

    // ─── Success screen ───────────────────────────────────────
    if (success) {
        return (
            <div
                className="sr-root"
                style={{ display: "flex", minHeight: "100vh" }}
            >
                {!isMobile && (
                    <ResidentSidebar
                        active="request"
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
                    {Topbar}
                    <div
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: isMobile
                                ? "32px 16px 80px"
                                : "48px 24px 40px",
                        }}
                    >
                        <div
                            className="sr-pop"
                            style={{
                                background: "#fff",
                                border: "1px solid #e4dfd4",
                                borderRadius: 10,
                                padding: isMobile ? "32px 20px" : "48px 48px",
                                textAlign: "center",
                                maxWidth: 560,
                                margin: "0 auto",
                            }}
                        >
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    background: "rgba(26,122,74,0.1)",
                                    border: "2px solid #a8d8bc",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 20px",
                                }}
                            >
                                <Check
                                    size={28}
                                    color="#1a7a4a"
                                    strokeWidth={2.5}
                                />
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: isMobile ? 20 : 24,
                                    fontWeight: 700,
                                    color: "#0e2554",
                                    marginBottom: 8,
                                }}
                            >
                                Request Submitted!
                            </div>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "#9090aa",
                                    margin: "0 0 24px",
                                    lineHeight: 1.7,
                                }}
                            >
                                Your request for{" "}
                                <strong style={{ color: "#1a1a2e" }}>
                                    {selectedCert?.name}
                                </strong>{" "}
                                has been submitted. Processing typically takes
                                1–3 business days.
                            </p>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 10,
                                    background: "#f8f6f1",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 6,
                                    padding: "12px 20px",
                                    marginBottom: 28,
                                }}
                            >
                                <Scroll size={16} color="#9090aa" />
                                <div>
                                    <div
                                        style={{
                                            fontSize: 9.5,
                                            color: "#9090aa",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 2,
                                        }}
                                    >
                                        Request ID
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: "#0e2554",
                                        }}
                                    >
                                        {formatRequestId(success.request_id)}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "#f5edce",
                                    border: "1px solid #e0d4a8",
                                    borderRadius: 6,
                                    padding: "12px 16px",
                                    marginBottom: 28,
                                    textAlign: "left",
                                    display: "flex",
                                    gap: 10,
                                }}
                            >
                                <AlertCircle
                                    size={14}
                                    color="#9a7515"
                                    style={{ flexShrink: 0, marginTop: 1 }}
                                />
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "#7a6530",
                                        lineHeight: 1.65,
                                    }}
                                >
                                    {selectedCert?.hasFee
                                        ? "This certificate requires a fee. Bring payment when claiming at the Barangay East Tapinac office. Bring a valid ID."
                                        : "Please bring a valid ID when claiming your certificate at the Barangay East Tapinac office."}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    className="sr-btn-ghost"
                                    onClick={() =>
                                        navigate("/resident/my-requests")
                                    }
                                >
                                    <FileText size={13} /> View My Requests
                                </button>
                                <button
                                    className="sr-btn-primary"
                                    onClick={handleReset}
                                >
                                    <Plus size={13} /> Submit Another
                                </button>
                            </div>
                        </div>
                    </div>
                    {isMobile && <ResidentBottomNav active="request" />}
                </div>
            </div>
        );
    }

    // ─── STEP 1 — Choose Certificate ──────────────────────────
    const Step1 = (
        <div className="sr-fadein">
            <div style={{ marginBottom: 20 }}>
                <div
                    style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0e2554",
                        marginBottom: 4,
                    }}
                >
                    Select a Certificate Type
                </div>
                <p style={{ fontSize: 12.5, color: "#9090aa", margin: 0 }}>
                    Choose the certificate you need. You can only request one at
                    a time.
                </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALL_CERTS.map((cert) => {
                    const Icon = cert.icon;
                    const isSelected = selectedCert?.name === cert.name;
                    return (
                        <div
                            key={cert.name}
                            className={`sr-cert-card${isSelected ? " selected" : ""}`}
                            onClick={() => setSelectedCert(cert)}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 8,
                                    background: isSelected
                                        ? "rgba(14,37,84,0.1)"
                                        : "#f8f6f1",
                                    border: `1px solid ${isSelected ? "rgba(14,37,84,0.2)" : "#e4dfd4"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon
                                    size={17}
                                    color={isSelected ? "#0e2554" : "#9090aa"}
                                    strokeWidth={1.8}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#1a1a2e",
                                        marginBottom: 2,
                                    }}
                                >
                                    {cert.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11.5,
                                        color: "#9090aa",
                                        lineHeight: 1.5,
                                        whiteSpace: isMobile
                                            ? "normal"
                                            : "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {cert.desc}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "2px 9px",
                                        borderRadius: 20,
                                        background: cert.hasFee
                                            ? "#fff7e6"
                                            : "#e8f5ee",
                                        color: cert.hasFee
                                            ? "#b86800"
                                            : "#1a7a4a",
                                        border: `1px solid ${cert.hasFee ? "#f5d78e" : "#a8d8bc"}`,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {cert.hasFee ? "₱ Fee" : "Free"}
                                </span>
                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        border: `2px solid ${isSelected ? "#0e2554" : "#e4dfd4"}`,
                                        background: isSelected
                                            ? "#0e2554"
                                            : "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isSelected && (
                                        <Check
                                            size={11}
                                            color="#fff"
                                            strokeWidth={3}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ─── STEP 2 — Request Details ─────────────────────────────
    const Step2 = (
        <div className="sr-fadein">
            {/* Selected cert banner */}
            <div
                style={{
                    background: "#edf1fa",
                    border: "1px solid rgba(14,37,84,0.15)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    marginBottom: 22,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                {(() => {
                    const Icon = selectedCert?.icon || FileText;
                    return <Icon size={18} color="#0e2554" strokeWidth={1.8} />;
                })()}
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0e2554",
                        }}
                    >
                        {selectedCert?.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#9090aa" }}>
                        {selectedCert?.desc}
                    </div>
                </div>
                <button
                    onClick={() => setStep(1)}
                    style={{
                        background: "none",
                        border: "1px solid rgba(14,37,84,0.2)",
                        borderRadius: 4,
                        padding: "4px 10px",
                        color: "#163066",
                        fontSize: 11,
                        fontFamily: "'Source Serif 4',serif",
                        cursor: "pointer",
                        fontWeight: 600,
                        flexShrink: 0,
                    }}
                >
                    Change
                </button>
            </div>

            {/* ── Pre-filled profile info ── */}
            {profileLoading && (
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #e4dfd4",
                        borderRadius: 8,
                        padding: "14px 16px",
                        marginBottom: 22,
                    }}
                >
                    <div
                        style={{
                            width: "40%",
                            height: 12,
                            background: "#f0ece4",
                            borderRadius: 4,
                            marginBottom: 10,
                        }}
                    />
                    <div
                        style={{
                            width: "65%",
                            height: 10,
                            background: "#f5f2ee",
                            borderRadius: 4,
                            marginBottom: 7,
                        }}
                    />
                    <div
                        style={{
                            width: "58%",
                            height: 10,
                            background: "#f5f2ee",
                            borderRadius: 4,
                            marginBottom: 7,
                        }}
                    />
                    <div
                        style={{
                            width: "72%",
                            height: 10,
                            background: "#f5f2ee",
                            borderRadius: 4,
                        }}
                    />
                </div>
            )}

            {profileError && (
                <div
                    style={{
                        background: "#fdecea",
                        border: "1px solid #f5c6c6",
                        borderRadius: 6,
                        padding: "11px 14px",
                        color: "#b02020",
                        fontSize: 12.5,
                        marginBottom: 16,
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                    }}
                >
                    <AlertCircle size={13} /> {profileError}
                </div>
            )}

            {profile && (
                <div
                    style={{
                        background: "#f8f6f1",
                        border: "1px solid #e4dfd4",
                        borderRadius: 8,
                        padding: "14px 16px",
                        marginBottom: 22,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            marginBottom: 12,
                        }}
                    >
                        <UserCircle size={13} color="#0e2554" />
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#0e2554",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                            }}
                        >
                            Your Information (from profile)
                        </span>
                        <button
                            onClick={() => navigate("/resident/profile")}
                            style={{
                                marginLeft: "auto",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 11,
                                color: "#163066",
                                fontFamily: "'Source Serif 4',serif",
                                fontWeight: 600,
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            Edit profile →
                        </button>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                            gap: "8px 20px",
                        }}
                    >
                        {[
                            { label: "Full Name", value: profile.full_name },
                            {
                                label: "Date of Birth",
                                value: fmtDate(profile.date_of_birth),
                            },
                            {
                                label: "Address",
                                value: fullAddress,
                                wide: true,
                            },
                            {
                                label: "Contact",
                                value: profile.contact_number || "—",
                            },
                        ].map(({ label, value, wide }) => (
                            <div
                                key={label}
                                style={{
                                    gridColumn:
                                        wide && !isMobile ? "1 / -1" : "auto",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        color: "#9090aa",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.8,
                                        marginBottom: 2,
                                    }}
                                >
                                    {label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12.5,
                                        color: "#1a1a2e",
                                        fontWeight: 500,
                                    }}
                                >
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div
                        style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTop: "1px solid #e4dfd4",
                            fontSize: 11,
                            color: "#9090aa",
                        }}
                    >
                        This information will be used to generate your
                        certificate. If anything is incorrect, update your
                        profile first.
                    </div>
                </div>
            )}

            <div
                style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0e2554",
                    marginBottom: 16,
                }}
            >
                Request Details
            </div>

            {/* Purpose */}
            <FieldGroup label="Purpose of Request" required>
                <select
                    className="sr-select"
                    value={purpose}
                    onChange={(e) => {
                        setPurpose(e.target.value);
                        setError("");
                    }}
                >
                    <option value="">Select purpose…</option>
                    {COMMON_PURPOSES.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
            </FieldGroup>
            {purpose === "Others" && (
                <FieldGroup label="Please specify" required>
                    <input
                        className="sr-input"
                        type="text"
                        placeholder="Describe your purpose…"
                        value={customPurpose}
                        onChange={(e) => {
                            setCustomPurpose(e.target.value);
                            setError("");
                        }}
                        maxLength={120}
                    />
                </FieldGroup>
            )}

            {/* ── Cert-specific extra fields ── */}
            {certExtra.length > 0 && (
                <div style={{ marginTop: 4, marginBottom: 4 }}>
                    <div
                        style={{
                            height: 1,
                            background: "#e4dfd4",
                            margin: "4px 0 18px",
                        }}
                    />
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0e2554",
                            marginBottom: 14,
                        }}
                    >
                        Additional Information Required
                    </div>
                    {certExtra.map((field) => (
                        <FieldGroup
                            key={field.key}
                            label={field.label}
                            required={field.required}
                        >
                            <input
                                className="sr-input"
                                type={field.type || "text"}
                                placeholder={field.placeholder || ""}
                                value={extraFields[field.key] || ""}
                                onChange={(e) => {
                                    setExtra(field.key, e.target.value);
                                    setError("");
                                }}
                                max={
                                    field.type === "date"
                                        ? new Date().toISOString().split("T")[0]
                                        : undefined
                                }
                            />
                        </FieldGroup>
                    ))}
                </div>
            )}

            {/* Additional notes */}
            <FieldGroup label="Additional Notes (optional)">
                <textarea
                    className="sr-textarea"
                    placeholder="Any other information the barangay should know…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={300}
                />
                <div
                    style={{
                        fontSize: 10.5,
                        color: "#9090aa",
                        marginTop: 4,
                        textAlign: "right",
                    }}
                >
                    {notes.length}/300
                </div>
            </FieldGroup>

            {/* Fee reminder */}
            {selectedCert?.hasFee && (
                <div
                    style={{
                        background: "#fff7e6",
                        border: "1px solid #f5d78e",
                        borderRadius: 6,
                        padding: "12px 14px",
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                    }}
                >
                    <AlertCircle
                        size={14}
                        color="#b86800"
                        style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <span
                        style={{
                            fontSize: 12,
                            color: "#b86800",
                            lineHeight: 1.65,
                        }}
                    >
                        <strong>{selectedCert.name}</strong> requires a fee
                        payable at the barangay office upon claiming.
                    </span>
                </div>
            )}
        </div>
    );

    // ─── STEP 3 — Confirmation ────────────────────────────────
    const summaryRows = [
        { label: "Certificate", value: selectedCert?.name },
        { label: "Purpose", value: finalPurpose || "—" },
        // Extra fields in summary
        ...certExtra.map((f) => ({
            label: f.label.replace(" (optional)", ""),
            value: extraFields[f.key] || "—",
        })),
        {
            label: "Fee Required",
            value: selectedCert?.hasFee
                ? "Yes – payable at barangay office"
                : "None",
        },
        { label: "Notes", value: notes.trim() || "None" },
    ];

    const Step3 = (
        <div className="sr-fadein">
            <div
                style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0e2554",
                    marginBottom: 18,
                }}
            >
                Review & Confirm
            </div>

            <div
                style={{
                    background: "#fff",
                    border: "1px solid #e4dfd4",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 20,
                }}
            >
                <div
                    style={{
                        padding: "12px 18px",
                        background: "#f8f6f1",
                        borderBottom: "1px solid #e4dfd4",
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#9090aa",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                        }}
                    >
                        Request Summary
                    </div>
                </div>
                <div
                    style={{
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    {/* Resident info block */}
                    {profile && (
                        <div
                            style={{
                                padding: "10px 12px",
                                background: "#f8f6f1",
                                borderRadius: 6,
                                marginBottom: 4,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 9.5,
                                    color: "#9090aa",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                    marginBottom: 6,
                                }}
                            >
                                Applicant
                            </div>
                            <div
                                style={{
                                    fontSize: 12.5,
                                    color: "#1a1a2e",
                                    fontWeight: 600,
                                }}
                            >
                                {profile.full_name}
                            </div>
                            <div
                                style={{
                                    fontSize: 11.5,
                                    color: "#9090aa",
                                    marginTop: 2,
                                }}
                            >
                                {fullAddress}
                            </div>
                        </div>
                    )}
                    {summaryRows.map(({ label, value }) => (
                        <div
                            key={label}
                            style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    width: 150,
                                    fontSize: 10.5,
                                    color: "#9090aa",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                    flexShrink: 0,
                                    paddingTop: 2,
                                }}
                            >
                                {label}
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#1a1a2e",
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                }}
                            >
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    background: "#f8f6f1",
                    border: "1px solid #e4dfd4",
                    borderRadius: 6,
                    padding: "12px 14px",
                    marginBottom: 20,
                    display: "flex",
                    gap: 10,
                }}
            >
                <AlertCircle
                    size={14}
                    color="#9090aa"
                    style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span
                    style={{
                        fontSize: 11.5,
                        color: "#4a4a6a",
                        lineHeight: 1.65,
                    }}
                >
                    By submitting, you confirm that all information is true and
                    accurate. Falsification may result in denial and legal
                    consequences.
                </span>
            </div>

            <div
                style={{
                    background: "#f5edce",
                    border: "1px solid #e0d4a8",
                    borderRadius: 6,
                    padding: "12px 14px",
                    display: "flex",
                    gap: 10,
                }}
            >
                <AlertCircle
                    size={14}
                    color="#9a7515"
                    style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span
                    style={{
                        fontSize: 11.5,
                        color: "#7a6530",
                        lineHeight: 1.65,
                    }}
                >
                    You will receive a <strong>Request ID</strong> after
                    submission. Processing takes{" "}
                    <strong>1–3 business days</strong>. Visit the office to
                    claim your document.
                </span>
            </div>
        </div>
    );

    const stepContent = [Step1, Step2, Step3][step - 1];

    return (
        <div
            className="sr-root"
            style={{ display: "flex", minHeight: "100vh" }}
        >
            {!isMobile && (
                <ResidentSidebar
                    active="request"
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
                {Topbar}
                <div
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: isMobile ? "20px 16px 80px" : "28px 24px 40px",
                    }}
                >
                    <div className="sr-fadein" style={{ marginBottom: 24 }}>
                        <h1
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: isMobile ? 20 : 24,
                                fontWeight: 700,
                                color: "#0e2554",
                                margin: "0 0 4px",
                            }}
                        >
                            Submit a Request
                        </h1>
                        <p
                            style={{
                                fontSize: 12.5,
                                color: "#9090aa",
                                margin: 0,
                            }}
                        >
                            Request a barangay certificate online. Pickup is
                            done in person at the barangay office.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
                            gap: 20,
                            alignItems: "start",
                        }}
                    >
                        {/* Wizard */}
                        <div>
                            <StepIndicator step={step} />
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e4dfd4",
                                    borderRadius: 8,
                                    padding: isMobile
                                        ? "20px 16px"
                                        : "24px 26px",
                                    marginBottom: 16,
                                }}
                            >
                                {stepContent}
                            </div>
                            {error && (
                                <div
                                    style={{
                                        background: "#fdecea",
                                        border: "1px solid #f5c6c6",
                                        borderRadius: 6,
                                        padding: "11px 14px",
                                        color: "#b02020",
                                        fontSize: 12.5,
                                        marginBottom: 14,
                                        display: "flex",
                                        gap: 8,
                                        alignItems: "center",
                                    }}
                                >
                                    <AlertCircle size={13} /> {error}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                }}
                            >
                                {step > 1 ? (
                                    <button
                                        className="sr-btn-ghost"
                                        onClick={handleBack}
                                    >
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                ) : (
                                    <button
                                        className="sr-btn-ghost"
                                        onClick={() =>
                                            navigate("/resident/home")
                                        }
                                    >
                                        <ChevronLeft size={14} /> Cancel
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button
                                        className="sr-btn-primary"
                                        onClick={handleNext}
                                        disabled={step === 1 && !selectedCert}
                                    >
                                        Continue <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        className="sr-btn-primary"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            "Submitting…"
                                        ) : (
                                            <>
                                                <Check size={14} /> Submit
                                                Request
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        {!isMobile && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14,
                                }}
                            >
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "12px 18px",
                                            background: "#f8f6f1",
                                            borderBottom: "1px solid #e4dfd4",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Playfair Display',serif",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                            }}
                                        >
                                            How It Works
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: "14px 18px",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 14,
                                        }}
                                    >
                                        {[
                                            {
                                                n: "1",
                                                title: "Submit Online",
                                                desc: "Fill out and submit this form.",
                                            },
                                            {
                                                n: "2",
                                                title: "Staff Review",
                                                desc: "Barangay staff process your request in 1–3 business days.",
                                            },
                                            {
                                                n: "3",
                                                title: "Claim In Person",
                                                desc: "Visit with a valid ID (and fee if applicable).",
                                            },
                                        ].map((s) => (
                                            <div
                                                key={s.n}
                                                style={{
                                                    display: "flex",
                                                    gap: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        background: "#0e2554",
                                                        color: "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {s.n}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 12.5,
                                                            fontWeight: 600,
                                                            color: "#1a1a2e",
                                                        }}
                                                    >
                                                        {s.title}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: "#9090aa",
                                                            marginTop: 1,
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {s.desc}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        background: "#f5edce",
                                        border: "1px solid #e0d4a8",
                                        borderRadius: 8,
                                        padding: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "#7a6530",
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            marginBottom: 8,
                                        }}
                                    >
                                        Office Hours
                                    </div>
                                    <p
                                        style={{
                                            fontSize: 12,
                                            color: "#7a6530",
                                            lineHeight: 1.75,
                                            margin: "0 0 6px",
                                        }}
                                    >
                                        <strong>Mon – Fri:</strong> 8:00 AM –
                                        5:00 PM
                                        <br />
                                        <strong>Saturday:</strong> 8:00 AM –
                                        12:00 PM
                                        <br />
                                        <strong>Sunday & Holidays:</strong>{" "}
                                        Closed
                                    </p>
                                    <p
                                        style={{
                                            fontSize: 11,
                                            color: "#9a7515",
                                            margin: 0,
                                        }}
                                    >
                                        54 - 14th Street corner Gallagher
                                        Street, Olongapo City
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "12px 18px",
                                            background: "#f8f6f1",
                                            borderBottom: "1px solid #e4dfd4",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Playfair Display',serif",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#0e2554",
                                            }}
                                        >
                                            What to Bring
                                        </div>
                                        {selectedCert && (
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    color: "#9090aa",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                for{" "}
                                                {selectedCert.name.replace(
                                                    "Certificate of ",
                                                    "Cert. of ",
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ padding: "8px 0" }}>
                                        {(() => {
                                            const base = [
                                                "Your CertiFast QR card (printed or on your phone)",
                                                "Valid government-issued ID",
                                                "Request ID / reference number",
                                            ];
                                            const extras = {
                                                "Business Permit": [
                                                    "Fee payment",
                                                    "Sketch or location map of business",
                                                    "Proof of business address",
                                                ],
                                                "Barangay Business Clearance (Renewal)":
                                                    [
                                                        "Fee payment",
                                                        "Previous barangay clearance / permit",
                                                    ],
                                                "Barangay Clearance": [
                                                    "Fee payment",
                                                ],
                                                "Certificate of Indigency": [
                                                    "Proof of income or indigency (if available)",
                                                ],
                                                "Certificate of Cohabitation": [
                                                    "Both partners must be present",
                                                    "Supporting documents (e.g. lease agreement, utility bill)",
                                                ],
                                                "Certificate of Guardianship": [
                                                    "Birth certificate of the ward",
                                                    "Supporting documents proving guardianship",
                                                ],
                                                "Certificate of Live Birth (Endorsement)":
                                                    [
                                                        "Hospital or birth records of the child",
                                                        "Valid IDs of both parents (if available)",
                                                    ],
                                                "Good Moral Certificate": [
                                                    "Letter of request from the school or employer (if applicable)",
                                                ],
                                            };
                                            const certItems = selectedCert
                                                ? extras[selectedCert.name] ||
                                                  (selectedCert.hasFee
                                                      ? ["Fee payment"]
                                                      : [])
                                                : [
                                                      "Payment (for fee-required certificates)",
                                                  ];
                                            const all = [...base, ...certItems];
                                            return all.map((item, i) => (
                                                <div
                                                    key={item}
                                                    style={{
                                                        display: "flex",
                                                        alignItems:
                                                            "flex-start",
                                                        gap: 10,
                                                        padding: "8px 18px",
                                                        borderBottom:
                                                            i < all.length - 1
                                                                ? "1px solid #f5f2ee"
                                                                : "none",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: "50%",
                                                            background:
                                                                "#1a7a4a",
                                                            flexShrink: 0,
                                                            marginTop: 5,
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#1a1a2e",
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {item}
                                                    </span>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {isMobile && <ResidentBottomNav active="request" />}
            </div>
        </div>
    );
}
