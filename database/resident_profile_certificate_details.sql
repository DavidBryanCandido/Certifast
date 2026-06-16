-- Resident profile certificate detail storage for CertiFast.
-- Run in the Supabase SQL Editor after the resident table exists.

ALTER TABLE residents
    ADD COLUMN IF NOT EXISTS profile_details jsonb DEFAULT '{}'::jsonb;

UPDATE residents
SET profile_details = '{}'::jsonb
WHERE profile_details IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Residents upload own profile files'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Residents upload own profile files"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'certifast-uploads'
        AND name LIKE ('resident-profile/' || auth.uid()::text || '/%')
      )
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Residents read own profile files'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Residents read own profile files"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'certifast-uploads'
        AND name LIKE ('resident-profile/' || auth.uid()::text || '/%')
      )
    $policy$;
  END IF;
END $$;
