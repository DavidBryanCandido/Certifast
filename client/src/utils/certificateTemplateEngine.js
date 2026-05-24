const DEFAULT_SETTINGS = {
    brgy_name: "BARANGAY EAST TAPINAC",
    brgy_city: "City of Olongapo",
    brgy_address: "54 - 14th Street corner Gallagher Street, Olongapo City",
    captain_name: "HON. DANTE L. HONDO",
    captain_title: "Punong Barangay",
    kagawad_name: "HON. JOJO D. DE LEON",
    kagawad_title: "Barangay Kagawad",
    kagawad_1_name: "HON. CRISANTA D. DANIEL",
    kagawad_1_title: "Barangay Kagawad",
    kagawad_2_name: "HON. FLORENCIA S. ABAD",
    kagawad_2_title: "Barangay Kagawad",
    kagawad_3_name: "HON. ANDREA A. AUSTRIA",
    kagawad_3_title: "Barangay Kagawad",
    city_logo_url: "/city-logo.png",
    brgy_logo_url: "/brgy-logo.png",
    captain_sig_base64: "",
    secondary_sig_base64: "",
};

const FIELD_LABELS = {
    requesterName: "Requester Name",
    requesterRelationship: "Requester Relationship",
    deceasedName: "Deceased Name",
    deceasedDate: "Date of Death",
    assistanceType: "Assistance Type",
    businessName: "Business / Trade Name",
    businessAddress: "Business Location",
    businessOwnerAddress: "Operator Address",
    businessType: "Type of Business",
    businessArea: "Coverage / Area",
    businessPermitNo: "Barangay Permit No.",
    operatorName: "Operator / Manager",
    partnerName: "Partner's Full Name",
    wardName: "Ward's Full Name",
    relationship: "Relationship to Ward",
    childName: "Child's Full Name",
    childDOB: "Child's Date of Birth",
    childBirthPlace: "Child's Place of Birth",
    fatherName: "Father's Full Name",
    motherName: "Mother's Full Name",
    requestingInstitution: "Requesting School / Employer",
    propertyLocation: "Property Location",
    propertyOwner: "Property Owner",
    taxDeclarationNo: "Tax Declaration No.",
    propertyArea: "Property Area",
    purposeDetail: "Purpose Detail",
    recipientName: "Recipient Name",
    recipientTitle: "Recipient Title",
    recipientOffice: "Recipient Office",
    recipientAddress: "Recipient Address",
    subject: "Subject",
    organizationName: "Organization / Group",
    presidentName: "President Name",
    vicePresidentName: "Vice President Name",
    appointmentDate: "Appointment Date",
    appointmentTime: "Appointment Time",
    originAddress: "Origin Address",
    destinationAddress: "Destination Address",
    quarantineDays: "Quarantine Days",
    companionName: "Companion Name",
    companionRole: "Companion Role",
    companionTwoName: "Second Companion Name",
    companionTwoRole: "Second Companion Role",
    wardAge: "Ward Age",
    wardGender: "Ward Gender",
    wardDOB: "Ward Date of Birth",
    wardTwoName: "Second Ward Name",
    wardTwoAge: "Second Ward Age",
    wardTwoGender: "Second Ward Gender",
    wardTwoDOB: "Second Ward Date of Birth",
    wardThreeName: "Third Ward Name",
    wardThreeAge: "Third Ward Age",
    wardThreeGender: "Third Ward Gender",
    wardThreeDOB: "Third Ward Date of Birth",
    titleNumber: "Title / OCT Number",
    taxDeclarationBuildingNo: "Building Tax Declaration No.",
    familyHomeYears: "Family Home Years",
    beneficiaryName: "Beneficiary Name",
    eligibilityDocument: "Eligibility Document",
    relationshipDetail: "Relationship Detail",
    boundaryNorth: "North Boundary",
    boundaryEast: "East Boundary",
    boundarySouth: "South Boundary",
    boundaryWest: "West Boundary",
    borderSize: "Border Size",
    detainedFacility: "Detention Facility",
    bailRequesterName: "Bail Requester Name",
    bailRequesterRelationship: "Bail Requester Relationship",
    assistanceRecipientName: "Assistance Recipient Name",
    lockdownAddress: "Lockdown Address",
    lockdownStartDate: "Lockdown Start Date",
    programName: "Program / Requirement",
    burialRelativeName: "Deceased Relative Name",
    telecomCompany: "Telecom Company",
    permitPurpose: "Permit Purpose",
    legalSpouseName: "Legal Spouse Name",
    currentPartnerName: "Current Partner Name",
    businessOwnerName: "Business Owner Name",
    businessPurpose: "Business Purpose",
    noMarriageSubject: "No Marriage Subject",
    childrenNames: "Children Names",
    claimantName: "Claimant Name",
    claimantRelationship: "Claimant Relationship",
    witnessBasis: "Witness / Basis Details",
    impairmentDetail: "Impairment Details",
    employmentHistory: "Employment History",
    loanPurpose: "Loan Purpose",
    occupantName: "Occupant / Possessor Name",
    effectivePeriod: "Effective Period",
    age: "Age",
    dateOfBirth: "Date of Birth",
    placeOfBirth: "Place of Birth",
    yearStarted: "Residency Start / Period",
    incidentName: "Incident / Calamity",
    incidentDate: "Incident Date",
    requirementName: "Requirement / Company",
    minorChildName: "Minor Child Name",
    activityName: "Activity / Program",
    residencyDuration: "Residency Duration",
    parentGuardianName: "Parent / Guardian Name",
    parentGuardianAge: "Parent / Guardian Age",
    thruName: "Thru Name",
    thruTitle: "Thru Title",
    thruOffice: "Thru Office",
    caregiverDescription: "Caregiver / Situation Details",
    wakeDays: "Wake Use Days",
    permitConditions: "Permit Conditions",
};

export const DOC1_CERTIFICATE_OPTIONS = [
    {
        name: "Barangay Clearance",
        templateKey: "doc1-barangay-clearance",
        hasFee: true,
        desc: "Doc #1 clearance with no derogatory record wording.",
    },
    {
        name: "Certificate of Residency",
        templateKey: "doc1-certificate-residency",
        hasFee: false,
        desc: "Doc #1 barangay certificate for bona fide residency.",
    },
    {
        name: "Certificate of Indigency",
        templateKey: "doc1-indigency-medical",
        hasFee: false,
        desc: "Doc #1 indigency format for assistance purposes.",
    },
    {
        name: "Business Permit",
        templateKey: "doc1-work-permit-certification",
        hasFee: true,
        desc: "Doc #1 work/business permit certification format.",
    },
    {
        name: "Good Moral Certificate",
        templateKey: "doc1-good-moral",
        hasFee: false,
        desc: "Doc #1 good moral and no pending case certification.",
    },
    {
        name: "Certificate of Live Birth (Endorsement)",
        templateKey: "doc1-live-birth-endorsement",
        hasFee: false,
        desc: "Doc #1 late registration endorsement for a minor child.",
    },
    {
        name: "Certificate of Cohabitation",
        templateKey: "doc1-cohabitation",
        hasFee: false,
        desc: "Doc #1 common-law partner certification.",
    },
    {
        name: "Certificate of No Business",
        templateKey: "doc1-no-business",
        hasFee: false,
        desc: "Doc #1 certification that a business is no longer existing.",
    },
    {
        name: "Certificate of Guardianship",
        templateKey: "doc1-guardianship",
        hasFee: false,
        desc: "Doc #1 legal guardian certification.",
    },
    {
        name: "Barangay Business Clearance (Renewal)",
        templateKey: "doc1-business-renewal-endorsement",
        hasFee: true,
        desc: "Doc #1 renewal endorsement for mayor's permit issuance.",
    },
    {
        name: "Certificate of Ownership",
        templateKey: "doc1-property-ownership",
        hasFee: false,
        desc: "Doc #1 property ownership and lot details certification.",
    },
    {
        name: "Certificate of Appearance",
        templateKey: "doc1-certificate-appearance",
        hasFee: false,
        desc: "Doc #1 appearance certification format.",
    },
    {
        name: "Endorsement: TODA Courtesy Call",
        templateKey: "doc1-endorsement-toda-courtesy-call",
        hasFee: false,
        desc: "Doc #1 endorsement letter for elected TODA officers.",
    },
    {
        name: "Acceptance Letter",
        templateKey: "doc1-acceptance-letter-quarantine",
        hasFee: false,
        desc: "Doc #1 acceptance letter for return-to-barangay quarantine.",
    },
    {
        name: "Household Certification",
        templateKey: "doc1-household-angkas-pass",
        hasFee: false,
        desc: "Doc #1 household certification for Angkas pass requirements.",
    },
    {
        name: "Family Home Certification",
        templateKey: "doc1-family-home-property",
        hasFee: false,
        desc: "Doc #1 property certification for family home declaration.",
    },
    {
        name: "First Time Jobseeker Certificate",
        templateKey: "doc1-first-time-jobseeker",
        hasFee: false,
        desc: "Doc #1 RA 11261 first time jobseeker certification.",
    },
    {
        name: "Endorsement: Financial Assistance",
        templateKey: "doc1-endorsement-financial-assistance",
        hasFee: false,
        desc: "Doc #1 endorsement letter for financial assistance.",
    },
    {
        name: "DSWD Eligibility Certification",
        templateKey: "doc1-dswd-eligibility-certification",
        hasFee: false,
        desc: "Doc #1 certification for DSWD eligibility documents.",
    },
    {
        name: "Certification of Lot Occupancy",
        templateKey: "doc1-lot-occupancy",
        hasFee: false,
        desc: "Doc #1 lot occupancy and boundary certification.",
    },
    {
        name: "Certification of Undertaking",
        templateKey: "doc1-undertaking-quarantine",
        hasFee: false,
        desc: "Doc #1 quarantine undertaking certification.",
    },
    {
        name: "Detained Resident Bail Certification",
        templateKey: "doc1-detained-bail-certification",
        hasFee: false,
        desc: "Doc #1 certification for detained resident applying for bail.",
    },
    {
        name: "Indigency: Sibling Assistance",
        templateKey: "doc1-indigency-sibling-assistance",
        hasFee: false,
        desc: "Doc #1 indigency certification requested for a sibling.",
    },
    {
        name: "Endorsement: Medical Assistance",
        templateKey: "doc1-endorsement-medical-assistance",
        hasFee: false,
        desc: "Doc #1 endorsement letter for medical assistance.",
    },
    {
        name: "Lockdown Residency Certificate",
        templateKey: "doc1-lockdown-residency-certification",
        hasFee: false,
        desc: "Doc #1 quarantine lockdown residency certification.",
    },
    {
        name: "Extended Duty Shift Notice",
        templateKey: "doc1-extended-duty-shift",
        hasFee: false,
        desc: "Doc #1 duty shift memorandum for rescuers.",
    },
    {
        name: "Burial Assistance Certification",
        templateKey: "doc1-burial-assistance",
        hasFee: false,
        desc: "Doc #1 indigency certification for burial assistance.",
    },
    {
        name: "Indigency: Educational Assistance",
        templateKey: "doc1-indigency-educational-assistance",
        hasFee: false,
        desc: "Doc #1 indigency certification for educational assistance.",
    },
    {
        name: "Telecom Permit Certification",
        templateKey: "doc1-telecom-nap-permit",
        hasFee: false,
        desc: "Doc #1 certification for telecom NAP build or rectification permits.",
    },
    {
        name: "Marital Separation Certification",
        templateKey: "doc1-marital-separation-certification",
        hasFee: false,
        desc: "Doc #1 certification for marital and child relationship details.",
    },
    {
        name: "Business Owner BIR Certification",
        templateKey: "doc1-business-owner-bir-certification",
        hasFee: false,
        desc: "Doc #1 certification for business owner BIR or TIN purposes.",
    },
    {
        name: "No Marriage Index / Death Claim Certificate",
        templateKey: "doc1-no-marriage-death-claim",
        hasFee: false,
        desc: "Doc #1 no marriage index and death claim certification.",
    },
    {
        name: "Hearing Impairment Certification",
        templateKey: "doc1-hearing-impairment-certification",
        hasFee: false,
        desc: "Doc #1 community witness certification for hearing impairment.",
    },
    {
        name: "Indigency: SPES / LEAP",
        templateKey: "doc1-indigency-spes-leap",
        hasFee: false,
        desc: "Doc #1 indigency certification for SPES or LEAP requirements.",
    },
    {
        name: "Simple Residency Certificate",
        templateKey: "doc1-simple-residency-loan",
        hasFee: false,
        desc: "Doc #1 simple residency certificate for loan or general purposes.",
    },
    {
        name: "Solo Parent Certification",
        templateKey: "doc1-solo-parent-certification",
        hasFee: false,
        desc: "Doc #1 solo parent residency certification.",
    },
];

