import axios from "axios";
import authService from "./authService";

const API = "http://localhost:5000/api";

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
};

export default requestService;
