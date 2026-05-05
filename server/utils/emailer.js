const nodemailer = require("nodemailer");

function emailEnabled() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

function createTransporter() {
    const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function sendResidentRejectionEmail({ to, residentName, reason }) {
    if (!emailEnabled() || !to) {
        return { sent: false, skipped: true };
    }

    const appName = process.env.APP_NAME || "CertiFast";
    const from =
        process.env.SMTP_FROM ||
        `"${appName}" <${process.env.SMTP_USER}>`;
    const safeName = escapeHtml(residentName || "Resident");
    const safeReason = escapeHtml(reason);

    const transporter = createTransporter();
    await transporter.sendMail({
        from,
        to,
        subject: `${appName} resident account update`,
        text: [
            `Hello ${residentName || "Resident"},`,
            "",
            `Your resident account registration was not activated.`,
            "",
            `Reason: ${reason}`,
            "",
            "Please contact the barangay office if you need help correcting your registration.",
            "",
            appName,
        ].join("\n"),
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a2e">
                <p>Hello ${safeName},</p>
                <p>Your resident account registration was <strong>not activated</strong>.</p>
                <p><strong>Reason:</strong> ${safeReason}</p>
                <p>Please contact the barangay office if you need help correcting your registration.</p>
                <p>${escapeHtml(appName)}</p>
            </div>
        `,
    });

    return { sent: true, skipped: false };
}

module.exports = {
    sendResidentRejectionEmail,
};
