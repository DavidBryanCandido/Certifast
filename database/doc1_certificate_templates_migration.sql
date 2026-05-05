-- Doc #1 certificate template migration for CertiFast.
-- In Supabase SQL Editor, paste and run the whole file from this first line.
-- If Supabase warns about RLS for certificate_templates, choose "Run without RLS".

ALTER TABLE certificate_templates
    ADD COLUMN IF NOT EXISTS template_key text,
    ADD COLUMN IF NOT EXISTS variant_label text,
    ADD COLUMN IF NOT EXISTS doc_source text DEFAULT 'doc1',
    ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS required_fields jsonb DEFAULT '[]'::jsonb;

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS extra_fields jsonb DEFAULT '{}'::jsonb;

ALTER TABLE issued_certificates
    ADD COLUMN IF NOT EXISTS template_id integer REFERENCES certificate_templates(template_id),
    ADD COLUMN IF NOT EXISTS extra_fields jsonb DEFAULT '{}'::jsonb;

ALTER TABLE residents
    ADD COLUMN IF NOT EXISTS gender character varying,
    ADD COLUMN IF NOT EXISTS place_of_birth character varying,
    ADD COLUMN IF NOT EXISTS occupation character varying,
    ADD COLUMN IF NOT EXISTS years_of_residency integer;

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES
    ('city_logo_url', '/city-logo.png'),
    ('brgy_logo_url', '/brgy-logo.png'),
    ('kagawad_name', 'Hon. Jojo D. De Leon'),
    ('kagawad_title', 'Barangay Kagawad'),
    ('kagawad_1_name', 'Hon. Crisanta D. Daniel'),
    ('kagawad_1_title', 'Barangay Kagawad'),
    ('kagawad_2_name', 'Hon. Florencia S. Abad'),
    ('kagawad_2_title', 'Barangay Kagawad')
ON CONFLICT (setting_key) DO NOTHING;

-- Reuse existing rows by name first.
UPDATE certificate_templates
SET template_key = 'doc1-barangay-clearance',
    variant_label = 'No derogatory record',
    doc_source = 'doc1',
    has_fee = true,
    description = 'Doc #1 barangay clearance with no derogatory record wording.',
    is_active = true,
    display_order = 10,
    required_fields = '[]'::jsonb
