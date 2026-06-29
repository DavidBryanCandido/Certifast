-- Update resident-facing review-time copy without changing schema.
-- Run in Supabase SQL Editor after certificate guidance has been seeded.

WITH guidance_waiting(group_key, waiting_text) AS (
    VALUES
    (
        'clearance',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Counter release after approval is usually about 12 minutes.'
    ),
    (
        'certification',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Counter release after approval is usually about 12 minutes.'
    ),
    (
        'residency',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Counter release after approval is usually about 12 minutes.'
    ),
    (
        'indigency',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Counter release after approval is usually about 12 minutes.'
    ),
    (
        'business',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Requests that need business-site verification or inspection may take up to 7 days under the charter extension rule.'
    ),
    (
        'business_closure',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Requests that need business-site verification or inspection may take up to 7 days under the charter extension rule.'
    ),
    (
        'property',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Requests that need onsite verification may take up to 7 days under the charter extension rule.'
    ),
    (
        'senior',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Counter release after approval is usually about 28 minutes.'
    ),
    (
        'solo_parent',
        'Online review may be approved immediately when staff is available; otherwise allow 1-3 business days. Barangay verification for solo-parent status may take 1 day.'
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
SET resident_guidance = jsonb_set(
    COALESCE(ct.resident_guidance, '{}'::jsonb),
    '{waiting}',
    to_jsonb(gw.waiting_text),
    true
)
FROM template_groups tg
JOIN guidance_waiting gw ON gw.group_key = tg.group_key
WHERE ct.template_key = tg.template_key;
