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

const adminDashboardService = {
    getStats: async () => {
        const headers = getAdminHeaders();
        const res = await axios.get(`${API}/admin/dashboard/stats`, headers);
        return res.data;
    },

    getRecentRequests: async (limit = 5) => {
        const headers = getAdminHeaders();
        const res = await axios.get(
            `${API}/admin/dashboard/recent-requests?limit=${limit}`,
            headers,
        );
        return res.data;
    },

    approveRequest: async (requestId) => {
        const headers = getAdminHeaders();
        const res = await axios.post(
            `${API}/admin/requests/${requestId}/approve`,
            {},
            headers,
        );
        return res.data;
    },

    rejectRequest: async (requestId, reason) => {
        const headers = getAdminHeaders();
        const res = await axios.post(
            `${API}/admin/requests/${requestId}/reject`,
            { reason },
            headers,
        );
        return res.data;
    },
};

export default adminDashboardService;
