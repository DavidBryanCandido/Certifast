-- Add configurable certificate fee amounts.
-- Run this in Supabase SQL editor before using fee amount controls.

ALTER TABLE certificate_templates
    ADD COLUMN IF NOT EXISTS fee_amount numeric(10, 2);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'certificate_templates_fee_amount_nonnegative'
    ) THEN
        ALTER TABLE certificate_templates
            ADD CONSTRAINT certificate_templates_fee_amount_nonnegative
            CHECK (fee_amount IS NULL OR fee_amount >= 0);
    END IF;
END $$;

COMMENT ON COLUMN certificate_templates.fee_amount IS
    'Optional peso amount residents should bring when this template has_fee is true.';
