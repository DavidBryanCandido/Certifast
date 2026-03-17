import axios from 'axios';

const baseURL =
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_API_URL ||
	'http://localhost:5000/api';

const api = axios.create({
	baseURL,
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
