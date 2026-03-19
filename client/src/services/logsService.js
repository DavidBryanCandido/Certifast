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

const logsService = {
    getStats: async () => {
        const res = await axios.get(`${API}/admin/logs/stats`, getAdminHeaders());
        return res.data;
    },

    getLogs: async (params = {}) => {
        const res = await axios.get(`${API}/admin/logs`, {
            ...getAdminHeaders(),
            params,
        });
        return res.data;
    },

    getLogById: async (logId) => {
        const res = await axios.get(`${API}/admin/logs/${logId}`, getAdminHeaders());
        return res.data;
    },
};

export default logsService;
