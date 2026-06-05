export const SYSTEM_THEMES = {
    default: {
        label: "Default",
        primary: "#0E2554",
        primaryDark: "#091A3E",
        primarySoft: "#163066",
        primaryRgb: "14, 37, 84",
        accent: "#C9A227",
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
        accentSoft: "#F2A65F",
        accentRgb: "224, 123, 42",
    },
};

export function normalizeSystemTheme(value) {
    return Object.prototype.hasOwnProperty.call(SYSTEM_THEMES, value)
        ? value
        : "default";
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
    root.style.setProperty("--color-accent-soft", theme.accentSoft);
    root.style.setProperty("--color-accent-rgb", theme.accentRgb);

    return key;
}
