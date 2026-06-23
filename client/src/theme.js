export const SYSTEM_THEMES = {
    default: {
        label: "Default",
        primary: "#0E2554",
        primaryDark: "#091A3E",
        primarySoft: "#163066",
        primaryRgb: "14, 37, 84",
        accent: "#C9A227",
        accentDark: "#9A7515",
        accentSoft: "#F0D060",
        accentRgb: "201, 162, 39",
    },
    green_orange: {
        label: "Green & Orange",
        primary: "#2f7d50",
        primaryDark: "#0F4A29",
        primarySoft: "#24854A",
        primaryRgb: "26, 107, 58",
        accent: "#E07B2A",
        accentDark: "#B85C18",
        accentSoft: "#F2A65F",
        accentRgb: "224, 123, 42",
    },
};

export const SYSTEM_THEME_STORAGE_KEY = "certifast_system_theme";

export function normalizeSystemTheme(value) {
    return Object.prototype.hasOwnProperty.call(SYSTEM_THEMES, value)
        ? value
        : "default";
}

export function getCachedSystemTheme() {
    if (typeof window === "undefined") return "default";

    try {
        return normalizeSystemTheme(
            window.localStorage.getItem(SYSTEM_THEME_STORAGE_KEY),
        );
    } catch {
        return "default";
    }
}

export function cacheSystemTheme(value) {
    const key = normalizeSystemTheme(value);
    if (typeof window === "undefined") return key;

    try {
        window.localStorage.setItem(SYSTEM_THEME_STORAGE_KEY, key);
    } catch {
        // The applied theme still works for this session if storage is blocked.
    }

    return key;
}

export function applySystemTheme(value = "default") {
    const key = normalizeSystemTheme(value);
    const theme = SYSTEM_THEMES[key];
    const root = document.documentElement;

    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-primary-dark", theme.primaryDark);
    root.style.setProperty("--color-primary-soft", theme.primarySoft);
    root.style.setProperty("--color-primary-rgb", theme.primaryRgb);
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--color-accent-dark", theme.accentDark);
    root.style.setProperty("--color-accent-soft", theme.accentSoft);
    root.style.setProperty("--color-accent-rgb", theme.accentRgb);

    return key;
}

export function getAppliedSystemThemeColors() {
    if (typeof window === "undefined") return SYSTEM_THEMES.default;

    const styles = window.getComputedStyle(document.documentElement);
    const fallback = SYSTEM_THEMES.default;
    const read = (variable, fallbackValue) =>
        styles.getPropertyValue(variable).trim() || fallbackValue;

    return {
        primary: read("--color-primary", fallback.primary),
        primaryDark: read("--color-primary-dark", fallback.primaryDark),
        primarySoft: read("--color-primary-soft", fallback.primarySoft),
        accent: read("--color-accent", fallback.accent),
        accentDark: read("--color-accent-dark", fallback.accentDark),
        accentSoft: read("--color-accent-soft", fallback.accentSoft),
    };
}