export const DOC2_CERTIFICATE_OPTIONS = [
    {
        name: "Indigency: Income and Means Certification",
        templateKey: "doc2-indigency-income-means",
        hasFee: false,
        desc: "Doc #2 indigency format with income, property, and daily needs wording.",
    },
    {
        name: "Flooded Residence Certification",
        templateKey: "doc2-flooded-residence-certification",
        hasFee: false,
        desc: "Doc #2 no-derogatory certification for a residence flooded during Habagat.",
    },
    {
        name: "Indigency and Good Moral Certification",
        templateKey: "doc2-indigent-good-moral-medical",
        hasFee: false,
        desc: "Doc #2 indigency with good moral/no criminal record wording.",
    },
    {
        name: "Residency Certification: Bank Requirement",
        templateKey: "doc2-residency-bank-record",
        hasFee: false,
        desc: "Doc #2 resident record certification for bank requirements.",
    },
    {
        name: "Minor Athlete Financial Assistance Certification",
        templateKey: "doc2-minor-athlete-financial-assistance",
        hasFee: false,
        desc: "Doc #2 indigency certification for a minor athlete seeking assistance.",
    },
    {
        name: "Parent Relationship / SPES Certification",
        templateKey: "doc2-parent-relationship-spes",
        hasFee: false,
        desc: "Doc #2 marital and biological father certification for SPES purposes.",
    },
    {
        name: "Business Closure Certification",
        templateKey: "doc2-business-closure-court-records",
        hasFee: false,
        desc: "Doc #2 certification that a business is no longer operating.",
    },
    {
        name: "General Legal Records Certification",
        templateKey: "doc2-general-legal-records",
        hasFee: false,
        desc: "Doc #2 bonafide resident/no-derogatory certification for legal records.",
    },
    {
        name: "Centenarian Living Certification",
        templateKey: "doc2-centenarian-living-veteran",
        hasFee: false,
        desc: "Doc #2 certification that a resident is living and is a centenarian.",
    },
    {
        name: "First Time Jobseeker Oath of Undertaking",
        templateKey: "doc2-first-time-jobseeker-oath",
        hasFee: false,
        desc: "Doc #2 RA 11261 first time jobseeker oath of undertaking.",
    },
    {
        name: "Funeral Assistance / Covered Court Indigency",
        templateKey: "doc2-funeral-covered-court-indigency",
        hasFee: false,
        desc: "Doc #2 indigency for funeral assistance and covered court wake use.",
    },
    {
        name: "Endorsement: Hospital Discharge Return Assistance",
        templateKey: "doc2-endorsement-hospital-return",
        hasFee: false,
        desc: "Doc #2 endorsement to CSWDO/Mayor for hospital discharge return assistance.",
    },
    {
        name: "Business Assessor / Building Permit Certification",
        templateKey: "doc2-business-assessor-permit",
        hasFee: true,
        desc: "Doc #2 business certification for city assessor or building permit purpose.",
    },
    {
        name: "Barangay Residency: School Requirement",
        templateKey: "doc2-residency-school-requirement",
        hasFee: false,
        desc: "Doc #2 residency certificate for school requirements.",
    },
    {
        name: "Registered Business Bank Certification",
        templateKey: "doc2-registered-business-bank",
        hasFee: true,
        desc: "Doc #2 registered business certification for bank requirements.",
    },
    {
        name: "Guardian PSA Requirement Certification",
        templateKey: "doc2-guardian-psa-certification",
        hasFee: false,
        desc: "Doc #2 guardian/legal guardian certification for PSA requirements.",
    },
    {
        name: "Indigency: Guardian Medical Assistance",
        templateKey: "doc2-indigency-guardian-medical",
        hasFee: false,
        desc: "Doc #2 indigency certification requested by a guardian for medical assistance.",
    },
    {
        name: "Organization Water Connection Clearance",
        templateKey: "doc2-organization-water-clearance",
        hasFee: true,
        desc: "Doc #2 barangay clearance for organization water connection purposes.",
    },
    {
        name: "Unemployment / SPES Certification",
        templateKey: "doc2-unemployment-spes-certification",
        hasFee: false,
        desc: "Doc #2 certification that the resident is unemployed/no work for SPES.",
    },
    {
        name: "LPG House-to-House Activity Permit",
        templateKey: "doc2-lpg-house-to-house-permit",
        hasFee: true,
        desc: "Doc #2 barangay permit for LPG safety house-to-house demonstration.",
    },
];

export const CERTIFICATE_TEMPLATE_OPTIONS = [
    ...DOC1_CERTIFICATE_OPTIONS,
    ...DOC2_CERTIFICATE_OPTIONS,
];

const TEMPLATE_ALIASES = {
    "barangay clearance": "doc1-barangay-clearance",
    "certificate of residency": "doc1-certificate-residency",
    "certificate of indigency": "doc1-indigency-medical",
    "barangay indigency": "doc1-indigency-medical",
    "business permit": "doc1-work-permit-certification",
    "good moral certificate": "doc1-good-moral",
    "certificate of live birth (endorsement)": "doc1-live-birth-endorsement",
    "certificate of cohabitation": "doc1-cohabitation",
    "certificate of no business": "doc1-no-business",
    "certificate of guardianship": "doc1-guardianship",
    "barangay business clearance (renewal)":
        "doc1-business-renewal-endorsement",
    "certificate of ownership": "doc1-property-ownership",
    "certificate of appearance": "doc1-certificate-appearance",
    "endorsement: toda courtesy call": "doc1-endorsement-toda-courtesy-call",
    "acceptance letter": "doc1-acceptance-letter-quarantine",
    "household certification": "doc1-household-angkas-pass",
    "family home certification": "doc1-family-home-property",
    "first time jobseeker certificate": "doc1-first-time-jobseeker",
    "endorsement: financial assistance":
        "doc1-endorsement-financial-assistance",
    "dswd eligibility certification": "doc1-dswd-eligibility-certification",
    "certification of lot occupancy": "doc1-lot-occupancy",
    "certification of undertaking": "doc1-undertaking-quarantine",
    "detained resident bail certification": "doc1-detained-bail-certification",
    "indigency: sibling assistance": "doc1-indigency-sibling-assistance",
    "endorsement: medical assistance": "doc1-endorsement-medical-assistance",
    "lockdown residency certificate": "doc1-lockdown-residency-certification",
    "extended duty shift notice": "doc1-extended-duty-shift",
    "burial assistance certification": "doc1-burial-assistance",
    "indigency: educational assistance":
        "doc1-indigency-educational-assistance",
    "telecom permit certification": "doc1-telecom-nap-permit",
    "marital separation certification": "doc1-marital-separation-certification",
    "business owner bir certification": "doc1-business-owner-bir-certification",
    "no marriage index / death claim certificate":
        "doc1-no-marriage-death-claim",
    "hearing impairment certification": "doc1-hearing-impairment-certification",
    "indigency: spes / leap": "doc1-indigency-spes-leap",
    "simple residency certificate": "doc1-simple-residency-loan",
    "solo parent certification": "doc1-solo-parent-certification",
    "indigency: income and means certification": "doc2-indigency-income-means",
    "flooded residence certification": "doc2-flooded-residence-certification",
    "indigency and good moral certification":
        "doc2-indigent-good-moral-medical",
    "residency certification: bank requirement": "doc2-residency-bank-record",
    "minor athlete financial assistance certification":
        "doc2-minor-athlete-financial-assistance",
    "parent relationship / spes certification": "doc2-parent-relationship-spes",
    "business closure certification": "doc2-business-closure-court-records",
    "general legal records certification": "doc2-general-legal-records",
    "centenarian living certification": "doc2-centenarian-living-veteran",
    "first time jobseeker oath of undertaking":
        "doc2-first-time-jobseeker-oath",
    "funeral assistance / covered court indigency":
        "doc2-funeral-covered-court-indigency",
    "endorsement: hospital discharge return assistance":
        "doc2-endorsement-hospital-return",
    "business assessor / building permit certification":
        "doc2-business-assessor-permit",
    "barangay residency: school requirement":
        "doc2-residency-school-requirement",
    "registered business bank certification": "doc2-registered-business-bank",
    "guardian psa requirement certification": "doc2-guardian-psa-certification",
    "indigency: guardian medical assistance": "doc2-indigency-guardian-medical",
    "organization water connection clearance":
        "doc2-organization-water-clearance",
    "unemployment / spes certification": "doc2-unemployment-spes-certification",
    "lpg house-to-house activity permit": "doc2-lpg-house-to-house-permit",
};

function normalizeKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

export function normalizeBarangaySettings(settings = {}) {
    return {
        ...DEFAULT_SETTINGS,
        ...Object.fromEntries(
            Object.entries(settings || {}).filter(([, value]) => value != null),
        ),
    };
}

function value(data, key, fallback = "________________") {
    const direct = data?.[key];
    const extra = data?.extraFields?.[key] ?? data?.extra_fields?.[key];
    const selected = direct ?? extra;
    const text = String(selected ?? "").trim();
    return text || fallback;
}

function valueAny(data, keys, fallback = "________________") {
    for (const key of keys) {
        const found = value(data, key, "");
        if (found) return found;
    }
    return fallback;
}

