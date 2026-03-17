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

const accountService = {
	async getAccounts(token) {
		const response = await api.get('/accounts', adminHeaders(token));
		return response.data;
	},
};

export default accountService;
