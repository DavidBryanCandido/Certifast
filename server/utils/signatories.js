const pool = require("../db/pool");

const KAGAWAD_SLOTS = ["kagawad", "kagawad1", "kagawad2", "kagawad3"];

function displayOfficialName(row) {
    const honorific = String(row.honorific || row.default_honorific || "").trim();
    const fullName = String(row.full_name || "").trim();
    return [honorific, fullName].filter(Boolean).join(" ");
}

function toSnapshot(row) {
    if (!row) return null;
    return {
        assignmentId: row.assignment_id,
        personnelId: row.personnel_id,
        name: displayOfficialName(row),
        title: row.title_override || row.position_name,
        positionCode: row.position_code,
        committee: row.committee || "",
        signatureData: row.signature_data || "",
    };
}

async function getActiveAssignmentRows(client = pool) {
    const result = await client.query(
        `SELECT
            assignment.assignment_id,
            assignment.personnel_id,
            assignment.committee,
            assignment.title_override,
            assignment.display_order,
            personnel.full_name,
            personnel.honorific,
            personnel.signature_data,
            position.position_code,
            position.position_name,
            position.default_honorific
         FROM barangay_personnel_assignments assignment
         JOIN barangay_terms term
           ON term.term_id = assignment.term_id
          AND term.is_active = true
         JOIN barangay_personnel personnel
           ON personnel.personnel_id = assignment.personnel_id
          AND personnel.is_active = true
         JOIN barangay_positions position
           ON position.position_id = assignment.position_id
          AND position.is_active = true
         WHERE assignment.is_active = true
           AND (
                assignment.starts_on IS NULL
                OR assignment.starts_on <= CURRENT_DATE
           )
           AND (
                assignment.ends_on IS NULL
                OR assignment.ends_on >= CURRENT_DATE
           )
           AND (
                position.position_code = 'punong_barangay'
                OR position.position_code = 'barangay_kagawad'
           )
         ORDER BY position.sort_order, assignment.display_order, personnel.full_name`,
    );
    return result.rows;
}

async function buildSignatorySnapshot(selections = {}, client = pool) {
    const rows = await getActiveAssignmentRows(client);
    const captain = rows.find(
        (row) => row.position_code === "punong_barangay",
    );
    const kagawads = rows.filter(
        (row) => row.position_code === "barangay_kagawad",
    );
    const kagawadByAssignment = new Map(
        kagawads.map((row) => [Number(row.assignment_id), row]),
    );

    if (!captain) {
        const error = new Error(
            "No active Punong Barangay is configured for the current administration",
        );
        error.statusCode = 400;
        throw error;
    }

    const snapshot = {
        captain: toSnapshot(captain),
    };
    const usedAssignments = new Set();

    for (const slot of KAGAWAD_SLOTS) {
        const raw = selections?.[slot];
        if (raw === null || raw === undefined || raw === "") continue;

        const assignmentId = Number.parseInt(raw, 10);
        const row = kagawadByAssignment.get(assignmentId);
        if (!row) {
            const error = new Error(
                `The selected ${slot} is not an active Barangay Kagawad`,
            );
            error.statusCode = 400;
            throw error;
        }
        if (usedAssignments.has(assignmentId)) {
            const error = new Error(
                "Choose a different Kagawad for each signatory or witness slot",
            );
            error.statusCode = 400;
            throw error;
        }

        usedAssignments.add(assignmentId);
        snapshot[slot] = toSnapshot(row);
    }

    return snapshot;
}

module.exports = {
    KAGAWAD_SLOTS,
    buildSignatorySnapshot,
    displayOfficialName,
    getActiveAssignmentRows,
    toSnapshot,
};
