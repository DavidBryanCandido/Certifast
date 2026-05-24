-- Doc #2 certificate template migration for CertiFast.
-- Run Doc #1 migration first if these columns do not exist yet.
-- In Supabase SQL Editor, paste and run the whole file.

ALTER TABLE certificate_templates
    ADD COLUMN IF NOT EXISTS template_key text,
    ADD COLUMN IF NOT EXISTS variant_label text,
    ADD COLUMN IF NOT EXISTS doc_source text DEFAULT 'doc1',
    ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS required_fields jsonb DEFAULT '[]'::jsonb;

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS template_id integer REFERENCES certificate_templates(template_id),
    ADD COLUMN IF NOT EXISTS extra_fields jsonb DEFAULT '{}'::jsonb;

ALTER TABLE issued_certificates
    ADD COLUMN IF NOT EXISTS template_id integer REFERENCES certificate_templates(template_id),
    ADD COLUMN IF NOT EXISTS extra_fields jsonb DEFAULT '{}'::jsonb;

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES
    ('kagawad_3_name', 'Hon. Andrea A. Austria'),
    ('kagawad_3_title', 'Barangay Kagawad')
ON CONFLICT (setting_key) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS certificate_templates_template_key_uidx
    ON certificate_templates (template_key)
    WHERE template_key IS NOT NULL;

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency: Income and Means Certification', 'doc2-indigency-income-means', 'Income/property indigency', 'doc2', false, 'Doc #2 indigency format with income, property, and daily needs wording.', true, 370, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-indigency-income-means');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Flooded Residence Certification', 'doc2-flooded-residence-certification', 'Habagat/flooded residence', 'doc2', false, 'Doc #2 no-derogatory certification for a residence flooded during Habagat.', true, 380, '["incidentName", "incidentDate", "requirementName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-flooded-residence-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency and Good Moral Certification', 'doc2-indigent-good-moral-medical', 'Indigent with good moral record', 'doc2', false, 'Doc #2 indigency with good moral/no criminal record wording.', true, 390, '["assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-indigent-good-moral-medical');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Residency Certification: Bank Requirement', 'doc2-residency-bank-record', 'Resident record for bank', 'doc2', false, 'Doc #2 resident record certification for bank requirements.', true, 400, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-residency-bank-record');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Minor Athlete Financial Assistance Certification', 'doc2-minor-athlete-financial-assistance', 'Minor athlete assistance', 'doc2', false, 'Doc #2 indigency certification for a minor athlete seeking assistance.', true, 410, '["minorChildName", "activityName", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-minor-athlete-financial-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Parent Relationship / SPES Certification', 'doc2-parent-relationship-spes', 'Parent relationship for SPES', 'doc2', false, 'Doc #2 marital and biological father certification for SPES purposes.', true, 420, '["legalSpouseName", "childrenNames", "currentPartnerName", "assistanceRecipientName", "programName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-parent-relationship-spes');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Closure Certification', 'doc2-business-closure-court-records', 'No longer operating business', 'doc2', false, 'Doc #2 certification that a business is no longer operating.', true, 430, '["businessOwnerName", "businessName", "businessAddress", "requesterName", "requestingInstitution"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-business-closure-court-records');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'General Legal Records Certification', 'doc2-general-legal-records', 'Legal and records purposes', 'doc2', false, 'Doc #2 bonafide resident/no-derogatory certification for legal records.', true, 440, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-general-legal-records');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Centenarian Living Certification', 'doc2-centenarian-living-veteran', 'Living centenarian', 'doc2', false, 'Doc #2 certification that a resident is living and is a centenarian.', true, 450, '["age", "programName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-centenarian-living-veteran');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'First Time Jobseeker Oath of Undertaking', 'doc2-first-time-jobseeker-oath', 'RA 11261 oath', 'doc2', false, 'Doc #2 RA 11261 first time jobseeker oath of undertaking.', true, 460, '["age", "residencyDuration", "parentGuardianName", "parentGuardianAge", "childName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-first-time-jobseeker-oath');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Funeral Assistance / Covered Court Indigency', 'doc2-funeral-covered-court-indigency', 'Funeral assistance and wake permit', 'doc2', false, 'Doc #2 indigency for funeral assistance and covered court wake use.', true, 470, '["deceasedName", "deceasedDate", "requesterRelationship", "wakeDays"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-funeral-covered-court-indigency');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Endorsement: Hospital Discharge Return Assistance', 'doc2-endorsement-hospital-return', 'Hospital discharge return assistance', 'doc2', false, 'Doc #2 endorsement to CSWDO/Mayor for hospital discharge return assistance.', true, 480, '["recipientName", "recipientTitle", "recipientOffice", "thruName", "thruTitle", "thruOffice", "caregiverDescription", "destinationAddress"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-endorsement-hospital-return');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Assessor / Building Permit Certification', 'doc2-business-assessor-permit', 'Assessor/building permit', 'doc2', true, 'Doc #2 business certification for city assessor or building permit purpose.', true, 490, '["businessAddress", "businessPurpose"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-business-assessor-permit');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Residency: School Requirement', 'doc2-residency-school-requirement', 'School requirement residency', 'doc2', false, 'Doc #2 residency certificate for school requirements.', true, 500, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-residency-school-requirement');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Registered Business Bank Certification', 'doc2-registered-business-bank', 'Registered business bank', 'doc2', true, 'Doc #2 registered business certification for bank requirements.', true, 510, '["businessName", "businessAddress", "businessOwnerName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-registered-business-bank');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Guardian PSA Requirement Certification', 'doc2-guardian-psa-certification', 'Guardian for PSA requirement', 'doc2', false, 'Doc #2 guardian/legal guardian certification for PSA requirements.', true, 520, '["wardName", "relationship", "purposeDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-guardian-psa-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency: Guardian Medical Assistance', 'doc2-indigency-guardian-medical', 'Guardian medical assistance', 'doc2', false, 'Doc #2 indigency certification requested by a guardian for medical assistance.', true, 530, '["age", "requesterName", "requesterRelationship", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-indigency-guardian-medical');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Organization Water Connection Clearance', 'doc2-organization-water-clearance', 'Organization water connection', 'doc2', true, 'Doc #2 barangay clearance for organization water connection purposes.', true, 540, '["organizationName", "requestingInstitution"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-organization-water-clearance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Unemployment / SPES Certification', 'doc2-unemployment-spes-certification', 'Unemployed for SPES', 'doc2', false, 'Doc #2 certification that the resident is unemployed/no work for SPES.', true, 550, '["programName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-unemployment-spes-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'LPG House-to-House Activity Permit', 'doc2-lpg-house-to-house-permit', 'LPG safety house-to-house permit', 'doc2', true, 'Doc #2 barangay permit for LPG safety house-to-house demonstration.', true, 560, '["businessName", "activityName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc2-lpg-house-to-house-permit');
