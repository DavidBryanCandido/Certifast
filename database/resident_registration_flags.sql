-- Resident registration additions for renter/non-matching ID and terms consent.

ALTER TABLE residents
ADD COLUMN IF NOT EXISTS is_renter boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS agreed_to_terms boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_agreed_at timestamp without time zone;

