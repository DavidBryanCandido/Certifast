// =============================================================
// FILE: client/src/pages/resident/ResidentProfile.jsx
// =============================================================

import { useEffect, useState } from "react";
import {
    User,
    Edit3,
    Check,
    X,
    AlertCircle,
    Users,
    Briefcase,
    FileUp,
    Plus,
    Trash2,
} from "lucide-react";
import residentProfileService from "../../services/residentProfileService";
import { supabase } from "../../supabaseClient";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";
import { formatAddressParts } from "../../utils/address";
import {
    buildStreetOptions,
    findSingleMappedPurok,
    isMappedPurokStreet,
    isStreetAllowedForPurok,
    normalizeAddressOptions,
    PUROKS_FALLBACK,
    STREET_MAPPINGS_FALLBACK,
    STREETS_FALLBACK,
} from "../../utils/addressOptions";

if (!document.head.querySelector("[data-resident-home]")) {
    const s = document.createElement("style");
    s.setAttribute("data-resident-home", "true");
    s.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Serif+4:wght@300;400;600&display=swap');
    .rh-root { min-height:100vh; background:#f4f2ed; font-family:'Source Serif 4',serif; }
    .rh-topbar { background:linear-gradient(135deg,var(--color-primary, #0e2554) 0%,var(--color-primary-soft, #163066) 100%); border-bottom:1px solid rgba(var(--color-accent-rgb, 201, 162, 39),0.2); position:sticky; top:0; z-index:100; }
    .rh-topbar-inner { padding:0 24px; height:60px; display:flex; align-items:center; gap:12px; }
    @keyframes rhFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .rh-fadein { animation:rhFadeUp 0.35s ease both; }
    `;
    document.head.appendChild(s);
}

const CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated", "Annulled"];
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const PROFILE_UPLOAD_POLICY_HINT =
    "Please run database/resident_profile_certificate_details.sql in Supabase, then try saving again.";
const PROFILE_UPLOAD_MIME_HINT =
    "The certifast-uploads bucket must allow image/jpeg, image/png, image/webp, and application/pdf.";

const EMPTY_PROFILE_DETAILS = Object.freeze({
    fatherName: "",
    motherName: "",
    legalSpouseName: "",
    currentPartnerName: "",
    childrenNames: [],
    businessName: "",
    businessType: "",
    businessArea: "",
    businessAddress: "",
    businessOwnerName: "",
    businessOwnerAddress: "",
    businessPermitNo: "",
    monthlyIncome: "",
    incomeStartYear: "",
    businessProof: null,
});

const MAX_PROFILE_FILE_SIZE = 6 * 1024 * 1024;

function textValue(value) {
    return value === null || value === undefined ? "" : String(value);
}

function trimText(value) {
    return textValue(value).trim();
}

function fmtDate(str) {
    if (!str) return "-";
    const dateOnly = String(str).slice(0, 10);
    const [y, m, d] = dateOnly.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function calcAge(dob) {
    if (!dob) return null;
    const dateOnly = String(dob).slice(0, 10);
    const [y, m, d] = dateOnly.split("-").map(Number);
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
        today <
        new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    ) {
        age -= 1;
    }
    return age;
}

function fileExt(name = "") {
    const ext = String(name).split(".").pop()?.toLowerCase();
    return ext && ext !== name.toLowerCase() ? ext : "bin";
}

function safeFilePart(raw = "") {
    return String(raw)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 42);
}

function formatFileSize(size = 0) {
    if (!size) return "0 KB";
    if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function validateBusinessProofFile(file) {
    if (!file) return "";
    const allowed =
        file.type.startsWith("image/") || file.type === "application/pdf";
    if (!allowed) return "Proof of business must be an image or PDF file.";
    if (file.size > MAX_PROFILE_FILE_SIZE) {
        return "Proof of business must be 6 MB or smaller.";
    }
    return "";
}

function normalizeBusinessProof(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const normalized = {
        fileName: trimText(value.fileName),
        filePath: trimText(value.filePath),
        fileUrl: trimText(value.fileUrl),
        mimeType: trimText(value.mimeType),
        fileSize: Number(value.fileSize) || 0,
        uploadedAt: trimText(value.uploadedAt),
    };

    if (!normalized.fileName && !normalized.filePath && !normalized.fileUrl) {
        return null;
    }

    return normalized;
}

function normalizeProfileDetails(value) {
    const details =
        value && typeof value === "object" && !Array.isArray(value) ? value : {};

    return {
        ...EMPTY_PROFILE_DETAILS,
        fatherName: textValue(details.fatherName),
        motherName: textValue(details.motherName),
        legalSpouseName: textValue(details.legalSpouseName),
        currentPartnerName: textValue(details.currentPartnerName),
        childrenNames: Array.isArray(details.childrenNames)
            ? details.childrenNames
                  .map((item) => trimText(item))
                  .filter(Boolean)
            : [],
        businessName: textValue(details.businessName),
        businessType: textValue(details.businessType),
        businessArea: textValue(details.businessArea),
        businessAddress: textValue(details.businessAddress),
        businessOwnerName: textValue(details.businessOwnerName),
        businessOwnerAddress: textValue(details.businessOwnerAddress),
        businessPermitNo: textValue(details.businessPermitNo),
        monthlyIncome: textValue(details.monthlyIncome),
        incomeStartYear: textValue(details.incomeStartYear),
        businessProof: normalizeBusinessProof(details.businessProof),
    };
}

function nonEmptyChildren(childrenNames) {
    const cleaned = (childrenNames || [])
        .map((item) => trimText(item))
        .filter(Boolean);
    return cleaned.length > 0 ? cleaned : [];
}

function withChildRow(childrenNames) {
    const cleaned = Array.isArray(childrenNames) ? childrenNames : [];
    return cleaned.length > 0 ? cleaned : [""];
}

function buildProfileDetailsPayload(form, businessProof) {
    const payload = {
        fatherName: trimText(form.fatherName),
        motherName: trimText(form.motherName),
        legalSpouseName: trimText(form.legalSpouseName),
        currentPartnerName: trimText(form.currentPartnerName),
        childrenNames: nonEmptyChildren(form.childrenNames),
        businessName: trimText(form.businessName),
        businessType: trimText(form.businessType),
        businessArea: trimText(form.businessArea),
        businessAddress: trimText(form.businessAddress),
        businessOwnerName: trimText(form.businessOwnerName),
        businessOwnerAddress: trimText(form.businessOwnerAddress),
        businessPermitNo: trimText(form.businessPermitNo),
        monthlyIncome: trimText(form.monthlyIncome),
        incomeStartYear: trimText(form.incomeStartYear),
        businessProof: normalizeBusinessProof(businessProof),
    };

    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            if (value && typeof value === "object") return true;
            return Boolean(value);
        }),
    );
}

function formFromProfile(profile) {
    const details = normalizeProfileDetails(profile?.profile_details);
    const childrenNames = withChildRow(details.childrenNames);

    return {
        date_of_birth: profile?.date_of_birth
            ? String(profile.date_of_birth).slice(0, 10)
            : "",
        civil_status: profile?.civil_status || CIVIL_STATUSES[0],
        contact_number: profile?.contact_number || "",
        house_number: profile?.house_number || "",
        purok_id: profile?.purok_id ? String(profile.purok_id) : "",
        street_id: profile?.street_id ? String(profile.street_id) : "",
        gender: profile?.gender || "",
        place_of_birth: profile?.place_of_birth || "",
        occupation: profile?.occupation || "",
        years_of_residency:
            profile?.years_of_residency !== null &&
            profile?.years_of_residency !== undefined
                ? String(profile.years_of_residency)
                : "",
        fatherName: details.fatherName,
        motherName: details.motherName,
        legalSpouseName: details.legalSpouseName,
        currentPartnerName: details.currentPartnerName,
        childrenNames,
        businessName: details.businessName,
        businessType: details.businessType,
        businessArea: details.businessArea,
        businessAddress: details.businessAddress,
        businessOwnerName: details.businessOwnerName,
        businessOwnerAddress: details.businessOwnerAddress,
        businessPermitNo: details.businessPermitNo,
        monthlyIncome: details.monthlyIncome,
        incomeStartYear: details.incomeStartYear,
        businessProof: details.businessProof,
    };
}

function hasBusinessInfo(details) {
    return Boolean(
        trimText(details.businessName) ||
            trimText(details.businessType) ||
            trimText(details.businessArea) ||
            trimText(details.businessAddress) ||
            trimText(details.businessOwnerName) ||
            trimText(details.businessOwnerAddress) ||
            trimText(details.businessPermitNo) ||
            details.businessProof,
    );
}

function hasWorkInfo(profile, details) {
    return Boolean(
        trimText(profile?.occupation) ||
            trimText(details.monthlyIncome) ||
            trimText(details.incomeStartYear),
    );
}

export default function ResidentProfile({ resident, onLogout }) {
    const [width, setWidth] = useState(window.innerWidth);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [puroks, setPuroks] = useState(PUROKS_FALLBACK);
    const [streets, setStreets] = useState(STREETS_FALLBACK);
    const [streetMappings, setStreetMappings] = useState(
        STREET_MAPPINGS_FALLBACK,
    );
    const [businessProofFile, setBusinessProofFile] = useState(null);
    const [form, setForm] = useState(formFromProfile(null));

    useEffect(() => {
        const fn = () => setWidth(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    useEffect(() => {
        fetch("/api/address-options")
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                const options = normalizeAddressOptions(data);
                setPuroks(options.puroks);
                setStreets(options.streets);
                setStreetMappings(options.streetMappings);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        let mounted = true;

        const applyProfile = (nextProfile) => {
            if (!mounted || !nextProfile) return;
            setProfile(nextProfile);
            setForm(formFromProfile(nextProfile));
            setBusinessProofFile(null);
        };

        const loadProfile = async ({ silent = false } = {}) => {
            if (!silent) setError("");
            try {
                const data = await residentProfileService.getProfile();
                applyProfile(data?.profile || data);
            } catch (err) {
                if (!mounted) return;
                if (
                    err?.response?.status === 401 ||
                    err?.response?.status === 403
                ) {
                    onLogout?.();
                    return;
                }
                if (!silent) {
                    setError(
                        err?.response?.data?.message ||
                            "Failed to load profile. Please refresh and try again.",
                    );
                }
            }
        };

        loadProfile();

        const intervalId = setInterval(() => {
            if (!document.hidden && !editing && !saving) {
                loadProfile({ silent: true });
            }
        }, 10000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [editing, onLogout, saving]);

    async function uploadBusinessProof(file) {
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user?.id) {
            throw new Error(
                "Please sign in again before uploading the proof of business.",
            );
        }

        const unique =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const path = [
            "resident-profile",
            user.id,
            `${Date.now()}-${safeFilePart("business-proof")}-${unique}.${fileExt(file.name)}`,
        ].join("/");

        const { error: uploadError } = await supabase.storage
            .from("certifast-uploads")
            .upload(path, file, {
                cacheControl: "3600",
                contentType: file.type || undefined,
                upsert: false,
            });

        if (uploadError) {
            const statusCode = String(uploadError.statusCode || "");
            const rawMessage = uploadError.message || "";
            const likelyMimeError =
                /mime|content.?type|not supported|unsupported|invalid.*type/i.test(
                    rawMessage,
                );
            const likelyPolicyError =
                statusCode === "403" ||
                /policy|permission|authorized|row-level security/i.test(
                    rawMessage,
                );

            if (likelyMimeError) {
                throw new Error(
                    `Could not upload the proof of business document. ${PROFILE_UPLOAD_MIME_HINT}`,
                );
            }

            throw new Error(
                likelyPolicyError
                    ? `Could not upload the proof of business document. ${PROFILE_UPLOAD_POLICY_HINT}`
                    : rawMessage
                      ? `Could not upload the proof of business document. ${rawMessage}`
                      : "Could not upload the proof of business document.",
            );
        }

        const { data: publicData } = supabase.storage
            .from("certifast-uploads")
            .getPublicUrl(path);

        return {
            fileName: file.name,
            filePath: path,
            fileUrl: publicData?.publicUrl || "",
            mimeType: file.type || "",
            fileSize: file.size || 0,
            uploadedAt: new Date().toISOString(),
        };
    }

    const streetOptions = buildStreetOptions(
        streets,
        streetMappings,
        form.purok_id,
    );

    async function handleSave() {
        if (!trimText(form.contact_number)) {
            setError("Contact number is required.");
            return;
        }
        if (!trimText(form.house_number)) {
            setError("House or unit number is required.");
            return;
        }
        if (!form.street_id) {
            setError("Please select your street.");
            return;
        }
        if (
            form.purok_id &&
            !isMappedPurokStreet(streetMappings, form.purok_id, form.street_id)
        ) {
            setError("Selected street is not assigned to the selected purok.");
            return;
        }
        if (
            trimText(form.years_of_residency) &&
            !/^\d+$/.test(trimText(form.years_of_residency))
        ) {
            setError("Years of residency must be a whole number.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            let businessProof = form.businessProof;
            if (businessProofFile) {
                businessProof = await uploadBusinessProof(businessProofFile);
            }

            const payload = {
                date_of_birth: form.date_of_birth || null,
                civil_status: form.civil_status || null,
                contact_number: trimText(form.contact_number),
                house_number: trimText(form.house_number) || null,
                purok_id: form.purok_id || null,
                street_id: form.street_id || null,
                street_other: null,
                gender: trimText(form.gender) || null,
                place_of_birth: trimText(form.place_of_birth) || null,
                occupation: trimText(form.occupation) || null,
                years_of_residency: trimText(form.years_of_residency) || null,
                profile_details: buildProfileDetailsPayload(form, businessProof),
            };

            const data = await residentProfileService.updateProfile(payload);
            const updatedProfile = data?.profile || data;
            setProfile(updatedProfile);
            setForm(formFromProfile(updatedProfile));
            setBusinessProofFile(null);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save. Please try again.",
            );
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setEditing(false);
        setError("");
        setBusinessProofFile(null);
        if (profile) setForm(formFromProfile(profile));
    }

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function handlePurokChange(value) {
        setError("");
        setForm((current) => ({
            ...current,
            purok_id: value,
            street_id:
                !value ||
                isStreetAllowedForPurok(streetMappings, value, current.street_id)
                    ? current.street_id
                    : "",
        }));
    }

    function handleStreetChange(value) {
        const inferredPurokId = findSingleMappedPurok(streetMappings, value);
        setError("");
        setForm((current) => ({
            ...current,
            street_id: value,
            purok_id:
                current.purok_id &&
                isStreetAllowedForPurok(streetMappings, current.purok_id, value)
                    ? current.purok_id
                    : inferredPurokId || "",
        }));
    }

    function updateChild(index, value) {
        setForm((current) => ({
            ...current,
            childrenNames: current.childrenNames.map((child, childIndex) =>
                childIndex === index ? value : child,
            ),
        }));
    }

    function addChildRow() {
        setForm((current) => ({
            ...current,
            childrenNames: [...current.childrenNames, ""],
        }));
    }

    function removeChildRow(index) {
        setForm((current) => {
            const next = current.childrenNames.filter(
                (_, childIndex) => childIndex !== index,
            );
            return {
                ...current,
                childrenNames: next.length > 0 ? next : [""],
            };
        });
    }

    function handleBusinessProofSelect(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const validationError = validateBusinessProofFile(file);
        if (validationError) {
            setError(validationError);
            event.target.value = "";
            return;
        }

        setError("");
        setBusinessProofFile(file);
    }

    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const name =
        profile?.full_name || resident?.full_name || resident?.name || "Resident";
    const initials = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const profileDetails = normalizeProfileDetails(profile?.profile_details);
    const age = calcAge(editing ? form.date_of_birth : profile?.date_of_birth);
    const displayChildren = profileDetails.childrenNames;
    const displayBusinessProof = profileDetails.businessProof;
    const displayHasWorkInfo = hasWorkInfo(profile, profileDetails);
    const displayHasBusinessInfo = hasBusinessInfo(profileDetails);
    const showWorkSection =
        editing || displayHasWorkInfo || !displayHasBusinessInfo;
    const showBusinessSection = editing || displayHasBusinessInfo;
    const displayAddress = profile
        ? (() => {
              const parts = [];
              if (profile.house_number) parts.push(profile.house_number);
              if (profile.purok_name) parts.push(profile.purok_name);
              else if (profile.purok_id) {
                  const purok = puroks.find(
                      (item) =>
                          String(item.purok_id) === String(profile.purok_id),
                  );
                  if (purok) parts.push(purok.name);
              }
              const street = profile.street_other
                  ? profile.street_other
                  : profile.street_name ||
                    (() => {
                        const match = streets.find(
                            (item) =>
                                String(item.street_id) ===
                                String(profile.street_id),
                        );
                        return match?.name || "";
                    })();
              if (street) parts.push(street);
              return formatAddressParts(
                  parts,
                  profile.address_barangay,
                  "Barangay East Tapinac",
                  profile.address_city,
                  "Olongapo City",
                  profile.address_province,
              );
          })()
        : "-";

    const inputProps = { className: "rp-input" };
    const twoColumnGrid = {
        gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
        padding: 0,
    };

    const fullRow = {
        gridColumn: isMobile ? "1" : "1 / -1",
    };

    const renderProfileField = ({
        label,
        field,
        displayValue,
        placeholder = "",
        multiline = false,
        full = false,
    }) => (
        <div style={full ? fullRow : undefined}>
            <label className="rp-field-label">{label}</label>
            {editing ? (
                multiline ? (
                    <textarea
                        className="rp-textarea"
                        placeholder={placeholder}
                        value={form[field] || ""}
                        onChange={(event) =>
                            updateField(field, event.target.value)
                        }
                    />
                ) : (
                    <input
                        {...inputProps}
                        placeholder={placeholder}
                        value={form[field] || ""}
                        onChange={(event) =>
                            updateField(field, event.target.value)
                        }
                    />
                )
            ) : (
                <div className="rp-field-value">{displayValue || "-"}</div>
            )}
        </div>
    );

    return (
        <div
            className="rh-root"
            style={{ display: "flex", minHeight: "100vh" }}
        >
            {!isMobile && (
                <ResidentSidebar
                    active="profile"
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
                <style>{`
                .rp-input,
                .rp-select,
                .rp-textarea {
                    width:100%;
                    padding:9px 12px;
                    border:1.5px solid #e4dfd4;
                    border-radius:5px;
                    font-family:'Source Serif 4',serif;
                    font-size:13px;
                    background:#fff;
                    outline:none;
                    color:#1a1a2e;
                    box-sizing:border-box;
                    transition:border-color .15s;
                }
                .rp-input:focus,
                .rp-select:focus,
                .rp-textarea:focus { border-color:var(--color-primary, #0e2554); }
                .rp-select {
                    cursor:pointer;
                    appearance:none;
                    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239090aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat:no-repeat;
                    background-position:right 12px center;
                    padding-right:34px;
                }
                .rp-textarea {
                    min-height:92px;
                    resize:vertical;
                }
                .rp-field-label {
                    font-size:10px;
                    font-weight:700;
                    color:#9090aa;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    margin-bottom:5px;
                    display:block;
                }
                .rp-field-value {
                    font-size:13px;
                    color:#1a1a2e;
                    font-weight:600;
                    line-height:1.5;
                }
                .rp-readonly {
                    font-size:13px;
                    color:#1a1a2e;
                    font-weight:600;
                    padding:9px 12px;
                    background:#f8f6f1;
                    border:1.5px solid #e4dfd4;
                    border-radius:5px;
                }
                .rp-muted {
                    font-size:11px;
                    color:#9090aa;
                    line-height:1.5;
                }
                .rp-card {
                    background:#fff;
                    border:1px solid #e4dfd4;
                    border-radius:8px;
                    overflow:hidden;
                    margin-bottom:14px;
                }
                .rp-card-head {
                    padding:13px 20px;
                    background:#f8f6f1;
                    border-bottom:1px solid #e4dfd4;
                    display:flex;
                    align-items:center;
                    gap:8px;
                }
                .rp-card-grid {
                    padding:20px 24px;
                    display:grid;
                    gap:18px 32px;
                }
                .rp-upload-btn {
                    display:inline-flex;
                    align-items:center;
                    gap:8px;
                    padding:10px 14px;
                    background:#fff;
                    border:1.5px solid #d8d0bd;
                    border-radius:5px;
                    color:var(--color-primary, #0e2554);
                    font-size:12.5px;
                    font-weight:600;
                    cursor:pointer;
                }
                .rp-upload-btn:hover { border-color:var(--color-primary, #0e2554); }
                .rp-inline-action {
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                    padding:8px 12px;
                    background:#fff;
                    border:1.5px solid #e4dfd4;
                    border-radius:5px;
                    color:#4a4a6a;
                    font-family:'Source Serif 4',serif;
                    font-size:12px;
                    font-weight:600;
                    cursor:pointer;
                }
                .rp-inline-action:hover { border-color:var(--color-primary, #0e2554); color:var(--color-primary, #0e2554); }
                .rp-link {
                    color:var(--color-primary, #0e2554);
                    text-decoration:none;
                    font-weight:600;
                }
                .rp-link:hover { text-decoration:underline; }
                `}</style>

                <ResidentTopbar
                    resident={resident}
                    onLogout={onLogout}
                    isMobile={isMobile}
                />

                <div
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: isMobile
                            ? "16px 14px 80px"
                            : isTablet
                              ? "20px 18px 30px"
                              : "28px 24px 40px",
                    }}
                >
                    <div
                        className="rh-fadein"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 22,
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: isMobile ? 20 : 22,
                                    fontWeight: 700,
                                    color: "var(--color-primary, #0e2554)",
                                    margin: "0 0 3px",
                                }}
                            >
                                My Profile
                            </h1>
                            <p
                                style={{
                                    fontSize: 12.5,
                                    color: "#9090aa",
                                    margin: 0,
                                }}
                            >
                                Keep your resident record ready for certificate
                                requests.
                            </p>
                        </div>

                        {!editing && profile && (
                            <button
                                onClick={() => setEditing(true)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "9px 18px",
                                    background: "#fff",
                                    border: "1.5px solid #e4dfd4",
                                    borderRadius: 4,
                                    color: "var(--color-primary, #0e2554)",
                                    fontFamily: "'Source Serif 4',serif",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                <Edit3 size={13} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {saved && (
                        <div
                            style={{
                                background: "#e8f5ee",
                                border: "1px solid #a8d8bc",
                                borderRadius: 6,
                                padding: "11px 14px",
                                color: "#1a7a4a",
                                fontSize: 13,
                                marginBottom: 16,
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <Check size={14} /> Profile updated successfully.
                        </div>
                    )}

                    {error && (
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
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}

                    {!profile && (
                        <div
                            style={{
                                background: "#fff",
                                border: "1px solid #e4dfd4",
                                borderRadius: 8,
                                padding: "32px 24px",
                            }}
                        >
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        marginBottom: 20,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 80,
                                            height: 10,
                                            background: "#f0ece4",
                                            borderRadius: 4,
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: "60%",
                                            height: 10,
                                            background: "#f5f2ee",
                                            borderRadius: 4,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {profile && (
                        <>
                            <div
                                className="rh-fadein"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--color-primary, #0e2554), var(--color-primary-soft, #163066))",
                                    borderRadius: 8,
                                    padding: "20px 24px",
                                    marginBottom: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 18,
                                }}
                            >
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "50%",
                                        background: "rgba(var(--color-accent-rgb, 201, 162, 39),0.15)",
                                        border: "2px solid rgba(var(--color-accent-rgb, 201, 162, 39),0.5)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: "var(--color-accent, #c9a227)",
                                        flexShrink: 0,
                                    }}
                                >
                                    {initials}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: isMobile ? 17 : 20,
                                            fontWeight: 700,
                                            color: "#fff",
                                        }}
                                    >
                                        {profile.full_name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "rgba(255,255,255,0.55)",
                                            marginTop: 3,
                                        }}
                                    >
                                        {profile.resident_id
                                            ? `RES-${String(profile.resident_id).padStart(4, "0")}`
                                            : "-"}{" "}
                                        | Registered {fmtDate(profile.created_at)}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "3px 10px",
                                        borderRadius: 20,
                                        background:
                                            profile.status === "active"
                                                ? "#e8f5ee"
                                                : "#f0ece4",
                                        color:
                                            profile.status === "active"
                                                ? "#1a7a4a"
                                                : "#9090aa",
                                        flexShrink: 0,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {profile.status}
                                </span>
                            </div>

                            <div className="rp-card rh-fadein">
                                <div className="rp-card-head">
                                    <User size={13} color="var(--color-primary, #0e2554)" />
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--color-primary, #0e2554)",
                                        }}
                                    >
                                        Identity and Residency
                                    </span>
                                </div>

                                <div
                                    className="rp-card-grid"
                                    style={{
                                        gridTemplateColumns: isMobile
                                            ? "1fr"
                                            : isTablet
                                              ? "1fr"
                                              : "1fr 1fr",
                                    }}
                                >
                                    <div>
                                        <label className="rp-field-label">
                                            Full Name
                                        </label>
                                        {editing ? (
                                            <div className="rp-readonly">
                                                {profile.full_name}
                                            </div>
                                        ) : (
                                            <div className="rp-field-value">
                                                {profile.full_name}
                                            </div>
                                        )}
                                        {editing && (
                                            <div
                                                style={{
                                                    fontSize: 10.5,
                                                    color: "#9090aa",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Name cannot be changed after
                                                registration.
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Resident ID
                                        </label>
                                        <div
                                            className={
                                                editing
                                                    ? "rp-readonly"
                                                    : "rp-field-value"
                                            }
                                            style={{
                                                fontFamily:
                                                    "'Courier New', monospace",
                                            }}
                                        >
                                            {profile.resident_id
                                                ? `RES-${String(profile.resident_id).padStart(4, "0")}`
                                                : "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Date of Birth
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                type="date"
                                                value={form.date_of_birth}
                                                onChange={(event) =>
                                                    updateField(
                                                        "date_of_birth",
                                                        event.target.value,
                                                    )
                                                }
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {fmtDate(profile.date_of_birth)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Age
                                        </label>
                                        <div
                                            className={
                                                editing
                                                    ? "rp-readonly"
                                                    : "rp-field-value"
                                            }
                                        >
                                            {age !== null
                                                ? `${age} years old`
                                                : "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Gender
                                        </label>
                                        {editing ? (
                                            <select
                                                className="rp-select"
                                                value={form.gender}
                                                onChange={(event) =>
                                                    updateField(
                                                        "gender",
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select...
                                                </option>
                                                {GENDER_OPTIONS.map((option) => (
                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="rp-field-value">
                                                {profile.gender || "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Civil Status
                                        </label>
                                        {editing ? (
                                            <select
                                                className="rp-select"
                                                value={form.civil_status}
                                                onChange={(event) =>
                                                    updateField(
                                                        "civil_status",
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {CIVIL_STATUSES.map((option) => (
                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="rp-field-value">
                                                {profile.civil_status || "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Place of Birth
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                placeholder="City or municipality"
                                                value={form.place_of_birth}
                                                onChange={(event) =>
                                                    updateField(
                                                        "place_of_birth",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profile.place_of_birth || "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Nationality
                                        </label>
                                        <div
                                            className={
                                                editing
                                                    ? "rp-readonly"
                                                    : "rp-field-value"
                                            }
                                        >
                                            {profile.nationality || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Years of Residency
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                inputMode="numeric"
                                                placeholder="e.g. 12"
                                                value={form.years_of_residency}
                                                onChange={(event) =>
                                                    updateField(
                                                        "years_of_residency",
                                                        event.target.value
                                                            .replace(
                                                                /[^0-9]/g,
                                                                "",
                                                            )
                                                            .slice(0, 3),
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profile.years_of_residency ??
                                                    "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            gridColumn: isMobile
                                                ? "1"
                                                : "1 / -1",
                                        }}
                                    >
                                        <label className="rp-field-label">
                                            Address{" "}
                                            <span style={{ color: "#b02020" }}>
                                                *
                                            </span>
                                        </label>

                                        {editing ? (
                                            <div
                                                style={{
                                                    background: "#f8f6f1",
                                                    border: "1px solid #e4dfd4",
                                                    borderRadius: 7,
                                                    padding: "14px 16px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns:
                                                            isMobile
                                                                ? "1fr"
                                                                : "1fr 1fr 1fr",
                                                        gap: 10,
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <div>
                                                        <label className="rp-field-label">
                                                            House / Unit No.{" "}
                                                            <span
                                                                style={{
                                                                    color: "#b02020",
                                                                }}
                                                            >
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            {...inputProps}
                                                            placeholder="e.g. 12-B"
                                                            value={
                                                                form.house_number
                                                            }
                                                            onChange={(event) =>
                                                                updateField(
                                                                    "house_number",
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="rp-field-label">
                                                            Purok
                                                        </label>
                                                        <select
                                                            className="rp-select"
                                                            value={form.purok_id}
                                                            onChange={(event) =>
                                                                handlePurokChange(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Select...
                                                            </option>
                                                            {puroks.map(
                                                                (item) => (
                                                                    <option
                                                                        key={
                                                                            item.purok_id
                                                                        }
                                                                        value={
                                                                            item.purok_id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="rp-field-label">
                                                            Street{" "}
                                                            <span
                                                                style={{
                                                                    color: "#b02020",
                                                                }}
                                                            >
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className="rp-select"
                                                            value={form.street_id}
                                                            onChange={(event) =>
                                                                handleStreetChange(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Select
                                                                street...
                                                            </option>
                                                            {streetOptions.map(
                                                                (option) => (
                                                                    <option
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                            {!streetOptions.length && (
                                                                <option
                                                                    value=""
                                                                    disabled
                                                                >
                                                                    No streets
                                                                    mapped
                                                                </option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns:
                                                            isMobile
                                                                ? "1fr"
                                                                : "1fr 1fr",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <div>
                                                        <label className="rp-field-label">
                                                            Barangay
                                                        </label>
                                                        <div className="rp-readonly">
                                                            East Tapinac
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="rp-field-label">
                                                            City
                                                        </label>
                                                        <div className="rp-readonly">
                                                            Olongapo City
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="rp-field-value">
                                                    {displayAddress}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#9090aa",
                                                        marginTop: 3,
                                                    }}
                                                >
                                                    Barangay East Tapinac,
                                                    Olongapo City
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Contact Number{" "}
                                            <span style={{ color: "#b02020" }}>
                                                *
                                            </span>
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                type="tel"
                                                placeholder="09XXXXXXXXX"
                                                maxLength={11}
                                                value={form.contact_number}
                                                onChange={(event) =>
                                                    updateField(
                                                        "contact_number",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profile.contact_number || "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Email Address
                                        </label>
                                        <div
                                            className={
                                                editing
                                                    ? "rp-readonly"
                                                    : "rp-field-value"
                                            }
                                        >
                                            {profile.email}
                                        </div>
                                        {editing && (
                                            <div
                                                style={{
                                                    fontSize: 10.5,
                                                    color: "#9090aa",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Email cannot be changed after
                                                registration.
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Date Registered
                                        </label>
                                        <div
                                            className={
                                                editing
                                                    ? "rp-readonly"
                                                    : "rp-field-value"
                                            }
                                        >
                                            {fmtDate(profile.created_at)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Account Status
                                        </label>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: "3px 10px",
                                                borderRadius: 20,
                                                textTransform: "uppercase",
                                                background:
                                                    profile.status === "active"
                                                        ? "#e8f5ee"
                                                        : "#f0ece4",
                                                color:
                                                    profile.status === "active"
                                                        ? "#1a7a4a"
                                                        : "#9090aa",
                                            }}
                                        >
                                            {profile.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rp-card rh-fadein">
                                <div className="rp-card-head">
                                    <Users size={13} color="var(--color-primary, #0e2554)" />
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--color-primary, #0e2554)",
                                        }}
                                    >
                                        Family Details
                                    </span>
                                </div>

                                <div
                                    className="rp-card-grid"
                                    style={{
                                        gridTemplateColumns: isMobile
                                            ? "1fr"
                                            : isTablet
                                              ? "1fr"
                                              : "1fr 1fr",
                                    }}
                                >
                                    <div>
                                        <label className="rp-field-label">
                                            Father's Full Name
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                value={form.fatherName}
                                                onChange={(event) =>
                                                    updateField(
                                                        "fatherName",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profileDetails.fatherName || "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Mother's Full Name
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                value={form.motherName}
                                                onChange={(event) =>
                                                    updateField(
                                                        "motherName",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profileDetails.motherName || "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Wife / Husband Name
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                value={form.legalSpouseName}
                                                onChange={(event) =>
                                                    updateField(
                                                        "legalSpouseName",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profileDetails.legalSpouseName ||
                                                    "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="rp-field-label">
                                            Current / Common-Law Partner
                                        </label>
                                        {editing ? (
                                            <input
                                                {...inputProps}
                                                value={form.currentPartnerName}
                                                onChange={(event) =>
                                                    updateField(
                                                        "currentPartnerName",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rp-field-value">
                                                {profileDetails.currentPartnerName ||
                                                    "-"}
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            gridColumn: isMobile
                                                ? "1"
                                                : "1 / -1",
                                        }}
                                    >
                                        <label className="rp-field-label">
                                            Children Names
                                        </label>

                                        {editing ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 10,
                                                }}
                                            >
                                                {form.childrenNames.map(
                                                    (childName, index) => (
                                                        <div
                                                            key={`child-${index}`}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns:
                                                                    isMobile
                                                                        ? "1fr auto"
                                                                        : "minmax(0, 1fr) auto",
                                                                gap: 10,
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <input
                                                                {...inputProps}
                                                                placeholder={`Child ${index + 1}`}
                                                                value={childName}
                                                                onChange={(event) =>
                                                                    updateChild(
                                                                        index,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                type="button"
                                                                className="rp-inline-action"
                                                                onClick={() =>
                                                                    removeChildRow(
                                                                        index,
                                                                    )
                                                                }
                                                                aria-label={`Remove child ${index + 1}`}
                                                            >
                                                                <Trash2
                                                                    size={13}
                                                                />
                                                                {!isMobile &&
                                                                    "Remove"}
                                                            </button>
                                                        </div>
                                                    ),
                                                )}

                                                <div>
                                                    <button
                                                        type="button"
                                                        className="rp-inline-action"
                                                        onClick={addChildRow}
                                                    >
                                                        <Plus size={13} /> Add
                                                        Child
                                                    </button>
                                                </div>
                                            </div>
                                        ) : displayChildren.length > 0 ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 6,
                                                }}
                                            >
                                                {displayChildren.map((child) => (
                                                    <div
                                                        key={child}
                                                        className="rp-field-value"
                                                    >
                                                        {child}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rp-field-value">
                                                -
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rp-card rh-fadein">
                                <div className="rp-card-head">
                                    <Briefcase size={13} color="var(--color-primary, #0e2554)" />
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--color-primary, #0e2554)",
                                        }}
                                    >
                                        Work and Business
                                    </span>
                                </div>

                                <div
                                    style={{
                                        padding: "20px 24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 22,
                                    }}
                                >
                                    {showWorkSection && (
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    marginBottom: 14,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: "#9090aa",
                                                        letterSpacing: 1,
                                                        textTransform:
                                                            "uppercase",
                                                    }}
                                                >
                                                    Employment / Income
                                                </span>
                                            </div>

                                            {editing || displayHasWorkInfo ? (
                                                <div
                                                    className="rp-card-grid"
                                                    style={twoColumnGrid}
                                                >
                                                    {renderProfileField({
                                                        label:
                                                            "Occupation / Role",
                                                        field: "occupation",
                                                        displayValue:
                                                            profile?.occupation,
                                                    })}
                                                    {renderProfileField({
                                                        label:
                                                            "Monthly Income",
                                                        field: "monthlyIncome",
                                                        placeholder:
                                                            "e.g. PHP 12,000",
                                                        displayValue:
                                                            profileDetails.monthlyIncome,
                                                    })}
                                                    {renderProfileField({
                                                        label:
                                                            "Income Start Year",
                                                        field:
                                                            "incomeStartYear",
                                                        placeholder:
                                                            "e.g. 2021",
                                                        displayValue:
                                                            profileDetails.incomeStartYear,
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="rp-muted">
                                                    No work details on file.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {showBusinessSection && (
                                        <div
                                            style={{
                                                borderTop: showWorkSection
                                                    ? "1px solid #f0ece4"
                                                    : "none",
                                                paddingTop: showWorkSection
                                                    ? 20
                                                    : 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    marginBottom: 14,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: "#9090aa",
                                                        letterSpacing: 1,
                                                        textTransform:
                                                            "uppercase",
                                                    }}
                                                >
                                                    Business Details
                                                </span>
                                                {editing && (
                                                    <span
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#7a6530",
                                                            background:
                                                                "#fff7e6",
                                                            border:
                                                                "1px solid #eadfc9",
                                                            borderRadius: 999,
                                                            padding: "2px 8px",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        If applicable
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className="rp-card-grid"
                                                style={twoColumnGrid}
                                            >
                                                {renderProfileField({
                                                    label:
                                                        "Business / Trade Name",
                                                    field: "businessName",
                                                    displayValue:
                                                        profileDetails.businessName,
                                                })}
                                                {renderProfileField({
                                                    label: "Type of Business",
                                                    field: "businessType",
                                                    displayValue:
                                                        profileDetails.businessType,
                                                })}
                                                {renderProfileField({
                                                    label: "Coverage / Area",
                                                    field: "businessArea",
                                                    displayValue:
                                                        profileDetails.businessArea,
                                                })}
                                                {renderProfileField({
                                                    label: "Barangay Permit No.",
                                                    field: "businessPermitNo",
                                                    displayValue:
                                                        profileDetails.businessPermitNo,
                                                })}
                                                {renderProfileField({
                                                    label:
                                                        "Business Owner Name",
                                                    field: "businessOwnerName",
                                                    placeholder:
                                                        "Leave blank if same as your name",
                                                    displayValue:
                                                        profileDetails.businessOwnerName ||
                                                        (displayHasBusinessInfo
                                                            ? "Same as resident"
                                                            : ""),
                                                })}
                                                {renderProfileField({
                                                    label: "Business Address",
                                                    field: "businessAddress",
                                                    displayValue:
                                                        profileDetails.businessAddress,
                                                    multiline: true,
                                                    full: true,
                                                })}
                                                {renderProfileField({
                                                    label:
                                                        "Owner / Operator Address",
                                                    field:
                                                        "businessOwnerAddress",
                                                    displayValue:
                                                        profileDetails.businessOwnerAddress,
                                                    multiline: true,
                                                    full: true,
                                                })}

                                                <div style={fullRow}>
                                                    <label className="rp-field-label">
                                                        Proof of Business
                                                    </label>

                                                    {editing ? (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                gap: 10,
                                                                alignItems:
                                                                    "flex-start",
                                                            }}
                                                        >
                                                            {form.businessProof
                                                                ?.fileUrl ? (
                                                                <a
                                                                    className="rp-link"
                                                                    href={
                                                                        form
                                                                            .businessProof
                                                                            .fileUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    View current
                                                                    file:{" "}
                                                                    {form
                                                                        .businessProof
                                                                        .fileName ||
                                                                        "Business document"}
                                                                </a>
                                                            ) : (
                                                                <div className="rp-muted">
                                                                    No proof
                                                                    file
                                                                    uploaded
                                                                    yet.
                                                                </div>
                                                            )}

                                                            <label className="rp-upload-btn">
                                                                <FileUp
                                                                    size={14}
                                                                />
                                                                {businessProofFile
                                                                    ? "Replace selected file"
                                                                    : "Upload proof file"}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*,.pdf"
                                                                    style={{
                                                                        display:
                                                                            "none",
                                                                    }}
                                                                    onChange={
                                                                        handleBusinessProofSelect
                                                                    }
                                                                />
                                                            </label>

                                                            {businessProofFile && (
                                                                <div className="rp-muted">
                                                                    Selected:{" "}
                                                                    {
                                                                        businessProofFile.name
                                                                    }{" "}
                                                                    (
                                                                    {formatFileSize(
                                                                        businessProofFile.size,
                                                                    )}
                                                                    )
                                                                </div>
                                                            )}

                                                            <div className="rp-muted">
                                                                Accepts image or
                                                                PDF files up to 6
                                                                MB.
                                                            </div>
                                                        </div>
                                                    ) : displayBusinessProof?.fileUrl ? (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <a
                                                                className="rp-link"
                                                                href={
                                                                    displayBusinessProof.fileUrl
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {displayBusinessProof.fileName ||
                                                                    "Business document"}
                                                            </a>
                                                            <div className="rp-muted">
                                                                {displayBusinessProof.fileSize
                                                                    ? formatFileSize(
                                                                          displayBusinessProof.fileSize,
                                                                      )
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="rp-field-value">
                                                            -
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!editing &&
                                        !displayHasWorkInfo &&
                                        !displayHasBusinessInfo && (
                                            <div className="rp-muted">
                                                No work or business details on
                                                file.
                                            </div>
                                        )}
                                </div>
                            </div>

                            {editing && (
                                <div
                                    className="rh-fadein"
                                    style={{
                                        padding: "14px 18px",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 8,
                                        background: "#f8f6f1",
                                        display: "flex",
                                        gap: 10,
                                        justifyContent: "flex-end",
                                        flexWrap: "wrap",
                                        marginBottom: 14,
                                    }}
                                >
                                    <button
                                        onClick={handleCancel}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "9px 18px",
                                            background: "#fff",
                                            border: "1.5px solid #e4dfd4",
                                            borderRadius: 4,
                                            color: "#4a4a6a",
                                            fontFamily:
                                                "'Source Serif 4',serif",
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <X size={13} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 7,
                                            padding: "9px 22px",
                                            background:
                                                "linear-gradient(135deg, var(--color-primary-soft, #163066), var(--color-primary-dark, #091a3e))",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 4,
                                            fontFamily:
                                                "'Playfair Display',serif",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            cursor: saving
                                                ? "default"
                                                : "pointer",
                                            opacity: saving ? 0.7 : 1,
                                        }}
                                    >
                                        {saving ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Check size={13} /> Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div
                                className="rh-fadein"
                                style={{
                                    background: "#f5edce",
                                    border: "1px solid #e0d4a8",
                                    borderRadius: 8,
                                    padding: "12px 16px",
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                }}
                            >
                                <AlertCircle
                                    size={13}
                                    color="var(--color-accent-dark, #9a7515)"
                                    style={{ flexShrink: 0, marginTop: 1 }}
                                />
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "#7a6530",
                                        lineHeight: 1.65,
                                    }}
                                >
                                    Name, email, and resident ID cannot be
                                    changed here. Contact the barangay office
                                    for account corrections.
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
