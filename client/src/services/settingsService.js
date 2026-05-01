// Client API for barangay settings management
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const readJsonSafe = async (res) => {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        return {
            message:
                text && text.trim().startsWith("<")
                    ? "Server returned HTML instead of JSON. Check VITE_API_URL."
                    : text,
        };
    }
    return res.json();
};

// Get all barangay settings
export const getBarangaySettings = async (token) => {
    const res = await fetch(`${API_URL}/admin/settings`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await readJsonSafe(res);
        throw new Error(error.message || "Failed to fetch settings");
    }

    const json = await readJsonSafe(res);
    return json.data;
};

// Update barangay settings
export const updateBarangaySettings = async (settings, token) => {
    const res = await fetch(`${API_URL}/admin/settings`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
    });

    if (!res.ok) {
        const error = await readJsonSafe(res);
        throw new Error(error.message || "Failed to update settings");
    }

    const json = await readJsonSafe(res);
    return json;
};
