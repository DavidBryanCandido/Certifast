-- CertiFast: Barangay East Tapinac purok-to-street mapping.
-- Run this after database/east_tapinac_charter_guidance_address_seed.sql.
-- The seed rows are best-effort from the provided East Tapinac purok map and
-- are intentionally kept in one VALUES block for easy barangay correction.

CREATE TABLE IF NOT EXISTS purok_streets (
    purok_id integer NOT NULL,
    street_id integer NOT NULL,
    is_active boolean DEFAULT TRUE NOT NULL,
    sort_order smallint DEFAULT 0 NOT NULL,
    source_note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (purok_id, street_id)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'purok_streets_purok_id_fkey'
    ) THEN
        ALTER TABLE purok_streets
            ADD CONSTRAINT purok_streets_purok_id_fkey
            FOREIGN KEY (purok_id) REFERENCES puroks(purok_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'purok_streets_street_id_fkey'
    ) THEN
        ALTER TABLE purok_streets
            ADD CONSTRAINT purok_streets_street_id_fkey
            FOREIGN KEY (street_id) REFERENCES streets(street_id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS purok_streets_purok_active_idx
    ON purok_streets (purok_id, is_active, sort_order, street_id);

CREATE INDEX IF NOT EXISTS purok_streets_street_active_idx
    ON purok_streets (street_id, is_active, sort_order, purok_id);

WITH best_effort_mappings(purok_name, street_name, sort_order) AS (
    VALUES
    ('Purok 1', 'Fendler Street', 1),
    ('Purok 1', 'Gallagher Street', 2),
    ('Purok 1', 'Hansen Street', 3),
    ('Purok 1', 'Irving Street', 4),
    ('Purok 1', '12th Street', 5),
    ('Purok 1', '13th Street', 6),
    ('Purok 1', '14th Street', 7),

    ('Purok 2', 'Donor Street', 1),
    ('Purok 2', 'Fendler Street', 2),
    ('Purok 2', 'Gallagher Street', 3),
    ('Purok 2', 'Hansen Street', 4),
    ('Purok 2', '14th Street', 5),
    ('Purok 2', '16th Street', 6),

    ('Purok 3', 'Cruz Dela Drive', 1),
    ('Purok 3', 'Coll Street', 2),
    ('Purok 3', 'Donor Street', 3),
    ('Purok 3', 'Fontain Extension Street', 4),
    ('Purok 3', '14th Street', 5),
    ('Purok 3', '16th Street', 6),

    ('Purok 4', 'Donor Street', 1),
    ('Purok 4', 'Fendler Street', 2),
    ('Purok 4', 'Fontain Extension Street', 3),
    ('Purok 4', 'Gallagher Street', 4),
    ('Purok 4', 'Hansen Street', 5),
    ('Purok 4', '14th Street', 6),
    ('Purok 4', '16th Street', 7),

    ('Purok 5', 'Bacon Street', 1),
    ('Purok 5', 'Donor Street', 2),
    ('Purok 5', 'Espiritu Street', 3),
    ('Purok 5', 'Fendler Street', 4),
    ('Purok 5', 'Fontain Extension Street', 5),
    ('Purok 5', '14th Street', 6),
    ('Purok 5', '16th Street', 7),

    ('Purok 6', 'Donor Street', 1),
    ('Purok 6', 'Fendler Street', 2),
    ('Purok 6', 'Gallagher Street', 3),
    ('Purok 6', 'Hansen Street', 4),
    ('Purok 6', '12th Street', 5),
    ('Purok 6', '13th Street', 6),
    ('Purok 6', '14th Street', 7),
    ('Purok 6', '16th Street', 8),

    ('Purok 7', 'Fendler Street', 1),
    ('Purok 7', 'Gallagher Street', 2),
    ('Purok 7', 'Hansen Street', 3),
    ('Purok 7', 'Irving Street', 4),
    ('Purok 7', '12th Street', 5),
    ('Purok 7', '13th Street', 6),
    ('Purok 7', '14th Street', 7),

    ('Purok 8', 'Apelado Street', 1),
    ('Purok 8', 'Bacon Street', 2),
    ('Purok 8', 'Espiritu Street', 3),
    ('Purok 8', 'Fendler Street', 4),
    ('Purok 8', '8th Street', 5),
    ('Purok 8', '9th Street', 6),
    ('Purok 8', '10th Street', 7),

    ('Purok 9', 'Fendler Street', 1),
    ('Purok 9', 'Gallagher Street', 2),
    ('Purok 9', 'Hansen Street', 3),
    ('Purok 9', 'Irving Street', 4),
    ('Purok 9', '10th Street', 5),
    ('Purok 9', '12th Street', 6),

    ('Purok 10', 'Bacon Street', 1),
    ('Purok 10', 'Espiritu Street', 2),
    ('Purok 10', 'Fendler Street', 3),
    ('Purok 10', '8th Street', 4),
    ('Purok 10', '9th Street', 5),
    ('Purok 10', '10th Street', 6),

    ('Purok 11', 'Acayan Street', 1),
    ('Purok 11', 'Apelado Street', 2),
    ('Purok 11', 'Fendler Street', 3),
    ('Purok 11', 'Fendler Extension Street', 4),
    ('Purok 11', '5th Street', 5),
    ('Purok 11', '6th Street', 6)
),
resolved AS (
    SELECT p.purok_id,
           s.street_id,
           best_effort_mappings.sort_order
    FROM best_effort_mappings
    JOIN puroks p
      ON lower(p.name) = lower(best_effort_mappings.purok_name)
    JOIN streets s
      ON lower(s.name) = lower(best_effort_mappings.street_name)
)
INSERT INTO purok_streets (
    purok_id,
    street_id,
    is_active,
    sort_order,
    source_note
)
SELECT purok_id,
       street_id,
       TRUE,
       sort_order,
       'best-effort from provided East Tapinac purok map'
FROM resolved
ON CONFLICT (purok_id, street_id)
DO UPDATE SET
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    source_note = EXCLUDED.source_note;

WITH best_effort_mappings(purok_name, street_name) AS (
    VALUES
    ('Purok 1', 'Fendler Street'),
    ('Purok 1', 'Gallagher Street'),
    ('Purok 1', 'Hansen Street'),
    ('Purok 1', 'Irving Street'),
    ('Purok 1', '12th Street'),
    ('Purok 1', '13th Street'),
    ('Purok 1', '14th Street'),
    ('Purok 2', 'Donor Street'),
    ('Purok 2', 'Fendler Street'),
    ('Purok 2', 'Gallagher Street'),
    ('Purok 2', 'Hansen Street'),
    ('Purok 2', '14th Street'),
    ('Purok 2', '16th Street'),
    ('Purok 3', 'Cruz Dela Drive'),
    ('Purok 3', 'Coll Street'),
    ('Purok 3', 'Donor Street'),
    ('Purok 3', 'Fontain Extension Street'),
    ('Purok 3', '14th Street'),
    ('Purok 3', '16th Street'),
    ('Purok 4', 'Donor Street'),
    ('Purok 4', 'Fendler Street'),
    ('Purok 4', 'Fontain Extension Street'),
    ('Purok 4', 'Gallagher Street'),
    ('Purok 4', 'Hansen Street'),
    ('Purok 4', '14th Street'),
    ('Purok 4', '16th Street'),
    ('Purok 5', 'Bacon Street'),
    ('Purok 5', 'Donor Street'),
    ('Purok 5', 'Espiritu Street'),
    ('Purok 5', 'Fendler Street'),
    ('Purok 5', 'Fontain Extension Street'),
    ('Purok 5', '14th Street'),
    ('Purok 5', '16th Street'),
    ('Purok 6', 'Donor Street'),
    ('Purok 6', 'Fendler Street'),
    ('Purok 6', 'Gallagher Street'),
    ('Purok 6', 'Hansen Street'),
    ('Purok 6', '12th Street'),
    ('Purok 6', '13th Street'),
    ('Purok 6', '14th Street'),
    ('Purok 6', '16th Street'),
    ('Purok 7', 'Fendler Street'),
    ('Purok 7', 'Gallagher Street'),
    ('Purok 7', 'Hansen Street'),
    ('Purok 7', 'Irving Street'),
    ('Purok 7', '12th Street'),
    ('Purok 7', '13th Street'),
    ('Purok 7', '14th Street'),
    ('Purok 8', 'Apelado Street'),
    ('Purok 8', 'Bacon Street'),
    ('Purok 8', 'Espiritu Street'),
    ('Purok 8', 'Fendler Street'),
    ('Purok 8', '8th Street'),
    ('Purok 8', '9th Street'),
    ('Purok 8', '10th Street'),
    ('Purok 9', 'Fendler Street'),
    ('Purok 9', 'Gallagher Street'),
    ('Purok 9', 'Hansen Street'),
    ('Purok 9', 'Irving Street'),
    ('Purok 9', '10th Street'),
    ('Purok 9', '12th Street'),
    ('Purok 10', 'Bacon Street'),
    ('Purok 10', 'Espiritu Street'),
    ('Purok 10', 'Fendler Street'),
    ('Purok 10', '8th Street'),
    ('Purok 10', '9th Street'),
    ('Purok 10', '10th Street'),
    ('Purok 11', 'Acayan Street'),
    ('Purok 11', 'Apelado Street'),
    ('Purok 11', 'Fendler Street'),
    ('Purok 11', 'Fendler Extension Street'),
    ('Purok 11', '5th Street'),
    ('Purok 11', '6th Street')
),
resolved AS (
    SELECT p.purok_id,
           s.street_id
    FROM best_effort_mappings
    JOIN puroks p
      ON lower(p.name) = lower(best_effort_mappings.purok_name)
    JOIN streets s
      ON lower(s.name) = lower(best_effort_mappings.street_name)
)
UPDATE purok_streets ps
SET is_active = FALSE
WHERE ps.source_note = 'best-effort from provided East Tapinac purok map'
  AND NOT EXISTS (
      SELECT 1
      FROM resolved
      WHERE resolved.purok_id = ps.purok_id
        AND resolved.street_id = ps.street_id
  );
