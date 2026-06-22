-- Doc #3 certificate template migration for CertiFast.
-- Run Doc #1 and Doc #2 migrations first if these columns do not exist yet.
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

CREATE UNIQUE INDEX IF NOT EXISTS certificate_templates_template_key_uidx
    ON certificate_templates (template_key)
    WHERE template_key IS NOT NULL;

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES ('bagong_pilipinas_logo_url', '/bagong-pilipinas-logo.png')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Permit: MLBB Tournament', 'doc3-mlbb-tournament-permit', 'MLBB tournament permit', 'doc3', true, 'Doc #3 barangay permit to hold a Mobile Legends tournament.', true, 570, '["eventName", "eventOrganizer", "eventPartner", "eventDate", "eventTime", "eventVenue"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-mlbb-tournament-permit');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Renewal Endorsement: Travel Services', 'doc3-business-renewal-travel', 'Travel services renewal', 'doc3', true, 'Doc #3 renewal endorsement form for travel services business permit.', true, 580, '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "businessCompliant", "businessNoObjection", "dateIssued", "validUntil"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-business-renewal-travel');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT '4Ps Child Details Certification', 'doc3-child-details-4ps', 'Child details for 4Ps', 'doc3', false, 'Doc #3 resident certification with child details for 4Ps requirement.', true, 590, '["childName", "childAge", "childDOB", "purposeDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-child-details-4ps');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Non-Resident Persons Certificate', 'doc3-non-resident-persons', 'Non-resident person list', 'doc3', false, 'Doc #3 certification listing persons who are non-residents of the barangay.', true, 600, '["nonResidentNames", "requestingOfficerName", "requestingOfficerTitle"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-non-resident-persons');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency: Medical Assistance', 'doc3-indigency-medical-assistance', 'Medical assistance indigency', 'doc3', false, 'Doc #3 indigency certification for medical assistance.', true, 610, '["assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-indigency-medical-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Road Damage Permit Certification', 'doc3-road-damage-permit', 'Road damage permit', 'doc3', true, 'Doc #3 certification for road damage permit application.', true, 620, '["permitType", "companyName", "businessAddress"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-road-damage-permit');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'BMBE Business Certificate', 'doc3-bmbe-business-certificate', 'BMBE business certificate', 'doc3', true, 'Doc #3 barangay certificate for Barangay Micro Business Enterprise benefits.', true, 630, '["businessName", "businessAddress", "businessOwnerName", "businessOwnerAddress", "expirationDate"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-bmbe-business-certificate');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Senior Alive and Well Certificate', 'doc3-senior-alive-well', 'Senior alive and well', 'doc3', false, 'Doc #3 certificate confirming a senior resident is alive and well.', true, 640, '["age", "aliveStatus", "claimantName", "claimantRelationship", "requirementName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-senior-alive-well');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Minor Stepbrother Birth Record Certification', 'doc3-minor-stepbrother-birth-record', 'Minor stepbrother birth record', 'doc3', false, 'Doc #3 certification for a minor stepbrother birth record requirement.', true, 650, '["siblingName", "siblingAge", "siblingGender", "siblingDOB", "siblingBirthPlace", "requesterAge", "purposeDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-minor-stepbrother-birth-record');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Fire Damage Certification', 'doc3-fire-damage-certification', 'Fire damaged property', 'doc3', false, 'Doc #3 certification for property or building damaged by fire.', true, 660, '["damageCause", "damageDate", "damageTime"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-fire-damage-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'First Time Jobseeker Clearance Certification', 'doc3-first-time-jobseeker-clearance', 'First time job seeker clearance', 'doc3', false, 'Doc #3 first time job seeker certification with one-year validity wording.', true, 670, '["effectivePeriod"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-first-time-jobseeker-clearance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Repatriated OFW Unemployment Certification', 'doc3-repatriated-ofw-unemployment', 'Repatriated OFW unemployment', 'doc3', false, 'Doc #3 certification for repatriated OFW unemployment and educational requirement.', true, 680, '["repatriationDate", "unemploymentStartDate", "programName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-repatriated-ofw-unemployment');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Pandemic Business Non-Operation Certificate', 'doc3-pandemic-business-non-operation', 'Pandemic non-operation', 'doc3', true, 'Doc #3 certificate that a business was non-operational during the pandemic period.', true, 690, '["businessName", "businessAddress", "businessOwnerName", "businessStatusPeriod"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-pandemic-business-non-operation');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Sole Guardian Travel Assistance Certificate', 'doc3-sole-guardian-travel-assistance', 'Sole guardian travel assistance', 'doc3', false, 'Doc #3 certificate that a resident is sole guardian for travel assistance.', true, 700, '["age", "wardName", "wardAge", "purposeDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-sole-guardian-travel-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Business Closure', 'doc3-business-closure', 'Business closure', 'doc3', true, 'Doc #3 barangay closure certificate for a business that ceased operation.', true, 710, '["businessName", "businessAddress", "businessOwnerName", "businessClosureDate", "dateIssued", "validUntil"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-business-closure');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Renovation Non-Operational Business Certificate', 'doc3-renovation-non-operational-business', 'Renovation non-operational', 'doc3', true, 'Doc #3 certificate for business non-operation due to repair or renovation.', true, 720, '["businessName", "businessAddress", "renovationStartDate", "renovationEndDate", "businessPurpose"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-renovation-non-operational-business');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Typhoon Carina Flood Victim: Financial Assistance', 'doc3-flood-victim-financial-assistance', 'Flood victim financial assistance', 'doc3', false, 'Doc #3 flood victim certification for financial assistance requirement.', true, 730, '["incidentName", "incidentDate", "requirementName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-flood-victim-financial-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Typhoon Carina Flood Victim: Calamity Loan', 'doc3-flood-victim-calamity-loan', 'Flood victim calamity loan', 'doc3', false, 'Doc #3 flood victim certification for calamity loan requirement.', true, 740, '["incidentName", "incidentDate", "requirementName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-flood-victim-calamity-loan');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Low-Income Certification: Purok Leader', 'doc3-low-income-purok-leader', 'Purok leader low income', 'doc3', false, 'Doc #3 low-income certification for a purok leader.', true, 750, '["occupation", "incomeStartYear", "monthlyIncome"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-low-income-purok-leader');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Low-Income Certification: Tricycle Driver', 'doc3-low-income-tricycle-driver', 'Tricycle driver low income', 'doc3', false, 'Doc #3 low-income certification for a tricycle driver.', true, 760, '["occupation", "incomeStartYear", "monthlyIncome", "purposeDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-low-income-tricycle-driver');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Indigency Blank Form', 'doc3-blank-indigency-form', 'Blank-style indigency', 'doc3', false, 'Doc #3 blank-style barangay indigency form.', true, 770, '["assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-blank-indigency-form');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Renewal Endorsement: Sari-Sari Store', 'doc3-business-renewal-store', 'Sari-sari store renewal', 'doc3', true, 'Doc #3 renewal endorsement form for sari-sari store business permit.', true, 780, '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "businessCompliant", "businessNoObjection", "dateIssued", "validUntil"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-business-renewal-store');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business New Endorsement', 'doc3-business-new-endorsement', 'New business endorsement', 'doc3', true, 'Doc #3 new business endorsement form for business permit.', true, 790, '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "businessCompliant", "businessNoObjection", "dateIssued", "validUntil"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc3-business-new-endorsement');

UPDATE certificate_templates
SET required_fields = '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "businessCompliant", "businessNoObjection", "dateIssued", "validUntil"]'::jsonb
WHERE template_key IN (
    'doc3-business-renewal-travel',
    'doc3-business-renewal-store',
    'doc3-business-new-endorsement'
);
