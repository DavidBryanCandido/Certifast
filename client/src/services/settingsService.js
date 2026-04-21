// Client API for barangay settings management
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
        throw new Error("Failed to fetch settings");
    }

    const json = await res.json();
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
        const error = await res.json();
        throw new Error(error.message || "Failed to update settings");
    }

    const json = await res.json();
    return json;
};
