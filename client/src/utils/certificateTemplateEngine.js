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
    "barangay business clearance (renewal)": "doc1-business-renewal-endorsement",
    "certificate of ownership": "doc1-property-ownership",
    "certificate of appearance": "doc1-certificate-appearance",
    "endorsement: toda courtesy call": "doc1-endorsement-toda-courtesy-call",
    "acceptance letter": "doc1-acceptance-letter-quarantine",
    "household certification": "doc1-household-angkas-pass",
    "family home certification": "doc1-family-home-property",
    "first time jobseeker certificate": "doc1-first-time-jobseeker",
    "endorsement: financial assistance": "doc1-endorsement-financial-assistance",
    "dswd eligibility certification": "doc1-dswd-eligibility-certification",
    "certification of lot occupancy": "doc1-lot-occupancy",
    "certification of undertaking": "doc1-undertaking-quarantine",
    "detained resident bail certification": "doc1-detained-bail-certification",
    "indigency: sibling assistance": "doc1-indigency-sibling-assistance",
    "endorsement: medical assistance": "doc1-endorsement-medical-assistance",
    "lockdown residency certificate": "doc1-lockdown-residency-certification",
    "extended duty shift notice": "doc1-extended-duty-shift",
    "burial assistance certification": "doc1-burial-assistance",
    "indigency: educational assistance": "doc1-indigency-educational-assistance",
    "telecom permit certification": "doc1-telecom-nap-permit",
    "marital separation certification": "doc1-marital-separation-certification",
    "business owner bir certification": "doc1-business-owner-bir-certification",
    "no marriage index / death claim certificate": "doc1-no-marriage-death-claim",
    "hearing impairment certification": "doc1-hearing-impairment-certification",
    "indigency: spes / leap": "doc1-indigency-spes-leap",
    "simple residency certificate": "doc1-simple-residency-loan",
    "solo parent certification": "doc1-solo-parent-certification",
};

