-- Run in Supabase SQL Editor if ID uploads fail with:
-- "new row violates row-level security policy" on storage.objects
--
-- Bucket: certifast-uploads
-- Path pattern: resident-ids/{auth.uid()}.jpg | .png | .webp
--
-- 1) Dashboard → Storage → certifast-uploads → Policies — enable RLS and add policies below.
-- 2) Ensure the bucket exists. Public bucket still requires INSERT policies for authenticated users.

-- Drop old policies if you are re-running (ignore errors if they don't exist)
-- DROP POLICY IF EXISTS "Residents upload own ID file" ON storage.objects;
-- DROP POLICY IF EXISTS "Residents update own ID file" ON storage.objects;

-- Allow authenticated users to insert only files named resident-ids/{their uid}.*
CREATE POLICY "Residents upload own ID file"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certifast-uploads'
  AND name ~ ('^resident-ids/' || auth.uid()::text || '\.(jpg|jpeg|png|webp)$')
);

CREATE POLICY "Residents update own ID file"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certifast-uploads'
  AND name ~ ('^resident-ids/' || auth.uid()::text || '\.(jpg|jpeg|png|webp)$')
)
WITH CHECK (
  bucket_id = 'certifast-uploads'
  AND name ~ ('^resident-ids/' || auth.uid()::text || '\.(jpg|jpeg|png|webp)$')
);