function escapeHtml(raw) {
    return String(raw ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function strong(raw) {
    return `<strong>${escapeHtml(raw)}</strong>`;
}

function upper(raw) {
    return String(raw || "")
        .trim()
        .toUpperCase();
}

function dateObj(raw) {
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(raw = new Date()) {
    const d = dateObj(raw) || new Date();
    return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function ordinalDay(raw = new Date(), uppercaseSuffix = false) {
    const d = dateObj(raw) || new Date();
    const day = d.getDate();
    const mod10 = day % 10;
    const mod100 = day % 100;
    let suffix = "th";
    if (mod10 === 1 && mod100 !== 11) suffix = "st";
    if (mod10 === 2 && mod100 !== 12) suffix = "nd";
    if (mod10 === 3 && mod100 !== 13) suffix = "rd";
    return `${day}${uppercaseSuffix ? suffix.toUpperCase() : suffix}`;
}

function issuedDate(data, pattern = "issued-this") {
    const raw =
        data?.issuedAt || data?.issued_at || data?.dateIssued || new Date();
    const d = dateObj(raw) || new Date();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear();

    if (pattern === "day-of") {
        return `${ordinalDay(d)} day of ${month} ${year}`;
    }
    if (pattern === "day-month-comma") {
        return `${ordinalDay(d)} Day of ${month}, ${year}`;
    }
    return `${ordinalDay(d, true)} Day of ${month} ${year}`;
}

function yearsOld(data) {
    const explicit = value(data, "age", "");
    if (explicit) return explicit;
    const dob = dateObj(valueAny(data, ["dateOfBirth", "date_of_birth"], ""));
    if (!dob) return "";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())) {
        age -= 1;
    }
    return Number.isFinite(age) ? String(age) : "";
}

function legalAgePhrase(data) {
    const age = yearsOld(data);
    return age ? `${age} years old` : "of legal age";
}

function personName(data) {
    return valueAny(data, ["residentName", "name", "resident_name"]);
}

function address(data) {
    return value(data, "address", "Barangay East Tapinac, Olongapo City");
}

function purpose(data) {
    return value(data, "purpose", "whatever legal purpose it may serve");
}

function personPrefix(data) {
    return value(data, "prefix", "Mr./Ms.");
}

function paragraphs(items) {
    return items
        .filter(Boolean)
        .map((item) => {
            if (typeof item === "string") {
                return `<p>${item}</p>`;
            }
            const className = item.className
                ? ` class="${item.className}"`
                : "";
            return `<p${className}>${item.html || ""}</p>`;
        })
        .join("");
}

function signatoryHtml(settings, type = "captain") {
    const map = {
        captain: {
            name: settings.captain_name,
            title: settings.captain_title,
            sig: settings.captain_sig_base64,
        },
        kagawad: {
            name: settings.kagawad_name,
            title: settings.kagawad_title,
            sig: settings.secondary_sig_base64,
        },
        kagawad1: {
            name: settings.kagawad_1_name,
            title: settings.kagawad_1_title,
            sig: settings.secondary_sig_base64,
        },
        kagawad2: {
            name: settings.kagawad_2_name,
            title: settings.kagawad_2_title,
            sig: "",
        },
        kagawad3: {
            name: settings.kagawad_3_name,
            title: settings.kagawad_3_title,
            sig: "",
        },
    };
    const selected = map[type] || map.captain;
    const sig = selected.sig
        ? `<img class="cf-signature-img" src="${escapeHtml(selected.sig)}" alt="" />`
        : `<div class="cf-signature-spacer"></div>`;
    return `
        <div class="cf-signatory">
            ${sig}
            <div class="cf-signatory-name">${escapeHtml(upper(selected.name))}</div>
            <div class="cf-signatory-title">${escapeHtml(selected.title)}</div>
        </div>`;
}

function renderSignatures(settings, mode = "captain-right") {
    if (mode === "none") return "";
    if (mode === "kagawad-right") {
        return `<div class="cf-signature-row captain">${signatoryHtml(settings, "kagawad")}</div>`;
    }
    if (mode === "kagawad1-right") {
        return `<div class="cf-signature-row captain">${signatoryHtml(settings, "kagawad1")}</div>`;
    }
    if (mode === "kagawad2-right") {
        return `<div class="cf-signature-row captain">${signatoryHtml(settings, "kagawad2")}</div>`;
    }
    if (mode === "kagawad3-right") {
        return `<div class="cf-signature-row captain">${signatoryHtml(settings, "kagawad3")}</div>`;
    }
    if (mode === "kagawad-left-captain-right") {
        return `
            <div class="cf-signature-row two">
                ${signatoryHtml(settings, "kagawad")}
                ${signatoryHtml(settings, "captain")}
            </div>`;
    }
    if (mode === "witnessed-by") {
        return `
            <div class="cf-witness-label">Witnessed By:</div>
            <div class="cf-signature-row two compact">
                ${signatoryHtml(settings, "kagawad1")}
                ${signatoryHtml(settings, "kagawad2")}
            </div>
            <div class="cf-signature-row captain-center">
                ${signatoryHtml(settings, "captain")}
            </div>`;
    }
    if (mode === "captain-right-witnessed-by") {
        return `
            <div class="cf-signature-row captain witness-captain">
                ${signatoryHtml(settings, "captain")}
            </div>
            <div class="cf-witness-block">
                <div class="cf-witness-label">Witnessed By:</div>
                <div class="cf-witness-stack">
                    ${signatoryHtml(settings, "kagawad1")}
                    ${signatoryHtml(settings, "kagawad2")}
                </div>
            </div>`;
    }
    return `<div class="cf-signature-row captain">${signatoryHtml(settings, "captain")}</div>`;
}

function letterHeader(data, subjectFallback = "ENDORSEMENT") {
    const recipientLines = [
        value(data, "recipientName", "HON. ROLEN C. PAULINO, JR."),
        value(data, "recipientTitle", "CITY MAYOR"),
        value(data, "recipientOffice", "OLONGAPO CITY"),
        value(data, "recipientAddress", ""),
    ].filter(Boolean);

    return `
        <div class="cf-letter-date">${escapeHtml(formatDate(data?.issuedAt || new Date()))}</div>
        <div class="cf-letter-to">
            ${recipientLines.map((line) => `<div>${escapeHtml(upper(line))}</div>`).join("")}
        </div>
        <div class="cf-letter-subject">Subject: ${escapeHtml(value(data, "subject", subjectFallback))}</div>`;
}

function letterClosing(closing = "Respectfully,") {
    return `<p>${escapeHtml(closing)}</p>`;
}

function householdMembersTable(data) {
    const rows = [
        {
            name: personName(data),
            position: value(data, "companionRole", "DRIVER"),
        },
        {
            name: value(data, "companionName", "________________"),
            position: value(data, "companionTwoRole", "PASSENGER"),
        },
    ];

    return `
        <table class="cf-cert-table cf-household-table">
            <thead>
                <tr>
                    <th>NAME:</th>
                    <th>POSITION:</th>
                </tr>
            </thead>
            <tbody>
                ${rows
                    .map(
                        (row, index) => `
                            <tr>
                                <td class="name-cell">${index + 1}.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml(upper(row.name))}</td>
                                <td class="position-cell">${escapeHtml(upper(row.position))}</td>
                            </tr>`,
                    )
                    .join("")}
            </tbody>
        </table>`;
}

function boundaryTable(data) {
    const cell = (label, key) => `
        <td class="boundary-label">${escapeHtml(label)}</td>
        <td class="boundary-value">${escapeHtml(value(data, key, "________________"))}</td>`;

    return `
        <table class="cf-cert-table cf-boundary-table">
            <tbody>
                <tr>
                    ${cell("NORTH", "boundaryNorth")}
                    ${cell("EAST", "boundaryEast")}
                </tr>
                <tr>
                    ${cell("SOUTH", "boundarySouth")}
                    ${cell("WEST", "boundaryWest")}
                </tr>
            </tbody>
        </table>`;
}

function guardianDetailsTable(data) {
    const rows = [
        {
            name: value(data, "wardName", "________________"),
            age: value(data, "wardAge", ""),
            gender: value(data, "wardGender", ""),
            dob: value(data, "wardDOB", ""),
        },
        {
            name: value(data, "wardTwoName", ""),
            age: value(data, "wardTwoAge", ""),
            gender: value(data, "wardTwoGender", ""),
            dob: value(data, "wardTwoDOB", ""),
        },
        {
            name: value(data, "wardThreeName", ""),
            age: value(data, "wardThreeAge", ""),
            gender: value(data, "wardThreeGender", ""),
            dob: value(data, "wardThreeDOB", ""),
        },
    ].filter((row) => row.name);

    return `
        <table class="cf-cert-table cf-guardian-table">
            <thead>
                <tr>
                    <th>NAME</th>
                    <th>AGE</th>
                    <th>GENDER</th>
                    <th>DOB</th>
                </tr>
            </thead>
            <tbody>
                ${rows
                    .map(
                        (row) => `
                            <tr>
                                <td>${escapeHtml(upper(row.name))}</td>
                                <td>${escapeHtml(row.age)}</td>
                                <td>${escapeHtml(upper(row.gender))}</td>
                                <td>${escapeHtml(row.dob ? formatDate(row.dob) : "")}</td>
                            </tr>`,
                    )
                    .join("")}
            </tbody>
        </table>`;
}

function signatureLine(label = "Signature over Printed Name") {
    return `
        <div class="cf-manual-signature">
            <div>_______________________</div>
            <small>${escapeHtml(label)}</small>
        </div>`;
}

const TEMPLATES = {
    "doc1-barangay-clearance": {
        title: "BARANGAY CLEARANCE",
        signatures: "captain-right",
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom It May Concern," },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, is a bonafide resident of this barangay, with postal address at ${strong(address(data))}, and has no derogatory record on file pursuant to Republic Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                `Certification is being issued upon the request of the above named for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-certificate-residency": {
        title: "BARANGAY CERTIFICATE",
        signatures: "kagawad-left-captain-right",
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, is a bonafide resident of this barangay with postal address at ${strong(address(data))}, a law-abiding citizen of this community and has no derogatory record pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                `Issued this ${issuedDate(data)} upon the request of the above named for ${strong(upper(purpose(data)))} purposes, at the Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-indigency-medical": {
        title: "BARANGAY INDIGENCY",
        signatures: "captain-right",
        fields: ["requesterName", "requesterRelationship", "assistanceType"],
        render(data) {
            const requester = value(data, "requesterName", "");
            const requesterLine = requester
                ? `Certification is hereby requested by ${strong(upper(requester))}, ${escapeHtml(value(data, "requesterRelationship", "relative"))} of the above named for ${strong(upper(purpose(data)))} purposes.`
                : `Certification is hereby requested by the above named for ${strong(upper(purpose(data)))} purposes.`;
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)} of ${strong(address(data))} is a bonafide resident of this barangay and has no derogatory record pursuant to Rep Act. No. 7160 otherwise known as the local Government Code of 1991.`,
                "Further certifies that the above-mentioned named belongs to indigent family and could not afford hospitalization, medical, educational, or other assistance needs.",
                requesterLine,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-work-permit-certification": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "businessName",
            "businessAddress",
            "businessType",
            "businessArea",
        ],
        render(data) {
            const businessName = value(
                data,
                "businessName",
                "________________",
            );
            const businessAddress = value(
                data,
                "businessAddress",
                address(data),
            );
            const businessType = value(
                data,
                "businessType",
                "business activity",
            );
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that, ${strong(upper(businessName))} is hereby granted clearance of work permit to conduct ${escapeHtml(businessType)} within the premises located at ${strong(businessAddress)}.`,
                `This certification is being issued upon the request of ${strong(upper(personName(data)))} for the purpose of securing necessary permit and for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-good-moral": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["requestingInstitution"],
        render(data) {
            const institution = value(data, "requestingInstitution", "");
            const purposeText = institution
                ? `${purpose(data)} / ${institution}`
                : purpose(data);
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern;" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} is a bonafide resident of this barangay at ${strong(address(data))}, with no derogatory record on file, pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                "This certifies further that the above named is of GOOD MORAL CHARACTER, and has no pending case in this office.",
                `Certification is being issued to the above-name for ${strong(upper(purposeText))} purposes.`,
                `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-live-birth-endorsement": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "partnerName",
            "childName",
            "childDOB",
            "childBirthPlace",
            "fatherName",
            "motherName",
        ],
        render(data) {
            const partner = value(data, "partnerName", "________________");
            const child = value(data, "childName", "________________");
            const childDob = value(data, "childDOB", "");
            const childDobText = childDob
                ? formatDate(childDob)
                : "________________";
            const childBirthPlace = value(
                data,
                "childBirthPlace",
                "Olongapo City",
            );
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that spouses ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} and ${strong(upper(partner))}, are both bonafide residents of this barangay, with no derogatory record on file pursuant to Republic Act, No. 7160, otherwise known as the Local Government Code of 1991.`,
                `This further certifies that the above-named has a minor child named as ${strong(upper(child))}, who was born on ${strong(childDobText)} at ${strong(childBirthPlace)} and has not been registered yet at the Local Civil Registry since the time of birth.`,
                "The above-named parent has sought the assistance of this office, and is therefore advise to seek assistance at the Local Civil Registry, Olongapo City for proper registration of their minor child.",
                `Certification is being issued to ${strong(upper(personName(data)))} in behalf of their minor child, ${strong(upper(child))} for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data, "day-month-comma")} at Barangay East Tapinac Olongapo City.`,
            ]);
        },
    },
    "doc1-cohabitation": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["partnerName"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to Certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, is a Resident of ${strong(address(data))}, and has no derogatory record filed in this office pursuant to Republic Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                "Further certifies that the above named is the common-law spouse of",
                {
                    className: "center-strong",
                    html: escapeHtml(upper(value(data, "partnerName"))),
                },
                `Issued this ${issuedDate(data, "day-of")} for ${strong(upper(purpose(data)))}.`,
            ]);
        },
    },
    "doc1-no-business": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "businessName",
            "businessAddress",
            "requesterName",
            "requestingInstitution",
        ],
        render(data) {
            const business = value(data, "businessName", personName(data));
            const businessAddress = value(
                data,
                "businessAddress",
                address(data),
            );
            const requester = value(data, "requesterName", personName(data));
            const office = value(
                data,
                "requestingInstitution",
                "requesting office",
            );
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that, ${strong(upper(business))}, located at ${strong(businessAddress)} is no longer existing in this barangay as per our systems record.`,
                `Certification is being issued as per request of ${strong(requester)}, ${escapeHtml(office)}.`,
                `Given this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-guardianship": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["wardName", "relationship"],
        render(data) {
            const ward = value(data, "wardName");
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN;" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} is a resident of this Barangay with postal Address ${strong(address(data))} has no derogatory record filed pursuant to Republic Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                `Further certifies that the above-named is the legal guardian of ${strong(upper(ward))}. Certification is being issued as per request of legal guardian, for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-business-renewal-endorsement": {
        title: "ENDORSEMENT",
        signatures: "captain-right",
        fields: [
            "businessPermitNo",
            "businessName",
            "businessAddress",
            "operatorName",
            "businessOwnerAddress",
        ],
        render(data) {
            const permitNo = value(
                data,
                "businessPermitNo",
                "ET-BPI-2024-5984",
            );
            const business = value(data, "businessName", "________________");
            const businessAddress = value(
                data,
                "businessAddress",
                address(data),
            );
            const operator = value(data, "operatorName", personName(data));
            const operatorAddress = value(
                data,
                "businessOwnerAddress",
                address(data),
            );
            return `
                <div class="cf-renewal">RENEWAL</div>
                <div class="cf-form-lines">
                    <div>${escapeHtml(permitNo)}</div><small>Barangay Permit No.</small>
                    <div>${escapeHtml(upper(business))}</div><small>(Business Name or Trade Activity)</small>
                    <div>${escapeHtml(upper(businessAddress))}</div><small>(Location)</small>
                    <div>${escapeHtml(upper(operator))}</div><small>(Operator/Manager)</small>
                    <div>${escapeHtml(upper(operatorAddress))}</div><small>(Address)</small>
                </div>
                ${paragraphs([
                    "being applied for the corresponding Business Permit has been found to be:",
                    "COMPLIANT with the provisions of existing Barangay Ordinance, rules and regulations being enforced in this barangay:",
                    "In view of the foregoing, this Barangay, thru the undersigned,",
                    "Interposes No Objection for the issuance of the corresponding Mayor's Permit being applied for.",
                ])}`;
        },
    },
    "doc1-property-ownership": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "propertyLocation",
            "taxDeclarationNo",
            "propertyArea",
            "borderSize",
            "boundaryNorth",
            "boundaryEast",
            "boundarySouth",
            "boundaryWest",
        ],
        render(data) {
            const propertyLocation = value(
                data,
                "propertyLocation",
                address(data),
            );
            const taxDeclaration = value(
                data,
                "taxDeclarationNo",
                "________________",
            );
            const area = value(data, "propertyArea", "________________");
            return `
                ${paragraphs([
                    { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                    `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "nationality", "Filipino"))} Citizen is the owner of a LOT located at ${strong(propertyLocation)} with Land TD No: ${strong(taxDeclaration)} measuring approx. ${strong(area)} more particularly described to with:`,
                    `BORDER SIZE: ${strong(value(data, "borderSize", "________________"))}`,
                ])}
                ${boundaryTable(data)}
                ${paragraphs([
                    "Further certifies that NO building located at the above-mentioned address was found to be dilapidated upon inspection of the community area officer assigned on the area.",
                    `Issued upon request of ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} this ${issuedDate(data, "day-of")}, at the Barangay Hall of East Tapinac, Olongapo City for ${strong(upper(purpose(data)))} purposes.`,
                ])}`;
        },
    },
    "doc1-certificate-appearance": {
        title: "CERTIFICATE OF APPEARANCE",
        signatures: "captain-right",
        fields: ["requestingInstitution", "appearanceDate"],
        render(data) {
            const institution = value(
                data,
                "requestingInstitution",
                "________________",
            );
            const appearanceDate = value(data, "appearanceDate", "");
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} of ${strong(institution)} appeared at this barangay on ${strong(appearanceDate ? formatDate(appearanceDate) : formatDate(data?.issuedAt))} to conduct ${escapeHtml(purpose(data))}.`,
                `Given this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City, Philippines.`,
            ]);
        },
    },
    "doc1-endorsement-toda-courtesy-call": {
        title: "ENDORSEMENT",
        hideTitle: true,
        signatures: "captain-right",
        fields: [
            "recipientName",
            "recipientTitle",
            "recipientOffice",
            "subject",
            "organizationName",
            "presidentName",
            "vicePresidentName",
            "appointmentDate",
            "appointmentTime",
        ],
        render(data) {
            const organization = value(
                data,
                "organizationName",
                "TODA, Zone II",
            );
            const appointmentDate = value(data, "appointmentDate", "");
            const appointmentTime = value(
                data,
                "appointmentTime",
                "3:00 in the afternoon",
            );
            const dateText = appointmentDate
                ? formatDate(appointmentDate)
                : "________________";
            return `
                ${letterHeader(data, "ENDORSEMENT: NEWLY ELECTED, ZONE II TODA PRESIDENT & VICE PRESIDENT COURTESY CALL")}
                <div class="cf-letter-rule"></div>
                ${paragraphs([
                    { className: "salutation", html: "Dear Mayor;" },
                    `May I respectfully endorse to your good office the recent elected candidates of ${strong(organization)}, ${strong(value(data, "presidentName", "________________"))} (TODA President) and ${strong(value(data, "vicePresidentName", "________________"))} (TODA Vice President) to have their Courtesy Call as Elected Officers on ${strong(dateText)} @ ${escapeHtml(appointmentTime)}.`,
                    "It is hope and anticipated that our request be given your preferential attention.",
                    "Thank you and More Power!",
                ])}
                ${letterClosing()}`;
        },
    },
    "doc1-acceptance-letter-quarantine": {
        title: "ACCEPTANCE LETTER",
        signatures: "captain-right",
        fields: ["originAddress", "destinationAddress", "quarantineDays"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `The undersigned is hereby granting the request of ${strong(upper(personName(data)))} who came from ${strong(value(data, "originAddress", "________________"))} and has desired to go home in our Barangay particularly ${strong(value(data, "destinationAddress", address(data)))}.`,
                `Further, upon entering in this Barangay, the above-mentioned is subject for ${strong(value(data, "quarantineDays", "14"))} days self-quarantine.`,
                "This certification is issued in accordance with the Bayanihan Heal as One Act as well as the existing laws, rules and regulations.",
                `Given this ${issuedDate(data, "day-of")} at the Office of the Punong Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-household-angkas-pass": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "companionName",
            "companionRole",
            "companionTwoRole",
        ],
        render(data) {
            return `
                ${paragraphs([
                    { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                    "This is to certify that:",
                ])}
                ${householdMembersTable(data)}
                ${paragraphs([
                    `of legal ages, are residents at ${strong(address(data))}.`,
                    "Further certifies that the above-named belongs to one household.",
                    `Issued upon the request of the aforementioned persons for ${strong(upper(purpose(data)))} requirement purposes this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
                ])}`;
        },
    },
    "doc1-family-home-property": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "propertyLocation",
            "propertyOwner",
            "titleNumber",
            "taxDeclarationNo",
            "taxDeclarationBuildingNo",
            "familyHomeYears",
            "deceasedName",
            "deceasedDate",
        ],
        render(data) {
            const deceasedDate = value(data, "deceasedDate", "");
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that the property located at ${strong(value(data, "propertyLocation", address(data)))} is registered in the name of ${strong(upper(value(data, "propertyOwner", personName(data))))} covered by ${escapeHtml(value(data, "titleNumber", "OCT/TCT No. ____________"))} with Tax Declaration No. ${escapeHtml(value(data, "taxDeclarationNo", "____________"))} and TD No. ${escapeHtml(value(data, "taxDeclarationBuildingNo", "____________"))}.`,
                `That the said property was the FAMILY HOME and permanent residence and dwelling of the late ${strong(upper(value(data, "deceasedName", value(data, "propertyOwner", personName(data)))))} ${escapeHtml(value(data, "familyHomeYears", "from ________ until"))} his/her death ${deceasedDate ? `on ${escapeHtml(formatDate(deceasedDate))}` : "on ________________"}.`,
                `This certification is being issued for purposes of declaring the said property as ${strong(upper(purpose(data)))}.`,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-first-time-jobseeker": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: ["yearStarted"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} of legal age, a resident of ${strong(address(data))} ${escapeHtml(value(data, "yearStarted", "up to present"))}, is a qualified avail of RA 11261 or the First Time Jobseekers Assistance Act of 2019.`,
                "I further certify that the holder/bearer was informed of his/her rights, including the duties and responsibilities accorded by RA 11261 through the Oath of Undertaking he/she has signed and executed in the presence of Barangay Official/s.",
                `Signed this ${issuedDate(data, "day-of")}, in the City of Olongapo.`,
                "[This certification is valid only for one (1) Year from the date issued]",
            ]);
        },
    },
    "doc1-endorsement-financial-assistance": {
        title: "ENDORSEMENT",
        hideTitle: true,
        signatures: "captain-right",
        fields: [
            "recipientName",
            "recipientTitle",
            "recipientOffice",
            "subject",
        ],
        render(data) {
            return `
                ${letterHeader(data, "ENDORSEMENT: FINANCIAL ASSISTANCE")}
                <div class="cf-letter-rule"></div>
                ${paragraphs([
                    {
                        className: "salutation",
                        html: `Dear ${escapeHtml(value(data, "recipientTitle", "Captain"))},`,
                    },
                    "GREETINGS!",
                    `May I endorse to your good office, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, a Resident of ${strong(address(data))}.`,
                    `The above-named belongs to an Indigent Family in this barangay and could not hardly support his/her ${escapeHtml(value(data, "assistanceType", "Financial Assistance"))} purposes.`,
                    `Given this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
                    "Thank you and More Power!",
                ])}
                ${letterClosing()}`;
        },
    },
    "doc1-dswd-eligibility-certification": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["eligibilityDocument", "requesterName", "relationshipDetail"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN;" },
                `This is to certify that, the ${escapeHtml(value(data, "eligibilityDocument", "DSWD Certificate of Eligibility"))} bearing the name of ${strong(upper(personName(data)))} of ${strong(address(data))} has no derogatory record filed pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                `Certification is being issued for whatever legal intent it may serve as per request of ${strong(upper(value(data, "requesterName", "________________")))} - (${escapeHtml(value(data, "relationshipDetail", "relationship"))}).`,
                `Issued this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-lot-occupancy": {
        title: "CERTIFICATION OF LOT OCCUPANCY",
        signatures: "captain-right",
        fields: [
            "occupantName",
            "propertyLocation",
            "boundaryNorth",
            "boundaryEast",
            "boundarySouth",
            "boundaryWest",
            "propertyArea",
        ],
        render(data) {
            return `
                ${paragraphs([
                    {
                        className: "salutation",
                        html: "TO WHOM IT MAY CONCERN:",
                    },
                    `This is to certify that as per documents shown and submitted in this office by the applicant and as verified, ${strong(upper(value(data, "occupantName", personName(data))))} is the actual occupant and possessor of a certain parcel of land located at ${strong(value(data, "propertyLocation", address(data)))} particularly described as follows;`,
                    "Bounded:",
                ])}
                ${boundaryTable(data)}
                ${paragraphs([
                    `Containing an area of approximately ${strong(value(data, "propertyArea", "________ square meters"))} more or less.`,
                    `This certification is being issued upon the request of ${strong(upper(value(data, "occupantName", personName(data))))} for ${strong(upper(purpose(data)))} purposes.`,
                    `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
                ])}`;
        },
    },
    "doc1-undertaking-quarantine": {
        title: "CERTIFICATION OF UNDERTAKING",
        signatures: "captain-right",
        fields: ["age", "purposeDetail"],
        render(data) {
            return `
                ${paragraphs([
                    `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "age", "____"))} years old, is a bonafide resident of ${strong(address(data))}.`,
                    "Whereas, His/her age belongs to those individuals who are prohibited to go out of their residence during the quarantine period;",
                    `Whereas, He/she is the only member in their household that are capable to go out for the purpose of ${escapeHtml(value(data, "purposeDetail", "purchasing their needs, transacting utility bills payment and other government agency requirements"))};`,
                    "Whereas, He/she has full knowledge that anyone who is below 21 years of age and above 59 years of age and pregnant women are prohibited to leave their residence until the quarantine is deemed lifted by the government;",
                    "As such, He/she is aware of the level risk he/she is entering into and hereby undertakes to observe additional precautionary measures.",
                    "By affixing my signature below, I hereby declare that I have fully understood the content of this Certificate and Undertaking and that the contents written herein were fully explained to me in a language I understand.",
                    `Signed this ${issuedDate(data, "day-of")}.`,
                ])}
                ${signatureLine()}`;
        },
    },
    "doc1-detained-bail-certification": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: [
            "detainedFacility",
            "bailRequesterName",
            "bailRequesterRelationship",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MY CONCERN" },
                `As per record found in this office, this is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, is a resident of ${strong(address(data))}.`,
                `Further certifies that the above-named is presently detained at ${strong(value(data, "detainedFacility", "OCARE"))} and is applying for BAIL as requested by (${escapeHtml(value(data, "bailRequesterRelationship", "Relationship"))}) ${strong(upper(value(data, "bailRequesterName", "________________")))}.`,
                `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-indigency-sibling-assistance": {
        title: "BARANGAY INDIGENCY",
        signatures: "captain-right",
        fields: ["assistanceRecipientName", "assistanceType"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom it my Concern," },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} with postal address at ${strong(address(data))} has no derogatory record on file, pursuant to Republic Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                "This further certifies that the above-named person belongs to indigent family in this Barangay and has no stable and sufficient job.",
                `This certification is being issued upon the request of the above-named for his/her sibling ${strong(upper(value(data, "assistanceRecipientName", "________________")))}.`,
                `Signed and issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City for ${strong(upper(value(data, "assistanceType", purpose(data))))} requirement purposes.`,
            ]);
        },
    },
    "doc1-endorsement-medical-assistance": {
        title: "ENDORSEMENT",
        hideTitle: true,
        signatures: "captain-right",
        fields: [
            "recipientName",
            "recipientTitle",
            "recipientOffice",
            "subject",
            "assistanceType",
        ],
        render(data) {
            return `
                ${letterHeader(data, "ENDORSEMENT: MEDICAL ASSISTANCE")}
                <div class="cf-letter-rule"></div>
                ${paragraphs([
                    { className: "salutation", html: "Dear Congressman," },
                    "GREETINGS!",
                    `May I endorse to your good office ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, a Resident at ${strong(address(data))}.`,
                    `The above-named belongs to an Indigent Family in this barangay and could not hardly support for his/her ${escapeHtml(value(data, "assistanceType", "Medical Expense"))}.`,
                    "Thank you and More Power!",
                ])}
                ${letterClosing()}`;
        },
    },
    "doc1-lockdown-residency-certification": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: ["lockdownAddress", "lockdownStartDate", "programName"],
        render(data) {
            const lockdownStart = value(data, "lockdownStartDate", "");
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern:" },
                `This is to certify, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, of legal age, a resident of ${strong(address(data))}, has been locked-down in our community at ${strong(value(data, "lockdownAddress", address(data)))} ${lockdownStart ? `since ${escapeHtml(formatDate(lockdownStart))}` : "since ____________"} up to present during the COVID-19 quarantine period.`,
                `Issued upon the request of the above-named person for ${strong(upper(value(data, "programName", purpose(data))))} requirement purposes.`,
                `Given this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-extended-duty-shift": {
        title: "EXTENDED DUTY SHIFT",
        hideTitle: true,
        signatures: "captain-right",
        fields: [
            "recipientName",
            "recipientOffice",
            "subject",
            "effectivePeriod",
        ],
        render(data) {
            return `
                ${letterHeader(data, "Extended Duty Shift")}
                <div class="cf-letter-rule"></div>
                ${paragraphs([
                    `The concerned above addressee are hereby instructed to extend their duty shifting effective ${strong(value(data, "effectivePeriod", "________________"))} as per the undersigned order.`,
                    "For your information, compliance and guidance.",
                ])}`;
        },
    },
    "doc1-burial-assistance": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["burialRelativeName", "deceasedDate", "assistanceType"],
        render(data) {
            const death = value(data, "deceasedDate", "");
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} of legal age, a Filipino citizen, is a resident of this barangay of ${strong(address(data))}.`,
                `The above-named belongs to an Indigent Family in this barangay and could not hardly support his/her burial assistance of ${strong(value(data, "burialRelativeName", "________________"))}${death ? `, who died on ${escapeHtml(formatDate(death))}` : ""}.`,
                `Issued upon the request of the above-named person for ${strong(upper(value(data, "assistanceType", "Financial Assistance")))} requirement purposes, this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-indigency-educational-assistance": {
        title: "BARANGAY INDIGENCY",
        signatures: "captain-right",
        fields: ["assistanceType"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN;" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, of legal age, with postal address at ${strong(address(data))}, has no derogatory record filed in this Barangay, pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                "Further certifies that the above-mentioned name belongs to an indigent family in this community.",
                `Certification is issued upon the request of the above-named person for ${strong(upper(value(data, "assistanceType", purpose(data))))} purposes.`,
                `This ${issuedDate(data)} at the Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-telecom-nap-permit": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["telecomCompany", "businessAddress", "permitPurpose"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern:" },
                `This is to certify that ${strong(upper(value(data, "telecomCompany", personName(data))))} is a Resident of ${strong(value(data, "businessAddress", address(data)))}.`,
                `This certification is issued upon request of the above-named person for ${strong(upper(value(data, "permitPurpose", purpose(data))))} and for whatever legal purpose it may serve.`,
                `Issued this ${issuedDate(data)} at the Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-marital-separation-certification": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: ["legalSpouseName", "currentPartnerName", "childrenNames"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, of legal age, with postal address at ${strong(address(data))}, has no derogatory record filed in this Barangay, pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                `Further certifies that the above-named is married to ${strong(upper(value(data, "legalSpouseName", "________________")))} and is the biological parent of ${strong(value(data, "childrenNames", "his/her children"))}. Furthermore, aforementioned are no longer together and currently in a relationship with ${strong(upper(value(data, "currentPartnerName", "________________")))}.`,
                `Issued this ${issuedDate(data)} as for ${strong(upper(purpose(data)))} purposes, at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-business-owner-bir-certification": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: [
            "businessOwnerName",
            "businessName",
            "businessAddress",
            "businessPurpose",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(value(data, "businessOwnerName", personName(data)))}`)}, business owner of ${strong(upper(value(data, "businessName", "________________")))}, located at ${strong(value(data, "businessAddress", address(data)))}.`,
                `Issued this ${issuedDate(data, "day-of")} upon the request of ${strong(upper(value(data, "businessOwnerName", personName(data))))} for ${strong(upper(value(data, "businessPurpose", purpose(data))))} purposes.`,
            ]);
        },
    },
    "doc1-no-marriage-death-claim": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right-witnessed-by",
        fields: [
            "noMarriageSubject",
            "dateOfBirth",
            "placeOfBirth",
            "commonLawPartnerName",
            "childrenNames",
            "deceasedDate",
            "claimantName",
            "claimantRelationship",
        ],
        render(data) {
            const dob = valueAny(data, ["dateOfBirth", "date_of_birth"], "");
            const death = value(data, "deceasedDate", "");
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(value(data, "noMarriageSubject", personName(data)))}`)} who is alleged to have been born on ${strong(dob ? formatDate(dob) : "________________")} in ${strong(value(data, "placeOfBirth", "Olongapo City"))} with postal address at ${strong(address(data))} does not appear in our National Indices of Marriage.`,
                `Further certifies that the above-named has ${escapeHtml(value(data, "childrenNames", "children"))} with common-law partner ${strong(upper(value(data, "commonLawPartnerName", "________________")))} who is currently bed ridden during his/her passing ${death ? `last ${escapeHtml(formatDate(death))}` : ""}.`,
                `Certification is issued this ${issuedDate(data)} upon the request of ${strong(upper(value(data, "claimantName", "________________")))}, ${escapeHtml(value(data, "claimantRelationship", "claimant"))} of the deceased subject for ${strong(upper(purpose(data)))} purposes at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-hearing-impairment-certification": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: [
            "age",
            "witnessBasis",
            "employmentHistory",
            "impairmentDetail",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To whom it my concern:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "age", "____"))} yrs. old and residing at ${strong(address(data))} is a bonafide resident and Law-abiding citizen of this community.`,
                `Further certifies that ${escapeHtml(value(data, "witnessBasis", "I know this person"))}. ${escapeHtml(value(data, "employmentHistory", "He/she was employed in the community"))} and has ${escapeHtml(value(data, "impairmentDetail", "hearing impairment"))}.`,
                `Certification is upon the request of ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} for ${strong(upper(purpose(data)))} purposes this may serve him/her.`,
            ]);
        },
    },
    "doc1-indigency-spes-leap": {
        title: "CERTIFICATE OF INDIGENCY",
        signatures: "captain-right",
        fields: ["assistanceRecipientName", "requesterRelationship"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom it my concern;" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, is a bonafide resident of this barangay with postal address at ${strong(address(data))}, with no derogatory record on file, pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                "This further certifies that the above-named belongs to indigent family of this barangay.",
                `This certification is being issued upon the request of the above-named in behalf of ${escapeHtml(value(data, "requesterRelationship", "his/her dependent"))} ${strong(upper(value(data, "assistanceRecipientName", "________________")))} for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-simple-residency-loan": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: ["age", "loanPurpose"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "WHOM IT MAY CONCERN TO:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "age", "____"))} years old and residing at ${strong(address(data))} is a bonafide resident of this barangay.`,
                `This certification is issued upon his/her request for ${strong(upper(value(data, "loanPurpose", purpose(data))))} purposes and for whatever legal intent and purpose this may serve.`,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc1-solo-parent-certification": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["age", "programName"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom It May Concern:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "age", "____"))} years old and residing at ${strong(address(data))}, is a bonafide solo parent resident of this barangay.`,
                `This certification is issued upon his/her request for ${strong(upper(value(data, "programName", purpose(data))))} purposes and for whatever legal intent and purpose this may serve.`,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-indigency-income-means": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: [],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom It May Concern;" },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, Filipino, resident of ${strong(address(data))} belongs to/is considered as among the indigent families of this Barangay.`,
                `This is to further certify that ${strong(upper(personName(data)))} is a person whose (a) gross income and that of their immediate family, with due consideration to dependents, do not exceed an amount double the monthly minimum wage of an employee, (b) who do not own real property with a fair market value of more than three hundred thousand (P300,000.00) Pesos, and (c) with due consideration to having several subsisting obligations, has no other means to augment their daily needs, more so ${escapeHtml(value(data, "assistanceType", "medical"))} needs.`,
            ]);
        },
    },
    "doc2-flooded-residence-certification": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["incidentName", "incidentDate", "requirementName"],
        render(data) {
            const incidentDate = value(data, "incidentDate", "");
            return paragraphs([
                { className: "salutation", html: "To Whom It May Concern;" },
                `This is to certify, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, is a resident of ${strong(address(data))}, has no derogatory record filed pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                `Further Certifies that the above-named residence was flooded during ${strong(value(data, "incidentName", "Habagat"))}${incidentDate ? ` dated, ${strong(formatDate(incidentDate))}` : ""}.`,
                `Issued upon the request of the above-named person for ${strong(upper(value(data, "requirementName", purpose(data))))} requirement purposes, this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-indigent-good-moral-medical": {
        title: "BARANGAY CERTIFICATE",
        signatures: "captain-right",
        fields: ["assistanceType"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, is a bonafide resident of this barangay with postal address at ${strong(address(data))}, belongs to indigent family.`,
                "As verified in our existing records and from other reliable source, subject person has never been accused, investigated nor detained for any crime inimical to moral turpitude and other related criminal acts.",
                `This certification is issued upon the request of ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} for ${strong(upper(value(data, "assistanceType", purpose(data))))} purposes.`,
                `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-residency-bank-record": {
        title: "BARANGAY CERTIFICATION",
        signatures: "kagawad2-right",
        fields: [],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that as per records in this Barangay, this person is a resident of ${strong(address(data))}.`,
                {
                    className: "center-strong",
                    html: escapeHtml(upper(personName(data))),
                },
                `This certification is being issued for ${strong(upper(purpose(data)))}.`,
                `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-minor-athlete-financial-assistance": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["minorChildName", "activityName", "assistanceType"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, of ${strong(address(data))}, is a bonafide resident in this with no derogatory record on file pursuant to Rep. Act 7160 also known as the Local Code of 1991.`,
                `This also certifies that the above named is among the indigents of this Barangay. This also certify further that her minor child, ${strong(upper(value(data, "minorChildName", "________________")))}, is a ${strong(upper(value(data, "activityName", "TAEKWONDO ATHLETE")))}, on her behalf thereby seeking ${strong(upper(value(data, "assistanceType", purpose(data))))}.`,
                `Certification is being issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-parent-relationship-spes": {
        title: "BARANGAY INDIGENCY",
        signatures: "kagawad1-right",
        fields: [
            "legalSpouseName",
            "childrenNames",
            "currentPartnerName",
            "assistanceRecipientName",
            "programName",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, with postal address at ${strong(address(data))} has no derogatory record filed in this Barangay, pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                `Further certifies that the above-named is married to ${strong(upper(value(data, "legalSpouseName", "________________")))} and is the biological father of her children${value(data, "childrenNames", "") ? `, ${strong(upper(value(data, "childrenNames", "")))}` : ""}. Furthermore, aforementioned are no longer together and currently in a relationship with ${strong(upper(value(data, "currentPartnerName", "________________")))}.`,
                `This certification is being issued upon the request of the above named for ${strong(upper(value(data, "programName", purpose(data))))}, for her daughter ${strong(upper(value(data, "assistanceRecipientName", "________________")))}.`,
                `Issued upon the request of the above-named this ${issuedDate(data)} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-business-closure-court-records": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "businessOwnerName",
            "businessName",
            "businessAddress",
            "requesterName",
            "requestingInstitution",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN;" },
                `This is to certify that, ${strong(upper(value(data, "businessOwnerName", personName(data))))}, business owner of ${strong(upper(value(data, "businessName", "________________")))}, located at ${strong(value(data, "businessAddress", address(data)))} is no longer operating in this barangay.`,
                `This certification is being issued upon the request of ${strong(upper(value(data, "requesterName", personName(data))))}, ${escapeHtml(value(data, "requestingInstitution", "Office of the Clerk of Court"))} for ${strong(upper(purpose(data)))} purposes.`,
                `Given this ${issuedDate(data)}, at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-general-legal-records": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN;" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} is a bonafide resident of Barangay East Tapinac, Olongapo City with postal address at ${strong(address(data))}, with no derogatory record filed pursuant to Republic Act No. 7160 otherwise known as the Local Government Code of 1991.`,
                `Issued this ${issuedDate(data)} for any ${strong(upper(purpose(data)))} purposes.`,
            ]);
        },
    },
    "doc2-centenarian-living-veteran": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["age", "programName"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHON IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "age", yearsOld(data) || "____"))} yrs. of age, with postal address at ${strong(address(data))}, is known to this barangay as a person of good morals and has no derogatory record on file, pursuant to Republic Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                "Further certifies that the above-named is still living and is a centenarian as of this date.",
                `This certification is being issued upon the request of the above-named for ${strong(value(data, "programName", purpose(data)))} requirement purposes.`,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-first-time-jobseeker-oath": {
        title: "OATH OF UNDERTAKING",
        signatures: "none",
        fields: [
            "age",
            "residencyDuration",
            "parentGuardianName",
            "parentGuardianAge",
            "childName",
        ],
        render(data) {
            return `
                ${paragraphs([
                    `I, ${strong(upper(personName(data)))}, ${escapeHtml(value(data, "age", yearsOld(data) || "____"))} years of age, Resident of Barangay ${strong(address(data))} for ${escapeHtml(value(data, "residencyDuration", "________"))}, availing the benefits of Republic Act 11261, otherwise known as the First Time Job Seekers Act of 2019, do hereby declare, agree and undertake to abide and be bound by the following:`,
                    "That this is the first time that I will actively look for a job, and therefore requesting that a Barangay Certification be issued in my favor to avail the benefits of the Law.",
                    "That I am aware that the benefits and privilege/s under the said law shall be valid only for one (1) year from the date that the Barangay Certification is issued:",
                    "That I can avail the benefits of the law only once;",
                    "That I understand that my personal information shall be included in the Roster/list of first-time job seeker and will not be used for any unlawful purpose;",
                    "That I will inform and/or report to the Barangay personally, through text or other means, or through my family/relatives once I get employed; and",
                    "That I am not a beneficiary of the Jobstart Program under R.A. No.10869 and other laws that give similar exemptions for the documents or transaction exempted under R.A. No. 11261.",
                    "That if issued the requested Certification, I will not use the same in any fraud, neither falsify nor help and/or assist in the fabrication of the said certification.",
                    "That this undertaking is made solely for the purpose of obtaining a Barangay Certification consistent with the objective of R.A. No.11261 and not for any other purposes.",
                    "That I consent to the use of my personal information pursuant to the Data Privacy Act and other applicable laws, rules, and regulations.",
                    `Signed this ${issuedDate(data)} in the City/Municipality of Olongapo City.`,
                ])}
                <div class="cf-oath-signatures">
                    <div>Signed by: __________________</div>
                    <div>Witnessed by: ________________</div>
                    <small>First Time Jobseeker</small>
                    <small>Barangay Official</small>
                </div>
                <div class="cf-oath-minor">
                    <div>__________________________________________________________________________</div>
                    <p>(For applicants under 18 years of age;)</p>
                    <p>I, ${escapeHtml(value(data, "parentGuardianName", "_______________________________"))}, ${escapeHtml(value(data, "parentGuardianAge", "_______"))} years of age, parent/guardian of ${escapeHtml(value(data, "childName", "________________________"))}, and a resident, allow my child/dependent to avail the benefits of Republic Act 11261 and be bound by the abovementioned conditions.</p>
                    <p>Signed by;</p>
                    <div class="cf-manual-signature"><div>_______________</div><small>Parent/Guardian</small></div>
                </div>`;
        },
    },
    "doc2-funeral-covered-court-indigency": {
        title: "CERTIFICATE OF INDIGENCY",
        signatures: "captain-right",
        fields: [
            "deceasedName",
            "deceasedDate",
            "requesterRelationship",
            "wakeDays",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MY CONCERN," },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, with postal address at ${strong(address(data))}, is a resident of this Barangay with no derogatory record filed in this office pursuant to Rep. Act No.7160 otherwise known as the Local Government Code of 1991.`,
                `Further certifies that the above-named ${escapeHtml(value(data, "requesterRelationship", "relative"))}, ${strong(`${personPrefix(data)} ${upper(value(data, "deceasedName", "________________"))}`)}, passed-away this ${strong(value(data, "deceasedDate", "________________"))}, belongs to an Indigent Family and could not afford the funeral service of his/her late ${escapeHtml(value(data, "requesterRelationship", "relative"))}. Furthermore, is given permit by the undersigned to use the covered court for ${escapeHtml(value(data, "wakeDays", "five (5)"))} days for the wake.`,
                `Given this, ${issuedDate(data, "day-of")} at the Barangay Hall of East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-endorsement-hospital-return": {
        title: "ENDORSEMENT",
        hideTitle: true,
        signatures: "captain-right",
        fields: [
            "recipientName",
            "recipientTitle",
            "recipientOffice",
            "thruName",
            "thruTitle",
            "thruOffice",
            "caregiverDescription",
            "destinationAddress",
        ],
        render(data) {
            return `
                <div class="cf-letter-date">${escapeHtml(formatDate(data?.issuedAt || new Date()))}</div>
                <div class="cf-letter-to">
                    <div>To: ${escapeHtml(upper(value(data, "recipientName", "HON. ROLEN C. PAULINO, JR.")))}</div>
                    <div>${escapeHtml(value(data, "recipientTitle", "City Mayor"))}</div>
                    <div>${escapeHtml(value(data, "recipientOffice", "Olongapo City"))}</div>
                    <br />
                    <div>Thru: ${escapeHtml(upper(value(data, "thruName", "GONZALO PASCUA, JR.")))}</div>
                    <div>${escapeHtml(value(data, "thruTitle", "HEAD, CSWDO"))}</div>
                    <div>${escapeHtml(value(data, "thruOffice", "Olongapo City"))}</div>
                </div>
                <div class="cf-letter-subject">Subject: ENDORSEMENT</div>
                ${paragraphs([
                    { className: "salutation", html: "Dear Hon. Mayor;" },
                    `May I respectfully endorse through your good office, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, a resident at ${strong(address(data))}.`,
                    `The above-named ${escapeHtml(value(data, "caregiverDescription", "has no relative in this City, and is being taken care of only by their ageing landlady who is unable to assist and provide for the said person"))}.`,
                    `He/she was discharged from the hospital and is in need of assistance to send him/her back to relatives somewhere in ${strong(value(data, "destinationAddress", "________________"))}.`,
                    "Thank you for your immediate attention on this matter.",
                    "Sincerely Yours,",
                ])}`;
        },
    },
    "doc2-business-assessor-permit": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["businessAddress", "businessPurpose"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)}, with business address at ${strong(value(data, "businessAddress", address(data)))}, with no derogatory record on file pursuant to Rep. Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                "This further certifies that the above-named has sought the assistance of this office for the purpose of securing a certification intended for his/her business application presented to this office.",
                `Certification is being issued upon the request of ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} for ${strong(upper(value(data, "businessPurpose", purpose(data))))} purpose.`,
                `Issued this ${issuedDate(data, "day-of")}, at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-residency-school-requirement": {
        title: "BARANGAY RESIDENCY",
        signatures: "captain-right",
        fields: [],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom It May Concern," },
                `This is to certify that, ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} ${legalAgePhrase(data)}, is a bonafide resident of this barangay with postal address at ${strong(address(data))}, has no derogatory record pursuant to Republic Act No.7160 otherwise known as the local Government Code of 1991.`,
                `Certification is being granted as per request of the subject person for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-registered-business-bank": {
        title: "BARANGAY CERTIFICATE",
        signatures: "kagawad1-right",
        fields: ["businessName", "businessAddress", "businessOwnerName"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To whom it my concern;" },
                `This is to certify that, ${strong(upper(value(data, "businessName", "________________")))}, with address at ${strong(value(data, "businessAddress", address(data)))} is a registered business located at the above stated address.`,
                `This certification is being issued upon the request of ${strong(upper(value(data, "businessOwnerName", personName(data))))} for ${strong(upper(purpose(data)))} purposes.`,
                `Issued this ${issuedDate(data, "day-of")}, at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-guardian-psa-certification": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: [
            "wardName",
            "wardAge",
            "wardGender",
            "wardDOB",
            "wardTwoName",
            "wardTwoAge",
            "wardTwoGender",
            "wardTwoDOB",
            "wardThreeName",
            "wardThreeAge",
            "wardThreeGender",
            "wardThreeDOB",
            "relationship",
            "purposeDetail",
        ],
        render(data) {
            return `
                ${paragraphs([
                    { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                    `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${legalAgePhrase(data)} with postal address at ${strong(address(data))}, with no derogatory record on file pursuant to Rep. Act No. 7160, otherwise known as the Local Government Code of 1991.`,
                    `This further certifies that the above-named is ${strong(value(data, "relationship", "Grandmother/legal guardian"))} of the below mentioned for ${strong(upper(value(data, "purposeDetail", purpose(data))))}, with the following details:`,
                ])}
                ${guardianDetailsTable(data)}
                ${paragraphs([
                    `Issued this ${issuedDate(data)}, at Barangay East Tapinac, Olongapo City.`,
                ])}`;
        },
    },
    "doc2-indigency-guardian-medical": {
        title: "CERTIFICATE OF INDIGENCY",
        signatures: "captain-right",
        fields: [
            "age",
            "requesterName",
            "requesterRelationship",
            "assistanceType",
        ],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `As per record found in this office, this is to certify that ${strong(upper(personName(data)))}, ${escapeHtml(value(data, "age", yearsOld(data) || "____"))} yrs. old and residing at ${strong(address(data))} is a bonafide resident and law-abiding citizen of this community.`,
                "It is further certified that he/she has no permanent source of income and could hardly suffice his/her daily needs. Furthermore, he/she belongs to the indigent families of this Barangay.",
                `This certification is being issued upon the request of ${strong(upper(value(data, "requesterName", "________________")))} (${escapeHtml(value(data, "requesterRelationship", "GUARDIAN"))}) of the above said person for ${strong(upper(value(data, "assistanceType", purpose(data))))} purposes.`,
                `Issued this ${issuedDate(data)}, at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-organization-water-clearance": {
        title: "BARANGAY CLEARANCE",
        signatures: "captain-right",
        fields: ["organizationName", "requestingInstitution"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "To Whom It May Concern:" },
                `This is to certify that ${strong(upper(value(data, "organizationName", personName(data))))}, of this Barangay with postal address at ${strong(address(data))}, has no derogatory record pursuant to Republic Act No. 7160 otherwise known as the local Government Code of 1991.`,
                `Certification is being granted as per request of the subject for ${strong(upper(purpose(data)))} purposes, at ${strong(upper(value(data, "requestingInstitution", "WATER DISTRICT")))}.`,
                `Issued this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
        },
    },
    "doc2-unemployment-spes-certification": {
        title: "BARANGAY CERTIFICATE",
        signatures: "kagawad1-right",
        fields: ["programName"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCER;" },
                `This Certificate is hereby awarded to ${strong(upper(personName(data)))}, is a bonafide resident of this barangay with postal address at ${strong(address(data))}, with no derogatory record pursuant to Republic Act No.7160 otherwise known as the local Government Code of 1991.`,
                "This further certifies that the above-named is UNEMPLOYED/NO WORK.",
                `Certification is being issued this ${issuedDate(data, "day-of")}, at Barangay East Tapinac, Olongapo City, for ${strong(upper(value(data, "programName", purpose(data))))} requirement purposes.`,
            ]);
        },
    },
    "doc2-lpg-house-to-house-permit": {
        title: "BARANGAY PERMIT",
        signatures: "kagawad3-right",
        fields: ["businessName", "activityName"],
        render(data) {
            const businessName = value(
                data,
                "businessName",
                "JJ & B SAFETY LPG DEVICE TRADING",
            );
            return `
                ${paragraphs([
                    {
                        className: "salutation",
                        html: "TO WHOM IT MAY CONCERN;",
                    },
                    `This is to certify that ${strong(upper(businessName))} is hereby granted permission to conduct a house to house monitoring and free demonstration within the jurisdiction of Barangay East Tapinac, Olongapo City.`,
                    `The activity aims to promote ${escapeHtml(value(data, "activityName", "an anti-leakage safety device designed to help prevent hazardous LPG gas leaks, and to provide residents with information on proper LPG safety and prevention measures"))}.`,
                    "This permit is issued with the following conditions:",
                ])}
                <ul class="cf-doc-list">
                    <li>The representatives of ${escapeHtml(businessName)} must coordinate with Barangay Office prior to the conduct of the activity.</li>
                    <li>They must present proper identification and this permit when conducting the house to house activity.</li>
                    <li>The activity shall be conducted in an orderly and respectful manner, ensuring the safety and privacy of residents.</li>
                    <li>The permit does not authorize any form of coercive selling; participation of residents shall remain voluntary.</li>
                    <li>The company shall comply with all existing barangay rules and regulations.</li>
                </ul>
                ${paragraphs([
                    `This certification is issued upon the request for whatever ${strong(upper(purpose(data)))} it may serve.`,
                    `Issued this ${issuedDate(data, "day-of")} at Barangay East Tapinac, Olongapo City.`,
                ])}`;
        },
    },
};

