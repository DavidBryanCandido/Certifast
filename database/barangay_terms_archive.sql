-- Adds reversible archive support for draft/test administration terms.
-- Safe to run more than once in the Supabase SQL Editor.

ALTER TABLE barangay_terms
    ADD COLUMN IF NOT EXISTS archived_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS archived_by integer,
    ADD COLUMN IF NOT EXISTS archive_reason text;

CREATE INDEX IF NOT EXISTS barangay_terms_archived_idx
    ON barangay_terms (archived_at);
