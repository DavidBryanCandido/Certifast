import { useEffect, useState } from 'react';

import accountService from '../../services/accountService';
import formatDate from '../../utils/formatDate';

export default function ManageAccounts() {
	const [rows, setRows] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				const token = localStorage.getItem('certifast_admin_token') || '';
				const result = await accountService.getAccounts(token);
				if (mounted) setRows(result.data || []);
			} catch (err) {
				if (mounted) setError(err?.response?.data?.message || 'Failed to load accounts');
			}
		}

		load();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div style={{ padding: 24 }}>
			<h2 style={{ marginTop: 0, color: '#0e2554' }}>Manage Accounts</h2>
			{error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
			<ul style={{ paddingLeft: 18, color: '#42546a' }}>
				{rows.map((row) => (
					<li key={row.admin_id} style={{ marginBottom: 8 }}>
						{row.full_name} ({row.role}) - {row.username} - Created {formatDate(row.created_at)}
					</li>
				))}
			</ul>
		</div>
	);
}