function signatureModeSlots(mode = "captain-right") {
    const normalized = String(mode || "captain-right").trim();
    const map = {
        none: [],
        "captain-right": ["captain"],
        "kagawad-right": ["kagawad"],
        "kagawad1-right": ["kagawad1"],
        "kagawad2-right": ["kagawad2"],
        "kagawad3-right": ["kagawad3"],
        "kagawad-left-captain-right": ["kagawad", "captain"],
        "witnessed-by": ["kagawad1", "kagawad2", "captain"],
        "captain-right-witnessed-by": ["captain", "kagawad1", "kagawad2"],
    };
    return map[normalized] || ["captain"];
}

export function getSignatoryTemplateUsage() {
    const optionByKey = new Map(
        CERTIFICATE_TEMPLATE_OPTIONS.map((cert, index) => [
            cert.templateKey,
            { ...cert, order: index },
        ]),
    );
    const usage = {
        captain: [],
        kagawad: [],
        kagawad1: [],
        kagawad2: [],
        kagawad3: [],
    };

    Object.entries(TEMPLATES).forEach(([templateKey, template]) => {
        const option = optionByKey.get(templateKey);
        const item = {
            templateKey,
            name: option?.name || template.title || templateKey,
            desc: option?.desc || "",
            order: option?.order ?? 9999,
        };
        signatureModeSlots(template.signatures).forEach((slot) => {
            if (usage[slot]) usage[slot].push(item);
        });
    });

    Object.keys(usage).forEach((slot) => {
        usage[slot].sort(
            (a, b) => a.order - b.order || a.name.localeCompare(b.name),
        );
    });

    return usage;
}

