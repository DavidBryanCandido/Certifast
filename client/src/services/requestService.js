import axios from "axios";
import authService from "./authService";
import { getApiBase } from "../apiBase";

const API = getApiBase();

const requestService = {
    // GET all requests for logged-in resident
    getAllRequests: async () => {
        const token = authService.getResidentToken();
        const res = await axios.get(`${API}/resident/requests`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    // POST create a new request
    createRequest: async (formData) => {
        const token = authService.getResidentToken();
        const res = await axios.post(`${API}/resident/requests`, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    getRequest: async (requestId) => {
        const token = authService.getResidentToken();
        const res = await axios.get(`${API}/resident/requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },

    resubmitRequest: async (requestId, formData) => {
        const token = authService.getResidentToken();
        const res = await axios.put(
            `${API}/resident/requests/${requestId}/resubmit`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        return res.data;
    },

    getCertificateTemplates: async () => {
        const res = await axios.get(`${API}/certificates/templates`);
        return res.data;
    },
};

export default requestService;
