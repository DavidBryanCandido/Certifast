-- Barangay East Tapinac Citizen's Charter resident guidance and address seed.
-- Run this in Supabase SQL Editor after the Doc #1/#2/#3 certificate migrations.

ALTER TABLE certificate_templates
    ADD COLUMN IF NOT EXISTS template_key text,
    ADD COLUMN IF NOT EXISTS fee_amount numeric(10, 2),
    ADD COLUMN IF NOT EXISTS proof_requirements jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS resident_guidance jsonb DEFAULT '{}'::jsonb;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'certificate_templates_fee_amount_nonnegative'
    ) THEN
        ALTER TABLE certificate_templates
            ADD CONSTRAINT certificate_templates_fee_amount_nonnegative
            CHECK (fee_amount IS NULL OR fee_amount >= 0);
    END IF;
END $$;

COMMENT ON COLUMN certificate_templates.resident_guidance IS
    'Resident-facing what-to-bring and online process notes based on Barangay East Tapinac Citizen Charter.';

WITH guidance(group_key, body) AS (
    VALUES
    (
        'clearance',
        $json$
        {
          "title": "Barangay Clearance",
          "waiting": "Online review: 1-3 business days. Counter release after approval is usually about 12 minutes.",
          "review": "Barangay staff checks your resident profile, purpose, and clearance details before preparing the clearance.",
          "release": "Claim the clearance in person. Bring the original ID and the listed payment for final verification and release.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request form and upload any certificate-specific supporting document." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff verifies your resident profile, purpose, and request details before preparing the clearance." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the clearance at the Barangay Hall with your ID, request reference, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    ),
    (
        'certification',
        $json$
        {
          "title": "Barangay Certification",
          "waiting": "Online review: 1-3 business days. Counter release after approval is usually about 12 minutes.",
          "review": "Barangay staff checks your resident profile, purpose, and supporting details before preparing the certification.",
          "release": "Claim the certification in person. Bring the original ID, request reference, and listed payment.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Supporting proof for the stated purpose, if requested",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request form and upload the supporting document requested by the selected certificate." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff assesses the submitted information and checks the supporting document before preparing the certification." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certification at the Barangay Hall with your ID, request reference, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    ),
    (
        'residency',
        $json$
        {
          "title": "Certificate of Residency",
          "waiting": "Online review: 1-3 business days. Counter release after approval is usually about 12 minutes.",
          "review": "Barangay staff verifies your residence details and the requesting bank, school, agency, or office requirement.",
          "release": "Claim the residency certificate in person. Bring your ID, request reference, and the original agency requirement if available.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Bank, school, agency, or office requirement document, if applicable",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the residency request and upload the requirement document if the requesting office gave one." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff verifies your profile address and checks the submitted requirement before preparing the certificate." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certificate at the Barangay Hall with your ID, request reference, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    ),
    (
        'indigency',
        $json$
        {
          "title": "Certificate of Indigency / Assistance Certification",
          "waiting": "Online review: 1-3 business days. Counter release after approval is usually about 12 minutes.",
          "review": "Barangay staff reviews the assistance purpose and checks the uploaded medical, burial, educational, financial, or agency document.",
          "release": "Claim the certification in person. Bring the original supporting document used for the request.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Original or copy of the uploaded assistance document",
            "Proof of relationship or authorization, if requesting for another person",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request and upload the supporting document for the assistance purpose." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff checks your profile, purpose, and uploaded supporting document before preparing the certification." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certification with your ID, request reference, original supporting document, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    ),
    (
        'business',
        $json$
        {
          "title": "Business Endorsement / Business Certification",
          "waiting": "Online review: 1-3 business days. Requests that need business-site verification or inspection may take up to 7 days under the charter extension rule.",
          "review": "Barangay staff reviews the business details, registration or permit document, and business address before preparing the endorsement.",
          "release": "Claim the endorsement in person. Bring the original business document used for the request.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "DTI, SEC, CDA, permit application, previous permit, or other business registration document",
            "Proof of business address, if requested"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the business request and upload the business registration, permit, or renewal document." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff reviews the business details and may schedule verification or inspection when needed." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the endorsement at the Barangay Hall with your ID, request reference, and original business document." }
          ]
        }
        $json$::jsonb
    ),
    (
        'business_closure',
        $json$
        {
          "title": "Business Closure / Non-Operation Certification",
          "waiting": "Online review: 1-3 business days. Requests that need business-site verification or inspection may take up to 7 days under the charter extension rule.",
          "review": "Barangay staff reviews the business closure details, prior permit or registration, and any proof of non-operation.",
          "release": "Claim the certification in person. Bring the original business closure or non-operation document if available.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Business registration, previous permit, closure proof, or non-operation document"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request and upload the prior permit, registration, or non-operation proof." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff reviews the closure details and may verify the business site when needed." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certification at the Barangay Hall with your ID, request reference, and original business document." }
          ]
        }
        $json$::jsonb
    ),
    (
        'property',
        $json$
        {
          "title": "Property / Lot Certification",
          "waiting": "Online review: 1-3 business days. Requests that need onsite verification may take up to 7 days under the charter extension rule.",
          "review": "Barangay staff checks the property details and uploaded ownership, lease, tax declaration, or lot document.",
          "release": "Claim the certification in person. Bring the original property document used for the request.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Property title, tax declaration, lease, occupancy, or lot document",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request and upload the property, lease, occupancy, or lot document." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff verifies the property details and may conduct onsite checking when needed." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certification with your ID, request reference, property document, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    ),
    (
        'senior',
        $json$
        {
          "title": "Senior Citizen Certification",
          "waiting": "Online review: 1-3 business days. Counter release after approval is usually about 28 minutes.",
          "review": "Barangay staff assesses the senior citizen requirement and prepares the certification for Senior Citizen ID processing.",
          "release": "Claim the certification in person. Bring age, residency, or OSCA-related proof if requested.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Senior citizen ID application, OSCA requirement, or proof of age and residency",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request and upload the senior citizen ID or agency requirement document if available." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff assesses the requirement and prepares the certification." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certification with your ID, request reference, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    ),
    (
        'solo_parent',
        $json$
        {
          "title": "Solo Parent Certification",
          "waiting": "Online review: 1-3 business days. Barangay verification for solo-parent status may take 1 day.",
          "review": "Barangay staff assesses the solo-parent requirement and verifies the resident's solo-parent status when needed.",
          "release": "Claim the certification in person. Bring the original solo-parent proof or agency requirement if available.",
          "bring": [
            "Valid government-issued ID",
            "Request ID / reference number",
            "Solo Parent ID application, agency requirement, or proof of solo-parent status",
            "Fee payment: PHP 50.00"
          ],
          "processSteps": [
            { "n": "1", "title": "Submit Online", "desc": "Complete the request and upload the solo-parent ID, agency requirement, or status proof if available." },
            { "n": "2", "title": "Barangay Review", "desc": "Barangay staff assesses the documents and verifies solo-parent status when needed." },
            { "n": "3", "title": "Claim In Person", "desc": "After approval, claim the certification with your ID, request reference, and PHP 50.00 payment." }
          ]
        }
        $json$::jsonb
    )
),
template_groups(template_key, group_key) AS (
    VALUES
    ('doc1-barangay-clearance', 'clearance'),
    ('doc1-certificate-residency', 'residency'),
    ('doc1-simple-residency-loan', 'residency'),
    ('doc2-residency-bank-record', 'residency'),
    ('doc2-residency-school-requirement', 'residency'),
    ('doc1-good-moral', 'certification'),
    ('doc1-certificate-appearance', 'certification'),
    ('doc1-live-birth-endorsement', 'certification'),
    ('doc1-cohabitation', 'certification'),
    ('doc1-guardianship', 'certification'),
    ('doc2-general-legal-records', 'certification'),
    ('doc2-parent-relationship-spes', 'certification'),
    ('doc2-guardian-psa-certification', 'certification'),
    ('doc3-child-details-4ps', 'certification'),
    ('doc3-minor-stepbrother-birth-record', 'certification'),
    ('doc1-indigency-medical', 'indigency'),
    ('doc1-indigency-sibling-assistance', 'indigency'),
    ('doc1-endorsement-medical-assistance', 'indigency'),
    ('doc1-burial-assistance', 'indigency'),
    ('doc1-indigency-educational-assistance', 'indigency'),
    ('doc1-indigency-spes-leap', 'indigency'),
    ('doc1-endorsement-financial-assistance', 'indigency'),
    ('doc1-dswd-eligibility-certification', 'indigency'),
    ('doc2-indigency-income-means', 'indigency'),
    ('doc2-indigent-good-moral-medical', 'indigency'),
    ('doc2-minor-athlete-financial-assistance', 'indigency'),
    ('doc2-funeral-covered-court-indigency', 'indigency'),
    ('doc2-indigency-guardian-medical', 'indigency'),
    ('doc3-indigency-medical-assistance', 'indigency'),
    ('doc3-flood-victim-financial-assistance', 'indigency'),
    ('doc3-blank-indigency-form', 'indigency'),
    ('doc1-work-permit-certification', 'business'),
    ('doc1-business-renewal-endorsement', 'business'),
    ('doc1-telecom-nap-permit', 'business'),
    ('doc1-business-owner-bir-certification', 'business'),
    ('doc2-business-assessor-permit', 'business'),
    ('doc2-registered-business-bank', 'business'),
    ('doc2-organization-water-clearance', 'business'),
    ('doc2-lpg-house-to-house-permit', 'business'),
    ('doc3-business-renewal-travel', 'business'),
    ('doc3-road-damage-permit', 'business'),
    ('doc3-bmbe-business-certificate', 'business'),
    ('doc3-business-renewal-store', 'business'),
    ('doc3-business-new-endorsement', 'business'),
    ('doc1-no-business', 'business_closure'),
    ('doc2-business-closure-court-records', 'business_closure'),
    ('doc3-pandemic-business-non-operation', 'business_closure'),
    ('doc3-business-closure', 'business_closure'),
    ('doc3-renovation-non-operational-business', 'business_closure'),
    ('doc1-property-ownership', 'property'),
    ('doc1-family-home-property', 'property'),
    ('doc1-lot-occupancy', 'property'),
    ('doc3-senior-alive-well', 'senior'),
    ('doc2-centenarian-living-veteran', 'senior'),
    ('doc1-solo-parent-certification', 'solo_parent')
)
UPDATE certificate_templates ct
SET resident_guidance = guidance.body
FROM template_groups tg
JOIN guidance ON guidance.group_key = tg.group_key
WHERE ct.template_key = tg.template_key;

-- Charter fees:
-- Barangay Clearance and Barangay Certification are PHP 50.00.
UPDATE certificate_templates
SET has_fee = TRUE,
    fee_amount = 50.00
WHERE template_key IN (
    'doc1-barangay-clearance',
    'doc1-certificate-residency',
    'doc1-simple-residency-loan',
    'doc2-residency-bank-record',
    'doc2-residency-school-requirement',
    'doc1-good-moral',
    'doc1-certificate-appearance',
    'doc1-live-birth-endorsement',
    'doc1-cohabitation',
    'doc1-guardianship',
    'doc2-general-legal-records',
    'doc2-parent-relationship-spes',
    'doc2-guardian-psa-certification',
    'doc3-child-details-4ps',
    'doc3-minor-stepbrother-birth-record',
    'doc1-indigency-medical',
    'doc1-indigency-sibling-assistance',
    'doc1-endorsement-medical-assistance',
    'doc1-burial-assistance',
    'doc1-indigency-educational-assistance',
    'doc1-indigency-spes-leap',
    'doc1-endorsement-financial-assistance',
    'doc1-dswd-eligibility-certification',
    'doc2-indigency-income-means',
    'doc2-indigent-good-moral-medical',
    'doc2-minor-athlete-financial-assistance',
    'doc2-funeral-covered-court-indigency',
    'doc2-indigency-guardian-medical',
    'doc3-indigency-medical-assistance',
    'doc3-flood-victim-financial-assistance',
    'doc3-blank-indigency-form',
    'doc1-property-ownership',
    'doc1-family-home-property',
    'doc1-lot-occupancy',
    'doc3-senior-alive-well',
    'doc2-centenarian-living-veteran',
    'doc1-solo-parent-certification'
);

-- Barangay Business Indorsement/Endorsement has no fee under the charter.
UPDATE certificate_templates
SET has_fee = FALSE,
    fee_amount = NULL
WHERE template_key IN (
    'doc1-work-permit-certification',
    'doc1-business-renewal-endorsement',
    'doc1-telecom-nap-permit',
    'doc1-business-owner-bir-certification',
    'doc2-business-assessor-permit',
    'doc2-registered-business-bank',
    'doc2-organization-water-clearance',
    'doc2-lpg-house-to-house-permit',
    'doc3-business-renewal-travel',
    'doc3-road-damage-permit',
    'doc3-bmbe-business-certificate',
    'doc3-business-renewal-store',
    'doc3-business-new-endorsement',
    'doc1-no-business',
    'doc2-business-closure-court-records',
    'doc3-pandemic-business-non-operation',
    'doc3-business-closure',
    'doc3-renovation-non-operational-business'
);

WITH actual_puroks(name, sort_order) AS (
    VALUES
    ('Purok 1', 1),
    ('Purok 2', 2),
    ('Purok 3', 3),
    ('Purok 4', 4),
    ('Purok 5', 5),
    ('Purok 6', 6),
    ('Purok 7', 7),
    ('Purok 8', 8),
    ('Purok 9', 9),
    ('Purok 10', 10),
    ('Purok 11', 11)
)
UPDATE puroks p
SET is_active = TRUE,
    sort_order = actual_puroks.sort_order
FROM actual_puroks
WHERE lower(p.name) = lower(actual_puroks.name);

WITH actual_puroks(name, sort_order) AS (
    VALUES
    ('Purok 1', 1),
    ('Purok 2', 2),
    ('Purok 3', 3),
    ('Purok 4', 4),
    ('Purok 5', 5),
    ('Purok 6', 6),
    ('Purok 7', 7),
    ('Purok 8', 8),
    ('Purok 9', 9),
    ('Purok 10', 10),
    ('Purok 11', 11)
)
INSERT INTO puroks (name, sort_order, is_active)
SELECT actual_puroks.name, actual_puroks.sort_order, TRUE
FROM actual_puroks
WHERE NOT EXISTS (
    SELECT 1
    FROM puroks p
    WHERE lower(p.name) = lower(actual_puroks.name)
);

UPDATE puroks
SET is_active = FALSE
WHERE lower(name) NOT IN (
    'purok 1',
    'purok 2',
    'purok 3',
    'purok 4',
    'purok 5',
    'purok 6',
    'purok 7',
    'purok 8',
    'purok 9',
    'purok 10',
    'purok 11'
);

WITH actual_streets(name, sort_order) AS (
    VALUES
    ('Acayan Street', 1),
    ('Apelado Street', 2),
    ('Bacon Street', 3),
    ('Cruz Dela Drive', 4),
    ('Coll Street', 5),
    ('Donor Street', 6),
    ('Espiritu Street', 7),
    ('Fendler Street', 8),
    ('Fendler Extension Street', 9),
    ('Fontain Extension Street', 10),
    ('Gallagher Street', 11),
    ('Hansen Street', 12),
    ('Irving Street', 13),
    ('5th Street', 14),
    ('6th Street', 15),
    ('8th Street', 16),
    ('9th Street', 17),
    ('10th Street', 18),
    ('12th Street', 19),
    ('13th Street', 20),
    ('14th Street', 21),
    ('16th Street', 22)
)
UPDATE streets s
SET is_active = TRUE,
    sort_order = actual_streets.sort_order
FROM actual_streets
WHERE lower(s.name) = lower(actual_streets.name);

WITH actual_streets(name, sort_order) AS (
    VALUES
    ('Acayan Street', 1),
    ('Apelado Street', 2),
    ('Bacon Street', 3),
    ('Cruz Dela Drive', 4),
    ('Coll Street', 5),
    ('Donor Street', 6),
    ('Espiritu Street', 7),
    ('Fendler Street', 8),
    ('Fendler Extension Street', 9),
    ('Fontain Extension Street', 10),
    ('Gallagher Street', 11),
    ('Hansen Street', 12),
    ('Irving Street', 13),
    ('5th Street', 14),
    ('6th Street', 15),
    ('8th Street', 16),
    ('9th Street', 17),
    ('10th Street', 18),
    ('12th Street', 19),
    ('13th Street', 20),
    ('14th Street', 21),
    ('16th Street', 22)
)
INSERT INTO streets (name, sort_order, is_active)
SELECT actual_streets.name, actual_streets.sort_order, TRUE
FROM actual_streets
WHERE NOT EXISTS (
    SELECT 1
    FROM streets s
    WHERE lower(s.name) = lower(actual_streets.name)
);

UPDATE streets
SET is_active = FALSE
WHERE lower(name) NOT IN (
    'acayan street',
    'apelado street',
    'bacon street',
    'cruz dela drive',
    'coll street',
    'donor street',
    'espiritu street',
    'fendler street',
    'fendler extension street',
    'fontain extension street',
    'gallagher street',
    'hansen street',
    'irving street',
    '5th street',
    '6th street',
    '8th street',
    '9th street',
    '10th street',
    '12th street',
    '13th street',
    '14th street',
    '16th street'
);
