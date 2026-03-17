import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import authService from '../../services/authService';

export default function ResidentLogin({ onLogin }) {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const result = await authService.residentLogin({ email, password });
			if (result?.token) {
				localStorage.setItem('certifast_resident_token', result.token);
			}
			if (onLogin) onLogin(result);
		} catch (err) {
			setError(err?.response?.data?.message || 'Login failed');
		}
	};

	return (
		<form onSubmit={handleSubmit} style={card}>
			<h2 style={{ marginTop: 0 }}>Resident Login</h2>
			<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={input} />
			<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" style={input} />
			{error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
			<button type="submit" style={button}>Login</button>
			<button type="button" style={linkButton} onClick={() => navigate('/resident/register')}>
				Create account
			</button>
		</form>
	);
}

const card = { maxWidth: 420, margin: '40px auto', background: '#fff', border: '1px solid #d8e1ef', borderRadius: 12, padding: 16 };
const input = { width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #c9d3e4', boxSizing: 'border-box' };
const button = { padding: '10px 12px', borderRadius: 8, border: 'none', background: '#0e2554', color: '#fff', cursor: 'pointer' };
const linkButton = { marginLeft: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #0e2554', background: '#fff', color: '#0e2554', cursor: 'pointer' };
