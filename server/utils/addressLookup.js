const ADDRESS_MAPPING_SETUP_MESSAGE =
    "Address street-purok mapping is not initialized. Run database/purok_street_mappings.sql first.";

function parsePositiveId(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isAddressMappingMissingError(err) {
    return err?.code === "42P01" && /purok_streets/i.test(err?.message || "");
}

async function resolvePurokStreetPair(pool, { purokId, streetId }) {
    const resolvedPurokId = parsePositiveId(purokId);
    const resolvedStreetId = parsePositiveId(streetId);

    if (!resolvedStreetId) {
        return {
            ok: false,
            status: 400,
            message: "Please select your street.",
        };
    }

    if (!resolvedPurokId) {
        const result = await pool.query(
            `SELECT NULL::integer AS purok_id,
                    NULL::text AS purok_name,
                    s.street_id,
                    s.name AS street_name
             FROM streets s
             WHERE s.street_id = $1
               AND s.is_active = TRUE
             LIMIT 1`,
            [resolvedStreetId],
        );

        if (!result.rows.length) {
            return {
                ok: false,
                status: 400,
                message: "Selected street is not available.",
            };
        }

        return {
            ok: true,
            address: result.rows[0],
        };
    }

    const result = await pool.query(
        `SELECT ps.purok_id,
                p.name AS purok_name,
                ps.street_id,
                s.name AS street_name
         FROM purok_streets ps
         JOIN puroks p ON p.purok_id = ps.purok_id
         JOIN streets s ON s.street_id = ps.street_id
         WHERE ps.purok_id = $1
           AND ps.street_id = $2
           AND ps.is_active = TRUE
           AND p.is_active = TRUE
           AND s.is_active = TRUE
         LIMIT 1`,
        [resolvedPurokId, resolvedStreetId],
    );

    if (!result.rows.length) {
        const mappingCount = await pool.query(
            "SELECT COUNT(*)::int AS count FROM purok_streets WHERE is_active = TRUE",
        );
        if (Number(mappingCount.rows[0]?.count || 0) === 0) {
            const fallbackResult = await pool.query(
                `SELECT p.purok_id,
                        p.name AS purok_name,
                        s.street_id,
                        s.name AS street_name
                 FROM streets s
                 LEFT JOIN puroks p
                   ON p.purok_id = $2
                  AND p.is_active = TRUE
                 WHERE s.street_id = $1
                   AND s.is_active = TRUE
                   AND ($2::int IS NULL OR p.purok_id IS NOT NULL)
                 LIMIT 1`,
                [resolvedStreetId, resolvedPurokId],
            );

            if (fallbackResult.rows.length) {
                return {
                    ok: true,
                    address: fallbackResult.rows[0],
                };
            }
        }

        return {
            ok: false,
            status: 400,
            message: "Selected street is not assigned to the selected purok.",
        };
    }

    return {
        ok: true,
        address: result.rows[0],
    };
}

module.exports = {
    ADDRESS_MAPPING_SETUP_MESSAGE,
    isAddressMappingMissingError,
    parsePositiveId,
    resolvePurokStreetPair,
};
