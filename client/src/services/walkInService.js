import axios from "axios";
import authService from "./authService";

const API = import.meta.env.VITE_API_URL;

function getAdminHeaders() {
    const token = authService.getAdminToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

const walkInService = {
    getCertTemplates: async () => {
        const res = await axios.get(
            `${API}/admin/certificates/templates`,
            getAdminHeaders(),
        );
        return res.data;
    },

    issueWalkIn: async (payload) => {
        const res = await axios.post(
            `${API}/admin/walkin/issue`,
            payload,
            getAdminHeaders(),
        );
        return res.data;
    },

    getTodayLog: async () => {
        const res = await axios.get(
            `${API}/admin/walkin/today`,
            getAdminHeaders(),
        );
        return res.data;
    },

    getReprintData: async (walkInId) => {
        const res = await axios.get(
            `${API}/admin/walkin/${encodeURIComponent(String(walkInId))}/reprint`,
            getAdminHeaders(),
        );
        return res.data;
    },
};

export default walkInService;
