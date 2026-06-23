import { getApiBase } from "../apiBase";
import { normalizeSystemTheme } from "../theme";

const API_URL = getApiBase();
let publicBrandingRequest = null;

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
    passwordResetEmail: "it-admin@easttapinac.gov.ph",
    brgyLogoUrl: null,
    cityLogoUrl: null,
    bagongPilipinasLogoUrl: "/bagong-pilipinas-logo.png",
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
        passwordResetEmail: clean(
            data.password_reset_email,
            DEFAULT_PUBLIC_BRANDING.passwordResetEmail,
        ),
        brgyLogoUrl: clean(data.brgy_logo_url || payload.logo_url, ""),
        cityLogoUrl: clean(data.city_logo_url, ""),
        bagongPilipinasLogoUrl: clean(
            data.bagong_pilipinas_logo_url,
            DEFAULT_PUBLIC_BRANDING.bagongPilipinasLogoUrl,
        ),
        officeSchedule: getOfficeScheduleRows(data),
        systemTheme: normalizeSystemTheme(data.system_theme),
    };
}

export function getPublicBrandingSettings() {
    if (publicBrandingRequest) return publicBrandingRequest;

    publicBrandingRequest = fetch(`${API_URL}/auth/public-branding`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load public branding");
            }
            return response.json();
        })
        .then(normalizePublicBranding)
        .finally(() => {
            publicBrandingRequest = null;
        });

    return publicBrandingRequest;
}
