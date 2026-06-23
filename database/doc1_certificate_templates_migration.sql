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
    display_order = 110,
    required_fields = '[]'::jsonb
WHERE name = 'Barangay Clearance'
  AND (template_key IS NULL OR template_key = 'doc1-barangay-clearance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Clearance', 'doc1-barangay-clearance', 'No derogatory record', 'doc1', true, 'Doc #1 barangay clearance with no derogatory record wording.', true, 110, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-barangay-clearance');

UPDATE certificate_templates
SET template_key = 'doc1-certificate-residency',
    variant_label = 'Bona fide resident',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 barangay certificate for bona fide residency.',
    is_active = true,
    display_order = 210,
    required_fields = '[]'::jsonb
WHERE name = 'Certificate of Residency'
  AND (template_key IS NULL OR template_key = 'doc1-certificate-residency');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Residency', 'doc1-certificate-residency', 'Bona fide resident', 'doc1', false, 'Doc #1 barangay certificate for bona fide residency.', true, 210, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-certificate-residency');

UPDATE certificate_templates
SET template_key = 'doc1-indigency-medical',
    variant_label = 'Assistance purposes',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 indigency certification for medical, educational, or assistance purposes.',
    is_active = true,
    display_order = 250,
    required_fields = '["requesterName", "requesterRelationship", "assistanceType"]'::jsonb
WHERE name = 'Certificate of Indigency'
  AND (template_key IS NULL OR template_key = 'doc1-indigency-medical');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Indigency', 'doc1-indigency-medical', 'Assistance purposes', 'doc1', false, 'Doc #1 indigency certification for medical, educational, or assistance purposes.', true, 250, '["requesterName", "requesterRelationship", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-indigency-medical');

UPDATE certificate_templates
SET template_key = 'doc1-work-permit-certification',
    variant_label = 'Work/business permit',
    doc_source = 'doc1',
    has_fee = true,
    description = 'Doc #1 certification for work or business permit clearance.',
    is_active = true,
    display_order = 70,
    required_fields = '["businessName", "businessAddress", "businessType", "businessArea"]'::jsonb
WHERE name = 'Business Permit'
  AND (template_key IS NULL OR template_key = 'doc1-work-permit-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Permit', 'doc1-work-permit-certification', 'Work/business permit', 'doc1', true, 'Doc #1 certification for work or business permit clearance.', true, 70, '["businessName", "businessAddress", "businessType", "businessArea"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-work-permit-certification');

UPDATE certificate_templates
SET template_key = 'doc1-good-moral',
    variant_label = 'Good moral and no pending case',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 certification for good moral character and no pending case.',
    is_active = true,
    display_order = 180,
    required_fields = '["requestingInstitution"]'::jsonb
WHERE name = 'Good Moral Certificate'
  AND (template_key IS NULL OR template_key = 'doc1-good-moral');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Good Moral Certificate', 'doc1-good-moral', 'Good moral and no pending case', 'doc1', false, 'Doc #1 certification for good moral character and no pending case.', true, 180, '["requestingInstitution"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-good-moral');

UPDATE certificate_templates
SET template_key = 'doc1-live-birth-endorsement',
    variant_label = 'Late birth registration',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 endorsement for late registration of a minor child.',
    is_active = true,
    display_order = 240,
    required_fields = '["partnerName", "childName", "childDOB", "childBirthPlace", "fatherName", "motherName"]'::jsonb
WHERE name = 'Certificate of Live Birth (Endorsement)'
  AND (template_key IS NULL OR template_key = 'doc1-live-birth-endorsement');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Live Birth (Endorsement)', 'doc1-live-birth-endorsement', 'Late birth registration', 'doc1', false, 'Doc #1 endorsement for late registration of a minor child.', true, 240, '["partnerName", "childName", "childDOB", "childBirthPlace", "fatherName", "motherName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-live-birth-endorsement');

UPDATE certificate_templates
SET template_key = 'doc1-cohabitation',
    variant_label = 'Common-law spouse',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 common-law partner certification.',
    is_active = true,
    display_order = 230,
    required_fields = '["partnerName"]'::jsonb
WHERE name = 'Certificate of Cohabitation'
  AND (template_key IS NULL OR template_key = 'doc1-cohabitation');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Cohabitation', 'doc1-cohabitation', 'Common-law spouse', 'doc1', false, 'Doc #1 common-law partner certification.', true, 230, '["partnerName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-cohabitation');

UPDATE certificate_templates
SET template_key = 'doc1-no-business',
    variant_label = 'No longer existing business',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 certification that a business is no longer existing in the barangay.',
    is_active = true,
    display_order = 60,
    required_fields = '["businessName", "businessAddress", "requesterName", "requestingInstitution"]'::jsonb
WHERE name = 'Certificate of No Business'
  AND (template_key IS NULL OR template_key = 'doc1-no-business');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of No Business', 'doc1-no-business', 'No longer existing business', 'doc1', false, 'Doc #1 certification that a business is no longer existing in the barangay.', true, 60, '["businessName", "businessAddress", "requesterName", "requestingInstitution"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-no-business');

UPDATE certificate_templates
SET template_key = 'doc1-guardianship',
    variant_label = 'Legal guardian',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 legal guardian certification.',
    is_active = true,
    display_order = 100,
    required_fields = '["wardName", "relationship"]'::jsonb
WHERE name = 'Certificate of Guardianship'
  AND (template_key IS NULL OR template_key = 'doc1-guardianship');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Guardianship', 'doc1-guardianship', 'Legal guardian', 'doc1', false, 'Doc #1 legal guardian certification.', true, 100, '["wardName", "relationship"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-guardianship');

UPDATE certificate_templates
SET template_key = 'doc1-business-renewal-endorsement',
    variant_label = 'Renewal endorsement',
    doc_source = 'doc1',
    has_fee = true,
    description = 'Doc #1 renewal endorsement for corresponding Mayor''s Permit.',
    is_active = true,
    display_order = 270,
    required_fields = '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "dateIssued", "validUntil"]'::jsonb
WHERE name = 'Barangay Business Clearance (Renewal)'
  AND (template_key IS NULL OR template_key = 'doc1-business-renewal-endorsement');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Barangay Business Clearance (Renewal)', 'doc1-business-renewal-endorsement', 'Renewal endorsement', 'doc1', true, 'Doc #1 renewal endorsement for corresponding Mayor''s Permit.', true, 270, '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "dateIssued", "validUntil"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-business-renewal-endorsement');

UPDATE certificate_templates
SET template_key = 'doc1-property-ownership',
    variant_label = 'Lot ownership',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 property ownership and lot details certification.',
    is_active = true,
    display_order = 260,
    required_fields = '["propertyLocation", "taxDeclarationNo", "propertyArea"]'::jsonb
WHERE name = 'Certificate of Ownership'
  AND (template_key IS NULL OR template_key = 'doc1-property-ownership');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Ownership', 'doc1-property-ownership', 'Lot ownership', 'doc1', false, 'Doc #1 property ownership and lot details certification.', true, 260, '["propertyLocation", "taxDeclarationNo", "propertyArea"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-property-ownership');

UPDATE certificate_templates
SET template_key = 'doc1-certificate-appearance',
    variant_label = 'Appearance at barangay',
    doc_source = 'doc1',
    has_fee = false,
    description = 'Doc #1 certificate of appearance.',
    is_active = true,
    display_order = 280,
    required_fields = '["requestingInstitution", "appearanceDate"]'::jsonb
WHERE name = 'Certificate of Appearance'
  AND (template_key IS NULL OR template_key = 'doc1-certificate-appearance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certificate of Appearance', 'doc1-certificate-appearance', 'Appearance at barangay', 'doc1', false, 'Doc #1 certificate of appearance.', true, 280, '["requestingInstitution", "appearanceDate"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-certificate-appearance');

-- Additional distinct Doc #1 variants found in BGRY.CERT# 1.docx.
INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Endorsement: TODA Courtesy Call', 'doc1-endorsement-toda-courtesy-call', 'TODA courtesy call endorsement', 'doc1', false, 'Doc #1 endorsement letter for elected TODA officers.', true, 10, '["recipientName", "recipientTitle", "recipientOffice", "subject", "organizationName", "presidentName", "vicePresidentName", "appointmentDate", "appointmentTime"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-endorsement-toda-courtesy-call');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Acceptance Letter', 'doc1-acceptance-letter-quarantine', 'Return-to-barangay quarantine', 'doc1', false, 'Doc #1 acceptance letter for return-to-barangay quarantine.', true, 20, '["originAddress", "destinationAddress", "quarantineDays"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-acceptance-letter-quarantine');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Household Certification', 'doc1-household-angkas-pass', 'Angkas pass household', 'doc1', false, 'Doc #1 household certification for Angkas pass requirements.', true, 30, '["companionName", "companionRole", "companionTwoName", "companionTwoRole"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-household-angkas-pass');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Family Home Certification', 'doc1-family-home-property', 'Family home property declaration', 'doc1', false, 'Doc #1 property certification for family home declaration.', true, 40, '["propertyLocation", "propertyOwner", "titleNumber", "taxDeclarationNo", "taxDeclarationBuildingNo", "familyHomeYears", "deceasedName", "deceasedDate"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-family-home-property');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'First Time Jobseeker Certificate', 'doc1-first-time-jobseeker', 'RA 11261 first time jobseeker', 'doc1', false, 'Doc #1 RA 11261 first time jobseeker certification.', true, 50, '["yearStarted"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-first-time-jobseeker');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Endorsement: Financial Assistance', 'doc1-endorsement-financial-assistance', 'Financial assistance endorsement', 'doc1', false, 'Doc #1 endorsement letter for financial assistance.', true, 80, '["recipientName", "recipientTitle", "recipientOffice", "subject"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-endorsement-financial-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'DSWD Eligibility Certification', 'doc1-dswd-eligibility-certification', 'DSWD eligibility document', 'doc1', false, 'Doc #1 certification for DSWD eligibility documents.', true, 90, '["eligibilityDocument", "requesterName", "relationshipDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-dswd-eligibility-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certification of Lot Occupancy', 'doc1-lot-occupancy', 'Lot occupancy and boundaries', 'doc1', false, 'Doc #1 lot occupancy and boundary certification.', true, 120, '["occupantName", "propertyLocation", "boundaryNorth", "boundaryEast", "boundarySouth", "boundaryWest", "propertyArea"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-lot-occupancy');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Certification of Undertaking', 'doc1-undertaking-quarantine', 'Quarantine undertaking', 'doc1', false, 'Doc #1 quarantine undertaking certification.', true, 130, '["age", "purposeDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-undertaking-quarantine');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Detained Resident Bail Certification', 'doc1-detained-bail-certification', 'Detained resident bail', 'doc1', false, 'Doc #1 certification for detained resident applying for bail.', true, 140, '["detainedFacility", "bailRequesterName", "bailRequesterRelationship"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-detained-bail-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency: Sibling Assistance', 'doc1-indigency-sibling-assistance', 'Sibling assistance indigency', 'doc1', false, 'Doc #1 indigency certification requested for a sibling.', true, 150, '["assistanceRecipientName", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-indigency-sibling-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Endorsement: Medical Assistance', 'doc1-endorsement-medical-assistance', 'Medical assistance endorsement', 'doc1', false, 'Doc #1 endorsement letter for medical assistance.', true, 160, '["recipientName", "recipientTitle", "recipientOffice", "subject", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-endorsement-medical-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Lockdown Residency Certificate', 'doc1-lockdown-residency-certification', 'COVID lockdown residency', 'doc1', false, 'Doc #1 quarantine lockdown residency certification.', true, 170, '["lockdownAddress", "lockdownStartDate", "programName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-lockdown-residency-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Extended Duty Shift Notice', 'doc1-extended-duty-shift', 'Extended duty shift memo', 'doc1', false, 'Doc #1 duty shift memorandum for rescuers.', true, 190, '["recipientName", "recipientOffice", "subject", "effectivePeriod"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-extended-duty-shift');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Burial Assistance Certification', 'doc1-burial-assistance', 'Burial assistance indigency', 'doc1', false, 'Doc #1 indigency certification for burial assistance.', true, 200, '["burialRelativeName", "deceasedDate", "assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-burial-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency: Educational Assistance', 'doc1-indigency-educational-assistance', 'Educational assistance indigency', 'doc1', false, 'Doc #1 indigency certification for educational assistance.', true, 290, '["assistanceType"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-indigency-educational-assistance');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Telecom Permit Certification', 'doc1-telecom-nap-permit', 'Telecom NAP permit', 'doc1', false, 'Doc #1 certification for telecom NAP build or rectification permits.', true, 220, '["telecomCompany", "businessAddress", "permitPurpose"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-telecom-nap-permit');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Marital Separation Certification', 'doc1-marital-separation-certification', 'Marital and child relationship', 'doc1', false, 'Doc #1 certification for marital and child relationship details.', true, 300, '["legalSpouseName", "currentPartnerName", "childrenNames"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-marital-separation-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Business Owner BIR Certification', 'doc1-business-owner-bir-certification', 'Business owner BIR/TIN', 'doc1', false, 'Doc #1 certification for business owner BIR or TIN purposes.', true, 310, '["businessOwnerName", "businessName", "businessAddress", "businessPurpose"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-business-owner-bir-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'No Marriage Index / Death Claim Certificate', 'doc1-no-marriage-death-claim', 'No marriage index and death claim', 'doc1', false, 'Doc #1 no marriage index and death claim certification.', true, 320, '["noMarriageSubject", "dateOfBirth", "placeOfBirth", "commonLawPartnerName", "childrenNames", "deceasedDate", "claimantName", "claimantRelationship"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-no-marriage-death-claim');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Hearing Impairment Certification', 'doc1-hearing-impairment-certification', 'Community witness impairment', 'doc1', false, 'Doc #1 community witness certification for hearing impairment.', true, 330, '["age", "witnessBasis", "employmentHistory", "impairmentDetail"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-hearing-impairment-certification');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Indigency: SPES / LEAP', 'doc1-indigency-spes-leap', 'SPES or LEAP indigency', 'doc1', false, 'Doc #1 indigency certification for SPES or LEAP requirements.', true, 340, '["assistanceRecipientName", "requesterRelationship"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-indigency-spes-leap');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Simple Residency Certificate', 'doc1-simple-residency-loan', 'Simple residency for loan', 'doc1', false, 'Doc #1 simple residency certificate for loan or general purposes.', true, 350, '["age", "loanPurpose"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-simple-residency-loan');

INSERT INTO certificate_templates (name, template_key, variant_label, doc_source, has_fee, description, is_active, display_order, required_fields)
SELECT 'Solo Parent Certification', 'doc1-solo-parent-certification', 'Solo parent residency', 'doc1', false, 'Doc #1 solo parent residency certification.', true, 360, '["age", "programName"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'doc1-solo-parent-certification');

CREATE UNIQUE INDEX IF NOT EXISTS certificate_templates_template_key_uidx
    ON certificate_templates (template_key)
    WHERE template_key IS NOT NULL;
