-- Resident registration proof upload support for CertiFast.
-- Run this in Supabase SQL Editor before deploying the matching app changes.
--
-- Bucket used by the app: certifast-uploads
-- Path pattern: resident-proofs/{auth.uid()}.jpg | .jpeg | .png | .webp | .pdf

ALTER TABLE residents
    ADD COLUMN IF NOT EXISTS residency_proof_url text,
    ADD COLUMN IF NOT EXISTS residency_proof_file_name text,
    ADD COLUMN IF NOT EXISTS residency_proof_mime_type text,
    ADD COLUMN IF NOT EXISTS residency_proof_file_size integer;

CREATE INDEX IF NOT EXISTS idx_residents_residency_proof_required
    ON residents (status, is_renter)
    WHERE is_renter = true;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Residents upload own residency proof file'
    ) THEN
        CREATE POLICY "Residents upload own residency proof file"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'certifast-uploads'
            AND name ~ ('^resident-proofs/' || auth.uid()::text || '\.(jpg|jpeg|png|webp|pdf)$')
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Residents update own residency proof file'
    ) THEN
        CREATE POLICY "Residents update own residency proof file"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'certifast-uploads'
            AND name ~ ('^resident-proofs/' || auth.uid()::text || '\.(jpg|jpeg|png|webp|pdf)$')
        )
        WITH CHECK (
            bucket_id = 'certifast-uploads'
            AND name ~ ('^resident-proofs/' || auth.uid()::text || '\.(jpg|jpeg|png|webp|pdf)$')
        );
    END IF;
END $$;
