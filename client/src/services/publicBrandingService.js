import { getApiBase } from "../apiBase";
import { normalizeSystemTheme } from "../theme";

const API_URL = getApiBase();

export const DEFAULT_OFFICE_SCHEDULE = [
    { label: "Mon - Thu", time: "8:00 AM - 5:00 PM" },
    { label: "Friday", time: "Closed" },
    { label: "Sat, Sun & Hol.", time: "Closed" },
];

export const DEFAULT_PUBLIC_BRANDING = {
    name: "Barangay East Tapinac",
    city: "City of Olongapo",
    address: "54 - 14th Street corner Gallagher Street, Olongapo City",
    contact: "(047) 123-4567",
    email: "brgy.easttapinac@olongapo.gov.ph",
    brgyLogoUrl: null,
    cityLogoUrl: null,
    officeSchedule: DEFAULT_OFFICE_SCHEDULE,
    systemTheme: "default",
};

function clean(value, fallback = "") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

export function getOfficeScheduleRows(settings = {}) {
    return DEFAULT_OFFICE_SCHEDULE.map((fallback, index) => {
        const line = index + 1;
        return {
            label: clean(settings[`office_schedule_line_${line}_label`], fallback.label),
            time: clean(settings[`office_schedule_line_${line}_time`], fallback.time),
        };
    }).filter((row) => row.label || row.time);
}

export function normalizePublicBranding(payload = {}) {
    const data = payload.data || payload.settings || payload;
    return {
        name: clean(data.brgy_name, DEFAULT_PUBLIC_BRANDING.name),
        city: clean(data.brgy_city, DEFAULT_PUBLIC_BRANDING.city),
        address: clean(data.brgy_address, DEFAULT_PUBLIC_BRANDING.address),
        contact: clean(data.brgy_contact, DEFAULT_PUBLIC_BRANDING.contact),
        email: clean(data.brgy_email, DEFAULT_PUBLIC_BRANDING.email),
        brgyLogoUrl: clean(data.brgy_logo_url || payload.logo_url, ""),
        cityLogoUrl: clean(data.city_logo_url, ""),
        officeSchedule: getOfficeScheduleRows(data),
        systemTheme: normalizeSystemTheme(data.system_theme),
    };
}

export async function getPublicBrandingSettings() {
    const res = await fetch(`${API_URL}/auth/public-branding`);
    if (!res.ok) return DEFAULT_PUBLIC_BRANDING;
    const json = await res.json();
    return normalizePublicBranding(json);
}
