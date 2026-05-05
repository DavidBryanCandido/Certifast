-- Run in Supabase SQL Editor if ID uploads fail with:
-- "new row violates row-level security policy" on storage.objects
--
-- Bucket: certifast-uploads
-- Path pattern: resident-ids/{auth.uid()}.jpg | .png | .webp
--
-- 1) Ensure the bucket exists and is public (or use signed URLs — your app uses getPublicUrl).

-- 2) Allow authenticated users to upload only their own file in resident-ids/
CREATE POLICY "Residents upload own ID file"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certifast-uploads'
  AND (storage.foldername(name))[1] = 'resident-ids'
  AND name IN (
    'resident-ids/' || auth.uid()::text || '.jpg',
    'resident-ids/' || auth.uid()::text || '.png',
    'resident-ids/' || auth.uid()::text || '.webp'
  )
);

-- 3) Optional: allow user to update/replace the same object
CREATE POLICY "Residents update own ID file"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certifast-uploads'
  AND (storage.foldername(name))[1] = 'resident-ids'
  AND (name = 'resident-ids/' || auth.uid()::text || '.jpg'
    OR name = 'resident-ids/' || auth.uid()::text || '.png'
    OR name = 'resident-ids/' || auth.uid()::text || '.webp')
)
WITH CHECK (
  bucket_id = 'certifast-uploads'
  AND (storage.foldername(name))[1] = 'resident-ids'
);

-- If policies already exist with the same name, drop them first or rename.
