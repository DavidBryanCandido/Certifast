import axios from "axios";
import authService from "./authService";
import { getApiBase } from "../apiBase";

const API = getApiBase();

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

    updateExtraFields: async (requestId, extraFields) => {
        const url = `${API}/admin/requests/${requestId}/extra-fields`;
        try {
            const res = await axios.put(url, { extraFields }, getAdminHeaders());
            return res.data;
        } catch (err) {
            if (err?.response?.status !== 404) throw err;
            const res = await axios.post(url, { extraFields }, getAdminHeaders());
            return res.data;
        }
    },

    saveSignatories: async (requestId, signatorySelections) => {
        const res = await axios.put(
            `${API}/admin/requests/${requestId}/signatories`,
            { signatorySelections },
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
