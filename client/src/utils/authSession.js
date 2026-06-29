import axios from "axios";

import { getApiBase } from "../apiBase";

const ADMIN_LOGIN_PATH = "/admin/login";
const RESIDENT_LOGIN_PATH = "/resident/login";

let axiosInterceptorInstalled = false;
let fetchInterceptorInstalled = false;
let originalFetch = null;

function clearStoredAuth() {
    localStorage.removeItem("certifast_admin_auth");
    localStorage.removeItem("certifast_admin_token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("certifast_resident_auth");
    localStorage.removeItem("certifast_resident_token");
}

function isApiUrl(url) {
    try {
        const apiBase = new URL(getApiBase(), window.location.origin);
        const target = new URL(String(url), window.location.origin);
        return (
            target.origin === apiBase.origin &&
            target.pathname.startsWith(apiBase.pathname.replace(/\/+$/, ""))
        );
    } catch {
        return false;
    }
}

function inferLoginPath(url = window.location.href) {
    const text = String(url || "");
    if (
        text.includes("/admin/") ||
        window.location.pathname.startsWith("/admin")
    ) {
        return ADMIN_LOGIN_PATH;
    }
    return RESIDENT_LOGIN_PATH;
}

function isAuthFailure(status, message = "") {
    if (status === 401) return true;
    if (status !== 403) return false;
    return /token|expired|invalid|no token|not found|unauthorized|authentication/i.test(
        message,
    );
}

function redirectToLogin(loginPath, reason) {
    clearStoredAuth();

    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (window.location.pathname === loginPath) return;

    const url = new URL(loginPath, window.location.origin);
    if (currentPath && currentPath !== loginPath) {
        url.searchParams.set("reason", reason || "session_expired");
    }
    window.location.replace(url.toString());
}

async function readResponseMessage(response) {
    try {
        const clone = response.clone();
        const contentType = clone.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const json = await clone.json();
            return json?.message || json?.error || "";
        }
        return await clone.text();
    } catch {
        return "";
    }
}

export function handleAuthFailure({ status, message, url }) {
    if (!isAuthFailure(status, message)) return false;
    redirectToLogin(inferLoginPath(url), "session_expired");
    return true;
}

export function installAuthSessionGuard() {
    if (!axiosInterceptorInstalled) {
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error?.response?.status;
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    "";
                const url = error?.config?.url || "";

                if (isApiUrl(url)) {
                    handleAuthFailure({ status, message, url });
                }

                return Promise.reject(error);
            },
        );
        axiosInterceptorInstalled = true;
    }

    if (!fetchInterceptorInstalled && typeof window !== "undefined") {
        originalFetch = window.fetch.bind(window);
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            const input = args[0];
            const url =
                typeof input === "string"
                    ? input
                    : input instanceof URL
                      ? input.toString()
                      : input?.url || "";

            if (isApiUrl(url) && (response.status === 401 || response.status === 403)) {
                const message = await readResponseMessage(response);
                handleAuthFailure({ status: response.status, message, url });
            }

            return response;
        };
        fetchInterceptorInstalled = true;
    }
}

export { clearStoredAuth };
