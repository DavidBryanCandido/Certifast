export const DATA_TABLE_REFRESH_MS = 30000;

export function shouldRefreshVisiblePage() {
    return typeof document === "undefined" || document.visibilityState === "visible";
}
