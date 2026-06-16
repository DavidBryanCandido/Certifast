// =============================================================
// FILE: client/src/pages/resident/SubmitRequest.jsx
// =============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Home,
    Plus,
    Search,
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
    UploadCloud,
} from "lucide-react";
import residentProfileService from "../../services/residentProfileService";
import requestService from "../../services/requestService";
import { supabase } from "../../supabaseClient";
import ResidentBottomNav from "../../components/ResidentBottomNav";
import ResidentSidebar from "../../components/ResidentSidebar";
import ResidentTopbar from "../../components/ResidentTopbar";
import {
    DEFAULT_PUBLIC_BRANDING,
    getPublicBrandingSettings,
} from "../../services/publicBrandingService";
import {
    CERTIFICATE_TEMPLATE_OPTIONS,
    getTemplateFieldLabels,
    getTemplateProofRequirements,
} from "../../utils/certificateTemplateEngine";

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
const CERT_ICONS = {
    "Barangay Clearance": Shield,
    "Certificate of Residency": Home,
    "Certificate of Indigency": Heart,
    "Business Permit": Briefcase,
    "Good Moral Certificate": BadgeCheck,
    "Certificate of Live Birth (Endorsement)": Baby,
    "Certificate of Cohabitation": Users,
    "Certificate of No Business": Building2,
    "Certificate of Guardianship": ClipboardList,
    "Barangay Business Clearance (Renewal)": FileCheck,
};

function withIcon(cert) {
    return {
        ...cert,
        icon: CERT_ICONS[cert.name] || FileText,
    };
}

const ALL_CERTS = CERTIFICATE_TEMPLATE_OPTIONS.map(withIcon);
const CERTS_PER_PAGE_DESKTOP = 8;
const CERTS_PER_PAGE_MOBILE = 5;

function certIdentity(cert) {
    return cert?.templateKey || cert?.templateId || cert?.name || "";
}

function normalizeTemplateField(field, templateKey, name) {
    const fieldConfig =
        typeof field === "object" && field !== null ? field : {};
    const key =
        typeof field === "string" ? field : fieldConfig.key || fieldConfig.name || "";

    if (!key) return null;

    const meta = getTemplateFieldLabels(templateKey, name).find(
        (item) => item.key === key,
    );
    const override = getTemplateFieldOverride(templateKey, name, key);

    return {
        key,
        label: fieldConfig.label || override?.label || meta?.label || humanizeFieldKey(key),
        placeholder: fieldConfig.placeholder ?? override?.placeholder ?? "",
        required: fieldConfig.required ?? override?.required ?? meta?.required ?? true,
        type:
            fieldConfig.type ||
            override?.type ||
            meta?.type ||
            (key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("dob")
                ? "date"
                : "text"),
        defaultValue:
            fieldConfig.defaultValue ?? override?.defaultValue ?? meta?.defaultValue,
        adminOnly: Boolean(
            fieldConfig.adminOnly ?? override?.adminOnly ?? meta?.adminOnly,
        ),
    };
}

const OBSOLETE_PROOF_KEYS = new Set(["valid_id", "address_proof"]);

function normalizeProofRequirements(raw) {
    let list = raw;
    if (typeof raw === "string") {
        try {
            list = JSON.parse(raw);
        } catch {
            list = [];
        }
    }

    if (!Array.isArray(list)) return [];

    return list
        .filter(Boolean)
        .filter((proof) => !OBSOLETE_PROOF_KEYS.has(String(proof.key || "")))
        .map((proof) => ({
            ...proof,
            required: proof.required !== false,
            accept: proof.accept || "image/*,.pdf",
        }));
}

function normalizeFeeAmount(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed =
        typeof value === "number"
            ? value
            : Number.parseFloat(String(value).replace(/,/g, "").trim());
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed * 100) / 100;
}