export function getCertificateTemplate(templateKey, certType) {
    const directKey = String(templateKey || "").trim();
    if (directKey && TEMPLATES[directKey]) return TEMPLATES[directKey];
    const alias = TEMPLATE_ALIASES[normalizeKey(certType)];
    if (alias && TEMPLATES[alias]) return TEMPLATES[alias];
    return TEMPLATES["doc1-barangay-clearance"];
}

function buildHeader(settings) {
    return `
        <header class="cf-cert-header">
            <img class="cf-logo cf-logo-left" src="${escapeHtml(settings.city_logo_url || DEFAULT_SETTINGS.city_logo_url)}" alt="" />
            <img class="cf-logo cf-logo-right" src="${escapeHtml(settings.brgy_logo_url || DEFAULT_SETTINGS.brgy_logo_url)}" alt="" />
            <div class="cf-republic">Republic of the Pilipinas</div>
            <div class="cf-city">${escapeHtml(settings.brgy_city || DEFAULT_SETTINGS.brgy_city)}</div>
            <div class="cf-barangay">${escapeHtml(upper(settings.brgy_name || DEFAULT_SETTINGS.brgy_name))}</div>
            <div class="cf-header-rule"></div>
            <div class="cf-office">OFFICE OF THE PUNONG BARANGAY</div>
        </header>`;
}

