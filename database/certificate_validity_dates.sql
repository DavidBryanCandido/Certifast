-- Certificate validity dates for issued and printed certificates.
-- In Supabase SQL Editor, paste and run the whole file from this first line.

ALTER TABLE issued_certificates
    ADD COLUMN IF NOT EXISTS issued_date date,
    ADD COLUMN IF NOT EXISTS valid_until date,
    ADD COLUMN IF NOT EXISTS validity_months integer,
    ADD COLUMN IF NOT EXISTS validity_rule text;

COMMENT ON COLUMN issued_certificates.issued_date IS
    'Barangay-local effective date shown on the printed certificate.';

COMMENT ON COLUMN issued_certificates.valid_until IS
    'Barangay-local expiry date shown on the printed certificate.';

COMMENT ON COLUMN issued_certificates.validity_months IS
    'Number of calendar months used to calculate valid_until from issued_date.';

COMMENT ON COLUMN issued_certificates.validity_rule IS
    'Named rule used for certificate validity, such as business_1_year or standard_1_month.';

UPDATE issued_certificates
SET issued_date = COALESCE(issued_date, issued_at::date)
WHERE issued_date IS NULL
  AND issued_at IS NOT NULL;

