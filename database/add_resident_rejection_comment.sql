-- Add a resident-level comment for denied / not activated accounts.
-- Run this once in the Supabase SQL Editor before deploying the admin review UI.

ALTER TABLE residents
ADD COLUMN IF NOT EXISTS rejection_comment text;
