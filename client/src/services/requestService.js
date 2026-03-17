import axios from 'axios';

const baseURL =
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_API_URL ||
	'http://localhost:5000/api';

const api = axios.create({
	baseURL,
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
