import axios from "axios";
import authService from "./authService";

const API = import.meta.env.VITE_API_URL;

function getResidentHeaders() {
    const token = authService.getResidentToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

const residentProfileService = {
    getProfile: async () => {
        const res = await axios.get(
            `${API}/resident/profile`,
            getResidentHeaders(),
        );
        return res.data;
    },

    updateProfile: async (payload) => {
        const res = await axios.put(
            `${API}/resident/profile`,
            payload,
            getResidentHeaders(),
        );
        return res.data;
    },
};

export default residentProfileService;
