import axios from "axios";
import authService from "./authService";
import { getApiBase } from "./apiBase";

const API = getApiBase();

function getAdminHeaders() {
    const token = authService.getAdminToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

const residentRecordsService = {
    getResidents: async (params = {}) => {
        const res = await axios.get(`${API}/admin/residents`, {
            ...getAdminHeaders(),
            params,
        });
        return res.data;
    },

    getResidentById: async (residentId) => {
        const res = await axios.get(
            `${API}/admin/residents/${residentId}`,
            getAdminHeaders(),
        );
        return res.data;
    },

    getResidentRequests: async (residentId) => {
        const res = await axios.get(
            `${API}/admin/residents/${residentId}/requests`,
            getAdminHeaders(),
        );
        return res.data;
    },

    getResidentStats: async () => {
        const res = await axios.get(
            `${API}/admin/residents/stats`,
            getAdminHeaders(),
        );
        return res.data;
    },
};

export default residentRecordsService;