function normalizeKey(value) {
    return String(value || "").trim().toLowerCase();
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
    return String(raw || "").trim().toUpperCase();
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
    const raw = data?.issuedAt || data?.issued_at || data?.dateIssued || new Date();
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
            const className = item.className ? ` class="${item.className}"` : "";
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

function boundaryList(data) {
    return `
        <div class="cf-boundaries">
            <div><strong>NORTH</strong><span>${escapeHtml(value(data, "boundaryNorth", "________________"))}</span></div>
            <div><strong>EAST</strong><span>${escapeHtml(value(data, "boundaryEast", "________________"))}</span></div>
            <div><strong>SOUTH</strong><span>${escapeHtml(value(data, "boundarySouth", "________________"))}</span></div>
            <div><strong>WEST</strong><span>${escapeHtml(value(data, "boundaryWest", "________________"))}</span></div>
        </div>`;
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
        fields: ["businessName", "businessAddress", "businessType", "businessArea"],
        render(data) {
            const businessName = value(data, "businessName", "________________");
            const businessAddress = value(data, "businessAddress", address(data));
            const businessType = value(data, "businessType", "business activity");
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
            const childDobText = childDob ? formatDate(childDob) : "________________";
            const childBirthPlace = value(data, "childBirthPlace", "Olongapo City");
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
                { className: "center-strong", html: escapeHtml(upper(value(data, "partnerName"))) },
                `Issued this ${issuedDate(data, "day-of")} for ${strong(upper(purpose(data)))}.`,
            ]);
        },
    },
    "doc1-no-business": {
        title: "BARANGAY CERTIFICATION",
        signatures: "captain-right",
        fields: ["businessName", "businessAddress", "requesterName", "requestingInstitution"],
        render(data) {
            const business = value(data, "businessName", personName(data));
            const businessAddress = value(data, "businessAddress", address(data));
            const requester = value(data, "requesterName", personName(data));
            const office = value(data, "requestingInstitution", "requesting office");
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
        fields: ["businessPermitNo", "businessName", "businessAddress", "operatorName", "businessOwnerAddress"],
        render(data) {
            const permitNo = value(data, "businessPermitNo", "ET-BPI-2024-5984");
            const business = value(data, "businessName", "________________");
            const businessAddress = value(data, "businessAddress", address(data));
            const operator = value(data, "operatorName", personName(data));
            const operatorAddress = value(data, "businessOwnerAddress", address(data));
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
        fields: ["propertyLocation", "taxDeclarationNo", "propertyArea"],
        render(data) {
            const propertyLocation = value(data, "propertyLocation", address(data));
            const taxDeclaration = value(data, "taxDeclarationNo", "________________");
            const area = value(data, "propertyArea", "________________");
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                `This is to certify that ${strong(`${personPrefix(data)} ${upper(personName(data))}`)}, ${escapeHtml(value(data, "nationality", "Filipino"))} Citizen is the owner of a LOT located at ${strong(propertyLocation)} with Land TD No: ${strong(taxDeclaration)} measuring approx. ${strong(area)}.`,
                `Further certifies that NO building located at the above-mentioned address was found to be dilapidated upon inspection of the community area officer assigned on the area.`,
                `Issued upon request of ${strong(`${personPrefix(data)} ${upper(personName(data))}`)} this ${issuedDate(data, "day-of")}, at the Barangay Hall of East Tapinac, Olongapo City for ${strong(upper(purpose(data)))} purposes.`,
            ]);
        },
    },
    "doc1-certificate-appearance": {
        title: "CERTIFICATE OF APPEARANCE",
        signatures: "captain-right",
        fields: ["requestingInstitution", "appearanceDate"],
        render(data) {
            const institution = value(data, "requestingInstitution", "________________");
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
            const organization = value(data, "organizationName", "TODA, Zone II");
            const appointmentDate = value(data, "appointmentDate", "");
            const appointmentTime = value(data, "appointmentTime", "3:00 in the afternoon");
            const dateText = appointmentDate ? formatDate(appointmentDate) : "________________";
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
        fields: ["companionName", "companionRole", "companionTwoName", "companionTwoRole"],
        render(data) {
            return paragraphs([
                { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                "This is to certify that:",
                {
                    className: "center-strong",
                    html: `${escapeHtml(upper(personName(data)))} - ${escapeHtml(upper(value(data, "companionRole", "DRIVER")))}<br />${escapeHtml(upper(value(data, "companionName", "________________")))} - ${escapeHtml(upper(value(data, "companionTwoRole", "PASSENGER")))}`,
                },
                `of legal ages, are residents at ${strong(address(data))}.`,
                "Further certifies that the above-named belongs to one household.",
                `Issued upon the request of the aforementioned persons for ${strong(upper(purpose(data)))} requirement purposes this ${issuedDate(data)} at Barangay East Tapinac, Olongapo City.`,
            ]);
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
        fields: ["recipientName", "recipientTitle", "recipientOffice", "subject"],
        render(data) {
            return `
                ${letterHeader(data, "ENDORSEMENT: FINANCIAL ASSISTANCE")}
                <div class="cf-letter-rule"></div>
                ${paragraphs([
                    { className: "salutation", html: `Dear ${escapeHtml(value(data, "recipientTitle", "Captain"))},` },
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
                    { className: "salutation", html: "TO WHOM IT MAY CONCERN:" },
                    `This is to certify that as per documents shown and submitted in this office by the applicant and as verified, ${strong(upper(value(data, "occupantName", personName(data))))} is the actual occupant and possessor of a certain parcel of land located at ${strong(value(data, "propertyLocation", address(data)))} particularly described as follows;`,
                    "Bounded:",
                ])}
                ${boundaryList(data)}
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
        fields: ["detainedFacility", "bailRequesterName", "bailRequesterRelationship"],
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
        fields: ["recipientName", "recipientTitle", "recipientOffice", "subject", "assistanceType"],
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
        fields: ["recipientName", "recipientOffice", "subject", "effectivePeriod"],
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
        fields: ["businessOwnerName", "businessName", "businessAddress", "businessPurpose"],
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
        fields: ["age", "witnessBasis", "employmentHistory", "impairmentDetail"],
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
};

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
            padding: 0.30in 0.82in 0.5in 1.08in;
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
            height: 1.34in;
            position: relative;
            z-index: 1;
            text-align: center;
            padding-top: 0.06in;
            margin-bottom: 0.18in;
        }
        .cf-cert-page section {
            position: relative;
            z-index: 1;
        }
        .cf-logo {
            position: absolute;
            top: 0.01in;
            width: 0.92in;
            height: 0.92in;
            object-fit: contain;
        }
        .cf-logo-left { left: 0; }
        .cf-logo-right { right: 0; }
        .cf-republic {
            font-family: Cambria, "Times New Roman", serif;
            font-size: 14pt;
            line-height: 1.1;
        }
        .cf-city {
            font-family: Cambria, "Times New Roman", serif;
            font-size: 14pt;
            line-height: 1.1;
        }
        .cf-barangay {
            font-family: "Times New Roman", Times, serif;
            font-size: 16pt;
            font-weight: 700;
            line-height: 1.15;
        }
        .cf-header-rule {
            width: 5.75in;
            border-top: 1px solid #000;
            margin: 0.06in auto 0;
        }
        .cf-office {
            font-family: Georgia, "Times New Roman", serif;
            font-size: 12pt;
            font-weight: 700;
            line-height: 1.15;
            margin-top: 0.03in;
        }
        .cf-cert-title {
            text-align: center;
            font-family: "Times New Roman", Times, serif;
            font-size: 18pt;
            font-weight: 700;
            line-height: 1.2;
            margin: 0.22in 0 0.20in;
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
        .cf-boundaries {
            width: 3.4in;
            margin: -0.04in 0 0.16in 0.55in;
            font-size: 12pt;
            line-height: 1.25;
        }
        .cf-boundaries div {
            display: grid;
            grid-template-columns: 0.72in 1fr;
            gap: 0.18in;
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
    const selectedCertType = certType || cert?.name || data?.certType || data?.type;
    const template = getCertificateTemplate(selectedTemplateKey, selectedCertType);
    const title = template.title || selectedCertType || "BARANGAY CERTIFICATION";
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
