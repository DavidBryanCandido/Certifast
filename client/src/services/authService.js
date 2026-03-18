import axios from "axios";

const API = "http://localhost:5000/api";

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
    getResidentToken: () => localStorage.getItem("certifast_resident_token"),
    getAdminToken: () => localStorage.getItem("certifast_admin_token"),
};

export default authService;
