import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getTokenFromAuthBlob = (storageKey) => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed?.token || null;
    } catch {
        return null;
    }
};

const authService = {
    // Resident Register
    residentRegister: async (formData) => {
        const res = await axios.post(`${API}/auth/resident/register`, formData);
        return res.data;
    },

    // Resident Login
    residentLogin: async (formData) => {
        const res = await axios.post(`${API}/auth/resident/login`, formData);
        return res.data; // ResidentLogin.jsx handles localStorage
    },

    // Admin Login
    adminLogin: async (formData) => {
        const res = await axios.post(`${API}/auth/admin/login`, formData);
        return res.data; // AdminLogin.jsx handles localStorage
    },

    // Logout helpers
    residentLogout: () => {
        localStorage.removeItem("certifast_resident_token");
        localStorage.removeItem("certifast_resident_auth");
    },

    adminLogout: () => {
        localStorage.removeItem("certifast_admin_token");
        localStorage.removeItem("certifast_admin_auth");
    },

    // Get tokens for protected requests
    getResidentToken: () =>
        localStorage.getItem("certifast_resident_token") ||
        getTokenFromAuthBlob("certifast_resident_auth"),
    getAdminToken: () =>
        localStorage.getItem("certifast_admin_token") ||
        getTokenFromAuthBlob("certifast_admin_auth"),
};

export default authService;
