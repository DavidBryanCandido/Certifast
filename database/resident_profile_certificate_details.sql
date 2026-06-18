-- Resident profile certificate detail storage for CertiFast.
-- Run in the Supabase SQL Editor after the resident table exists.

ALTER TABLE residents
    ADD COLUMN IF NOT EXISTS profile_details jsonb DEFAULT '{}'::jsonb;

UPDATE residents
SET profile_details = '{}'::jsonb
WHERE profile_details IS NULL;

UPDATE storage.buckets
SET allowed_mime_types = (
    SELECT array_agg(DISTINCT mime_type)
    FROM unnest(
        allowed_mime_types
        || ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
    ) AS allowed_mimes(mime_type)
)
WHERE id = 'certifast-uploads'
  AND allowed_mime_types IS NOT NULL;

DROP POLICY IF EXISTS "Residents upload own profile files" ON storage.objects;
DROP POLICY IF EXISTS "Residents read own profile files" ON storage.objects;

DO $$
BEGIN
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
END $$;
