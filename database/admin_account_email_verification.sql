-- Link CertiFast staff/admin records to their Supabase Auth users.
-- Run this once in the Supabase SQL Editor before deploying the matching code.

ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS supabase_auth_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS admin_accounts_supabase_auth_id_unique
ON public.admin_accounts (supabase_auth_id)
WHERE supabase_auth_id IS NOT NULL;

COMMENT ON COLUMN public.admin_accounts.supabase_auth_id IS
'Supabase Auth user UUID. Accounts with this value must verify their email before admin login.';
