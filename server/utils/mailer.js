const nodemailer = require("nodemailer");

const STATUS_EMAILS = {
    approved: "Your Certificate Request Has Been Approved",
    ready: "Your Certificate is Ready for Pickup",
    rejected: "Your Certificate Request Was Not Approved",
    needs_correction: "Action Required: Correct Your Certificate Request",
};

const ACCOUNT_EMAILS = {
    activated: "Your CertiFast Account Has Been Activated",
    password_changed: "Your CertiFast Password Was Changed",
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getTransporter() {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
    const tlsRejectUnauthorized =
        process.env.EMAIL_TLS_REJECT_UNAUTHORIZED ??
        process.env.SMTP_TLS_REJECT_UNAUTHORIZED;

    if (!host || !user || !pass) {
        throw new Error("Email SMTP configuration is incomplete.");
    }

    const options = {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    };

    if (String(tlsRejectUnauthorized).toLowerCase() === "false") {
        options.tls = { rejectUnauthorized: false };
    }

    return nodemailer.createTransport(options);
}

function normalizeEmailList(items) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => String(item || "").trim())
        .filter(Boolean);
}

function buildPickupDetailsBlock(normalizedStatus, pickupDetails) {
    if (!["approved", "ready"].includes(normalizedStatus) || !pickupDetails) {
        return "";
    }

    const bringItems = normalizeEmailList(pickupDetails.bringItems);
    const bringBlock = bringItems.length
        ? `<p style="margin-bottom:8px;"><strong>What to bring:</strong></p>
           <ul style="margin-top:0;padding-left:22px;">
               ${bringItems
                   .map((item) => `<li>${escapeHtml(item)}</li>`)
                   .join("")}
           </ul>`
        : "";
    const feeBlock = pickupDetails.feeLabel
        ? `<p><strong>Fee:</strong> ${escapeHtml(pickupDetails.feeLabel)}</p>`
        : "";

    if (!bringBlock && !feeBlock) return "";

    return `
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;margin:18px 0;">
            <p style="margin-top:0;"><strong>${normalizedStatus === "ready" ? "Pickup reminder" : "Claiming reminder"}</strong></p>
            ${bringBlock}
            ${feeBlock}
        </div>
    `;
}

function statusActionText(normalizedStatus, hasPickupDetails) {
    if (normalizedStatus === "needs_correction") {
        return "Sign in to CertiFast, open My Requests, edit this request, and resubmit it for review.";
    }
    if (hasPickupDetails && normalizedStatus === "ready") {
        return "Please visit the barangay office during office hours to claim your certificate.";
    }
    if (hasPickupDetails && normalizedStatus === "approved") {
        return "Please prepare the listed items while barangay staff process your certificate.";
    }
    return "Please visit the barangay office during office hours if action or pickup is required.";
}

