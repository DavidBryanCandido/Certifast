-- Cleanup for request proof requirements after resident ID verification was separated
-- from certificate-specific supporting documents.
-- Run this if the earlier proof SQL added valid_id/address_proof requirements.

ALTER TABLE certificate_templates
    ADD COLUMN IF NOT EXISTS proof_requirements jsonb DEFAULT '[]'::jsonb;

-- Basic resident identity/residency is already verified during account activation.
UPDATE certificate_templates
SET proof_requirements = '[]'::jsonb
WHERE template_key IN (
    'doc1-barangay-clearance',
    'doc1-certificate-residency',
    'doc1-cohabitation'
);

UPDATE certificate_templates
SET proof_requirements = '[{"key":"request_letter","label":"Request letter or agency requirement document","required":true,"accept":"image/*,.pdf"}]'::jsonb
WHERE template_key IN (
    'doc1-household-angkas-pass',
    'doc1-lockdown-residency-certification',
    'doc1-simple-residency-loan',
    'doc2-residency-bank-record',
    'doc2-centenarian-living-veteran',
    'doc3-senior-alive-well'
);

UPDATE certificate_templates
SET proof_requirements = '[{"key":"travel_documents","label":"Travel, repatriation, or destination document","required":true,"accept":"image/*,.pdf"}]'::jsonb
WHERE template_key IN (
    'doc1-acceptance-letter-quarantine',
    'doc1-undertaking-quarantine'
);

UPDATE certificate_templates
SET proof_requirements = '[{"key":"school_documents","label":"School requirement, enrollment, or assessment document","required":true,"accept":"image/*,.pdf"}]'::jsonb
WHERE template_key = 'doc2-residency-school-requirement';

UPDATE certificate_templates
SET proof_requirements = '[{"key":"guardianship_documents","label":"Birth record, guardianship proof, or authorization document","required":true,"accept":"image/*,.pdf"}]'::jsonb
WHERE template_key IN (
    'doc1-guardianship',
    'doc2-guardian-psa-certification'
);

UPDATE certificate_templates
SET proof_requirements = '[{"key":"medical_documents","label":"Medical certificate, bill, or hospital document","required":true,"accept":"image/*,.pdf"},{"key":"guardianship_documents","label":"Birth record, guardianship proof, or authorization document","required":true,"accept":"image/*,.pdf"}]'::jsonb
WHERE template_key = 'doc2-indigency-guardian-medical';

UPDATE certificate_templates
SET proof_requirements = '[{"key":"guardianship_documents","label":"Birth record, guardianship proof, or authorization document","required":true,"accept":"image/*,.pdf"},{"key":"travel_documents","label":"Travel, repatriation, or destination document","required":true,"accept":"image/*,.pdf"}]'::jsonb
WHERE template_key = 'doc3-sole-guardian-travel-assistance';