function buildWatermark(settings) {
    const logo = settings.brgy_logo_url || DEFAULT_SETTINGS.brgy_logo_url;
    if (!logo) return "";
    return `<img class="cf-bg-watermark" src="${escapeHtml(logo)}" alt="" />`;
}

function baseStyles() {
    return `
        @page { size: Letter; margin: 0; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #ffffff; }
        body { color: #000; font-family: "Times New Roman", Times, serif; }
        .cf-cert-page {
            width: 8.5in;
            min-height: 11in;
            padding: 0.44in 0.60in 0.5in 0.72in;
            background: #fff;
            position: relative;
            overflow: hidden;
        }
        .cf-bg-watermark {
            position: absolute;
            left: 50%;
            top: 53%;
            width: 5.45in;
            height: 5.45in;
            object-fit: contain;
            transform: translate(-50%, -50%);
            opacity: 0.13;
            z-index: 0;
            pointer-events: none;
        }
        .cf-cert-header {
            height: 1.52in;
            position: relative;
            z-index: 1;
            text-align: center;
            padding-top: 0.10in;
            margin: 0 auto 0.36in;
            width: 6.95in;
        }
        .cf-cert-page section {
            position: relative;
            z-index: 1;
        }
        .cf-logo {
            position: absolute;
            top: 0.03in;
            width: 0.86in;
            height: 0.86in;
            object-fit: contain;
        }
        .cf-logo-left { left: 0.02in; }
        .cf-logo-right { right: 0.02in; }
        .cf-republic {
            font-family: Cambria, "Times New Roman", serif;
            font-size: 12pt;
            line-height: 1.05;
            margin-top: 0.01in;
        }
        .cf-city {
            font-family: Cambria, "Times New Roman", serif;
            font-size: 12pt;
            line-height: 1.05;
        }
        .cf-barangay {
            font-family: "Times New Roman", Times, serif;
            font-size: 16pt;
            font-weight: 700;
            line-height: 1.16;
            margin-top: 0.04in;
        }
        .cf-header-rule {
            width: 6.48in;
            border-top: 1px solid #000;
            margin: 0.30in auto 0;
        }
        .cf-office {
            font-family: Georgia, "Times New Roman", serif;
            font-size: 12pt;
            font-weight: 700;
            line-height: 1.12;
            margin-top: 0.04in;
        }
        .cf-cert-title {
            text-align: center;
            font-family: "Times New Roman", Times, serif;
            font-size: 18pt;
            font-weight: 700;
            line-height: 1.2;
            margin: 0.06in 0 0.20in;
            letter-spacing: 0;
        }
        .cf-cert-body {
            font-size: 12pt;
            line-height: 1.45;
        }
        .cf-cert-body p {
            margin: 0 0 0.16in;
            text-align: justify;
        }
        .cf-cert-body .salutation {
            margin-bottom: 0.22in;
            text-align: left;
        }
        .cf-cert-body .center-strong {
            text-align: center;
            font-size: 13pt;
            font-weight: 700;
            margin: -0.05in 0 0.14in;
        }
        .cf-cert-body strong {
            font-weight: 700;
        }
        .cf-renewal {
            text-align: center;
            font-size: 12pt;
            font-weight: 700;
            margin-top: -0.12in;
            margin-bottom: 0.08in;
        }
        .cf-form-lines {
            text-align: center;
            font-size: 12pt;
            line-height: 1.2;
            margin-bottom: 0.18in;
        }
        .cf-form-lines div {
            font-weight: 700;
            margin-top: 0.07in;
        }
        .cf-form-lines small {
            display: block;
            font-size: 10pt;
            font-style: italic;
        }
        .cf-letter-date {
            font-size: 12pt;
            margin: 0 0 0.18in;
        }
        .cf-letter-to {
            font-size: 12pt;
            font-weight: 700;
            line-height: 1.25;
            margin-bottom: 0.12in;
        }
        .cf-letter-subject {
            font-size: 12pt;
            font-weight: 700;
            margin-bottom: 0.08in;
        }
        .cf-letter-rule {
            border-top: 1px solid #000;
            margin: 0.03in 0 0.18in;
        }
        .cf-cert-table {
            border-collapse: collapse;
            color: #000;
            font-family: Calibri, Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.15;
            table-layout: fixed;
        }
        .cf-cert-table th,
        .cf-cert-table td {
            border: 1px solid #000;
            padding: 0.02in 0.07in;
            vertical-align: middle;
        }
        .cf-cert-table th {
            background: #bfbfbf;
            font-weight: 700;
            text-align: center;
        }
        .cf-household-table {
            width: 4.3in;
            margin: -0.04in auto 0.18in;
        }
        .cf-household-table .name-cell {
            width: 2.7in;
            text-align: left;
        }
        .cf-household-table .position-cell {
            width: 1.6in;
            text-align: center;
        }
        .cf-boundary-table {
            width: 5.05in;
            margin: -0.04in auto 0.16in;
        }
        .cf-boundary-table .boundary-label {
            width: 0.62in;
            background: #d0cece;
            font-weight: 700;
            text-align: center;
        }
        .cf-boundary-table .boundary-value {
            width: 1.9in;
            font-weight: 700;
            text-align: center;
        }
        .cf-guardian-table {
            width: 5.5in;
            margin: -0.03in auto 0.18in;
        }
        .cf-guardian-table th {
            background: #bdd6ee;
        }
        .cf-guardian-table td {
            text-align: center;
        }
        .cf-manual-signature {
            margin-top: 0.26in;
            text-align: center;
            width: 2.6in;
            font-size: 12pt;
        }
        .cf-manual-signature small {
            display: block;
            font-size: 10pt;
        }
        .cf-oath-signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.2in;
            margin: 0.18in 0 0.1in;
            font-size: 11pt;
        }
        .cf-oath-signatures small {
            display: block;
            text-align: center;
            font-size: 10pt;
        }
        .cf-oath-minor {
            margin-top: 0.12in;
            font-size: 11pt;
        }
        .cf-doc-list {
            margin: -0.05in 0 0.15in 0.28in;
            padding-left: 0.16in;
            font-size: 12pt;
            line-height: 1.38;
        }
        .cf-doc-list li {
            margin-bottom: 0.06in;
            text-align: justify;
        }
        .cf-signature-row {
            display: flex;
            margin-top: 0.46in;
            width: 100%;
        }
        .cf-signature-row.captain {
            justify-content: flex-end;
        }
        .cf-signature-row.two {
            justify-content: space-between;
            gap: 0.42in;
        }
        .cf-signature-row.compact {
            margin-top: 0.16in;
        }
        .cf-signature-row.captain-center {
            justify-content: center;
            margin-top: 0.28in;
        }
        .cf-signature-row.witness-captain {
            margin-top: 0.36in;
        }
        .cf-signatory {
            width: 2.45in;
            text-align: center;
            min-height: 0.76in;
        }
        .cf-signature-img {
            display: block;
            max-width: 1.75in;
            max-height: 0.42in;
            object-fit: contain;
            margin: 0 auto -0.05in;
        }
        .cf-signature-spacer {
            height: 0.38in;
        }
        .cf-signatory-name {
            font-size: 12pt;
            font-weight: 700;
            line-height: 1.1;
        }
        .cf-signatory-title {
            font-size: 11pt;
            line-height: 1.15;
        }
        .cf-witness-label {
            font-size: 11pt;
            margin-top: 0.28in;
        }
        .cf-witness-block {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-top: 0.20in;
        }
        .cf-witness-block .cf-witness-label {
            width: 2.45in;
            margin-top: 0;
            margin-bottom: 0.06in;
            text-align: left;
            font-size: 9pt;
        }
        .cf-witness-stack {
            width: 2.45in;
            display: flex;
            flex-direction: column;
            gap: 0.18in;
        }
        .cf-witness-stack .cf-signatory {
            width: 100%;
            min-height: 0.46in;
        }
        .cf-witness-stack .cf-signature-spacer {
            height: 0.14in;
        }
        @media screen {
            body {
                background: #d7d7d7;
                padding: 24px;
            }
            .cf-cert-page {
                margin: 0 auto;
                box-shadow: 0 12px 35px rgba(0,0,0,.18);
            }
        }
        @media print {
            body { background: #fff; padding: 0; }
            .cf-cert-page {
                box-shadow: none;
                page-break-after: always;
            }
        }`;
}