async function sendStatusEmail(
    residentEmail,
    residentName,
    certType,
    status,
    rejectionReason = "",
    pickupDetails = null,
) {
    const normalizedStatus = String(status || "").toLowerCase();
    const subject = STATUS_EMAILS[normalizedStatus];
    if (!subject) return { skipped: true };
    if (!residentEmail) throw new Error("Resident email is required.");

    const transporter = getTransporter();
    const from =
        process.env.EMAIL_FROM ||
        process.env.SMTP_FROM ||
        process.env.EMAIL_USER ||
        process.env.SMTP_USER;
    const statusLabel =
        normalizedStatus === "ready"
            ? "Ready for Pickup"
            : normalizedStatus === "needs_correction"
              ? "Needs Correction"
            : normalizedStatus.charAt(0).toUpperCase() +
              normalizedStatus.slice(1);

    const rejectionBlock =
        normalizedStatus === "rejected" || normalizedStatus === "needs_correction"
            ? `<p><strong>${normalizedStatus === "needs_correction" ? "What to correct" : "Reason"}:</strong> ${escapeHtml(rejectionReason || "No reason was provided.")}</p>`
            : "";
    const pickupDetailsBlock = buildPickupDetailsBlock(
        normalizedStatus,
        pickupDetails,
    );

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:620px;margin:0 auto;">
            <div style="background:#0e2554;color:#fff;padding:18px 22px;border-radius:6px 6px 0 0;">
                <div style="font-size:18px;font-weight:700;">Barangay East Tapinac &mdash; CertiFast</div>
                <div style="font-size:12px;color:#f0d060;margin-top:4px;">Certificate Request Update</div>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:0;padding:22px;border-radius:0 0 6px 6px;">
                <p>Hello ${escapeHtml(residentName || "Resident")},</p>
                <p>Your certificate request has a status update.</p>
                <p><strong>Certificate:</strong> ${escapeHtml(certType || "Certificate Request")}</p>
                <p><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>
                ${rejectionBlock}
                ${pickupDetailsBlock}
                <p>${statusActionText(normalizedStatus, Boolean(pickupDetailsBlock))}</p>
                <p><strong>Office hours:</strong> Mon-Fri 8AM-5PM, Saturday 8AM-12PM.</p>
                <p style="color:#6b7280;font-size:12px;margin-top:24px;">This is an automated CertiFast notification.</p>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from,
        to: residentEmail,
        subject,
        html,
    });

    return { sent: true };
}

async function sendAccountActivatedEmail(residentEmail, residentName) {
    if (!residentEmail) throw new Error("Resident email is required.");

    const transporter = getTransporter();
    const from =
        process.env.EMAIL_FROM ||
        process.env.SMTP_FROM ||
        process.env.EMAIL_USER ||
        process.env.SMTP_USER;
    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:620px;margin:0 auto;">
            <div style="background:#0e2554;color:#fff;padding:18px 22px;border-radius:6px 6px 0 0;">
                <div style="font-size:18px;font-weight:700;">Barangay East Tapinac &mdash; CertiFast</div>
                <div style="font-size:12px;color:#f0d060;margin-top:4px;">Account Update</div>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:0;padding:22px;border-radius:0 0 6px 6px;">
                <p>Hello ${escapeHtml(residentName || "Resident")},</p>
                <p>Your CertiFast resident account has been activated.</p>
                <p>You may now sign in to CertiFast and request barangay certificates online.</p>
                <p style="color:#6b7280;font-size:12px;margin-top:24px;">This is an automated CertiFast notification.</p>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from,
        to: residentEmail,
        subject: ACCOUNT_EMAILS.activated,
        html,
    });

    return { sent: true };
}

async function sendPasswordChangedEmail(
    residentEmail,
    residentName,
    changedBy = "resident",
) {
    if (!residentEmail) throw new Error("Resident email is required.");

    const transporter = getTransporter();
    const from =
        process.env.EMAIL_FROM ||
        process.env.SMTP_FROM ||
        process.env.EMAIL_USER ||
        process.env.SMTP_USER;
    const changedByText =
        changedBy === "admin"
            ? "by barangay personnel"
            : "from your resident account";
    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:620px;margin:0 auto;">
            <div style="background:#0e2554;color:#fff;padding:18px 22px;border-radius:6px 6px 0 0;">
                <div style="font-size:18px;font-weight:700;">Barangay East Tapinac &mdash; CertiFast</div>
                <div style="font-size:12px;color:#f0d060;margin-top:4px;">Security Alert</div>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:0;padding:22px;border-radius:0 0 6px 6px;">
                <p>Hello ${escapeHtml(residentName || "Resident")},</p>
                <p>Your CertiFast password was changed ${escapeHtml(changedByText)}.</p>
                <p>If you did not request or authorize this change, please contact the barangay office immediately.</p>
                <p style="color:#6b7280;font-size:12px;margin-top:24px;">This is an automated CertiFast security notification. Your password is never included in this email.</p>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from,
        to: residentEmail,
        subject: ACCOUNT_EMAILS.password_changed,
        html,
    });

    return { sent: true };
}

module.exports = {
    sendStatusEmail,
    sendAccountActivatedEmail,
    sendPasswordChangedEmail,
};
