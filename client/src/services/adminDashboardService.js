import axios from "axios";
import authService from "./authService";

const API = "http://localhost:5000/api";

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
        const res = await axios.get(`${API}/admin/dashboard/stats`, getAdminHeaders());
        return res.data;
    },

    getRecentRequests: async (limit = 5) => {
        const res = await axios.get(
            `${API}/admin/dashboard/recent-requests?limit=${limit}`,
            getAdminHeaders(),
        );
        return res.data;
    },

    approveRequest: async (requestId) => {
        const res = await axios.post(
            `${API}/admin/requests/${requestId}/approve`,
            {},
            getAdminHeaders(),
        );
        return res.data;
    },

    rejectRequest: async (requestId, reason) => {
        const res = await axios.post(
            `${API}/admin/requests/${requestId}/reject`,
            { reason },
            getAdminHeaders(),
        );
        return res.data;
    },
};

export default adminDashboardService;
