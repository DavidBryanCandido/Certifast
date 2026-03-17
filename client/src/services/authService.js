import axios from 'axios';

const baseURL =
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_API_URL ||
	'http://localhost:5000/api';

const api = axios.create({
	baseURL,
});

const authService = {
	async adminLogin(payload) {
		const response = await api.post('/admin-auth/login', payload);
		return response.data;
	},

	async residentLogin(payload) {
		const response = await api.post('/resident-auth/login', payload);
		return response.data;
	},

	async residentRegister(payload) {
		const response = await api.post('/resident-auth/register', payload);
		return response.data;
	},
};

export default authService;
