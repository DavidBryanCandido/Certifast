const nodemailer = require("nodemailer");

const STATUS_EMAILS = {
    approved: "Your Certificate Request Has Been Approved",
    ready: "Your Certificate is Ready for Pickup",
    rejected: "Your Certificate Request Was Not Approved",
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
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT || 587);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
        throw new Error("Email SMTP configuration is incomplete.");
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

async function sendStatusEmail(
    residentEmail,
    residentName,
    certType,
    status,
    rejectionReason = "",
) {
    const normalizedStatus = String(status || "").toLowerCase();
    const subject = STATUS_EMAILS[normalizedStatus];
    if (!subject) return { skipped: true };
    if (!residentEmail) throw new Error("Resident email is required.");

    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const statusLabel =
        normalizedStatus === "ready"
            ? "Ready for Pickup"
            : normalizedStatus.charAt(0).toUpperCase() +
              normalizedStatus.slice(1);

    const rejectionBlock =
        normalizedStatus === "rejected"
            ? `<p><strong>Reason:</strong> ${escapeHtml(rejectionReason || "No reason was provided.")}</p>`
            : "";

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
                <p>Please visit the barangay office during office hours if action or pickup is required.</p>
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
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
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
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
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
