import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

function adminHeaders(token) {
	return {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
}

const logsService = {
	async getLogs(token) {
		const response = await api.get('/logs', adminHeaders(token));
		return response.data;
	},

	async createLog(payload, token) {
		const response = await api.post('/logs', payload, adminHeaders(token));
		return response.data;
	},
};

export default logsService;
