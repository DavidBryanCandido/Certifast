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

const reportsService = {
    getOverview: async (period = "month") => {
        const res = await axios.get(`${API}/admin/reports/overview`, {
            ...getAdminHeaders(),
            params: { period },
        });
        return res.data;
    },
};

export default reportsService;
