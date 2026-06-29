const pool = require("../db/pool");

const DEFAULT_BRING_ITEMS = [
    "Valid government-issued ID",
    "Request reference",
];

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

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function normalizeStringArray(value) {
    return parseJsonArray(value)
        .map((item) => String(item || "").trim())
        .filter(Boolean);
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

function formatRequestReference(requestId) {
    const parsed = Number.parseInt(requestId, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return "";
    return `REQ-${String(parsed).padStart(4, "0")}`;
}

function isFeeBringItem(item) {
    const text = String(item || "").toLowerCase();
    return /\bfee\b/.test(text) || /listed payment|payment at/.test(text);
}

function isGenericReferenceItem(item) {
    return /request\s*(id|reference)|reference\s*number/i.test(
        String(item || ""),
    );
}

function getGuidanceBringItems(value) {
    const guidance = parseJsonObject(value);
    const bring = normalizeStringArray(guidance.bring || guidance.whatToBring);
    return bring.length ? bring : DEFAULT_BRING_ITEMS;
}

function getProofRequirementLabels(value) {
    return parseJsonArray(value)
        .map((item) => {
            if (!item || typeof item !== "object") return "";
            return String(item.label || item.name || "").trim();
        })
        .filter(Boolean);
}

async function getRequestAttachmentLabels(requestId) {
    try {
        const result = await pool.query(
            `SELECT DISTINCT label
             FROM request_attachments
             WHERE request_id = $1
               AND NULLIF(TRIM(label), '') IS NOT NULL
             ORDER BY label ASC`,
            [requestId],
        );
        return result.rows
            .map((row) => String(row.label || "").trim())
            .filter(Boolean);
    } catch (err) {
        if (err?.code === "42P01" || /request_attachments/i.test(err?.message || "")) {
            return [];
        }
        throw err;
    }
}

function buildFeeDetails(row) {
    const hasFee = Boolean(row?.has_fee);
    if (!hasFee) {
        return {
            hasFee,
            feeAmount: null,
            feeLabel: "No fee required",
            feeLine: "Fee: No fee required",
        };
    }

    const formatted = formatPesoAmount(row?.fee_amount);
    return {
        hasFee,
        feeAmount: normalizeFeeAmount(row?.fee_amount),
        feeLabel: formatted || "Payable at the barangay office",
        feeLine: `Fee: ${formatted || "Payable at the barangay office"}`,
    };
}

function buildBringItems({ row, requestReference, proofLabels }) {
    const guidanceItems = getGuidanceBringItems(row?.resident_guidance).filter(
        (item) => !isFeeBringItem(item) && !isGenericReferenceItem(item),
    );
    const proofItems = proofLabels.map(
        (label) => `Original/copy of uploaded ${label}`,
    );

    return uniqueList([
        "Your CertiFast QR card (printed or on your phone)",
        ...guidanceItems,
        requestReference ? `Request reference: ${requestReference}` : "",
        ...proofItems,
    ]);
}

async function getRequestNotificationDetails(requestId) {
    const result = await pool.query(
        `SELECT
            r.request_id,
            r.cert_type,
            res.email AS resident_email,
            res.full_name AS resident_name,
            COALESCE(ct.name, r.cert_type, 'Certificate Request') AS certificate_name,
            COALESCE(ct.has_fee, false) AS has_fee,
            to_jsonb(ct)->>'fee_amount' AS fee_amount,
            COALESCE(to_jsonb(ct)->'proof_requirements', '[]'::jsonb) AS proof_requirements,
            COALESCE(to_jsonb(ct)->'resident_guidance', '{}'::jsonb) AS resident_guidance
         FROM requests r
         LEFT JOIN residents res ON res.resident_id = r.resident_id
         LEFT JOIN LATERAL (
            SELECT *
            FROM certificate_templates template
            WHERE template.template_id = r.template_id
               OR (r.template_id IS NULL AND template.name = r.cert_type)
            ORDER BY CASE WHEN template.template_id = r.template_id THEN 0 ELSE 1 END,
                     COALESCE(template.display_order, 0),
                     template.template_id
            LIMIT 1
         ) ct ON TRUE
         WHERE r.request_id = $1
         LIMIT 1`,
        [requestId],
    );

    const row = result.rows[0];
    if (!row) return null;

    const requestReference = formatRequestReference(row.request_id);
    const proofLabels = uniqueList([
        ...getProofRequirementLabels(row.proof_requirements),
        ...(await getRequestAttachmentLabels(row.request_id)),
    ]);
    const feeDetails = buildFeeDetails(row);

    return {
        requestId: row.request_id,
        requestReference,
        certType: row.cert_type || row.certificate_name || "Certificate Request",
        certificateName:
            row.certificate_name || row.cert_type || "Certificate Request",
        residentEmail: row.resident_email || "",
        residentName: row.resident_name || "",
        bringItems: buildBringItems({ row, requestReference, proofLabels }),
        ...feeDetails,
    };
}

function finishSentence(text) {
    const value = String(text || "").trim();
    if (!value) return "";
    return /[.!?]$/.test(value) ? value : `${value}.`;
}

function buildStatusNotificationMessage(status, details) {
    const normalizedStatus = String(status || "").toLowerCase();
    const bringText = Array.isArray(details?.bringItems)
        ? details.bringItems.join("; ")
        : "";
    const feeSentence = finishSentence(details?.feeLine);

    if (normalizedStatus === "approved") {
        if (!bringText) {
            return "Your certificate request has been approved and is now being processed.";
        }
        return [
            `Your request was approved. Please prepare these for claiming: ${bringText}.`,
            feeSentence,
        ]
            .filter(Boolean)
            .join(" ");
    }

    if (normalizedStatus === "ready") {
        if (!bringText) {
            return "Your certificate is ready for pickup at the barangay office.";
        }
        return [
            `Your certificate is ready for pickup. Please bring: ${bringText}.`,
            feeSentence,
        ]
            .filter(Boolean)
            .join(" ");
    }

    return "Your certificate request has a status update.";
}

module.exports = {
    buildStatusNotificationMessage,
    formatPesoAmount,
    formatRequestReference,
    getRequestNotificationDetails,
};
