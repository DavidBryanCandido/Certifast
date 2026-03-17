import { useMemo } from 'react';

export default function Settings() {
	const apiBase = useMemo(
		() =>
			import.meta.env.VITE_API_BASE_URL ||
			import.meta.env.VITE_API_URL ||
			'http://localhost:5000/api',
		[]
	);

	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>System Settings</h2>
			<div style={{ border: '1px solid #d8e1ef', borderRadius: 10, padding: 14, background: '#fff' }}>
				<p style={{ marginTop: 0, color: '#42546a' }}>Current API base URL:</p>
				<code style={{ color: '#0e2554', fontWeight: 700 }}>{apiBase}</code>
			</div>
		</div>
	);
}
