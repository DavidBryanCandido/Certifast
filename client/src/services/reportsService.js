import axios from "axios";

const API = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("certifast_admin_token");

const reportsService = {
    getOverview: async (period = "month") => {
        const res = await axios.get(
            `${API}/reports/overview?period=${period}`,
            {
                headers: { Authorization: `Bearer ${getToken()}` },
            },
        );
        return res.data;
    },
};

export default reportsService;
