-- Establish the initial CertiFast system owner.
--
-- If the database already has an active superadmin, this does nothing.
-- Otherwise, it promotes the oldest active admin account. Review the selected
-- account in Manage Accounts after running this migration.

DO $$
DECLARE
    initial_superadmin_id integer;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.admin_accounts
        WHERE LOWER(role) = 'superadmin'
          AND status = 'active'
    ) THEN
        SELECT admin_id
        INTO initial_superadmin_id
        FROM public.admin_accounts
        WHERE LOWER(role) = 'admin'
          AND status = 'active'
        ORDER BY created_at ASC NULLS LAST, admin_id ASC
        LIMIT 1;

        IF initial_superadmin_id IS NULL THEN
            RAISE EXCEPTION
                'No active admin account exists to promote to superadmin';
        END IF;

        UPDATE public.admin_accounts
        SET role = 'superadmin'
        WHERE admin_id = initial_superadmin_id;
    END IF;
END
$$;
