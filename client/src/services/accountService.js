import axios from "axios";
import authService from "./authService";

const API = "http://localhost:5000/api";

const getAdminHeaders = () => ({
    headers: { Authorization: `Bearer ${authService.getAdminToken()}` },
});

const accountService = {
    getAccounts: async () => {
        const headers = getAdminHeaders();
        const res = await axios.get(`${API}/admin/accounts`, headers);
        return res.data;
    },

    createAccount: async (payload) => {
        const headers = getAdminHeaders();
        const res = await axios.post(`${API}/admin/accounts`, payload, headers);
        return res.data;
    },

    updateAccount: async (accountId, payload) => {
        const headers = getAdminHeaders();
        const res = await axios.put(
            `${API}/admin/accounts/${accountId}`,
            payload,
            headers,
        );
        return res.data;
    },

    resetPassword: async (accountId, newPassword) => {
        const headers = getAdminHeaders();
        const res = await axios.put(
            `${API}/admin/accounts/${accountId}/password`,
            { new_password: newPassword },
            headers,
        );
        return res.data;
    },

    deactivateAccount: async (accountId) => {
        const headers = getAdminHeaders();
        const res = await axios.delete(
            `${API}/admin/accounts/${accountId}`,
            headers,
        );
        return res.data;
    },
};

export default accountService;