function formatPesoAmount(value) {
    const amount = normalizeFeeAmount(value);
    if (amount === null) return "";
    return `PHP ${amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function feePaymentText(cert) {
    if (!cert?.hasFee) return "";
    const amount = formatPesoAmount(cert.feeAmount);
    return amount ? `Fee payment: ${amount}` : "Fee payment";
}

const DEFAULT_ONLINE_WAIT = "Online review: 1-3 business days.";

const DEFAULT_RESIDENT_GUIDANCE = {
    title: "Barangay Certificate Request",
    waiting: DEFAULT_ONLINE_WAIT,
    review:
        "Barangay staff reviews your resident profile, purpose, and submitted requirements before preparing the certificate.",
    release:
        "Claim the certificate in person. Staff may ask to see your original ID or supporting document before release.",
    bring: ["Valid government-issued ID", "Request ID / reference number"],
};

const REQUEST_SUBJECT_SELF = "self";
const REQUEST_SUBJECT_MINOR = "minor";
const EMPTY_MINOR_DETAILS = {
    fullName: "",
    dateOfBirth: "",
    relationship: "",
};
const MINOR_PROOF_REQUIREMENT = {
    key: "minor_guardianship_document",
    label: "Minor birth record, guardianship proof, or authorization document",
    required: true,
    accept: "image/*,.pdf",
};

function calculateAge(dateString) {
    if (!dateString) return null;
    const birth = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age -= 1;
    }
    return age;
}

function mergeProofRequirements(base = [], additional = []) {
    const seen = new Set();
    return [...base, ...additional].filter((proof) => {
        const key = String(proof?.key || proof?.label || "").toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getCharterGuidance(cert) {
    if (!cert) return null;
    return normalizeResidentGuidance(cert.residentGuidance, cert);
}

function uniqueList(items = []) {
    const seen = new Set();
    return items.filter((item) => {
        const text = String(item || "").trim();
        const key = text.toLowerCase();
        if (!text || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function parseJsonObject(value) {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed)
                ? parsed
                : {};
        } catch {
            return {};
        }
    }
    return {};
}

function normalizeStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => String(item || "").trim())
        .filter(Boolean);
}

function normalizeProcessSteps(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((step, index) => {
            if (!step || typeof step !== "object") return null;
            return {
                n: String(step.n || index + 1),
                title: String(step.title || "").trim(),
                desc: String(step.desc || step.description || "").trim(),
            };
        })
        .filter((step) => step?.title && step?.desc);
}

function normalizeResidentGuidance(raw, cert) {
    const guidance = parseJsonObject(raw);
    const steps = normalizeProcessSteps(
        guidance.processSteps || guidance.process_steps,
    );
    return {
        title:
            String(guidance.title || "").trim() ||
            cert?.name ||
            DEFAULT_RESIDENT_GUIDANCE.title,
        waiting:
            String(guidance.waiting || guidance.waitingTime || "").trim() ||
            DEFAULT_RESIDENT_GUIDANCE.waiting,
        review:
            String(guidance.review || "").trim() ||
            DEFAULT_RESIDENT_GUIDANCE.review,
        release:
            String(guidance.release || "").trim() ||
            DEFAULT_RESIDENT_GUIDANCE.release,
        bring:
            normalizeStringArray(guidance.bring || guidance.whatToBring)
                .length > 0
                ? normalizeStringArray(guidance.bring || guidance.whatToBring)
                : DEFAULT_RESIDENT_GUIDANCE.bring,
        processSteps: steps,
    };
}

function getWhatToBringItems(cert, proofRequirements = []) {
    const guidance = getCharterGuidance(cert);
    const uploadedDocumentItems = proofRequirements.map(
        (proof) => `Original/copy of uploaded ${proof.label}`,
    );
    return uniqueList([
        "Your CertiFast QR card (printed or on your phone)",
        ...(guidance?.bring || [
            "Valid government-issued ID",
            "Request ID / reference number",
        ]),
        ...uploadedDocumentItems,
        feePaymentText(cert),
    ]);
}

function getProcessSteps(guidance) {
    const data = guidance || DEFAULT_RESIDENT_GUIDANCE;
    if (data.processSteps?.length) return data.processSteps;
    return [
        {
            n: "1",
            title: "Submit Online",
            desc: "Complete the form and upload the required supporting document, if the certificate asks for one.",
        },
        {
            n: "2",
            title: "Barangay Review",
            desc: data.review,
        },
        {
            n: "3",
            title: "Claim In Person",
            desc: data.release,
        },
    ];
}

function normalizeTemplateRows(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return ALL_CERTS;

    return rows.map((row) => {
        const name = row.name || "Certificate Request";
        const templateKey = row.templateKey || row.template_key || "";
        const rawFields = row.fields || row.required_fields || [];
        const fieldConfigs = Array.isArray(rawFields)
            ? rawFields
                  .map((field) => normalizeTemplateField(field, templateKey, name))
                  .filter(Boolean)
            : [];

        return withIcon({
            name,
            templateId: row.templateId || row.template_id || null,
            templateKey,
            hasFee: Boolean(row.hasFee ?? row.has_fee),
            feeAmount: normalizeFeeAmount(row.feeAmount ?? row.fee_amount),
            desc: row.desc || row.description || "",
            fields: fieldConfigs,
            proofRequirements: normalizeProofRequirements(
                row.proofRequirements || row.proof_requirements || [],
            ),
            residentGuidance:
                row.residentGuidance || row.resident_guidance || {},
        });
    });
}

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
    "Certificate of Indigency": [
        {
            key: "requesterName",
            label: "Requester Name",
            placeholder: "Full name of requester, if different from resident",
            required: false,
        },
        {
            key: "requesterRelationship",
            label: "Relationship to Resident",
            placeholder: "e.g. Parent, spouse, sibling",
            required: false,
        },
        {
            key: "assistanceType",
            label: "Assistance Type",
            placeholder: "e.g. Medical, educational, financial",
            required: true,
        },
    ],
    "Barangay Business Clearance (Renewal)": [
        {
            key: "businessPermitNo",
            label: "Barangay Permit No.",
            placeholder: "e.g. ET-BPI-2024-5984",
            required: true,
        },
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
        {
            key: "operatorName",
            label: "Operator / Manager",
            placeholder: "Full name of operator or manager",
            required: true,
        },
        {
            key: "businessOwnerAddress",
            label: "Operator Address",
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
            key: "partnerName",
            label: "Spouse / Partner's Full Name",
            placeholder: "Full legal name of spouse or partner",
            required: true,
        },
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
            key: "childBirthPlace",
            label: "Child's Place of Birth",
            placeholder: "e.g. Olongapo City",
            required: true,
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
    "Certificate of No Business": [
        {
            key: "businessName",
            label: "Business / Trade Name",
            placeholder: "Name of closed or non-existing business",
            required: true,
        },
        {
            key: "businessAddress",
            label: "Business Address",
            placeholder: "Street, Barangay, City",
            required: true,
        },
        {
            key: "requesterName",
            label: "Requester Name",
            placeholder: "Full name of requesting person",
            required: true,
        },
        {
            key: "requestingInstitution",
            label: "Requesting Office / Institution",
            placeholder: "Office or institution requesting the certificate",
            required: true,
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
    "Certificate of Ownership": [
        {
            key: "propertyLocation",
            label: "Property Location",
            placeholder: "Lot location or address",
            required: true,
        },
        {
            key: "taxDeclarationNo",
            label: "Tax Declaration No.",
            placeholder: "Land TD number",
            required: true,
        },
        {
            key: "propertyArea",
            label: "Property Area",
            placeholder: "e.g. 120 sqm",
            required: true,
        },
    ],
    "Certificate of Appearance": [
        {
            key: "requestingInstitution",
            label: "Office / Institution",
            placeholder: "Office, school, or organization",
            required: true,
        },
        {
            key: "appearanceDate",
            label: "Appearance Date",
            placeholder: "",
            required: true,
            type: "date",
        },
    ],
};

// ─── Helpers ──────────────────────────────────────────────────
function fieldOverrideMap(fields = []) {
    return Object.fromEntries(fields.map((field) => [field.key, field]));
}

const FIELD_OVERRIDES_BY_NAME = Object.fromEntries(
    Object.entries(CERT_EXTRA_FIELDS).map(([name, fields]) => [
        name,
        fieldOverrideMap(fields),
    ]),
);

const FIELD_OVERRIDES_BY_TEMPLATE = {
    "doc1-indigency-medical": FIELD_OVERRIDES_BY_NAME["Certificate of Indigency"],
    "doc1-work-permit-certification": FIELD_OVERRIDES_BY_NAME["Business Permit"],
    "doc1-good-moral": FIELD_OVERRIDES_BY_NAME["Good Moral Certificate"],
    "doc1-live-birth-endorsement":
        FIELD_OVERRIDES_BY_NAME["Certificate of Live Birth (Endorsement)"],
    "doc1-cohabitation": FIELD_OVERRIDES_BY_NAME["Certificate of Cohabitation"],
    "doc1-no-business": FIELD_OVERRIDES_BY_NAME["Certificate of No Business"],
    "doc1-guardianship": FIELD_OVERRIDES_BY_NAME["Certificate of Guardianship"],
    "doc1-business-renewal-endorsement":
        FIELD_OVERRIDES_BY_NAME["Barangay Business Clearance (Renewal)"],
    "doc1-property-ownership": FIELD_OVERRIDES_BY_NAME["Certificate of Ownership"],
    "doc1-certificate-appearance":
        FIELD_OVERRIDES_BY_NAME["Certificate of Appearance"],
};

function getTemplateFieldOverride(templateKey, name, key) {
    return (
        FIELD_OVERRIDES_BY_TEMPLATE[templateKey]?.[key] ||
        FIELD_OVERRIDES_BY_NAME[name]?.[key]
    );
}

function humanizeFieldKey(key) {
    return String(key || "")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCertificateFields(cert) {
    if (Array.isArray(cert?.fields) && cert.fields.length > 0) {
        return cert.fields.filter((field) => !field.adminOnly);
    }
    return (CERT_EXTRA_FIELDS[cert?.name] || []).filter(
        (field) => !field.adminOnly,
    );
}

function defaultExtraFieldValues(fields = []) {
    return Object.fromEntries(
        fields
            .filter((field) => field?.defaultValue !== undefined)
            .map((field) => [field.key, field.defaultValue]),
    );
}

function fieldValueForDisplay(field, values) {
    const selected =
        values[field.key] !== undefined ? values[field.key] : field.defaultValue;
    if (field.type === "checkbox") {
        return selected ? "Yes" : "No";
    }
    return selected || "—";
}

function getProofRequirements(cert) {
    const tableRequirements = normalizeProofRequirements(cert?.proofRequirements);
    if (tableRequirements.length > 0) {
        return tableRequirements;
    }
    return getTemplateProofRequirements(cert?.templateKey, cert?.name);
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

const MAX_SUPPORTING_FILE_SIZE = 6 * 1024 * 1024;
const MAX_SUPPORTING_FILES = 8;

function validateProofFile(file) {
    if (!file) return "";
    const allowed =
        file.type.startsWith("image/") || file.type === "application/pdf";
    if (!allowed) return "Supporting document must be an image or PDF file.";
    if (file.size > MAX_SUPPORTING_FILE_SIZE) {
        return "Supporting document must be 6 MB or smaller.";
    }
    return "";
}

function fileListForProof(proofFiles, key) {
    const files = proofFiles?.[key];
    if (Array.isArray(files)) return files.filter(Boolean);
    return files ? [files] : [];
}

function countProofFiles(proofFiles = {}) {
    return Object.values(proofFiles).reduce(
        (total, files) => total + (Array.isArray(files) ? files.length : files ? 1 : 0),
        0,
    );
}

function proofFileNames(files = []) {
    return files.map((file) => file.name).join(", ");
}

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
    const [certs, setCerts] = useState(ALL_CERTS);
    const [certsLoading, setCertsLoading] = useState(true);
    const [certsError, setCertsError] = useState("");
    const [certSearch, setCertSearch] = useState("");
    const [certPage, setCertPage] = useState(1);
    const [branding, setBranding] = useState(DEFAULT_PUBLIC_BRANDING);

    // Wizard state
    const [step, setStep] = useState(1);
    const [selectedCert, setSelectedCert] = useState(null);
    const [purpose, setPurpose] = useState("");
    const [customPurpose, setCustomPurpose] = useState("");
    const [extraFields, setExtraFields] = useState({});
    const [requestSubject, setRequestSubject] = useState(REQUEST_SUBJECT_SELF);
    const [minorDetails, setMinorDetails] = useState(EMPTY_MINOR_DETAILS);
    const [proofFiles, setProofFiles] = useState({});
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

    useEffect(() => {
        let mounted = true;

        getPublicBrandingSettings()
            .then((data) => {
                if (mounted) setBranding(data);
            })
            .catch(() => {});

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        async function loadCertificateTemplates() {
            setCertsLoading(true);
            setCertsError("");
            try {
                const result = await requestService.getCertificateTemplates();
                const rows = Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result)
                        ? result
                        : [];
                if (mounted) setCerts(normalizeTemplateRows(rows));
            } catch {
                if (mounted) {
                    setCerts(ALL_CERTS);
                    setCertsError(
                        "Using built-in certificate list while templates are unavailable.",
                    );
                }
            } finally {
                if (mounted) setCertsLoading(false);
            }
        }

        loadCertificateTemplates();
        return () => {
            mounted = false;
        };
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
    const finalPurpose = purpose === "Others" ? customPurpose : purpose;
    const certExtra = selectedCert ? getCertificateFields(selectedCert) : [];
    const isMinorRequest = requestSubject === REQUEST_SUBJECT_MINOR;
    const representedMinorAge = calculateAge(minorDetails.dateOfBirth);
    const certificateProofRequirements = selectedCert
        ? getProofRequirements(selectedCert)
        : [];
    const proofRequirements = isMinorRequest
        ? mergeProofRequirements(certificateProofRequirements, [
              MINOR_PROOF_REQUIREMENT,
          ])
        : certificateProofRequirements;
    const charterGuidance = getCharterGuidance(selectedCert);
    const processSteps = getProcessSteps(charterGuidance);
    const whatToBringItems = getWhatToBringItems(
        selectedCert,
        proofRequirements,
    );
    const activeCerts = certsLoading ? ALL_CERTS : certs;
    const normalizedCertSearch = certSearch.trim().toLowerCase();
    const filteredCerts = normalizedCertSearch
        ? activeCerts.filter((cert) =>
              [cert.name, cert.desc, cert.templateKey]
                  .filter(Boolean)
                  .some((text) =>
                      String(text).toLowerCase().includes(normalizedCertSearch),
                  ),
          )
        : activeCerts;
    const certsPerPage = isMobile
        ? CERTS_PER_PAGE_MOBILE
        : CERTS_PER_PAGE_DESKTOP;
    const certPageCount = Math.max(
        1,
        Math.ceil(filteredCerts.length / certsPerPage),
    );
    const currentCertPage = Math.min(certPage, certPageCount);
    const visibleCerts = filteredCerts.slice(
        (currentCertPage - 1) * certsPerPage,
        currentCertPage * certsPerPage,
    );
    const officeSchedule =
        branding.officeSchedule || DEFAULT_PUBLIC_BRANDING.officeSchedule;
    const fullAddress = profile
        ? [
              profile.address_house,
              profile.address_street,
              branding.name,
              branding.city,
          ]
              .filter((part) => String(part || "").trim())
              .join(", ")
        : "—";

    function setExtra(key, val) {
        setExtraFields((prev) => ({ ...prev, [key]: val }));
    }

    function setMinorDetail(key, val) {
        setMinorDetails((prev) => ({ ...prev, [key]: val }));
        setError("");
    }

    function handleRequestSubjectChange(nextSubject) {
        setRequestSubject(nextSubject);
        setError("");
        if (nextSubject === REQUEST_SUBJECT_SELF) {
            setProofFiles((prev) => {
                const { [MINOR_PROOF_REQUIREMENT.key]: _minorProof, ...rest } =
                    prev;
                return rest;
            });
        }
    }

    function setProofFilesForKey(key, selectedFiles) {
        const files = Array.from(selectedFiles || []).filter(Boolean);
        for (const file of files) {
            const validationError = validateProofFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        const otherFileCount = countProofFiles({
            ...proofFiles,
            [key]: [],
        });
        if (otherFileCount + files.length > MAX_SUPPORTING_FILES) {
            setError(
                `Please upload up to ${MAX_SUPPORTING_FILES} supporting files total.`,
            );
            return;
        }
        setProofFiles((prev) => ({ ...prev, [key]: files }));
        setError("");
    }

    // Reset extra fields when cert changes
    useEffect(() => {
        setExtraFields(defaultExtraFieldValues(certExtra));
        setRequestSubject(REQUEST_SUBJECT_SELF);
        setMinorDetails(EMPTY_MINOR_DETAILS);
        setProofFiles({});
    }, [selectedCert]);

    async function uploadProofFiles() {
        if (proofRequirements.length === 0) return [];

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user?.id) {
            throw new Error("Please sign in again before uploading supporting documents.");
        }

        const uploaded = [];
        for (const requirement of proofRequirements) {
            const files = fileListForProof(proofFiles, requirement.key);
            if (files.length === 0) continue;

            for (const file of files) {
                const unique =
                    typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const path = [
                    "request-proofs",
                    user.id,
                    `${Date.now()}-${safeFilePart(requirement.key)}-${unique}.${fileExt(file.name)}`,
                ].join("/");

                const { error: uploadError } = await supabase.storage
                    .from("certifast-uploads")
                    .upload(path, file, {
                        cacheControl: "3600",
                        contentType: file.type || undefined,
                        upsert: false,
                    });

                if (uploadError) {
                    throw new Error(
                        uploadError.message ||
                            `Could not upload ${requirement.label}.`,
                    );
                }

                const { data: publicData } = supabase.storage
                    .from("certifast-uploads")
                    .getPublicUrl(path);

                uploaded.push({
                    proofKey: requirement.key,
                    label: requirement.label,
                    fileName: file.name,
                    filePath: path,
                    fileUrl: publicData?.publicUrl || "",
                    mimeType: file.type || "",
                    fileSize: file.size || 0,
                });
            }
        }

        return uploaded;
    }

    useEffect(() => {
        setCertPage(1);
    }, [certSearch, certs]);

    useEffect(() => {
        if (certPage > certPageCount) {
            setCertPage(certPageCount);
        }
    }, [certPage, certPageCount]);

    function handleNext() {
        if (step === 1 && !selectedCert) return;
        if (step === 2) {
            if (!finalPurpose.trim()) {
                setError("Please state the purpose of your request.");
                return;
            }
            if (isMinorRequest) {
                if (!minorDetails.fullName.trim()) {
                    setError("Please enter the minor's full name.");
                    return;
                }
                if (!minorDetails.dateOfBirth) {
                    setError("Please enter the minor's date of birth.");
                    return;
                }
                if (representedMinorAge === null) {
                    setError("Please enter a valid date of birth for the minor.");
                    return;
                }
                if (representedMinorAge >= 18) {
                    setError(
                        "This option is only for minors under 18 years old.",
                    );
                    return;
                }
                if (!minorDetails.relationship.trim()) {
                    setError("Please state your relationship to the minor.");
                    return;
                }
            }
            // Validate required extra fields
            for (const field of certExtra) {
                if (
                    field.required &&
                    field.type !== "checkbox" &&
                    !String(extraFields[field.key] ?? "").trim()
                ) {
                    setError(
                        `Please fill in: ${field.label.replace(" (optional)", "")}`,
                    );
                    return;
                }
            }
            for (const proof of proofRequirements) {
                if (
                    proof.required &&
                    fileListForProof(proofFiles, proof.key).length === 0
                ) {
                    setError(`Please upload: ${proof.label}`);
                    return;
                }
            }
            if (countProofFiles(proofFiles) > MAX_SUPPORTING_FILES) {
                setError(
                    `Please upload up to ${MAX_SUPPORTING_FILES} supporting files total.`,
                );
                return;
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
            const attachments = await uploadProofFiles();
            const subjectFields = isMinorRequest
                ? {
                      requestSubject: REQUEST_SUBJECT_MINOR,
                      certificateFor: "minor",
                      minorName: minorDetails.fullName.trim(),
                      minorDateOfBirth: minorDetails.dateOfBirth,
                      minorAge: representedMinorAge,
                      minorRelationship: minorDetails.relationship.trim(),
                      guardianName:
                          profile?.full_name || resident?.full_name || "",
                  }
                : {
                      requestSubject: REQUEST_SUBJECT_SELF,
                      certificateFor: "self",
                  };
            const data = await requestService.createRequest({
                certType: selectedCert.name,
                templateId: selectedCert.templateId || null,
                purpose: finalPurpose,
                extraFields: {
                    ...extraFields,
                    ...subjectFields,
                    templateKey: selectedCert.templateKey || "",
                    proofAttachments: attachments,
                },
                attachments,
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
        setRequestSubject(REQUEST_SUBJECT_SELF);
        setMinorDetails(EMPTY_MINOR_DETAILS);
        setProofFiles({});
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
                                has been submitted.{" "}
                                {charterGuidance?.waiting || DEFAULT_ONLINE_WAIT}
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
                                    Bring these when claiming at the{" "}
                                    {branding.name} office:{" "}
                                    {whatToBringItems.join(", ")}.
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
            {(certsLoading || certsError) && (
                <div
                    style={{
                        background: certsError ? "#fff7e6" : "#edf1fa",
                        border: `1px solid ${certsError ? "#f5d78e" : "rgba(14,37,84,0.15)"}`,
                        borderRadius: 6,
                        padding: "10px 12px",
                        marginBottom: 12,
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        color: certsError ? "#b86800" : "#0e2554",
                        fontSize: 11.5,
                    }}
                >
                    <AlertCircle size={13} />
                    {certsError || "Loading certificate templates..."}
                </div>
            )}
            <div style={{ marginBottom: 12 }}>
                <div style={{ position: "relative" }}>
                    <Search
                        size={15}
                        color="#9090aa"
                        style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                        }}
                    />
                    <input
                        className="sr-input"
                        type="search"
                        value={certSearch}
                        onChange={(e) => setCertSearch(e.target.value)}
                        placeholder="Search certificate name or purpose..."
                        style={{ paddingLeft: 36, paddingRight: 72 }}
                    />
                    {certSearch && (
                        <button
                            type="button"
                            onClick={() => setCertSearch("")}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                border: "none",
                                background: "none",
                                color: "#0e2554",
                                fontFamily: "'Source Serif 4',serif",
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: "pointer",
                                padding: "3px 5px",
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        marginTop: 8,
                        fontSize: 11,
                        color: "#9090aa",
                        flexWrap: "wrap",
                    }}
                >
                    <span>
                        Showing {filteredCerts.length === 0 ? 0 : (currentCertPage - 1) * certsPerPage + 1}
                        {"-"}
                        {Math.min(currentCertPage * certsPerPage, filteredCerts.length)} of {filteredCerts.length}
                    </span>
                    {certPageCount > 1 && (
                        <span>
                            Page {currentCertPage} of {certPageCount}
                        </span>
                    )}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleCerts.map((cert) => {
                    const Icon = cert.icon;
                    const identity = certIdentity(cert);
                    const isSelected =
                        selectedCert && certIdentity(selectedCert) === identity;
                    return (
                        <div
                            key={identity}
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
                                    {cert.hasFee
                                        ? cert.feeAmount
                                            ? formatPesoAmount(cert.feeAmount)
                                            : "PHP Fee"
                                        : "Free"}
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
            {visibleCerts.length === 0 && (
                <div
                    style={{
                        background: "#f8f6f1",
                        border: "1px dashed #d8d1c4",
                        borderRadius: 8,
                        padding: "22px 16px",
                        textAlign: "center",
                        marginTop: 8,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0e2554",
                            marginBottom: 4,
                        }}
                    >
                        No matching certificate
                    </div>
                    <div style={{ fontSize: 12, color: "#9090aa" }}>
                        Try a shorter search term, like clearance, indigency, business, or solo parent.
                    </div>
                </div>
            )}
            {certPageCount > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 14,
                    }}
                >
                    <button
                        type="button"
                        className="sr-btn-ghost"
                        onClick={() => setCertPage((page) => Math.max(1, page - 1))}
                        disabled={currentCertPage === 1}
                        style={{
                            opacity: currentCertPage === 1 ? 0.45 : 1,
                            cursor: currentCertPage === 1 ? "default" : "pointer",
                            padding: "8px 12px",
                        }}
                    >
                        <ChevronLeft size={13} /> Prev
                    </button>
                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {Array.from({ length: certPageCount }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCertPage(page)}
                                aria-label={`Go to certificate page ${page}`}
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    border:
                                        page === currentCertPage
                                            ? "1px solid #0e2554"
                                            : "1px solid #e4dfd4",
                                    background:
                                        page === currentCertPage
                                            ? "#0e2554"
                                            : "#fff",
                                    color:
                                        page === currentCertPage
                                            ? "#fff"
                                            : "#4a4a6a",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "'Source Serif 4',serif",
                                }}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="sr-btn-ghost"
                        onClick={() =>
                            setCertPage((page) =>
                                Math.min(certPageCount, page + 1),
                            )
                        }
                        disabled={currentCertPage === certPageCount}
                        style={{
                            opacity: currentCertPage === certPageCount ? 0.45 : 1,
                            cursor:
                                currentCertPage === certPageCount
                                    ? "default"
                                    : "pointer",
                            padding: "8px 12px",
                        }}
                    >
                        Next <ChevronRight size={13} />
                    </button>
                </div>
            )}
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
                        Your resident profile anchors this online request. If
                        anything is incorrect, update your profile first.
                    </div>
                </div>
            )}

            <div
                style={{
                    border: "1px solid #e4dfd4",
                    borderRadius: 8,
                    padding: "14px 16px",
                    marginBottom: 22,
                    background: "#fffdf8",
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
                        Certificate Recipient
                    </span>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 10,
                    }}
                >
                    {[
                        {
                            key: REQUEST_SUBJECT_SELF,
                            label: "For myself",
                            Icon: UserCircle,
                        },
                        {
                            key: REQUEST_SUBJECT_MINOR,
                            label: "For a minor I represent",
                            Icon: Baby,
                        },
                    ].map(({ key, label, Icon }) => {
                        const active = requestSubject === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => handleRequestSubjectChange(key)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "11px 12px",
                                    border: active
                                        ? "1.5px solid #0e2554"
                                        : "1.5px solid #e4dfd4",
                                    borderRadius: 6,
                                    background: active ? "#edf1fa" : "#fff",
                                    color: active ? "#0e2554" : "#4a4a6a",
                                    cursor: "pointer",
                                    fontFamily: "'Source Serif 4',serif",
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    textAlign: "left",
                                }}
                            >
                                <Icon size={15} strokeWidth={1.8} />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
                {isMinorRequest && (
                    <div
                        style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid #e4dfd4",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: isMobile
                                    ? "1fr"
                                    : "1fr 1fr",
                                gap: "0 12px",
                            }}
                        >
                            <FieldGroup label="Minor's Full Name" required>
                                <input
                                    className="sr-input"
                                    type="text"
                                    placeholder="Full legal name of the minor"
                                    value={minorDetails.fullName}
                                    onChange={(e) =>
                                        setMinorDetail("fullName", e.target.value)
                                    }
                                    maxLength={120}
                                />
                            </FieldGroup>
                            <FieldGroup label="Minor's Date of Birth" required>
                                <input
                                    className="sr-input"
                                    type="date"
                                    value={minorDetails.dateOfBirth}
                                    onChange={(e) =>
                                        setMinorDetail(
                                            "dateOfBirth",
                                            e.target.value,
                                        )
                                    }
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </FieldGroup>
                            <div
                                style={{
                                    gridColumn: isMobile ? "auto" : "1 / -1",
                                }}
                            >
                                <FieldGroup
                                    label="Relationship to Minor"
                                    required
                                >
                                    <input
                                        className="sr-input"
                                        type="text"
                                        placeholder="e.g. Parent, Guardian, Grandparent"
                                        value={minorDetails.relationship}
                                        onChange={(e) =>
                                            setMinorDetail(
                                                "relationship",
                                                e.target.value,
                                            )
                                        }
                                        maxLength={80}
                                    />
                                </FieldGroup>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                    {certExtra.map((field) => {
                        const checked =
                            extraFields[field.key] !== undefined
                                ? Boolean(extraFields[field.key])
                                : Boolean(field.defaultValue);
                        return (
                        <FieldGroup
                            key={field.key}
                            label={field.label}
                            required={field.required}
                        >
                            {field.type === "checkbox" ? (
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        minHeight: 38,
                                        padding: "8px 10px",
                                        border: "1px solid #e4dfd4",
                                        borderRadius: 6,
                                        background: "#fffdf8",
                                        fontSize: 12.5,
                                        color: "#1a1a2e",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                            setExtra(field.key, e.target.checked);
                                            setError("");
                                        }}
                                    />
                                    <span>{checked ? "Yes" : "No"}</span>
                                </label>
                            ) : (
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
                                            ? new Date()
                                                  .toISOString()
                                                  .split("T")[0]
                                            : undefined
                                    }
                                />
                            )}
                        </FieldGroup>
                        );
                    })}
                </div>
            )}

            {proofRequirements.length > 0 && (
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
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0e2554",
                            marginBottom: 6,
                        }}
                    >
                        <UploadCloud size={15} />
                        Supporting Documents
                    </div>
                    <div
                        style={{
                            fontSize: 11.5,
                            color: "#7a7890",
                            lineHeight: 1.5,
                            marginBottom: 14,
                        }}
                    >
                        Upload only the document needed for this certificate,
                        such as a letter, medical paper, business paper, school
                        paper, or other requirement. Staff will review it before
                        approving or rejecting the request.
                    </div>
                    {proofRequirements.map((proof) => {
                        const files = fileListForProof(proofFiles, proof.key);
                        const hasFiles = files.length > 0;
                        return (
                            <FieldGroup
                                key={proof.key}
                                label={proof.label}
                                required={proof.required}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        padding: "11px 12px",
                                        border: "1.5px dashed #cfc7bb",
                                        borderRadius: 6,
                                        background: hasFiles
                                            ? "#f0faf4"
                                            : "#fffdf8",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                            minWidth: 0,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                fontSize: 12.5,
                                                color: hasFiles
                                                    ? "#1a7a4a"
                                                    : "#4a4a6a",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {hasFiles
                                                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                                                : "Choose files"}
                                        </strong>
                                        <span
                                            style={{
                                                fontSize: 10.5,
                                                color: "#9090aa",
                                            }}
                                        >
                                            {hasFiles
                                                ? files
                                                      .map(
                                                          (file) =>
                                                              `${file.name} (${formatFileSize(file.size)})`,
                                                      )
                                                      .join(", ")
                                                : `Images or PDFs, max 6 MB each. Up to ${MAX_SUPPORTING_FILES} files total.`}
                                        </span>
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#0e2554",
                                            flexShrink: 0,
                                        }}
                                    >
                                        Browse
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept={proof.accept || "image/*,.pdf"}
                                        onChange={(e) =>
                                            setProofFilesForKey(
                                                proof.key,
                                                e.target.files,
                                            )
                                        }
                                        style={{ display: "none" }}
                                    />
                                </label>
                            </FieldGroup>
                        );
                    })}
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
                        {selectedCert.feeAmount
                            ? ` of ${formatPesoAmount(selectedCert.feeAmount)}`
                            : ""}{" "}
                        payable at the barangay office upon claiming.
                    </span>
                </div>
            )}
        </div>
    );

    // ─── STEP 3 — Confirmation ────────────────────────────────
    const summaryRows = [
        { label: "Certificate", value: selectedCert?.name },
        {
            label: "Certificate For",
            value: isMinorRequest
                ? `Minor - ${minorDetails.fullName.trim()}`
                : "Myself",
        },
        ...(isMinorRequest
            ? [
                  {
                      label: "Minor Date of Birth",
                      value: fmtDate(minorDetails.dateOfBirth),
                  },
                  {
                      label: "Minor Age",
                      value:
                          representedMinorAge !== null
                              ? `${representedMinorAge} years old`
                              : "N/A",
                  },
                  {
                      label: "Relationship",
                      value: minorDetails.relationship.trim() || "N/A",
                  },
              ]
            : []),
        { label: "Purpose", value: finalPurpose || "—" },
        // Extra fields in summary
        ...certExtra.map((f) => ({
            label: f.label.replace(" (optional)", ""),
            value: fieldValueForDisplay(f, extraFields),
        })),
        ...proofRequirements.map((proof) => ({
            label: `Document: ${proof.label}`,
            value:
                proofFileNames(fileListForProof(proofFiles, proof.key)) ||
                "—",
        })),
        {
            label: "Fee Required",
            value: selectedCert?.hasFee
                ? selectedCert.feeAmount
                    ? `Yes - ${formatPesoAmount(selectedCert.feeAmount)}`
                    : "Yes - payable at barangay office"
                : "None",
        },
        {
            label: "Process Note",
            value: charterGuidance
                ? `${charterGuidance.title}. ${charterGuidance.waiting}`
                : DEFAULT_ONLINE_WAIT,
        },
        {
            label: "Claim Requirements",
            value: whatToBringItems.join(", "),
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
                    submission. {charterGuidance?.waiting || DEFAULT_ONLINE_WAIT}{" "}
                    Visit the office to claim your document.
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
                                        {charterGuidance && (
                                            <div
                                                style={{
                                                    background: "#f8f6f1",
                                                    border: "1px solid #e4dfd4",
                                                    borderRadius: 6,
                                                    padding: "9px 10px",
                                                    fontSize: 11.5,
                                                    color: "#4a4a6a",
                                                    lineHeight: 1.55,
                                                }}
                                            >
                                                <strong>
                                                    {charterGuidance.title}
                                                </strong>
                                                <br />
                                                {charterGuidance.waiting}
                                            </div>
                                        )}
                                        {processSteps.map((s) => (
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
                                        {officeSchedule.map((row, index) => (
                                            <span key={`${row.label}-${index}`}>
                                                <strong>{row.label}:</strong>{" "}
                                                {row.time}
                                                {index < officeSchedule.length - 1 && (
                                                    <br />
                                                )}
                                            </span>
                                        ))}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: 11,
                                            color: "#9a7515",
                                            margin: 0,
                                        }}
                                    >
                                        {branding.address}
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
                                        {whatToBringItems.map((item, i) => (
                                            <div
                                                key={item}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 10,
                                                    padding: "8px 18px",
                                                    borderBottom:
                                                        i <
                                                        whatToBringItems.length -
                                                            1
                                                            ? "1px solid #f5f2ee"
                                                            : "none",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background: "#1a7a4a",
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
                                        ))}
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