WHERE name = 'Barangay Clearance'
  AND (template_key IS NULL OR template_key = 'doc1-barangay-clearance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Clearance', 'doc1-barangay-clearance', 'No derogatory record', 'doc1', true, 'Doc #1 barangay clearance with no derogatory record wording.', true, 10, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-barangay-clearance');

UPDATE certificate_templates
SET template_key = 'doc1-certificate-residency',
    variant_label = 'Bona fide resident',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 barangay certificate for bona fide residency.',
    is_active = true,
    display_order = 20,
    required_fields = '[]'::jsonb
WHERE name = 'Certificate of Residency'
  AND (template_key IS NULL OR template_key = 'doc1-certificate-residency');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Residency', 'doc1-certificate-residency', 'Bona fide resident', 'doc1', false, 'Doc #1 barangay certificate for bona fide residency.', true, 20, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-certificate-residency');

UPDATE certificate_templates
SET template_key = 'doc1-indigency-medical',
    variant_label = 'Assistance purposes',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 indigency certification for medical, educational, or assistance purposes.',
    is_active = true,
    display_order = 30,
    required_fields = '["requesterName", "requesterRelationship", "assistanceType"]'::jsonb
WHERE name = 'Certificate of Indigency'
  AND (template_key IS NULL OR template_key = 'doc1-indigency-medical');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Indigency', 'doc1-indigency-medical', 'Assistance purposes', 'doc1', false, 'Doc #1 indigency certification for medical, educational, or assistance purposes.', true, 30, '["requesterName", "requesterRelationship", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-indigency-medical');

UPDATE certificate_templates
SET template_key = 'doc1-work-permit-certification',
    variant_label = 'Work/business permit',
    doc_source = 'doc1',
    has_fee = true,
    description = 'Doc #1 certification for work or business permit clearance.',
    is_active = true,
    display_order = 40,
    required_fields = '["businessName", "businessAddress", "businessType", "businessArea"]'::jsonb
WHERE name = 'Business Permit'
  AND (template_key IS NULL OR template_key = 'doc1-work-permit-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Permit', 'doc1-work-permit-certification', 'Work/business permit', 'doc1', true, 'Doc #1 certification for work or business permit clearance.', true, 40, '["businessName", "businessAddress", "businessType", "businessArea"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-work-permit-certification');

UPDATE certificate_templates
SET template_key = 'doc1-good-moral',
    variant_label = 'Good moral and no pending case',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 certification for good moral character and no pending case.',
    is_active = true,
    display_order = 50,
    required_fields = '["requestingInstitution"]'::jsonb
WHERE name = 'Good Moral Certificate'
  AND (template_key IS NULL OR template_key = 'doc1-good-moral');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Good Moral Certificate', 'doc1-good-moral', 'Good moral and no pending case', 'doc1', false, 'Doc #1 certification for good moral character and no pending case.', true, 50, '["requestingInstitution"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-good-moral');

UPDATE certificate_templates
SET template_key = 'doc1-live-birth-endorsement',
    variant_label = 'Late birth registration',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 endorsement for late registration of a minor child.',
    is_active = true,
    display_order = 60,
    required_fields = '["partnerName", "childName", "childDOB", "childBirthPlace", "fatherName", "motherName"]'::jsonb
WHERE name = 'Certificate of Live Birth (Endorsement)'
  AND (template_key IS NULL OR template_key = 'doc1-live-birth-endorsement');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Live Birth (Endorsement)', 'doc1-live-birth-endorsement', 'Late birth registration', 'doc1', false, 'Doc #1 endorsement for late registration of a minor child.', true, 60, '["partnerName", "childName", "childDOB", "childBirthPlace", "fatherName", "motherName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-live-birth-endorsement');

UPDATE certificate_templates
SET template_key = 'doc1-cohabitation',
    variant_label = 'Common-law spouse',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 common-law partner certification.',
    is_active = true,
    display_order = 70,
    required_fields = '["partnerName"]'::jsonb
WHERE name = 'Certificate of Cohabitation'
  AND (template_key IS NULL OR template_key = 'doc1-cohabitation');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Cohabitation', 'doc1-cohabitation', 'Common-law spouse', 'doc1', false, 'Doc #1 common-law partner certification.', true, 70, '["partnerName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-cohabitation');

UPDATE certificate_templates
SET template_key = 'doc1-no-business',
    variant_label = 'No longer existing business',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 certification that a business is no longer existing in the barangay.',
    is_active = true,
    display_order = 80,
    required_fields = '["businessName", "businessAddress", "requesterName", "requestingInstitution"]'::jsonb
WHERE name = 'Certificate of No Business'
  AND (template_key IS NULL OR template_key = 'doc1-no-business');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of No Business', 'doc1-no-business', 'No longer existing business', 'doc1', false, 'Doc #1 certification that a business is no longer existing in the barangay.', true, 80, '["businessName", "businessAddress", "requesterName", "requestingInstitution"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-no-business');

UPDATE certificate_templates
SET template_key = 'doc1-guardianship',
    variant_label = 'Legal guardian',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 legal guardian certification.',
    is_active = true,
    display_order = 90,
    required_fields = '["wardName", "relationship"]'::jsonb
WHERE name = 'Certificate of Guardianship'
  AND (template_key IS NULL OR template_key = 'doc1-guardianship');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Guardianship', 'doc1-guardianship', 'Legal guardian', 'doc1', false, 'Doc #1 legal guardian certification.', true, 90, '["wardName", "relationship"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-guardianship');

UPDATE certificate_templates
SET template_key = 'doc1-business-renewal-endorsement',
    variant_label = 'Renewal endorsement',
    doc_source = 'doc1',
    has_fee = true,
    description = 'Doc #1 renewal endorsement for corresponding Mayor''s Permit.',
    is_active = true,
    display_order = 100,
    required_fields = '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress"]'::jsonb
WHERE name = 'Barangay Business Clearance (Renewal)'
  AND (template_key IS NULL OR template_key = 'doc1-business-renewal-endorsement');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Business Clearance (Renewal)', 'doc1-business-renewal-endorsement', 'Renewal endorsement', 'doc1', true, 'Doc #1 renewal endorsement for corresponding Mayor''s Permit.', true, 100, '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-business-renewal-endorsement');

UPDATE certificate_templates
SET template_key = 'doc1-property-ownership',
    variant_label = 'Lot ownership',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 property ownership and lot details certification.',
    is_active = true,
    display_order = 110,
    required_fields = '["propertyLocation", "taxDeclarationNo", "propertyArea"]'::jsonb
WHERE name = 'Certificate of Ownership'
  AND (template_key IS NULL OR template_key = 'doc1-property-ownership');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Ownership', 'doc1-property-ownership', 'Lot ownership', 'doc1', false, 'Doc #1 property ownership and lot details certification.', true, 110, '["propertyLocation", "taxDeclarationNo", "propertyArea"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-property-ownership');

UPDATE certificate_templates
SET template_key = 'doc1-certificate-appearance',
    variant_label = 'Appearance at barangay',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 certificate of appearance.',
    is_active = true,
    display_order = 120,
    required_fields = '["requestingInstitution", "appearanceDate"]'::jsonb
WHERE name = 'Certificate of Appearance'
  AND (template_key IS NULL OR template_key = 'doc1-certificate-appearance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Appearance', 'doc1-certificate-appearance', 'Appearance at barangay', 'doc1', false, 'Doc #1 certificate of appearance.', true, 120, '["requestingInstitution", "appearanceDate"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-certificate-appearance');

CREATE UNIQUE INDEX IF NOT EXISTS certificate_templates_template_key_uidx
    ON certificate_templates (template_key)
    WHERE template_key IS NOT NULL;
