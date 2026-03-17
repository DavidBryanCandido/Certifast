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

const residentService = {
	async getResidents(token) {
		const response = await api.get('/residents', adminHeaders(token));
		return response.data;
	},

	async getResidentById(id, token) {
		const response = await api.get(`/residents/${id}`, adminHeaders(token));
		return response.data;
	},
};

export default residentService;
