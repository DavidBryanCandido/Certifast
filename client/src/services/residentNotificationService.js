// FILE: client/src/services/residentNotificationService.js
import axios from "axios";
import authService from "./authService";
import { getApiBase } from "./apiBase";

const API = getApiBase();

function getHeaders() {
    return {
        headers: { Authorization: `Bearer ${authService.getResidentToken()}` },
    };
}

const residentNotificationService = {
    getNotifications: async (limit = 20) => {
        const res = await axios.get(
            `${API}/resident/notifications?limit=${limit}`,
            getHeaders(),
        );
        return res.data;
    },
    getUnreadCount: async () => {
        const res = await axios.get(
            `${API}/resident/notifications/unread-count`,
            getHeaders(),
        );
        return res.data;
    },
    markRead: async (notificationId) => {
        const res = await axios.put(
            `${API}/resident/notifications/${notificationId}/read`,
            {},
            getHeaders(),
        );
        return res.data;
    },
    markAllRead: async () => {
        const res = await axios.put(
            `${API}/resident/notifications/read-all`,
            {},
            getHeaders(),
        );
        return res.data;
    },
};

export default residentNotificationService;
