-- Reorder existing Doc #1 certificate templates to match their first
-- appearance in BGRY.CERT# 1.docx. Safe to run more than once.

UPDATE certificate_templates AS template
SET display_order = source_order.display_order
FROM (
    VALUES
        ('doc1-endorsement-toda-courtesy-call', 10),
        ('doc1-acceptance-letter-quarantine', 20),
        ('doc1-household-angkas-pass', 30),
        ('doc1-family-home-property', 40),
        ('doc1-first-time-jobseeker', 50),
        ('doc1-no-business', 60),
        ('doc1-work-permit-certification', 70),
        ('doc1-endorsement-financial-assistance', 80),
        ('doc1-dswd-eligibility-certification', 90),
        ('doc1-guardianship', 100),
        ('doc1-barangay-clearance', 110),
        ('doc1-lot-occupancy', 120),
        ('doc1-undertaking-quarantine', 130),
        ('doc1-detained-bail-certification', 140),
        ('doc1-indigency-sibling-assistance', 150),
        ('doc1-endorsement-medical-assistance', 160),
        ('doc1-lockdown-residency-certification', 170),
        ('doc1-good-moral', 180),
        ('doc1-extended-duty-shift', 190),
        ('doc1-burial-assistance', 200),
        ('doc1-certificate-residency', 210),
        ('doc1-telecom-nap-permit', 220),
        ('doc1-cohabitation', 230),
        ('doc1-live-birth-endorsement', 240),
        ('doc1-indigency-medical', 250),
        ('doc1-property-ownership', 260),
        ('doc1-business-renewal-endorsement', 270),
        ('doc1-certificate-appearance', 280),
        ('doc1-indigency-educational-assistance', 290),
        ('doc1-marital-separation-certification', 300),
        ('doc1-business-owner-bir-certification', 310),
        ('doc1-no-marriage-death-claim', 320),
        ('doc1-hearing-impairment-certification', 330),
        ('doc1-indigency-spes-leap', 340),
        ('doc1-simple-residency-loan', 350),
        ('doc1-solo-parent-certification', 360)
) AS source_order(template_key, display_order)
WHERE template.template_key = source_order.template_key;

UPDATE certificate_templates
SET required_fields =
    '["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress", "dateIssued", "validUntil"]'::jsonb
WHERE template_key = 'doc1-business-renewal-endorsement';
