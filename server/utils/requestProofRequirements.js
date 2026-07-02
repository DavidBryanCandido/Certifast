const DEFAULT_PROOF_ACCEPT = "image/*,.pdf";
const DEFAULT_MAX_FILES = 8;
const MAX_PROOF_FILE_SIZE = 6 * 1024 * 1024;

const OBSOLETE_PROOF_KEYS = new Set(["valid_id", "address_proof"]);

function cleanText(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeProofKey(raw, fallback) {
    const key = cleanText(raw || fallback)
        .toLowerCase()
        .replace(/[^a-z0-9_ -]+/g, "")
        .replace(/[\s-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);
    return key || fallback;
}

function normalizeMaxFiles(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_FILES;
}

function normalizeMinFiles(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeKeyList(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => normalizeProofKey(item, ""))
        .filter(Boolean);
}

function normalizeProofRequirements(value = []) {
    return parseJsonArray(value)
        .filter(Boolean)
        .map((item, index) => {
            const source = typeof item === "object" ? item : {};
            const label =
                cleanText(source.label || source.name || source.title) ||
                `Supporting document ${index + 1}`;
            const key = normalizeProofKey(source.key || source.proofKey, `proof_${index + 1}`);
            if (OBSOLETE_PROOF_KEYS.has(key)) return null;
            const groupKey = normalizeProofKey(
                source.groupKey || source.group_key,
                "",
            );
            const inGroup = Boolean(groupKey);

            return {
                key,
                label,
                required: inGroup ? source.required === true : source.required !== false,
                accept: cleanText(source.accept) || DEFAULT_PROOF_ACCEPT,
                maxFiles: normalizeMaxFiles(source.maxFiles || source.max_files),
                legacyKeys: normalizeKeyList(source.legacyKeys || source.legacy_keys),
                ...(inGroup
                    ? {
                          groupKey,
                          groupLabel:
                              cleanText(source.groupLabel || source.group_label) ||
                              label,
                          groupRequired:
                              source.groupRequired !== false &&
                              source.group_required !== false,
                          groupMinFiles: normalizeMinFiles(
                              source.groupMinFiles || source.group_min_files,
                          ),
                      }
                    : {}),
            };
        })
        .filter(Boolean);
}

function requirementsForRequest(templateRequirements = []) {
    return normalizeProofRequirements(templateRequirements);
}

function attachmentProofKey(file) {
    return normalizeProofKey(file?.proofKey || file?.proof_key, "proof");
}

function groupAttachmentsByProofKey(attachments = []) {
    const grouped = new Map();
    attachments.filter(Boolean).forEach((file) => {
        const key = attachmentProofKey(file);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(file);
    });
    return grouped;
}

function proofKeys(proof = {}) {
    return [
        normalizeProofKey(proof.key || proof.proofKey, ""),
        ...normalizeKeyList(proof.legacyKeys || proof.legacy_keys),
    ].filter(Boolean);
}

function buildRequirementIndex(requirements = []) {
    const byKey = new Map();
    const groups = new Map();
    const groupByKey = new Map();

    requirements.forEach((proof) => {
        proofKeys(proof).forEach((key) => byKey.set(key, proof));

        if (!proof.groupKey) return;

        const groupKey = normalizeProofKey(proof.groupKey, "");
        if (!groupKey) return;

        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                key: groupKey,
                groupKey,
                label: proof.groupLabel || proof.label,
                groupLabel: proof.groupLabel || proof.label,
                required: true,
                groupRequired: proof.groupRequired !== false,
                groupMinFiles: proof.groupMinFiles || 1,
                keys: new Set([groupKey]),
                items: [],
                isGroup: true,
            });
        }

        const group = groups.get(groupKey);
        group.items.push(proof);
        group.groupRequired = group.groupRequired || proof.groupRequired === true;
        group.groupMinFiles = Math.max(group.groupMinFiles || 1, proof.groupMinFiles || 1);
        proofKeys(proof).forEach((key) => group.keys.add(key));
    });

    groups.forEach((group) => {
        group.keys.forEach((key) => groupByKey.set(key, group));
    });

    return { byKey, groupByKey, groups: [...groups.values()] };
}

