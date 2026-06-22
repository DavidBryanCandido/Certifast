const pool = require("../db/pool");
const { createAuditLog } = require("../utils/logger");
const {
    buildSignatorySnapshot,
    displayOfficialName,
    toSnapshot,
} = require("../utils/signatories");

function ensureAdmin(req, res) {
    if (req.admin?.role !== "admin" && req.admin?.role !== "superadmin") {
        res.status(403).json({ message: "Admin access only" });
        return false;
    }
    return true;
}

function parsePositiveInteger(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalDate(value) {
    const text = String(value || "").trim();
    return text || null;
}

function mapAssignment(row) {
    return {
        assignmentId: row.assignment_id,
        personnelId: row.personnel_id,
        fullName: row.full_name,
        honorific: row.honorific || "",
        displayName: displayOfficialName(row),
        contactNumber: row.contact_number || "",
        email: row.email || "",
        photoUrl: row.photo_url || "",
        signatureData: row.signature_data || "",
        personnelNotes: row.personnel_notes || "",
        positionId: row.position_id,
        positionCode: row.position_code,
        positionName: row.position_name,
        positionGroup: row.position_group,
        signatoryEligible: Boolean(row.is_signatory_eligible),
        requiresPurok: Boolean(row.requires_purok),
        termId: row.term_id,
        termName: row.term_name,
        purokId: row.purok_id || null,
        purokName: row.purok_name || "",
        committee: row.committee || "",
        titleOverride: row.title_override || "",
        displayOrder: row.display_order || 0,
        startsOn: row.starts_on || null,
        endsOn: row.ends_on || null,
        isActive: row.assignment_active !== false,
        isCurrentEffective: Boolean(row.is_current_effective),
    };
}

async function getPersonnelRoster(req, res) {
    try {
        const termsResult = await pool.query(
            `SELECT term_id, term_name, starts_on, ends_on, is_active, notes
             FROM barangay_terms
             ORDER BY is_active DESC, starts_on DESC NULLS LAST, term_id DESC`,
        );
        const requestedTermId = parsePositiveInteger(req.query.termId);
        const activeTerm = termsResult.rows.find((row) => row.is_active);
        const selectedTermId =
            requestedTermId || activeTerm?.term_id || termsResult.rows[0]?.term_id;

        const [positionsResult, puroksResult, assignmentsResult] =
            await Promise.all([
                pool.query(
                    `SELECT
                        position_id,
                        position_code,
                        position_name,
                        position_group,
                        default_honorific,
                        is_elected,
                        is_signatory_eligible,
                        requires_purok,
                        sort_order
                     FROM barangay_positions
                     WHERE is_active = true
                     ORDER BY sort_order, position_name`,
                ),
                pool.query(
                    `SELECT purok_id, name
                     FROM puroks
                     WHERE is_active = true
                     ORDER BY sort_order, name`,
                ),
                selectedTermId
                    ? pool.query(
                          `SELECT
                              assignment.assignment_id,
                              assignment.personnel_id,
                              assignment.position_id,
                              assignment.term_id,
                              assignment.purok_id,
                              assignment.committee,
                              assignment.title_override,
                              assignment.display_order,
                              assignment.starts_on,
                              assignment.ends_on,
                              assignment.is_active AS assignment_active,
                              (
                                  (assignment.starts_on IS NULL OR assignment.starts_on <= CURRENT_DATE)
                                  AND
                                  (assignment.ends_on IS NULL OR assignment.ends_on >= CURRENT_DATE)
                              ) AS is_current_effective,
                              personnel.full_name,
                              personnel.honorific,
                              personnel.contact_number,
                              personnel.email,
                              personnel.photo_url,
                              personnel.signature_data,
                              personnel.notes AS personnel_notes,
                              position.position_code,
                              position.position_name,
                              position.position_group,
                              position.default_honorific,
                              position.is_signatory_eligible,
                              position.requires_purok,
                              position.sort_order AS position_sort_order,
                              term.term_name,
                              purok.name AS purok_name
                           FROM barangay_personnel_assignments assignment
                           JOIN barangay_personnel personnel
                             ON personnel.personnel_id = assignment.personnel_id
                           JOIN barangay_positions position
                             ON position.position_id = assignment.position_id
                           JOIN barangay_terms term
                             ON term.term_id = assignment.term_id
                           LEFT JOIN puroks purok
                             ON purok.purok_id = assignment.purok_id
                           WHERE assignment.term_id = $1
                           ORDER BY
                               assignment.is_active DESC,
                               position.sort_order,
                               assignment.display_order,
                               personnel.full_name`,
                          [selectedTermId],
                      )
                    : Promise.resolve({ rows: [] }),
            ]);

        const assignments = assignmentsResult.rows.map(mapAssignment);
        const captainRow = assignmentsResult.rows.find(
            (row) =>
                row.assignment_active !== false &&
                row.is_current_effective &&
                row.position_code === "punong_barangay",
        );
        const kagawadRows = assignmentsResult.rows.filter(
            (row) =>
                row.assignment_active !== false &&
                row.is_current_effective &&
                row.position_code === "barangay_kagawad",
        );

        return res.json({
            data: {
                selectedTermId: selectedTermId || null,
                activeTermId: activeTerm?.term_id || null,
                terms: termsResult.rows.map((row) => ({
                    termId: row.term_id,
                    termName: row.term_name,
                    startsOn: row.starts_on,
                    endsOn: row.ends_on,
                    isActive: Boolean(row.is_active),
                    notes: row.notes || "",
                })),
                positions: positionsResult.rows.map((row) => ({
                    positionId: row.position_id,
                    positionCode: row.position_code,
                    positionName: row.position_name,
                    positionGroup: row.position_group,
                    defaultHonorific: row.default_honorific || "",
                    isElected: Boolean(row.is_elected),
                    signatoryEligible: Boolean(row.is_signatory_eligible),
                    requiresPurok: Boolean(row.requires_purok),
                    sortOrder: row.sort_order || 0,
                })),
                puroks: puroksResult.rows.map((row) => ({
                    purokId: row.purok_id,
                    name: row.name,
                })),
                assignments,
                signatories: {
                    captain: captainRow ? toSnapshot(captainRow) : null,
                    kagawads: kagawadRows.map(toSnapshot),
                },
            },
        });
    } catch (err) {
        console.error("getPersonnelRoster error:", err);
        if (err?.code === "42P01" || err?.code === "42703") {
            return res.status(503).json({
                message:
                    "Run database/barangay_personnel_management.sql in Supabase first",
            });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

async function createPersonnelAssignment(req, res) {
    if (!ensureAdmin(req, res)) return;

    const body = req.body || {};
    const fullName = String(body.fullName || "").trim();
    const positionId = parsePositiveInteger(body.positionId);
    const termId = parsePositiveInteger(body.termId);
    const purokId = parsePositiveInteger(body.purokId);

    if (!fullName || !positionId || !termId) {
        return res.status(400).json({
            message: "Full name, position, and administration term are required",
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const personResult = await client.query(
            `INSERT INTO barangay_personnel (
                full_name,
                honorific,
                contact_number,
                email,
                photo_url,
                signature_data,
                notes,
                is_active
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, true)
             ON CONFLICT (full_name) DO UPDATE
             SET honorific = EXCLUDED.honorific,
                 contact_number = EXCLUDED.contact_number,
                 email = EXCLUDED.email,
                 photo_url = EXCLUDED.photo_url,
                 signature_data = EXCLUDED.signature_data,
                 notes = EXCLUDED.notes,
                 is_active = true,
                 updated_at = now()
             RETURNING personnel_id`,
            [
                fullName,
                String(body.honorific || "").trim() || null,
                String(body.contactNumber || "").trim() || null,
                String(body.email || "").trim() || null,
                String(body.photoUrl || "").trim() || null,
                String(body.signatureData || "").trim() || null,
                String(body.notes || "").trim() || null,
            ],
        );
        const personnelId = personResult.rows[0].personnel_id;

        const existingAssignment = await client.query(
            `SELECT assignment_id
             FROM barangay_personnel_assignments
             WHERE personnel_id = $1
               AND position_id = $2
               AND term_id = $3
               AND purok_id IS NOT DISTINCT FROM $4
             LIMIT 1`,
            [personnelId, positionId, termId, purokId],
        );

        const assignmentResult = existingAssignment.rowCount
            ? await client.query(
                  `UPDATE barangay_personnel_assignments
                   SET committee = $2,
                       title_override = $3,
                       starts_on = $4,
                       ends_on = $5,
                       is_active = true,
                       updated_at = now()
                   WHERE assignment_id = $1
                   RETURNING assignment_id`,
                  [
                      existingAssignment.rows[0].assignment_id,
                      String(body.committee || "").trim() || null,
                      String(body.titleOverride || "").trim() || null,
                      parseOptionalDate(body.startsOn),
                      parseOptionalDate(body.endsOn),
                  ],
              )
            : await client.query(
                  `INSERT INTO barangay_personnel_assignments (
                      personnel_id,
                      position_id,
                      term_id,
                      purok_id,
                      committee,
                      title_override,
                      display_order,
                      starts_on,
                      ends_on,
                      is_active
                   )
                   VALUES (
                       $1,
                       $2,
                       $3,
                       $4,
                       $5,
                       $6,
                       (
                           SELECT COALESCE(MAX(display_order), 0) + 1
                           FROM barangay_personnel_assignments
                           WHERE term_id = $3
                       ),
                       $7,
                       $8,
                       true
                   )
                   RETURNING assignment_id`,
            [
                personnelId,
                positionId,
                termId,
                purokId,
                String(body.committee || "").trim() || null,
                String(body.titleOverride || "").trim() || null,
                parseOptionalDate(body.startsOn),
                parseOptionalDate(body.endsOn),
            ],
              );
        await client.query("COMMIT");

        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "personnel_create",
            targetTable: "barangay_personnel_assignments",
            targetId: assignmentResult.rows[0].assignment_id,
            description: `Added ${fullName} to the barangay personnel roster`,
            ipAddress: req.ip,
        });

        return res.status(201).json({
            message: "Personnel assignment saved",
            assignmentId: assignmentResult.rows[0].assignment_id,
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("createPersonnelAssignment error:", err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

async function updatePersonnelAssignment(req, res) {
    if (!ensureAdmin(req, res)) return;

    const assignmentId = parsePositiveInteger(req.params.id);
    if (!assignmentId) {
        return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const body = req.body || {};
    const fullName = String(body.fullName || "").trim();
    const positionId = parsePositiveInteger(body.positionId);
    const termId = parsePositiveInteger(body.termId);
    const purokId = parsePositiveInteger(body.purokId);
    if (!fullName || !positionId || !termId) {
        return res.status(400).json({
            message: "Full name, position, and administration term are required",
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const current = await client.query(
            `SELECT personnel_id
             FROM barangay_personnel_assignments
             WHERE assignment_id = $1
             FOR UPDATE`,
            [assignmentId],
        );
        if (current.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Assignment not found" });
        }

        await client.query(
            `UPDATE barangay_personnel
             SET full_name = $2,
                 honorific = $3,
                 contact_number = $4,
                 email = $5,
                 photo_url = $6,
                 signature_data = $7,
                 notes = $8,
                 is_active = $9,
                 updated_at = now()
             WHERE personnel_id = $1`,
            [
                current.rows[0].personnel_id,
                fullName,
                String(body.honorific || "").trim() || null,
                String(body.contactNumber || "").trim() || null,
                String(body.email || "").trim() || null,
                String(body.photoUrl || "").trim() || null,
                String(body.signatureData || "").trim() || null,
                String(body.notes || "").trim() || null,
                body.isActive !== false,
            ],
        );

        await client.query(
            `UPDATE barangay_personnel_assignments
             SET position_id = $2,
                 term_id = $3,
                 purok_id = $4,
                 committee = $5,
                 title_override = $6,
                 starts_on = $7,
                 ends_on = $8,
                 is_active = $9,
                 updated_at = now()
             WHERE assignment_id = $1`,
            [
                assignmentId,
                positionId,
                termId,
                purokId,
                String(body.committee || "").trim() || null,
                String(body.titleOverride || "").trim() || null,
                parseOptionalDate(body.startsOn),
                parseOptionalDate(body.endsOn),
                body.isActive !== false,
            ],
        );
        await client.query("COMMIT");

        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "personnel_update",
            targetTable: "barangay_personnel_assignments",
            targetId: assignmentId,
            description: `Updated personnel assignment for ${fullName}`,
            ipAddress: req.ip,
        });

        return res.json({ message: "Personnel assignment updated" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("updatePersonnelAssignment error:", err);
        if (err?.code === "23505") {
            return res.status(409).json({
                message: "That person or assignment already exists",
            });
        }
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

async function createPersonnelTerm(req, res) {
    if (!ensureAdmin(req, res)) return;

    const body = req.body || {};
    const termName = String(body.termName || "").trim();
    if (!termName) {
        return res.status(400).json({ message: "Term name is required" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const currentActiveResult = await client.query(
            `SELECT term_id
             FROM barangay_terms
             WHERE is_active = true
             LIMIT 1`,
        );
        const activate = body.isActive !== false;
        if (activate) {
            await client.query(
                `UPDATE barangay_terms
                 SET is_active = false,
                     updated_at = now()
                 WHERE is_active = true`,
            );
        }

        const termResult = await client.query(
            `INSERT INTO barangay_terms (
                term_name,
                starts_on,
                ends_on,
                is_active,
                notes
             )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING term_id`,
            [
                termName,
                parseOptionalDate(body.startsOn),
                parseOptionalDate(body.endsOn),
                activate,
                String(body.notes || "").trim() || null,
            ],
        );
        const termId = termResult.rows[0].term_id;

        if (body.copyCurrentRoster && currentActiveResult.rows[0]?.term_id) {
            await client.query(
                `INSERT INTO barangay_personnel_assignments (
                    personnel_id,
                    position_id,
                    term_id,
                    purok_id,
                    committee,
                    title_override,
                    display_order,
                    starts_on,
                    ends_on,
                    is_active
                 )
                 SELECT
                    personnel_id,
                    position_id,
                    $1,
                    purok_id,
                    committee,
                    title_override,
                    display_order,
                    $2,
                    NULL,
                    is_active
                 FROM barangay_personnel_assignments
                 WHERE term_id = $3`,
                [
                    termId,
                    parseOptionalDate(body.startsOn),
                    currentActiveResult.rows[0].term_id,
                ],
            );
        }

        await client.query("COMMIT");

        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "personnel_term_create",
            targetTable: "barangay_terms",
            targetId: termId,
            description: `Created barangay administration term ${termName}`,
            ipAddress: req.ip,
        });

        return res.status(201).json({
            message: "Administration term created",
            termId,
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("createPersonnelTerm error:", err);
        if (err?.code === "23505") {
            return res
                .status(409)
                .json({ message: "A term with that name already exists" });
        }
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

async function activatePersonnelTerm(req, res) {
    if (!ensureAdmin(req, res)) return;

    const termId = parsePositiveInteger(req.params.id);
    if (!termId) {
        return res.status(400).json({ message: "Invalid term ID" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `UPDATE barangay_terms
             SET is_active = false,
                 updated_at = now()
             WHERE is_active = true`,
        );
        const result = await client.query(
            `UPDATE barangay_terms
             SET is_active = true,
                 updated_at = now()
             WHERE term_id = $1
             RETURNING term_name`,
            [termId],
        );
        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Term not found" });
        }
        await client.query("COMMIT");

        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "personnel_term_activate",
            targetTable: "barangay_terms",
            targetId: termId,
            description: `Activated barangay administration term ${result.rows[0].term_name}`,
            ipAddress: req.ip,
        });

        return res.json({ message: "Administration term activated" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("activatePersonnelTerm error:", err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
}

async function saveRequestSignatories(req, res) {
    const requestId = parsePositiveInteger(req.params.id);
    if (!requestId) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    try {
        const snapshot = await buildSignatorySnapshot(
            req.body?.signatorySelections || {},
        );
        const result = await pool.query(
            `UPDATE requests
             SET signatory_snapshot = $2::jsonb
             WHERE request_id = $1
             RETURNING request_id, signatory_snapshot`,
            [requestId, JSON.stringify(snapshot)],
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        await createAuditLog({
            actorId: req.admin.id,
            actorName: req.admin.username,
            actorRole: req.admin.role,
            actionType: "request_signatories_update",
            targetTable: "requests",
            targetId: requestId,
            description: `Selected certificate signatories for request #${requestId}`,
            ipAddress: req.ip,
        });

        return res.json({
            message: "Certificate signatories saved",
            data: result.rows[0].signatory_snapshot,
        });
    } catch (err) {
        console.error("saveRequestSignatories error:", err);
        if (err?.code === "42P01" || err?.code === "42703") {
            return res.status(503).json({
                message:
                    "Run database/barangay_personnel_management.sql in Supabase first",
            });
        }
        return res
            .status(err?.statusCode || 500)
            .json({ message: err?.message || "Server error" });
    }
}

module.exports = {
    getPersonnelRoster,
    createPersonnelAssignment,
    updatePersonnelAssignment,
    createPersonnelTerm,
    activatePersonnelTerm,
    saveRequestSignatories,
};