export function buildCertificatePrintHtml({
    cert = null,
    certType = "",
    templateKey = "",
    data = {},
    settings = {},
    autoPrint = false,
} = {}) {
    const mergedSettings = normalizeBarangaySettings(settings);
    const selectedTemplateKey =
        templateKey ||
        cert?.templateKey ||
        data?.templateKey ||
        data?.extraFields?.templateKey ||
        data?.extra_fields?.templateKey;
    const selectedCertType =
        certType || cert?.name || data?.certType || data?.type;
    const template = getCertificateTemplate(
        selectedTemplateKey,
        selectedCertType,
    );
    const title =
        template.title || selectedCertType || "BARANGAY CERTIFICATION";
    const titleHtml = template.hideTitle
        ? ""
        : `<h1 class="cf-cert-title">${escapeHtml(title)}</h1>`;
    const body = template.render({
        ...data,
        extraFields: data?.extraFields || data?.extra_fields || {},
    });
    const signatures = renderSignatures(
        mergedSettings,
        template.signatures || "captain-right",
    );
    const printScript = autoPrint
        ? `<script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));</script>`
        : "";

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(selectedCertType || title)}</title>
<style>${baseStyles()}</style>
</head>
<body>
    <main class="cf-cert-page">
        ${buildWatermark(mergedSettings)}
        ${buildHeader(mergedSettings)}
        <section>
            ${titleHtml}
            <div class="cf-cert-body">${body}</div>
            ${signatures}
        </section>
    </main>
    ${printScript}
</body>
</html>`;
}

export function getTemplateFieldLabels(templateKey, certType) {
    const template = getCertificateTemplate(templateKey, certType);
    return (template.fields || []).map((field) => ({
        key: field,
        label: FIELD_LABELS[field] || field,
    }));
}
