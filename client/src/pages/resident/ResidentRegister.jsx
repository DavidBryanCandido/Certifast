import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import authService from '../../services/authService';

export default function ResidentRegister({ onSuccess }) {
	const navigate = useNavigate();
	const [form, setForm] = useState({ full_name: '', email: '', password: '', address: '' });
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setMessage('');

		try {
			await authService.residentRegister(form);
			setMessage('Registration successful. You can now login.');
			if (onSuccess) onSuccess();
		} catch (err) {
			setError(err?.response?.data?.message || 'Registration failed');
		}
	};

	return (
		<form onSubmit={handleSubmit} style={card}>
			<h2 style={{ marginTop: 0 }}>Resident Register</h2>
			<input value={form.full_name} onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))} placeholder="Full name" style={input} />
			<input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" style={input} />
			<input value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} placeholder="Address" style={input} />
			<input value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} type="password" placeholder="Password" style={input} />
			{message ? <p style={{ color: '#0f7b6c' }}>{message}</p> : null}
			{error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
			<button type="submit" style={button}>Register</button>
			<button type="button" style={linkButton} onClick={() => navigate('/resident/login')}>
				Back to login
			</button>
		</form>
	);
}

const card = { maxWidth: 420, margin: '40px auto', background: '#fff', border: '1px solid #d8e1ef', borderRadius: 12, padding: 16 };
const input = { width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #c9d3e4', boxSizing: 'border-box' };
const button = { padding: '10px 12px', borderRadius: 8, border: 'none', background: '#0e2554', color: '#fff', cursor: 'pointer' };
const linkButton = { marginLeft: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #0e2554', background: '#fff', color: '#0e2554', cursor: 'pointer' };
