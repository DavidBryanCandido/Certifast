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
    return `<div class="cf-signature-row captain">${signatoryHtml(settings, "captain")}</div>`;
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
        .cf-cert-header {
            height: 1.34in;
            position: relative;
            text-align: center;
            padding-top: 0.06in;
            margin-bottom: 0.18in;
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
        ${buildHeader(mergedSettings)}
        <section>
            <h1 class="cf-cert-title">${escapeHtml(title)}</h1>
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
