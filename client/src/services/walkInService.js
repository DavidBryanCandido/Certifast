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

const walkInService = {
	async getWalkIns(token) {
		const response = await api.get('/walkins', adminHeaders(token));
		return response.data;
	},

	async createWalkIn(payload, token) {
		const response = await api.post('/walkins', payload, adminHeaders(token));
		return response.data;
	},
};

export default walkInService;
