function cleanAddressValue(value) {
    return value === null || value === undefined ? "" : String(value).trim();
}

function canonicalAddressSegment(value) {
    let normalized = cleanAddressValue(value)
        .toLowerCase()
        .replace(/[.]/g, "")
        .replace(/\s+/g, " ");

    const cityOfMatch = normalized.match(/^city of (.+)$/);
    if (cityOfMatch) normalized = `${cityOfMatch[1]} city`;

    const provinceOfMatch = normalized.match(/^province of (.+)$/);
    if (provinceOfMatch) normalized = provinceOfMatch[1];

    const provinceMatch = normalized.match(/^(.+) province$/);
    if (provinceMatch) normalized = provinceMatch[1];

    return normalized;
}

function addressSegments(value) {
    if (Array.isArray(value)) return value.flatMap(addressSegments);

    return cleanAddressValue(value)
        .split(",")
        .map((segment) => segment.trim())
        .filter(Boolean);
}

export function formatAddressParts(...values) {
    const seen = new Set();
    const result = [];

    values.flatMap(addressSegments).forEach((segment) => {
        const canonical = canonicalAddressSegment(segment);
        if (!canonical || seen.has(canonical)) return;
        seen.add(canonical);
        result.push(segment);
    });

    return result.join(", ");
}

export function formatResidentAddress(record = {}, defaults = {}) {
    const house = record.address_house || record.house_number;
    const street =
        record.address_street || record.street_other || record.street_name;
    const barangay =
        record.address_barangay || record.barangay_name || record.barangay;
    const city = record.address_city || record.city;
    const province = record.address_province || record.province;

    const hasResidentAddress = [house, street, barangay, city, province].some(
        (value) => cleanAddressValue(value),
    );
    if (!hasResidentAddress) return "";

    return formatAddressParts(
        house,
        street,
        barangay,
        defaults.barangay,
        city,
        defaults.city,
        province,
        defaults.province,
    );
}
