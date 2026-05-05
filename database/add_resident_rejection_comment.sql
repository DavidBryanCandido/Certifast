-- Add resident review fields for admin approval / denial.
-- Safe to run more than once in the Supabase SQL Editor.

ALTER TABLE residents
ADD COLUMN IF NOT EXISTS rejection_comment text,
ADD COLUMN IF NOT EXISTS verified_by integer,
ADD COLUMN IF NOT EXISTS verified_at timestamp without time zone;
