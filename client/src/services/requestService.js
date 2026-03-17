import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

const requestService = {
	async getAllRequests() {
		const response = await api.get('/requests');
		return response.data;
	},

	async getRequestById(id) {
		const response = await api.get(`/requests/${id}`);
		return response.data;
	},

	async createRequest(payload) {
		const response = await api.post('/requests', payload);
		return response.data;
	},
};

export default requestService;