function countFilesForKeys(groupedAttachments, keys = []) {
    const seen = new Set();
    return keys.reduce((count, key) => {
        if (!key || seen.has(key)) return count;
        seen.add(key);
        return count + (groupedAttachments.get(key) || []).length;
    }, 0);
}

function groupPublicShape(group) {
    return {
        key: group.groupKey,
        groupKey: group.groupKey,
        label: group.groupLabel,
        groupLabel: group.groupLabel,
        required: true,
        groupRequired: group.groupRequired !== false,
        groupMinFiles: group.groupMinFiles || 1,
        isGroup: true,
    };
}

function getMissingProofRequirements(requirements = [], attachments = []) {
    const grouped = groupAttachmentsByProofKey(attachments);
    const index = buildRequirementIndex(requirements);
    const missing = [];

    requirements.forEach((proof) => {
        if (proof.groupKey || !proof.required) return;
        if (countFilesForKeys(grouped, proofKeys(proof)) === 0) {
            missing.push(proof);
        }
    });

    index.groups.forEach((group) => {
        if (group.groupRequired === false) return;
        const fileCount = countFilesForKeys(grouped, [...group.keys]);
        if (fileCount < (group.groupMinFiles || 1)) {
            missing.push(groupPublicShape(group));
        }
    });

    return missing;
}

function summarizeProofRequirements({
    templateRequirements = [],
    attachments = [],
} = {}) {
    const proofRequirements = requirementsForRequest(templateRequirements);
    const missingProofRequirements = getMissingProofRequirements(
        proofRequirements,
        attachments,
    );

    return { proofRequirements, missingProofRequirements };
}

function isAllowedProofMime(file) {
    const mime = cleanText(file?.mimeType || file?.mime_type || file?.type);
    if (mime.startsWith("image/") || mime === "application/pdf") return true;

    const name = cleanText(file?.fileName || file?.file_name || file?.name).toLowerCase();
    return /\.(jpe?g|png|webp|gif|pdf)$/.test(name);
}

function validateProofAttachments({
    requirements = [],
    attachments = [],
    uploadPrefix = "",
    allowedExistingPaths = new Set(),
} = {}) {
    const errors = [];
    const requirementIndex = buildRequirementIndex(requirements);
    const grouped = groupAttachmentsByProofKey(attachments);

    attachments.forEach((file) => {
        const key = attachmentProofKey(file);
        const requirement = requirementIndex.byKey.get(key);
        const group = requirementIndex.groupByKey.get(key);
        if (!requirement) {
            errors.push(
                `Unexpected supporting document: ${file.label || file.fileName || key}`,
            );
            return;
        }
        const label = requirement?.label || group?.groupLabel || "Supporting document";

        const path = cleanText(file.filePath || file.file_path);
        if (!path) {
            errors.push(`${label} must be uploaded before submitting.`);
            return;
        }

        const allowedPath =
            allowedExistingPaths.has(path) ||
            (uploadPrefix && path.startsWith(uploadPrefix));
        if (!allowedPath) {
            errors.push(`${label} has an invalid upload path.`);
        }

        if (!isAllowedProofMime(file)) {
            errors.push(`${label} must be an image or PDF file.`);
        }

        const fileSize = Number(file.fileSize || file.file_size || file.size || 0);
        if (fileSize > MAX_PROOF_FILE_SIZE) {
            errors.push(`${label} must be 6 MB or smaller.`);
        }
    });

    requirements.forEach((proof) => {
        const fileCount = countFilesForKeys(grouped, proofKeys(proof));
        if (!proof.groupKey && proof.required && fileCount === 0) {
            errors.push(`Please upload: ${proof.label}`);
        }
        if (fileCount > proof.maxFiles) {
            errors.push(`${proof.label} accepts up to ${proof.maxFiles} files.`);
        }
    });

    requirementIndex.groups.forEach((group) => {
        if (group.groupRequired === false) return;
        const fileCount = countFilesForKeys(grouped, [...group.keys]);
        if (fileCount < (group.groupMinFiles || 1)) {
            errors.push(`Please upload at least one file for: ${group.groupLabel}`);
        }
    });

    return [...new Set(errors)];
}

module.exports = {
    DEFAULT_MAX_FILES,
    normalizeProofRequirements,
    requirementsForRequest,
    summarizeProofRequirements,
    validateProofAttachments,
};
