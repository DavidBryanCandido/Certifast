import axios from "axios";
import authService from "./authService";

const API = "http://localhost:5000/api";

const getAdminHeaders = () => ({
    headers: { Authorization: `Bearer ${authService.getAdminToken()}` },
});

const accountService = {
    getAccounts: async () => {
        const res = await axios.get(`${API}/accounts`, getAdminHeaders());
        return res.data;
    },
};

export default accountService;
