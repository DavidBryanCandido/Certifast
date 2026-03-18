import axios from "axios";
import authService from "./authService";

const API = "http://localhost:5000/api";

const requestService = {
    getMyRequests: async () => {
        const token = authService.getResidentToken();
        const res = await axios.get(`${API}/resident/requests`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
};

export default requestService;
