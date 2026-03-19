import axios from "axios";
import authService from "./authService";

const API = "http://localhost:5000/api";

const getAdminHeaders = () => ({
    headers: { Authorization: `Bearer ${authService.getAdminToken()}` },
});

const accountService = {
    getAccounts: async () => {
        const res = await axios.get(`${API}/admin/accounts`, getAdminHeaders());
        return res.data;
    },

    createAccount: async (payload) => {
        const res = await axios.post(
            `${API}/admin/accounts`,
            payload,
            getAdminHeaders(),
        );
        return res.data;
    },

    updateAccount: async (accountId, payload) => {
        const res = await axios.put(
            `${API}/admin/accounts/${accountId}`,
            payload,
            getAdminHeaders(),
        );
        return res.data;
    },

    resetPassword: async (accountId, newPassword) => {
        const res = await axios.put(
            `${API}/admin/accounts/${accountId}/password`,
            { new_password: newPassword },
            getAdminHeaders(),
        );
        return res.data;
    },

    deactivateAccount: async (accountId) => {
        const res = await axios.delete(
            `${API}/admin/accounts/${accountId}`,
            getAdminHeaders(),
        );
        return res.data;
    },
};

export default accountService;
