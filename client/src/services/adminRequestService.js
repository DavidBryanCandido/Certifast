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

const adminRequestService = {
    getRequests: async () => {
        const res = await axios.get(`${API}/admin/requests`, getAdminHeaders());
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

    markReady: async (requestId) => {
        const res = await axios.post(
            `${API}/admin/requests/${requestId}/mark-ready`,
            {},
            getAdminHeaders(),
        );
        return res.data;
    },

    releaseRequest: async (requestId) => {
        const res = await axios.post(
            `${API}/admin/requests/${requestId}/release`,
            {},
            getAdminHeaders(),
        );
        return res.data;
    },
};

export default adminRequestService;
